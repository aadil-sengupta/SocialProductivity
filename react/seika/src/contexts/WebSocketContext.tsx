import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

// Types
export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
}

interface WebSocketContextType {
  // Connection state
  status: WebSocketStatus;
  isConnected: boolean;
  lastError: string | null;
  reconnectAttempts: number;
  
  // Connection methods
  connect: (url: string) => void;
  disconnect: () => void;
  
  // Messaging
  sendMessage: (message: WebSocketMessage) => boolean;
  
  // Event listeners
  addEventListener: (type: string, callback: (data: any) => void) => void;
  removeEventListener: (type: string, callback: (data: any) => void) => void;
  
  // Timer-specific methods for your app
  broadcastTimerState: (timerData: any) => void;
  joinRoom: (roomId: string, userId: string) => void;
  leaveRoom: () => void;
}

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  serverUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  autoConnect = false,
  serverUrl = 'ws://localhost:8000/ws/', // Your Django WebSocket URL
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}) => {
  // State
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventListenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const currentRoomRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Helper to clear reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Event listener management
  const addEventListener = useCallback((type: string, callback: (data: any) => void) => {
    if (!eventListenersRef.current.has(type)) {
      eventListenersRef.current.set(type, new Set());
    }
    eventListenersRef.current.get(type)?.add(callback);
  }, []);

  const removeEventListener = useCallback((type: string, callback: (data: any) => void) => {
    eventListenersRef.current.get(type)?.delete(callback);
  }, []);

  const emitEvent = useCallback((type: string, data: any) => {
    eventListenersRef.current.get(type)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket event listener for ${type}:`, error);
      }
    });
  }, []);

  // Send message function
  const sendMessage = useCallback((message: WebSocketMessage): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: Date.now()
        };
        wsRef.current.send(JSON.stringify(messageWithTimestamp));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        setLastError('Failed to send message');
        return false;
      }
    }
    return false;
  }, []);

  // Timer-specific methods
  const broadcastTimerState = useCallback((timerData: any) => {
    if (currentRoomRef.current) {
      sendMessage({
        type: 'timer_update',
        payload: {
          roomId: currentRoomRef.current,
          userId: userIdRef.current,
          timerData
        }
      });
    }
  }, [sendMessage]);

  const joinRoom = useCallback((roomId: string, userId: string) => {
    currentRoomRef.current = roomId;
    userIdRef.current = userId;
    
    sendMessage({
      type: 'join_room',
      payload: {
        roomId,
        userId
      }
    });
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    if (currentRoomRef.current) {
      sendMessage({
        type: 'leave_room',
        payload: {
          roomId: currentRoomRef.current,
          userId: userIdRef.current
        }
      });
    }
    currentRoomRef.current = null;
    userIdRef.current = null;
  }, [sendMessage]);

  // Connect function
  const connect = useCallback((url?: string) => {
    const wsUrl = url || serverUrl;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected');
      return;
    }

    try {
      setStatus('connecting');
      setLastError(null);
      clearReconnectTimeout();

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        setReconnectAttempts(0);
        emitEvent('connected', null);

        // Rejoin room if we were in one
        if (currentRoomRef.current && userIdRef.current) {
          joinRoom(currentRoomRef.current, userIdRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          emitEvent('message', message);
          
          // Handle specific message types
          if (message.type) {
            emitEvent(message.type, message.payload);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          emitEvent('error', { error: 'Failed to parse message', data: event.data });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setLastError('Connection error');
        emitEvent('error', error);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        wsRef.current = null;
        emitEvent('disconnected', { code: event.code, reason: event.reason });

        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setStatus('reconnecting');
          setReconnectAttempts(prev => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(wsUrl);
          }, reconnectInterval);
        } else {
          setStatus('disconnected');
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setStatus('error');
      setLastError(error instanceof Error ? error.message : 'Unknown connection error');
    }
  }, [serverUrl, reconnectAttempts, maxReconnectAttempts, reconnectInterval, clearReconnectTimeout, emitEvent, joinRoom]);

  // Disconnect function
  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    setReconnectAttempts(0);
    
    if (wsRef.current) {
      // Send leave room message before disconnecting
      leaveRoom();
      
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }
    
    setStatus('disconnected');
    setLastError(null);
  }, [clearReconnectTimeout, leaveRoom]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Handle visibility change to reconnect when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && status === 'disconnected' && autoConnect) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, autoConnect, connect]);

  // Context value
  const contextValue: WebSocketContextType = {
    // State
    status,
    isConnected: status === 'connected',
    lastError,
    reconnectAttempts,
    
    // Methods
    connect,
    disconnect,
    sendMessage,
    addEventListener,
    removeEventListener,
    
    // Timer-specific methods
    broadcastTimerState,
    joinRoom,
    leaveRoom
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Hook for specific event listening with cleanup
export const useWebSocketListener = (
  eventType: string, 
  callback: (data: any) => void, 
  dependencies: any[] = []
) => {
  const { addEventListener, removeEventListener } = useWebSocket();

  useEffect(() => {
    addEventListener(eventType, callback);
    return () => removeEventListener(eventType, callback);
  }, [eventType, ...dependencies, addEventListener, removeEventListener]);
};

export default WebSocketContext;
