// Example of how to use WebSocket in your dashboard component
import React, { useState, useEffect } from 'react';
import { useWebSocket, useWebSocketListener } from '@/contexts/WebSocketContext';
import { useTimerSync } from '@/hooks/useTimerSync';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';

// Add this to your dashboard page component
export const DashboardWebSocketIntegration = () => {
  const [roomId, setRoomId] = useState('');
  const [peersOnline, setPeersOnline] = useState<any[]>([]);
  
  // Option 1: Use the WebSocket context directly
  const { isConnected, status, connect, joinRoom, leaveRoom } = useWebSocket();
  
  // Option 2: Use the simplified hook (recommended)
  const {
    isConnected: syncConnected,
    syncTimerState,
    joinRoom: syncJoinRoom,
    leaveRoom: syncLeaveRoom
  } = useTimerSync({
    roomId: 'default-study-room', // Optional: auto-join a default room
    autoConnect: true,
    autoSync: true, // Automatically sync timer state
    onPeerTimerUpdate: (peerData) => {
      console.log('Peer timer update:', peerData);
      // Update UI to show peer timer states
    },
    onUserJoined: (userData) => {
      console.log('User joined:', userData);
      // Show notification or update user list
    },
    onUserLeft: (userData) => {
      console.log('User left:', userData);
      // Update user list
    }
  });

  // Listen for specific events
  useWebSocketListener('timer_sync_request', (data) => {
    // Someone requested a timer sync
    syncTimerState();
  }, [syncTimerState]);

  // Real-time collaboration features
  const handleSyncTimer = () => {
    syncTimerState({
      action: 'manual_sync',
      timestamp: Date.now()
    });
  };

  const handleJoinStudySession = () => {
    const studyRoomId = `study-${Date.now()}`;
    syncJoinRoom(studyRoomId);
    setRoomId(studyRoomId);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <Badge 
          color={syncConnected ? 'success' : 'danger'} 
          variant="flat"
        >
          {syncConnected ? 'Connected' : 'Disconnected'}
        </Badge>
        {roomId && (
          <Badge color="primary" variant="flat">
            Room: {roomId}
          </Badge>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button
          color="primary"
          onClick={handleJoinStudySession}
          isDisabled={!syncConnected}
        >
          Start Study Session
        </Button>
        
        <Button
          color="secondary"
          variant="flat"
          onClick={handleSyncTimer}
          isDisabled={!syncConnected || !roomId}
        >
          Sync Timer
        </Button>
        
        <Button
          color="warning"
          variant="flat"
          onClick={syncLeaveRoom}
          isDisabled={!roomId}
        >
          Leave Session
        </Button>
      </div>

      {/* Peers List */}
      {peersOnline.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">
            Study Partners ({peersOnline.length})
          </h4>
          <div className="space-y-1">
            {peersOnline.map((peer, index) => (
              <div key={index} className="text-sm text-gray-600">
                {peer.userName} - {peer.status}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Usage in your main dashboard component:
/*
export default function DashboardPage() {
  // ... your existing code ...
  
  return (
    <MainLayout>
      {/* Your existing dashboard content */}
      
      {/* Add WebSocket integration */}
      {import.meta.env.VITE_ENABLE_TIMER_SYNC === 'true' && (
        <DashboardWebSocketIntegration />
      )}
      
      {/* Rest of your dashboard */}
    </MainLayout>
  );
}
*/
