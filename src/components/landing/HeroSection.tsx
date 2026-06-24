import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FancyButton from "@/components/branding/FancyButton";
import TryBeforeSignup from "@/components/landing/TryBeforeSignup";
import { useLandingContent } from "@/lib/landing/LandingContentContext";

const heroVideos = [
  { src: "/hero/video-1.mp4", poster: "/hero/video-1.webp", rotate: -6, y: 40 },
  { src: "/hero/video-2.mp4", poster: "/hero/video-2.webp", rotate: -3, y: 15 },
  { src: "/hero/video-4.mp4", poster: "/hero/video-4.webp", rotate: 0, y: 0, center: true },
  { src: "/hero/video-3.mp4", poster: "/hero/video-3.webp", rotate: 3, y: 15 },
  { src: "/hero/bear.mp4", poster: "/hero/bear.webp", rotate: 6, y: 40 },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { content } = useLandingContent();
  const { hero } = content;
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);


  return (
    <section className="relative flex min-h-[auto] flex-col items-center overflow-hidden bg-background pt-40 pb-0 md:min-h-dvh md:pt-44">
      {/* ── Ambient depth (desktop only) ── */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block" aria-hidden>
        <div
          className="absolute left-1/2 top-[-12%] h-[640px] w-[1100px] -translate-x-1/2 rounded-full opacity-[0.55] blur-[140px]"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--primary) / 0.28), transparent 70%)",
          }}
        />
        <div
          className="absolute left-[-8%] top-[18%] h-[420px] w-[420px] rounded-full opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(closest-side, rgba(217,70,239,0.22), transparent 70%)",
          }}
        />
        <div
          className="absolute right-[-8%] top-[28%] h-[420px] w-[420px] rounded-full opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(closest-side, rgba(139,92,246,0.18), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-30 mx-auto w-full px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-5 hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/80">
            Megsy Studio · Live
          </span>
        </motion.div>

        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[9vw] uppercase leading-[0.95] tracking-tight text-foreground md:text-[5.5vw]"
        >
          {hero.h1Pre}{" "}
          <span
            id="anchor-hero-now"
            className="bg-gradient-to-br from-primary via-fuchsia-400 to-violet-400 bg-clip-text text-transparent"
          >
            {hero.h1Highlight}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-3 max-w-2xl px-2 text-[13px] leading-snug text-muted-foreground md:mt-6 md:text-lg"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-8 md:gap-4"
        >
          <button
            onClick={() => navigate("/auth")}
            className="group relative rounded-full p-[2px] overflow-hidden transition-transform hover:scale-[1.03]"
            style={{
              background:
                "conic-gradient(from var(--angle, 0deg), #c0c0c0, #ffffff, #8a8a8a, #ffffff, #c0c0c0)",
              animation: "silver-spin 4s linear infinite",
            }}
          >
            <span className="relative block rounded-full bg-black px-8 py-3 text-sm font-semibold text-foreground md:px-10 md:py-4 md:text-base">
              {hero.ctaPrimary}
            </span>
          </button>
        </motion.div>

        <TryBeforeSignup />
      </div>

      <div className="relative z-10 mt-8 flex w-full max-w-[1500px] items-end justify-center gap-2 px-4 pb-4 md:mt-10 md:gap-5">
        {heroVideos.map((vid, i) => {
          const isEdge = Math.abs(vid.rotate) > 3;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100, rotate: vid.rotate }}
              animate={{ opacity: 1, y: vid.y, rotate: vid.rotate }}
              transition={{ duration: 0.7, delay: 0.45 + i * 0.1, ease: "easeOut" }}
              whileHover={{ y: vid.y - 10, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/5 md:rounded-2xl ${
                isEdge ? "hidden md:block" : ""
              } ${
                vid.center
                  ? "w-[34%] md:w-[20%] z-[3]"
                  : Math.abs(vid.rotate) <= 3
                    ? "w-[30%] md:w-[18%] z-[2]"
                    : "w-[15%] z-[1]"
              }`}
              style={{ aspectRatio: "3/4" }}
            >
              {isMobile ? (
                <img
                  src={vid.poster}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <video
                  src={vid.src}
                  poster={vid.poster}
                  preload={vid.center ? "metadata" : "none"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              )}
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.45) 100%)",
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden h-40 md:block"
        style={{
          background:
            "linear-gradient(to bottom, transparent, hsl(var(--background)) 92%)",
        }}
      />

      {/* Scroll cue (desktop) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/40">
          Scroll
        </span>
        <div className="relative h-8 w-[1px] overflow-hidden bg-white/10">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-primary to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
