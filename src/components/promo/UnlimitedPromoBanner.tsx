import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { usePromoCountdown } from "@/hooks/usePromoCountdown";

const pad = (n: number) => String(n).padStart(2, "0");
const DISMISS_KEY = "promo-banner-dismissed-v6";

const UnlimitedPromoBanner = () => {
  const navigate = useNavigate();
  const { active, days, hours, minutes, seconds } = usePromoCountdown();
  const ref = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const visible = active && !dismissed;

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!visible || !el) {
      root.style.setProperty("--promo-banner-h", "0px");
      return;
    }
    const update = () => {
      root.style.setProperty("--promo-banner-h", `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--promo-banner-h", "0px");
    };
  }, [visible]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  if (!visible) return null;

  const goPricing = () => navigate("/pricing");

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Limited time offer"
      className="relative z-40 w-full"
      style={{
        background:
          "linear-gradient(180deg, hsl(0 0% 4%) 0%, hsl(0 0% 6%) 100%)",
        borderBottom: "1px solid hsl(0 0% 100% / 0.06)",
        // In standalone PWA mode (iOS/Android), the status bar overlays the top
        // of the viewport. Push the banner content below the safe-area so the
        // headline and countdown remain fully visible on every screen size.
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <button
        type="button"
        onClick={goPricing}
        className="group relative mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-9 py-1.5 leading-none text-left transition-opacity hover:opacity-90 sm:gap-3 sm:px-10 sm:py-2"
      >

        {/* NEW pill */}
        <span
          className="shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ background: "hsl(0 0% 100% / 0.08)" }}
        >
          50% OFF
        </span>

        {/* Headline — shorter on mobile, full on sm+ */}
        <span className="shrink min-w-0 text-[12px] font-medium text-white/90 sm:text-[13px]">
          <span className="sm:hidden">Unlimited everything · 50% off</span>
          <span className="hidden sm:inline">
            Unlimited Chat, Images & Videos — 50% off every plan
          </span>
        </span>

        {/* Hairline separator */}
        <span
          aria-hidden
          className="hidden h-3 w-px shrink-0 sm:inline-block"
          style={{ background: "hsl(0 0% 100% / 0.12)" }}
        />

        {/* Countdown — always visible */}
        <span
          className="shrink-0 inline-flex items-center gap-1 font-mono text-[10.5px] tabular-nums text-white/60 sm:text-[11px]"
          aria-live="polite"
        >
          <span className="hidden text-white/40 sm:inline">Ends in</span>
          <span className="text-white/90">
            {days > 0 ? `${days}d ` : ""}
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </span>
        </span>

        {/* CTA link */}
        <span className="hidden shrink-0 items-center gap-0.5 text-[12px] font-semibold text-white underline-offset-4 group-hover:underline sm:inline-flex">
          Claim offer
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </button>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/5 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default UnlimitedPromoBanner;
