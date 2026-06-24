import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Toggles the `ms-theme` class on <body> whenever the user is on a mobile
 * settings route. This applies the purple/pink neon theme scoped in
 * `src/styles/mobile-settings-theme.css` without touching every page.
 */
export function MobileSettingsTheme() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const onSettings =
      pathname === "/settings" || pathname.startsWith("/settings/");
    const active = isMobile && onSettings;
    document.body.classList.toggle("ms-theme", active);
    return () => {
      document.body.classList.remove("ms-theme");
    };
  }, [pathname, isMobile]);

  return null;
}

export default MobileSettingsTheme;
