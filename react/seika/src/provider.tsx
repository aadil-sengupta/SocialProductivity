import type { NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AccentColorProvider } from "@/contexts/AccentColorContext";
import { WallpaperProvider } from "@/contexts/WallpaperContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";

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
              url="ws://localhost:8000/ws/session/"
              autoConnect={true}  // disable if profile context doesn't have anything or smthin
              reconnectAttempts={5}
              reconnectDelay={3000}
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
