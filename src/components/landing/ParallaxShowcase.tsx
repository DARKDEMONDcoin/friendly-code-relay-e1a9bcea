import { motion } from "framer-motion";
import LazyVideo from "@/components/landing/LazyVideo";

const ParallaxShowcase = () => {
  return (
    <section className="relative scroll-mt-28 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[480px] -translate-y-1/2 bg-gradient-to-b from-fuchsia-500/[0.07] via-purple-500/[0.04] to-transparent blur-3xl" />

      <div className="mx-auto mb-10 max-w-7xl px-6 text-center md:mb-14">
        <motion.h2
          id="anchor-depth"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-[10vw] font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-[6vw]"
        >
          DEPTH OF{" "}
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            CREATION
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-2xl text-base text-foreground/70 md:text-lg"
        >
          One canvas, every modality — explore how Megsy moves between chat,
          image, video and code without breaking your flow.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-6xl px-4 md:px-6"
      >
        <div className="relative rounded-2xl p-[1px] md:rounded-[28px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-400/40 via-purple-400/20 to-cyan-400/30 opacity-60 blur-md md:rounded-[28px]" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background shadow-[0_30px_80px_-20px_rgba(168,85,247,0.35)] md:rounded-[28px]">
            <LazyVideo src="/api-showcase/showcase-main.mp4" className="aspect-video w-full" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ParallaxShowcase;
