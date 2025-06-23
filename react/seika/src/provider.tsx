import type { NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AccentColorProvider } from "@/contexts/AccentColorContext";
import { WallpaperProvider } from "@/contexts/WallpaperContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationRemindersProvider } from "@/contexts/NotificationRemindersContext";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { ContextMenuProvider } from "@/contexts/ContextMenuContext";
import { OfflineModeProvider } from "@/contexts/OfflineModeContext";

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
          <NotificationProvider>
            <NotificationRemindersProvider>
              <AppearanceProvider>
                <OfflineModeProvider>
                  <TimerProvider>
                    <ProfileProvider>
                      <ContextMenuProvider>
                        <WebSocketProvider
                        //url="wss://server.seika.fun/ws/session/"
                        url={import.meta.env.VITE_WEBSOCKET_URL || "wss://server.seika.fun/ws/session/"}
                        autoConnect={true}  // disable if profile context doesn't have anything or smthin
                        reconnectAttempts={5}
                        reconnectDelay={3000}
                        >
                          <HeroUIProvider navigate={navigate} useHref={useHref}>
                            {children}
                          </HeroUIProvider>
                        </WebSocketProvider>
                      </ContextMenuProvider>
                    </ProfileProvider>
                  </TimerProvider>
                </OfflineModeProvider>
              </AppearanceProvider>
            </NotificationRemindersProvider>
          </NotificationProvider>
        </WallpaperProvider>
      </AccentColorProvider>
    </DarkModeProvider>
  );
}
