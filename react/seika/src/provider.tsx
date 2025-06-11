import type { NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AccentColorProvider } from "@/contexts/AccentColorContext";
import { WallpaperProvider } from "@/contexts/WallpaperContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <DarkModeProvider>
      <AccentColorProvider>
        <WallpaperProvider>
          <TimerProvider>
            <ProfileProvider>
              <WebSocketProvider 
                autoConnect={false}
                serverUrl={import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/'}
                reconnectInterval={3000}
                maxReconnectAttempts={5}
              >
                <HeroUIProvider navigate={navigate} useHref={useHref}>
                  {children}
                </HeroUIProvider>
              </WebSocketProvider>
            </ProfileProvider>
          </TimerProvider>
        </WallpaperProvider>
      </AccentColorProvider>
    </DarkModeProvider>
  );
}
