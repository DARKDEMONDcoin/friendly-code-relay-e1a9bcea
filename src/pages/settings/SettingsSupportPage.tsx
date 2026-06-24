// Support hub — cartoon redesign on mobile.
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronIcon,
  FAQIcon,
  HumanSupportIcon,
  AISupportIcon,
} from "@/components/settings/SettingsIcons";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopSettingsLayout } from "@/components/settings/DesktopSettingsLayout";
import { CartoonPage, CartoonHero, CartoonCard } from "@/components/settings/CartoonSettingsShell";
import { INK, PINK, YELLOW, MINT, LAVENDER, TEXT, MUTED } from "@/pages/billing/ReferralsPage";
import supportSticker from "@/assets/settings/support-sticker.png";

const options = [
  {
    icon: FAQIcon,
    title: "Help Center",
    desc: "Browse FAQs and a guide for every page and section.",
    path: "/settings/support/help",
    tone: YELLOW,
  },
  {
    icon: AISupportIcon,
    title: "Ask AI",
    desc: "Instant answers from Megsy's AI support assistant.",
    path: "/support",
    tone: MINT,
  },
  {
    icon: HumanSupportIcon,
    title: "Contact our team",
    desc: "Write your issue and a human will reply by email.",
    path: "/settings/support/contact",
    tone: LAVENDER,
  },
];

export default function SettingsSupportPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const desktopList = (
    <div className="space-y-2.5">
      {options.map((opt, i) => {
        const Icon = opt.icon;
        return (
          <motion.button
            key={opt.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06 }}
            onClick={() => navigate(opt.path)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-muted grid place-items-center text-foreground shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{opt.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.desc}</p>
            </div>
            <ChevronIcon className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          </motion.button>
        );
      })}
    </div>
  );

  if (!isMobile) {
    return (
      <DesktopSettingsLayout title="Help & Support" subtitle="Choose how you'd like to get help.">
        {desktopList}
      </DesktopSettingsLayout>
    );
  }

  return (
    <CartoonPage title="Help & Support">
      <CartoonHero
        sticker={supportSticker}
        bg={PINK}
        title="How can we help?"
        subtitle="Pick the option that fits — we reply fast."
      />

      <div className="space-y-3 mt-2">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              onClick={() => navigate(opt.path)}
              className="w-full flex items-center gap-4 p-4 rounded-[22px] text-left transition active:translate-x-[1px] active:translate-y-[1px]"
              style={{
                backgroundColor: "hsl(var(--surface-1))",
                border: `2px solid ${INK}`,
                boxShadow: `3px 3px 0 ${INK}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-[14px] grid place-items-center shrink-0"
                style={{ backgroundColor: opt.tone, border: `2px solid ${INK}`, color: INK }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px]" style={{ color: TEXT, fontWeight: 900 }}>{opt.title}</p>
                <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: MUTED, fontWeight: 600 }}>
                  {opt.desc}
                </p>
              </div>
              <ChevronIcon className="w-4 h-4 shrink-0" style={{ color: MUTED }} />
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-[11px] mt-8" style={{ color: MUTED, fontWeight: 700 }}>
        Typical reply time · under 24 hours
      </p>
    </CartoonPage>
  );
}
