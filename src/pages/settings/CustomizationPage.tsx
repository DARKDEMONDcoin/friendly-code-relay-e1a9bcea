import { useState, useCallback, useEffect } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopSettingsLayout } from "@/components/settings/DesktopSettingsLayout";
import { CartoonPage, CartoonHero, CartoonCard } from "@/components/settings/CartoonSettingsShell";
import { INK, YELLOW, PINK, MINT, LAVENDER, PEACH, TEXT, MUTED, SURFACE_2 } from "@/pages/billing/ReferralsPage";
import customizationSticker from "@/assets/settings/customization-sticker.png";

const accentColors = [
  { hsl: "262 60% 55%", hex: "#7c5cfc" },
  { hsl: "210 80% 55%", hex: "#3b82f6" },
  { hsl: "142 50% 50%", hex: "#22c55e" },
  { hsl: "330 70% 55%", hex: "#ec4899" },
  { hsl: "25 90% 55%", hex: "#f97316" },
  { hsl: "160 60% 45%", hex: "#14b8a6" },
  { hsl: "0 70% 55%", hex: "#ef4444" },
  { hsl: "270 60% 55%", hex: "#8b5cf6" },
  { hsl: "180 60% 45%", hex: "#06b6d4" },
  { hsl: "45 90% 50%", hex: "#eab308" },
  { hsl: "150 60% 40%", hex: "#10b981" },
  { hsl: "340 80% 55%", hex: "#f43f5e" },
  // Creative additions — premium hues
  { hsl: "230 70% 60%", hex: "#5b6cf5" },
  { hsl: "290 65% 60%", hex: "#c855f0" },
  { hsl: "12 85% 58%", hex: "#f56042" },
  { hsl: "195 85% 50%", hex: "#0ea5e9" },
  { hsl: "85 60% 45%", hex: "#84cc16" },
  { hsl: "320 75% 60%", hex: "#e84cc4" },
];

const CustomizationPage = () => {
  const isMobile = useIsMobile();
  const [currentAccent, setCurrentAccent] = useState(
    () => localStorage.getItem("accent") || "262 60% 55%",
  );

  // Lock the theme to the current dark experience — forever.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    if (localStorage.getItem("theme") !== "dark") {
      localStorage.setItem("theme", "dark");
      window.dispatchEvent(new Event("themechange-custom"));
    }
  }, []);

  const handleAccentChange = useCallback((hsl: string) => {
    document.documentElement.style.setProperty("--primary", hsl);
    document.documentElement.style.setProperty("--user-bubble", `hsl(${hsl})`);
    localStorage.setItem("accent", hsl);
    localStorage.setItem("userBubbleColor", `hsl(${hsl})`);
    setCurrentAccent(hsl);
  }, []);


  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-md mx-auto"
    >

      {/* Single color picker — applies to both accent and chat bubble */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.12em] mb-5">
          Accent Color
        </p>

        <div className="rounded-2xl bg-muted/30 p-4 mb-6 space-y-2.5">
          <div className="flex justify-end">
            <div
              className="rounded-2xl rounded-br-sm px-3.5 py-2 max-w-[65%]"
              style={{ background: `hsl(${currentAccent})` }}
            >
              <p className="text-foreground text-[13px]">Hey! How's it going?</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-3.5 py-2 bg-muted max-w-[65%]">
              <p className="text-[13px] text-foreground">Pretty good, thanks!</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {accentColors.map((c) => {
            const isSelected = currentAccent === c.hsl;
            return (
              <button
                key={c.hex}
                onClick={() => handleAccentChange(c.hsl)}
                className={`w-9 h-9 rounded-full transition-all hover:scale-110 flex items-center justify-center ${
                  isSelected ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""
                }`}
                style={{ background: c.hex }}
                aria-label={c.hex}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-foreground drop-shadow-sm" />}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  if (!isMobile) {
    return (
      <DesktopSettingsLayout title="Customization" subtitle="Personalize your experience">
        {content}
      </DesktopSettingsLayout>
    );
  }

  const mobileContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <CartoonHero
        sticker={customizationSticker}
        bg={LAVENDER}
        title="Make it yours"
        subtitle="Pick a theme and an accent color that fits your vibe."
      />


      <CartoonCard className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: MUTED, fontWeight: 800 }}>
          Accent color
        </p>

        <div
          className="rounded-2xl p-4 space-y-2.5"
          style={{ backgroundColor: SURFACE_2, border: `1.5px solid hsl(var(--surface-4))` }}
        >
          <div className="flex justify-end">
            <div
              className="rounded-2xl rounded-br-sm px-3.5 py-2 max-w-[65%]"
              style={{ background: `hsl(${currentAccent})` }}
            >
              <p className="text-[13px]" style={{ color: INK, fontWeight: 700 }}>Hey! How's it going?</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div
              className="rounded-2xl rounded-bl-sm px-3.5 py-2 max-w-[65%]"
              style={{ background: "hsl(var(--surface-4))" }}
            >
              <p className="text-[13px]" style={{ color: TEXT, fontWeight: 600 }}>Pretty good, thanks!</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-1">
          {accentColors.map((c) => {
            const isSelected = currentAccent === c.hsl;
            return (
              <button
                key={c.hex}
                onClick={() => handleAccentChange(c.hsl)}
                className="w-10 h-10 rounded-full transition-all hover:scale-110 grid place-items-center"
                style={{
                  background: c.hex,
                  border: `2.5px solid ${INK}`,
                  boxShadow: isSelected ? `3px 3px 0 ${INK}` : "none",
                }}
                aria-label={c.hex}
              >
                {isSelected && <Check className="w-4 h-4" style={{ color: INK }} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </CartoonCard>
    </motion.div>
  );

  return <CartoonPage title="Customization">{mobileContent}</CartoonPage>;
};

export default CustomizationPage;
