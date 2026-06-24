import { motion } from "framer-motion";
import { useMemo } from "react";

interface DesktopGreetingProps {
  userName: string | null | undefined;
  isFirstVisit: boolean;
  returningGreetingIdx: number;
}

/**
 * Desktop empty-state greeting — ChatGPT-clean composition with the
 * Referral landing's ambient glow + grid backdrop. Mobile untouched.
 */
export const DesktopGreeting = ({
  userName,
  isFirstVisit,
  returningGreetingIdx,
}: DesktopGreetingProps) => {
  const raw = userName || "there";
  const dname = raw.charAt(0).toUpperCase() + raw.slice(1);

  const h = new Date().getHours();
  const part =
    h < 5 ? "Still up"
    : h < 12 ? "Good morning"
    : h < 17 ? "Good afternoon"
    : h < 21 ? "Good evening"
    : "Late one";

  const { lead, tail } = useMemo(() => {
    const variants = [
      { lead: part, tail: dname },
      { lead: "What's on your mind", tail: dname },
      { lead: "Where to today", tail: dname },
      { lead: "Ready when you are", tail: dname },
    ];
    return isFirstVisit
      ? variants[0]
      : variants[returningGreetingIdx % variants.length];
  }, [part, dname, isFirstVisit, returningGreetingIdx]);

  return (
    <div className="relative z-10 hidden md:flex items-center justify-center px-6 pt-16 pb-20 md:pt-0 md:pb-[210px] overflow-hidden w-full">
      {/* Ambient primary glow — referral landing wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.25), transparent 70%), radial-gradient(50% 40% at 50% 100%, hsl(var(--primary) / 0.15), transparent 70%)",
        }}
      />

      {/* Faint grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center text-center"
      >
        <h1 className="text-[34px] sm:text-[44px] font-semibold leading-[1.1] tracking-tight text-foreground">
          {lead},{" "}
          <span style={{ color: "hsl(var(--primary))" }}>{tail}</span>
        </h1>
      </motion.div>
    </div>
  );
};

export default DesktopGreeting;
