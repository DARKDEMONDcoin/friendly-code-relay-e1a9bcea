import { memo, useEffect, useState } from "react";
import { Brain } from "lucide-react";
import MegsyStar from "@/components/files/MegsyStar";

interface ThinkingLoaderProps {
  searchStatus?: string;
}

// Thinking states:
//  • 0 – <5s   : "Thinking…" (no icon — minimal)
//  • 5 – <15s : "Thinking deeply…" with brain icon
//  • >=15s   : star + status text (writing/working)
// honors prefers-reduced-motion via ai-shimmer class.
const ThinkingLoader = ({ searchStatus }: ThinkingLoaderProps) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = window.setInterval(() => setElapsed(Date.now() - start), 500);
    return () => window.clearInterval(t);
  }, []);

  const ar =
    typeof document !== "undefined" &&
    (document.documentElement.lang === "ar" || document.documentElement.dir === "rtl");

  // Explicit status from backend always wins — show star + label.
  if (searchStatus?.trim()) {
    return (
      <div className="flex items-center gap-2 py-1" aria-live="polite">
        <MegsyStar size={22} />
        <span className="ai-shimmer text-[13px] font-medium motion-reduce:animate-none">
          {searchStatus}
        </span>
      </div>
    );
  }

  if (elapsed < 5000) {
    return (
      <div className="flex items-center gap-2 py-1" aria-live="polite">
        <MegsyStar size={16} />
        <span className="ai-shimmer text-[13px] font-medium motion-reduce:animate-none">
          {ar ? "يفكر…" : "Thinking…"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1" aria-live="polite">
      <MegsyStar size={16} />
      <Brain className="w-4 h-4 text-foreground/80 animate-pulse" />
      <span className="ai-shimmer text-[13px] font-medium motion-reduce:animate-none">
        {ar ? "يفكر بعمق…" : "Thinking deeply…"}
      </span>
    </div>
  );
};

export default memo(ThinkingLoader);
