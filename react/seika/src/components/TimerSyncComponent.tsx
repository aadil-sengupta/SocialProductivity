import React, { useEffect, useState } from 'react';
import { useWebSocket, useWebSocketListener } from '@/contexts/WebSocketContext';
import { useTimer } from '@/contexts/TimerContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Badge } from '@heroui/badge';

interface TimerSyncComponentProps {
  className?: string;
}

interface PeerUser {
  userId: string;
  userName: string;
  timerData: {
    currentTime: number;
    totalTime: number;
    status: string;
    mode: string;
    sessionPhase: string;
  };
  lastSeen: number;
}

export default function TimerSyncComponent({ className = '' }: TimerSyncComponentProps) {
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
  
  const [roomId, setRoomId] = useState('');
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [peersInRoom, setPeersInRoom] = useState<Map<string, PeerUser>>(new Map());
  const [isAutoSync, setIsAutoSync] = useState(false);

  // Listen for timer updates from other users
  useWebSocketListener('timer_update', (data) => {
    if (data.userId !== userName) { // Don't update from our own broadcasts
      setPeersInRoom(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          userId: data.userId,
          userName: data.userName || data.userId,
          timerData: data.timerData,
          lastSeen: Date.now()
        });
        return newMap;
      });
    }
  }, [userName]);

  // Listen for room join/leave events
  useWebSocketListener('user_joined', (data) => {
    console.log(`User ${data.userName} joined the room`);
  }, []);

  useWebSocketListener('user_left', (data) => {
    setPeersInRoom(prev => {
      const newMap = new Map(prev);
      newMap.delete(data.userId);
      return newMap;
    });
  }, []);

  // Auto-broadcast timer state when it changes (if auto-sync is enabled)
  useEffect(() => {
    if (isAutoSync && currentRoom && isConnected) {
      const timerData = {
        currentTime: timerContext.currentTime,
        totalTime: timerContext.totalTime,
        status: timerContext.status,
        mode: timerContext.mode,
        sessionPhase: 'focus', // You can get this from your dashboard state
      };
      
      broadcastTimerState(timerData);
    }
  }, [
    timerContext.currentTime,
    timerContext.status,
    timerContext.mode,
    isAutoSync,
    currentRoom,
    isConnected,
    broadcastTimerState
  ]);

  // Clean up old peer data
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setPeersInRoom(prev => {
        const newMap = new Map();
        for (const [userId, peer] of prev) {
          if (now - peer.lastSeen < 30000) { // Keep peers active within 30 seconds
            newMap.set(userId, peer);
          }
        }
        return newMap;
      });
    }, 10000);

    return () => clearInterval(cleanup);
  }, []);

  const handleConnect = () => {
    if (!isConnected) {
      connect();
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim() && isConnected) {
      joinRoom(roomId.trim(), userName);
      setCurrentRoom(roomId.trim());
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setCurrentRoom(null);
    setPeersInRoom(new Map());
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'reconnecting': return 'warning';
      case 'error': return 'danger';
      default: return 'default';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md font-bold">Timer Sync</p>
          <div className="flex items-center gap-2">
            <Badge color={getStatusColor()} variant="flat">
              {status}
            </Badge>
            {currentRoom && (
              <Badge color="primary" variant="flat">
                Room: {currentRoom}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="gap-4">
        {/* Connection Controls */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              color="primary" 
              onClick={handleConnect}
              isLoading={status === 'connecting'}
            >
              Connect
            </Button>
          ) : (
            <Button 
              color="danger" 
              variant="flat"
              onClick={disconnect}
            >
              Disconnect
            </Button>
          )}
        </div>

        {/* Room Controls */}
        {isConnected && (
          <div className="flex flex-col gap-2">
            {!currentRoom ? (
              <>
                <Input
                  label="Room ID"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <Button 
                  color="primary"
                  onClick={handleJoinRoom}
                  isDisabled={!roomId.trim()}
                >
                  Join Room
                </Button>
              </>
            ) : (
              <Button 
                color="warning"
                variant="flat"
                onClick={handleLeaveRoom}
              >
                Leave Room
              </Button>
            )}
          </div>
        )}

        {/* Auto-sync toggle */}
        {currentRoom && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAutoSync}
              onChange={(e) => setIsAutoSync(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm">Auto-sync timer</label>
          </div>
        )}

        {/* Peers in room */}
        {currentRoom && peersInRoom.size > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Others in room:</p>
            <div className="space-y-2">
              {Array.from(peersInRoom.values()).map((peer) => (
                <div 
                  key={peer.userId}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{peer.userName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {peer.timerData.mode} • {peer.timerData.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">
                        {formatTime(peer.timerData.currentTime)}
                      </p>
                      {peer.timerData.totalTime > 0 && (
                        <p className="text-xs text-gray-500">
                          / {formatTime(peer.timerData.totalTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual sync button */}
        {currentRoom && !isAutoSync && (
          <Button 
            size="sm"
            variant="flat"
            onClick={() => {
              const timerData = {
                currentTime: timerContext.currentTime,
                totalTime: timerContext.totalTime,
                status: timerContext.status,
                mode: timerContext.mode,
                sessionPhase: 'focus',
              };
              broadcastTimerState(timerData);
            }}
          >
            Sync Timer Now
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
