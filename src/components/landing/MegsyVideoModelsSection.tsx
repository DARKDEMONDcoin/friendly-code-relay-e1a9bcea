import { motion } from "framer-motion";
import { useLandingContent } from "@/lib/landing/LandingContentContext";
import { Video, Film, Clock, Ratio, AudioLines, Sparkles, Settings2, Wand2 } from "lucide-react";

type VideoCopy = {
  kicker: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  items: Array<{ name: string; cost: string; description: string }>;
  settings: {
    title: string;
    subtitle: string;
    items: Array<{ icon: typeof Ratio; label: string; value: string }>;
  };
};

const COPY: Record<string, VideoCopy> = {
  ar: {
    kicker: "نماذج الفيديو",
    title: "فيديوهات",
    titleHighlight: "سينمائية بنقرة.",
    subtitle:
      "أفضل نماذج توليد الفيديو في العالم — حركة سلسة، إضاءة سينمائية، وأصوات أصلية.",
    items: [
      { name: "Veo 3.1", cost: "60 MC", description: "أفضل نموذج فيديو من Google بصوت أصلي وحركة طبيعية." },
      { name: "Kling 3 Pro", cost: "45 MC", description: "حركة دقيقة وثبات للشخصيات بمقاطع طويلة بدقة 1080p." },
      { name: "Runway Gen-4", cost: "50 MC", description: "تحكم سينمائي في الكاميرا والإضاءة والإيقاع." },
      { name: "Hunyuan Video", cost: "30 MC", description: "نموذج مفتوح بأسلوب فني واقعي وحركة قوية." },
      { name: "Sora Turbo", cost: "55 MC", description: "مشاهد معقدة من OpenAI بإخراج واقعي مذهل." },
    ],
    settings: {
      title: "إعدادات الفيديو",
      subtitle: "اضبط كل تفصيلة قبل الإخراج — كأنك في غرفة تحكم حقيقية.",
      items: [
        { icon: Clock, label: "المدة", value: "4 · 8 · 12 ثانية" },
        { icon: Ratio, label: "نسبة العرض", value: "16:9 · 9:16 · 1:1" },
        { icon: Film, label: "حركة الكاميرا", value: "تتبع · تقريب · بانوراما · ثابت" },
        { icon: AudioLines, label: "الصوت ومزامنة الشفاه", value: "موسيقى · مؤثرات · Lip Sync" },
      ],
    },
  },
  en: {
    kicker: "Video models",
    title: "Cinematic video,",
    titleHighlight: "one click away.",
    subtitle:
      "The best video models in the world — smooth motion, cinematic lighting, native audio.",
    items: [
      { name: "Veo 3.1", cost: "60 MC", description: "Google's flagship with native audio and natural motion." },
      { name: "Kling 3 Pro", cost: "45 MC", description: "Precise motion and character consistency at 1080p." },
      { name: "Runway Gen-4", cost: "50 MC", description: "Cinematic control over camera, lighting and pacing." },
      { name: "Hunyuan Video", cost: "30 MC", description: "Open-source model with strong realistic motion." },
      { name: "Sora Turbo", cost: "55 MC", description: "Complex scenes from OpenAI with stunning realism." },
    ],
    settings: {
      title: "Video settings",
      subtitle: "Tune every detail before render — like a real control room.",
      items: [
        { icon: Clock, label: "Duration", value: "4 · 8 · 12 seconds" },
        { icon: Ratio, label: "Aspect ratio", value: "16:9 · 9:16 · 1:1" },
        { icon: Film, label: "Camera motion", value: "Track · Zoom · Pan · Static" },
        { icon: AudioLines, label: "Audio & Lip Sync", value: "Music · SFX · Lip Sync" },
      ],
    },
  },
};

const MegsyVideoModelsSection = () => {
  const { locale } = useLandingContent();
  const c = COPY[locale.code] ?? COPY.en;

  return (
    <section id="anchor-video-models-section" className="relative scroll-mt-28 overflow-hidden py-20 md:py-28">
      <div className="absolute left-1/4 top-1/3 -z-10 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5">
            <Video className="h-4 w-4 text-cyan-200" />
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">
              {c.kicker}
            </p>
          </div>
          <h2 className="font-display text-[10vw] font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-[6vw]">
            {c.title}{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
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
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 transition-all hover:border-cyan-400/40"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/30">
                  <Video className="h-5 w-5 text-cyan-100" />
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-100">
                  {m.cost}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{m.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{m.description}</p>
              <Sparkles className="absolute -bottom-4 -right-4 h-20 w-20 text-cyan-500/[0.06] transition-all group-hover:text-cyan-500/15" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 md:p-10"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/30">
              <Settings2 className="h-5 w-5 text-cyan-100" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground md:text-xl">{c.settings.title}</h3>
              <p className="text-sm text-foreground/70">{c.settings.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.settings.items.map((it) => (
              <div
                key={it.label}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-background/40 p-4"
              >
                <it.icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-100" />
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
      <Wand2 className="hidden" />
    </section>
  );
};

export default MegsyVideoModelsSection;
