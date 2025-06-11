import { useEffect, useCallback } from 'react';
import { useWebSocket, useWebSocketListener } from '@/contexts/WebSocketContext';
import { useTimer } from '@/contexts/TimerContext';
import { useProfile } from '@/contexts/ProfileContext';

interface UseTimerSyncOptions {
  roomId?: string;
  autoConnect?: boolean;
  autoSync?: boolean;
  onPeerTimerUpdate?: (peerData: any) => void;
  onUserJoined?: (userData: any) => void;
  onUserLeft?: (userData: any) => void;
}

export const useTimerSync = ({
  roomId,
  autoConnect = true,
  autoSync = false,
  onPeerTimerUpdate,
  onUserJoined,
  onUserLeft
}: UseTimerSyncOptions = {}) => {
  const { 
    isConnected, 
    status, 
    connect, 
    disconnect,
    joinRoom, 
    leaveRoom, 
    broadcastTimerState 
  } = useWebSocket();
  
  const { userName } = useProfile();
  const timerContext = useTimer();

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && status === 'disconnected') {
      connect();
    }
  }, [autoConnect, status, connect]);

  // Auto-join room if connected and roomId provided
  useEffect(() => {
    if (isConnected && roomId) {
      joinRoom(roomId, userName);
    }
    
    return () => {
      if (roomId) {
        leaveRoom();
      }
    };
  }, [isConnected, roomId, userName, joinRoom, leaveRoom]);

  // Listen for WebSocket events
  useWebSocketListener('timer_update', useCallback((data) => {
    if (data.userId !== userName) {
      onPeerTimerUpdate?.(data);
    }
  }, [userName, onPeerTimerUpdate]), [userName, onPeerTimerUpdate]);

  useWebSocketListener('user_joined', useCallback((data) => {
    onUserJoined?.(data);
  }, [onUserJoined]), [onUserJoined]);

  useWebSocketListener('user_left', useCallback((data) => {
    onUserLeft?.(data);
  }, [onUserLeft]), [onUserLeft]);

  // Auto-sync timer state
  useEffect(() => {
    if (autoSync && isConnected && roomId) {
      const timerData = {
        currentTime: timerContext.currentTime,
        totalTime: timerContext.totalTime,
        status: timerContext.status,
        mode: timerContext.mode,
        userName: userName,
      };
      
      broadcastTimerState(timerData);
    }
  }, [
    autoSync,
    isConnected,
    roomId,
    timerContext.currentTime,
    timerContext.totalTime,
    timerContext.status,
    timerContext.mode,
    userName,
    broadcastTimerState
  ]);

  // Manual sync function
  const syncTimerState = useCallback((customData?: any) => {
    if (isConnected && roomId) {
      const timerData = {
        currentTime: timerContext.currentTime,
        totalTime: timerContext.totalTime,
        status: timerContext.status,
        mode: timerContext.mode,
        userName: userName,
        ...customData
      };
      
      broadcastTimerState(timerData);
    }
  }, [isConnected, roomId, timerContext, userName, broadcastTimerState]);

  return {
    // Connection state
    isConnected,
    status,
    
    // Manual control functions
    connect,
    disconnect,
    joinRoom: (newRoomId: string) => joinRoom(newRoomId, userName),
    leaveRoom,
    syncTimerState,
    
    // Current context data
    timerContext,
    userName
  };
};

export default useTimerSync;
