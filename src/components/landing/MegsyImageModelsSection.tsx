import { motion } from "framer-motion";
import { useLandingContent } from "@/lib/landing/LandingContentContext";
import { ImageIcon, Sparkles, Layers, Ratio, Wand2, SunMedium, Settings2 } from "lucide-react";

const SETTINGS_LABELS: Record<string, { title: string; subtitle: string; items: Array<{ icon: typeof Ratio; label: string; value: string }> }> = {
  ar: {
    title: "إعدادات الاستوديو",
    subtitle: "تحكم كامل في كل تفصيلة قبل وبعد التوليد.",
    items: [
      { icon: Ratio, label: "نسبة العرض", value: "1:1 · 16:9 · 9:16 · 4:5" },
      { icon: Layers, label: "عدد النسخ", value: "1 — 4 صور لكل أمر" },
      { icon: SunMedium, label: "الإضاءة والستايل", value: "سينمائي · استوديو · أنمي · واقعي" },
      { icon: Wand2, label: "أدوات إضافية", value: "تكبير الدقة · إزالة الخلفية · تبديل الوجوه" },
    ],
  },
  en: {
    title: "Studio settings",
    subtitle: "Full control over every detail before and after generation.",
    items: [
      { icon: Ratio, label: "Aspect ratio", value: "1:1 · 16:9 · 9:16 · 4:5" },
      { icon: Layers, label: "Variations", value: "1 — 4 images per prompt" },
      { icon: SunMedium, label: "Lighting & style", value: "Cinematic · Studio · Anime · Realistic" },
      { icon: Wand2, label: "Pro tools", value: "Upscale · Remove BG · Face swap" },
    ],
  },
};

const MegsyImageModelsSection = () => {
  const { content, locale } = useLandingContent();
  const { imageModels: c } = content;
  const settings = SETTINGS_LABELS[locale.code] ?? SETTINGS_LABELS.en;

  return (
    <section id="anchor-image-models-section" className="relative scroll-mt-28 overflow-hidden py-20 md:py-28">
      <div className="absolute right-1/3 top-1/3 -z-10 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-1.5">
            <ImageIcon className="h-4 w-4 text-pink-300" />
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-200">
              {c.kicker}
            </p>
          </div>
          <h2 className="font-display text-[10vw] font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-[6vw]">
            {c.title}{" "}
            <span className="bg-gradient-to-r from-pink-400 to-fuchsia-300 bg-clip-text text-transparent">
              {c.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-foreground/75 md:text-lg">{c.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {c.items.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 transition-all hover:border-pink-400/40"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 ring-1 ring-pink-400/30">
                  <ImageIcon className="h-5 w-5 text-pink-200" />
                </div>
                <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-[11px] font-bold text-pink-200">
                  {m.cost}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{m.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{m.description}</p>
              <Sparkles className="absolute -bottom-4 -right-4 h-20 w-20 text-pink-500/[0.06] transition-all group-hover:text-pink-500/15" />
            </motion.div>
          ))}
        </div>

        {/* Settings preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 md:p-10"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 ring-1 ring-pink-400/30">
              <Settings2 className="h-5 w-5 text-pink-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground md:text-xl">{settings.title}</h3>
              <p className="text-sm text-foreground/70">{settings.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {settings.items.map((it) => (
              <div
                key={it.label}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-background/40 p-4"
              >
                <it.icon className="mt-0.5 h-5 w-5 shrink-0 text-pink-200" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                    {it.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{it.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MegsyImageModelsSection;
