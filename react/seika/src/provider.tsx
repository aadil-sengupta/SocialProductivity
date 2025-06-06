import type { NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AccentColorProvider } from "@/contexts/AccentColorContext";
import { WallpaperProvider } from "@/contexts/WallpaperContext";

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
          <HeroUIProvider navigate={navigate} useHref={useHref}>
            {children}
          </HeroUIProvider>
        </WallpaperProvider>
      </AccentColorProvider>
    </DarkModeProvider>
  );
}
