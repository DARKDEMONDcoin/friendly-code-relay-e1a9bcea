// Privacy & data settings — cartoon redesign on mobile.
import { useNavigate } from "react-router-dom";
import { ChevronIcon } from "@/components/settings/SettingsIcons";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopSettingsLayout } from "@/components/settings/DesktopSettingsLayout";
import { CartoonPage, CartoonHero, CartoonCard } from "@/components/settings/CartoonSettingsShell";
import { INK, MINT, PINK, TEXT, MUTED } from "@/pages/billing/ReferralsPage";
import privacySticker from "@/assets/settings/privacy-sticker.png";

const links = [
  { title: "Privacy Policy", desc: "How we collect and use your data", href: "https://privacy.megsyai.com", external: true },
  { title: "Terms of Service", desc: "The rules for using Megsy", href: "https://terms.megsyai.com", external: true },
  { title: "Cookie Policy", desc: "Which cookies we use and why", href: "/cookies", external: false },
];

const actions = [
  { title: "Memory", desc: "View or clear what Megsy remembers", path: "/settings/memory" },
  { title: "Change email", desc: "Update your account email", path: "/settings/change-email" },
  { title: "Change password", desc: "Set a new password", path: "/settings/change-password" },
  { title: "Delete account", desc: "Permanently delete your data", path: "/settings/delete-account", danger: true },
];

export default function SettingsPrivacyPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const desktopBody = (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground leading-relaxed p-5 rounded-2xl border border-border bg-card">
        Your data belongs to you. Review our policies and control your data at any time.
      </p>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-2 px-1">
          Policies
        </p>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {links.map((l) => (
            <button
              key={l.title}
              onClick={() => (l.external ? window.open(l.href, "_blank") : navigate(l.href))}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{l.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{l.desc}</p>
              </div>
              <ChevronIcon className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-2 px-1">
          Your data
        </p>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {actions.map((a) => (
            <button
              key={a.title}
              onClick={() => navigate(a.path)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${a.danger ? "text-destructive" : "text-foreground"}`}>
                  {a.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
              <ChevronIcon className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isMobile) {
    return (
      <DesktopSettingsLayout title="Privacy & Data" subtitle="Control your data and review our policies.">
        {desktopBody}
      </DesktopSettingsLayout>
    );
  }

  const SectionList = ({
    title,
    items,
  }: {
    title: string;
    items: Array<{ title: string; desc: string; danger?: boolean; onClick: () => void }>;
  }) => (
    <section>
      <p className="text-[11px] uppercase tracking-[0.12em] mb-2 px-2" style={{ color: MUTED, fontWeight: 800 }}>
        {title}
      </p>
      <CartoonCard className="!p-0 overflow-hidden">
        {items.map((it, idx) => (
          <button
            key={it.title}
            onClick={it.onClick}
            className="w-full flex items-center gap-3 px-4 py-4 text-left transition active:bg-white/5"
            style={{ borderTop: idx === 0 ? "none" : `1px solid hsl(var(--surface-4))` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px]" style={{ color: it.danger ? "hsl(var(--brand-blush))" : TEXT, fontWeight: 800 }}>
                {it.title}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: MUTED, fontWeight: 600 }}>{it.desc}</p>
            </div>
            <ChevronIcon className="w-4 h-4 shrink-0" style={{ color: MUTED }} />
          </button>
        ))}
      </CartoonCard>
    </section>
  );

  return (
    <CartoonPage title="Privacy & Data">
      <CartoonHero
        sticker={privacySticker}
        bg={MINT}
        title="Your data, your call"
        subtitle="Review our policies and control your data at any time."
      />
      <div className="space-y-5 mt-2">
        <SectionList
          title="Policies"
          items={links.map((l) => ({
            title: l.title,
            desc: l.desc,
            onClick: () => (l.external ? window.open(l.href, "_blank") : navigate(l.href)),
          }))}
        />
        <SectionList
          title="Your data"
          items={actions.map((a) => ({
            title: a.title,
            desc: a.desc,
            danger: a.danger,
            onClick: () => navigate(a.path),
          }))}
        />
      </div>
    </CartoonPage>
  );
}
