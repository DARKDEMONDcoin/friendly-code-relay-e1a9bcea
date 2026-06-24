import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import {
  AccountIcon,
  WorkspacesIcon,
  BillingIcon,
  ThemeIcon,
  IntegrationsIcon,
  MemoryIcon,
  SkillsIcon,
  LanguageIcon,
  NotificationsIcon,
  AiPersonalizationIcon,
  SupportIcon,
  PrivacyIcon,
  GiftIcon,
  SparkleIcon,
  BackIcon,
} from "@/components/settings/SettingsIcons";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/layouts/AppLayout";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  external?: boolean;
};

type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Account",
    items: [
      { id: "overview", label: "Overview", icon: SparkleIcon, path: "/settings" },
      { id: "profile", label: "Profile", icon: AccountIcon, path: "/settings/profile" },
      { id: "billing", label: "Plan & Billing", icon: BillingIcon, path: "/settings/billing" },
      { id: "referrals", label: "Referrals", icon: GiftIcon, path: "/settings/referrals" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { id: "workspaces", label: "Workspaces", icon: WorkspacesIcon, path: "/settings/workspaces" },
      {
        id: "integrations",
        label: "Integrations",
        icon: IntegrationsIcon,
        path: "/settings/integrations",
      },
    ],
  },
  {
    title: "AI",
    items: [
      {
        id: "ai-personalization",
        label: "Personalization",
        icon: AiPersonalizationIcon,
        path: "/settings/ai-personalization",
      },
      { id: "memory", label: "Memory", icon: MemoryIcon, path: "/settings/memory" },
      { id: "skills", label: "Skills", icon: SkillsIcon, path: "/settings/skills" },
    ],
  },
  {
    title: "System",
    items: [
      {
        id: "customization",
        label: "Appearance",
        icon: ThemeIcon,
        path: "/settings/customization",
      },
      { id: "language", label: "Language", icon: LanguageIcon, path: "/settings/language" },
      {
        id: "notifications",
        label: "Notifications",
        icon: NotificationsIcon,
        path: "/settings/notifications",
      },
      { id: "privacy", label: "Privacy & Data", icon: PrivacyIcon, path: "/settings/privacy" },
    ],
  },
  {
    title: "Support",
    items: [{ id: "support", label: "Help Center", icon: SupportIcon, path: "/settings/support" }],
  },
];

interface DesktopSettingsLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function DesktopSettingsLayout({
  children,
  title,
  subtitle,
  action,
}: DesktopSettingsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => {
    if (path === "/settings") return location.pathname === "/settings";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <AppLayout>
      <div data-settings-page className="settings-desktop-canvas h-full w-full overflow-hidden">
        <div className="h-full w-full flex">
          {/* Sidebar */}
          <aside className="w-72 shrink-0 bg-background border-r border-border flex flex-col">
            <div className="px-4 pt-5 pb-4 flex items-center gap-2">
              <button
                onClick={() => navigate("/chat")}
                className="w-8 h-8 grid place-items-center rounded-lg text-primary hover:bg-muted/50 transition-colors -ml-1"
                aria-label="Back"
              >
                <BackIcon className="w-5 h-5" />
              </button>
              <span className="font-display text-base font-bold text-foreground tracking-tight">
                Settings
              </span>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.path)}
                          className={cn(
                            "w-full h-10 px-3 flex items-center gap-3 rounded-xl border border-transparent transition-all text-[14px] font-medium",
                            active
                              ? "text-foreground"
                              : "text-foreground/80 hover:text-foreground hover:bg-foreground/[0.06]",
                          )}
                          style={active ? {
                            background: "radial-gradient(80% 100% at 50% 100%, hsl(var(--primary) / 0.55), hsl(var(--primary) / 0.10) 75%), linear-gradient(180deg, hsl(var(--primary) / 0.30), hsl(var(--primary) / 0.14))",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 26px -14px hsl(var(--primary) / 0.85)",
                            borderColor: "hsl(var(--primary) / 0.45)",
                          } : undefined}
                        >
                          <Icon className={cn("w-4 h-4", active ? undefined : "opacity-80")} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-border/60 px-3 py-3">
              <button
                onClick={handleLogout}
                className="w-full h-10 px-3 flex items-center gap-3 rounded-xl border border-transparent text-[14px] font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/[0.06] transition-all"
              >
                <LogOut className="w-4 h-4 opacity-80" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-12 py-10">
              {action && <div className="flex justify-end mb-6">{action}</div>}
              <div className="pb-16">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
}

export default DesktopSettingsLayout;
