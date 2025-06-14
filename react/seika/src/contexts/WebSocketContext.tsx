import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

// WebSocket connection states
export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// Message types for type safety
export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
}

// WebSocket context type
interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  status: WebSocketStatus;
  
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  
  // Messaging
  sendMessage: (message: WebSocketMessage) => void;
  
  // Room management (if needed)
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  currentRoom: string | null;
  
  // Connection stats
  connectionAttempts: number;
  lastConnectedAt: Date | null;
}

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
}

// Create context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = 'ws://localhost:8000/ws/session/',
  autoConnect = true,
  reconnectAttempts = 5,
  reconnectDelay = 3000,
  enableHeartbeat = false, // Disabled by default - only enable for production with proxies/firewalls
  heartbeatInterval = 30000, // 30 seconds
}) => {
  // State
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  
  // Computed state
  const isConnected = status === 'connected';
  
  // Clear reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  // Clear heartbeat interval
  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);
  
  // Send heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (!enableHeartbeat) {
      console.log('💓 [WebSocket] Heartbeat disabled - relying on TCP keepalive');
      return;
    }
    
    clearHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('📡 [WebSocket] Sending heartbeat');
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, heartbeatInterval);
  }, [clearHeartbeat, enableHeartbeat, heartbeatInterval]);
  
  // Process queued messages
  const processMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      console.log(`📤 [WebSocket] Processing ${messageQueueRef.current.length} queued messages`);
      messageQueueRef.current.forEach(message => {
        wsRef.current?.send(JSON.stringify(message));
      });
      messageQueueRef.current = [];
    }
  }, []);
  
  // Send message
  const sendMessage = useCallback((message: WebSocketMessage) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    };
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📤 [WebSocket] Sending message:', messageWithTimestamp);
      wsRef.current.send(JSON.stringify(messageWithTimestamp));
    } else {
      console.log('📋 [WebSocket] Queueing message (not connected):', messageWithTimestamp);
      messageQueueRef.current.push(messageWithTimestamp);
    }
  }, []);
  
  // Join room
  const joinRoom = useCallback((roomId: string) => {
    console.log(`🚪 [WebSocket] Joining room: ${roomId}`);
    setCurrentRoom(roomId);
    sendMessage({
      type: 'join_room',
      payload: { roomId }
    });
  }, [sendMessage]);
  
  // Leave room
  const leaveRoom = useCallback(() => {
    if (currentRoom) {
      console.log(`🚪 [WebSocket] Leaving room: ${currentRoom}`);
      sendMessage({
        type: 'leave_room',
        payload: { roomId: currentRoom }
      });
      setCurrentRoom(null);
    }
  }, [currentRoom, sendMessage]);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ [WebSocket] Already connected, skipping connection attempt');
      return;
    }
    
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('⚠️ [WebSocket] Connection already in progress');
      return;
    }
    
    console.log(`🔌 [WebSocket] Attempting to connect to ${url} (attempt ${connectionAttempts + 1})`);
    setStatus('connecting');
    
    try {
      // Get user token from localStorage for authorization
      const userToken = localStorage.getItem('userToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      // Construct WebSocket URL with token as query parameter if available
      let wsUrl = url;
      if (userToken) {
        const separator = url.includes('?') ? '&' : '?';
        wsUrl = `${url}${separator}token=${encodeURIComponent(userToken)}`;
        console.log('🔑 [WebSocket] Including user token in connection');
      } else {
        console.log('⚠️ [WebSocket] No user token found in localStorage');
      }
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ [WebSocket] Connected successfully');
        setStatus('connected');
        setConnectionAttempts(0);
        setLastConnectedAt(new Date());
        clearReconnectTimeout();
        startHeartbeat();
        processMessageQueue();
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📥 [WebSocket] Received message:', message);
          
          // Handle special message types
          if (message.type === 'pong') {
            console.log('💓 [WebSocket] Received pong');
            return;
          }
          
          // Dispatch custom event for message handling
          window.dispatchEvent(new CustomEvent('websocket-message', { detail: message }));
        } catch (error) {
          console.error('❌ [WebSocket] Error parsing message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log(`🔌 [WebSocket] Connection closed:`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        setStatus('disconnected');
        clearHeartbeat();
        
        // Attempt reconnection if it wasn't a clean close and we haven't exceeded max attempts
        if (!event.wasClean && connectionAttempts < reconnectAttempts) {
          setStatus('reconnecting');
          setConnectionAttempts(prev => prev + 1);
          
          console.log(`🔄 [WebSocket] Scheduling reconnection in ${reconnectDelay}ms (attempt ${connectionAttempts + 1}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else if (connectionAttempts >= reconnectAttempts) {
          console.log('❌ [WebSocket] Max reconnection attempts reached');
          setStatus('error');
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('❌ [WebSocket] Connection error:', error);
        setStatus('error');
      };
      
    } catch (error) {
      console.error('❌ [WebSocket] Failed to create WebSocket:', error);
      setStatus('error');
    }
  }, [url, connectionAttempts, reconnectAttempts, reconnectDelay, clearReconnectTimeout, startHeartbeat, processMessageQueue]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 [WebSocket] Manually disconnecting');
    clearReconnectTimeout();
    clearHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setStatus('disconnected');
    setConnectionAttempts(0);
    setCurrentRoom(null);
    messageQueueRef.current = [];
  }, [clearReconnectTimeout, clearHeartbeat]);
  
  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      console.log('🚀 [WebSocket] Auto-connecting on mount');
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 [WebSocket] Cleaning up on unmount');
      disconnect();
    };
  }, [autoConnect]); // Only run on mount and when autoConnect changes
  
  // Handle page visibility changes (reconnect when page becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'disconnected' && autoConnect) {
        console.log('👁️ [WebSocket] Page became visible, attempting reconnection');
        connect();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status, autoConnect, connect]);
  
  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 [WebSocket] Network came online, attempting reconnection');
      if (status === 'disconnected' && autoConnect) {
        connect();
      }
    };
    
    const handleOffline = () => {
      console.log('📴 [WebSocket] Network went offline');
      setStatus('disconnected');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status, autoConnect, connect]);
  
  const contextValue: WebSocketContextType = {
    isConnected,
    status,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    currentRoom,
    connectionAttempts,
    lastConnectedAt,
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Hook to listen for specific WebSocket message types
export const useWebSocketListener = (
  messageType: string,
  callback: (data: any) => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (message.type === messageType) {
        callback(message.payload || message);
      }
    };
    
    window.addEventListener('websocket-message', handleMessage as EventListener);
    
    return () => {
      window.removeEventListener('websocket-message', handleMessage as EventListener);
    };
  }, [messageType, ...deps]);
};

export default WebSocketContext;