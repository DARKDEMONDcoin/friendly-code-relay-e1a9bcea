// Integrations page — Paper & Ink editorial desktop + cartoon mobile.
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { integrations, INTEGRATION_CATEGORIES, type Integration } from "@/lib/integrationsData";
import IntegrationDetailModal from "@/components/integrations/IntegrationDetailModal";
import { ArrowLeft, Search } from "lucide-react";
import {
  INK as CARTOON_INK,
  YELLOW, MINT, PINK, LAVENDER, PEACH,
  PAGE_BG, SURFACE, SURFACE_2, BORDER, TEXT as CARTOON_TEXT, MUTED,
} from "@/pages/billing/ReferralsPage";
import integrationsSticker from "@/assets/settings/integrations-sticker.png";

type AppMeta = Record<string, any>;

// ---------- Palette (locked: Paper & Ink) ----------
const PAPER = "#f5f3ee";
const PAPER_2 = "#e8e4dd";
const INK = "#0d0d0d";
const INK_2 = "#2d2d2d";
const INK_MUTED = "#6b6b66";
const DISPLAY = "'Space Grotesk', sans-serif";
const BODY = "'DM Sans', sans-serif";

// ---------- Brand logo ----------
const FAVICON_SOURCES = (domain: string) => [
  `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
];

const BrandLogo = ({ integration, size = 28 }: { integration: Integration; size?: number }) => {
  const [srcIdx, setSrcIdx] = useState(0);
  const sources = integration.domain ? FAVICON_SOURCES(integration.domain) : [];
  const url = sources[srcIdx];
  if (!url) {
    return (
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 600,
          color: INK_2,
          fontSize: size * 0.55,
        }}
      >
        {integration.name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain"
      loading="lazy"
      onError={() => setSrcIdx((i) => i + 1)}
    />
  );
};

const LogoTile = ({ integration, size = 44 }: { integration: Integration; size?: number }) => (
  <div
    className="grid place-items-center shrink-0"
    style={{
      width: size,
      height: size,
      background: "#ffffff",
      border: `1px solid ${PAPER_2}`,
    }}
  >
    <BrandLogo integration={integration} size={Math.round(size * 0.6)} />
  </div>
);

// ---------- Page ----------
const IntegrationsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({});
  const [appMeta, setAppMeta] = useState<Record<string, AppMeta>>({});
  const [loadingApp, setLoadingApp] = useState<string | null>(null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [toolEnabled, setToolEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConnections();
    loadToolSettings();
  }, []);

  const loadToolSettings = async () => {
    const { data } = await supabase.from("pipedream_tool_settings").select("app_slug, enabled");
    const map: Record<string, boolean> = {};
    for (const row of data ?? []) map[row.app_slug] = row.enabled;
    setToolEnabled(map);
  };

  const toggleTool = async (appSlug: string, next: boolean) => {
    setToolEnabled((prev) => ({ ...prev, [appSlug]: next }));
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("pipedream_tool_settings")
      .upsert(
        {
          user_id: user.id,
          app_slug: appSlug,
          enabled: next,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,app_slug" },
      );
  };

  const loadConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const [github, supa, notify, cf, pd] = await Promise.all([
        supabase.functions.invoke("github-push", { body: { action: "status" } }),
        supabase.functions.invoke("supabase-link-manager", { body: { action: "status" } }),
        supabase.functions.invoke("report-error", { headers: { "x-fn": "notify-user" }, body: { action: "status" } }),
        supabase.functions.invoke("report-error", { headers: { "x-fn": "check-cf-secrets" }, body: {} }),
        supabase.functions.invoke("pipedream-connect", { body: { action: "list_accounts" } }),
      ]);

      const connected: Record<string, boolean> = {};
      const meta: Record<string, AppMeta> = {};

      if (!github.error && github.data?.connected) connected.github = true;
      if (!supa.error && supa.data?.connected) connected.supabase = true;

      if (!notify.error && notify.data) {
        meta.email = { ...notify.data.email };
        meta.telegram = { ...notify.data.telegram };
        if (notify.data.email?.connected) connected.email = true;
        if (notify.data.telegram?.connected) connected.telegram = true;
      }

      const cfOk = !cf.error && cf.data?.verify?.success === true;
      meta.cloudflare = { available: cfOk };
      if (cfOk) connected.cloudflare = true;

      if (!pd.error && Array.isArray(pd.data?.accounts)) {
        for (const a of pd.data.accounts) {
          const slug = a.app_slug ?? a.app?.name_slug ?? a.app?.slug;
          if (!slug) continue;
          connected[slug] = true;
          meta[slug] = {
            account_id: a.account_id ?? a.id,
            account_name: a.account_name ?? a.name,
          };
        }
      }

      setConnectedApps(connected);
      setAppMeta(meta);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const handleConnect = async (integration: Integration, form?: any) => {
    setLoadingApp(integration.id);
    try {
      if (integration.type === "pipedream" && integration.pipedreamSlug) {
        const { data, error } = await supabase.functions.invoke("pipedream-connect", {
          body: { action: "create_token" },
        });
        if (error || data?.error || !data?.connect_link_url) {
          throw new Error(data?.error || error?.message || "Pipedream not configured");
        }
        const url = `${data.connect_link_url}&app=${encodeURIComponent(integration.pipedreamSlug)}`;
        const popup = window.open(url, `pd-${integration.app}`, "width=600,height=750");
        if (!popup) throw new Error("Allow popups to complete the connection");

        await new Promise<void>((resolve) => {
          const start = Date.now();
          const timer = window.setInterval(async () => {
            if (popup.closed || Date.now() - start > 180_000) {
              window.clearInterval(timer);
              resolve();
              return;
            }
            const { data: poll } = await supabase.functions.invoke("pipedream-connect", {
              body: { action: "list_accounts" },
            });
            const found = (poll?.accounts || []).some(
              (a: any) =>
                (a.app_slug ?? a.app?.name_slug ?? a.app?.slug) === integration.pipedreamSlug,
            );
            if (found) {
              window.clearInterval(timer);
              try {
                popup.close();
              } catch {}
              resolve();
            }
          }, 2500);
        });

        await loadConnections();
        if (connectedApps[integration.app]) toast.success(`${integration.name} connected`);
        setSelectedIntegration(null);
        return;
      }

      if (integration.app === "github" || integration.app === "supabase") {
        const popup = window.open(
          "about:blank",
          `${integration.app}-oauth`,
          "width=600,height=750",
        );
        try {
          const startFn =
            integration.app === "github" ? "oauth-github-connect" : "supabase-oauth-start";
          const { data, error } = await supabase.functions.invoke(startFn, {
            body: { redirect_to: window.location.href },
          });
          if (error || data?.error || !data?.authorize_url) {
            throw new Error(data?.error || error?.message || "OAuth is not configured");
          }
          if (!popup) throw new Error("Allow popups to complete the connection");
          popup.location.href = data.authorize_url;

          await new Promise<void>((resolve) => {
            const listener = (ev: MessageEvent) => {
              if (ev.data?.type !== `${integration.app}-oauth`) return;
              window.removeEventListener("message", listener);
              window.clearInterval(poll);
              resolve();
            };
            window.addEventListener("message", listener);
            const poll = window.setInterval(() => {
              if (popup.closed) {
                window.clearInterval(poll);
                window.removeEventListener("message", listener);
                resolve();
              }
            }, 1000);
          });

          await loadConnections();
          toast.success(`${integration.name} connected`);
          setSelectedIntegration(null);
        } catch (e) {
          if (popup && !popup.closed) popup.close();
          throw e;
        }
        return;
      }

      if (integration.app === "email" || integration.app === "telegram") {
        const { data, error } = await supabase.functions.invoke("report-error", { headers: { "x-fn": "notify-user" }, body: { action: "connect", app: integration.app, ...(form || {}) },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message || "Failed");
        await loadConnections();
        toast.success(`${integration.name} enabled`);
        setSelectedIntegration(null);
        return;
      }

      if (integration.app === "cloudflare") {
        toast.info("Cloudflare is configured by the server administrator.");
        return;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${integration.name} connection failed`);
    } finally {
      setLoadingApp(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    setLoadingApp(integration.id);
    try {
      if (integration.type === "pipedream") {
        const accountId = appMeta[integration.app]?.account_id;
        if (accountId) {
          await supabase.functions.invoke("pipedream-connect", {
            body: { action: "delete_account", account_id: accountId },
          });
        }
      } else if (integration.app === "github") {
        await supabase.functions.invoke("github-push", { body: { action: "disconnect" } });
      } else if (integration.app === "supabase") {
        await supabase.functions.invoke("supabase-link-manager", {
          body: { action: "disconnect" },
        });
      } else if (integration.app === "email" || integration.app === "telegram") {
        await supabase.functions.invoke("report-error", { headers: { "x-fn": "notify-user" }, body: { action: "disconnect", app: integration.app },
        });
      }
      await loadConnections();
      toast.success(`${integration.name} disconnected`);
      setSelectedIntegration(null);
    } finally {
      setLoadingApp(null);
    }
  };

  const isConnected = (app: string) => !!connectedApps[app];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return integrations.filter((i) => {
      if (activeCategory !== "All" && i.category !== activeCategory) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const connectedCount = Object.keys(connectedApps).filter((k) => connectedApps[k]).length;

  // Per-category counts for sidebar
  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = { All: integrations.length };
    for (const i of integrations) m[i.category] = (m[i.category] ?? 0) + 1;
    return m;
  }, []);

  // ---------- Row (list-style card) ----------
  const Row = ({ integration }: { integration: Integration }) => {
    const connected = isConnected(integration.app);
    const isPipedream = integration.type === "pipedream";
    const enabled = toolEnabled[integration.app] !== false;
    return (
      <div
        className="group flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5"
        style={{ borderBottom: `1px solid ${PAPER_2}`, background: PAPER }}
      >
        <button
          onClick={() => setSelectedIntegration(integration)}
          className="flex items-center gap-4 flex-1 text-left min-w-0"
        >
          <LogoTile integration={integration} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h3
                className="text-[15px] truncate"
                style={{ fontFamily: DISPLAY, fontWeight: 600, color: INK }}
              >
                {integration.name}
              </h3>
              {connected && (
                <span
                  className="uppercase"
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    color: INK_MUTED,
                    borderBottom: `1px solid ${INK_2}`,
                    paddingBottom: 1,
                  }}
                >
                  Connected
                </span>
              )}
            </div>
            <p
              className="text-[13px] mt-1 line-clamp-2"
              style={{ color: INK_MUTED, fontFamily: BODY }}
            >
              {integration.description}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-3 sm:gap-5 sm:pl-4 sm:ml-auto">
          {connected && isPipedream && (
            <label
              className="flex items-center gap-2 cursor-pointer select-none"
              title="Use in chat"
            >
              <span
                className="uppercase"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  color: INK_MUTED,
                }}
              >
                Use in chat
              </span>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enabled}
                onChange={(e) => toggleTool(integration.app, e.target.checked)}
              />
              <span
                aria-hidden
                className="relative inline-flex h-[18px] w-[34px] items-center transition-colors"
                style={{
                  background: enabled ? INK : "transparent",
                  border: `1px solid ${INK}`,
                }}
              >
                <span
                  className="inline-block h-[12px] w-[12px] transition-transform"
                  style={{
                    background: enabled ? PAPER : INK,
                    transform: enabled ? "translateX(18px)" : "translateX(2px)",
                  }}
                />
              </span>
            </label>
          )}

          <button
            onClick={() => setSelectedIntegration(integration)}
            className="px-5 py-2 text-[11px] uppercase transition-colors shrink-0"
            style={{
              fontFamily: DISPLAY,
              letterSpacing: "0.22em",
              background: connected ? "transparent" : INK,
              color: connected ? INK : PAPER,
              border: `1px solid ${INK}`,
            }}
          >
            {connected ? "Manage" : "Connect"}
          </button>
        </div>
      </div>
    );
  };

  // ---------- Sidebar ----------
  const Sidebar = () => (
    <aside
      className="hidden lg:flex flex-col shrink-0"
      style={{
        width: 280,
        background: PAPER,
        borderRight: `1px solid ${PAPER_2}`,
        minHeight: "100dvh",
      }}
    >
      <div className="px-7 pt-10 pb-8">
        <button
          onClick={() => navigate("/settings")}
          className="text-[11px] uppercase hover:opacity-60 transition-opacity"
          style={{ fontFamily: DISPLAY, letterSpacing: "0.24em", color: INK_MUTED }}
        >
          ← Settings
        </button>
        <h1
          className="mt-8 leading-[1.05]"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            color: INK,
            fontSize: 34,
            letterSpacing: "-0.02em",
          }}
        >
          Integrations
        </h1>
        <p
          className="mt-3 text-[12px] uppercase"
          style={{ fontFamily: DISPLAY, letterSpacing: "0.2em", color: INK_MUTED }}
        >
          {connectedCount} / {integrations.length} Connected
        </p>
      </div>

      <nav className="px-3 pb-10 overflow-y-auto flex-1">
        <p
          className="px-4 pb-3 uppercase"
          style={{ fontFamily: DISPLAY, fontSize: 10, letterSpacing: "0.24em", color: INK_MUTED }}
        >
          Categories
        </p>
        {INTEGRATION_CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          const count = categoryCounts[cat] ?? 0;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
              style={{
                fontFamily: BODY,
                fontSize: 14,
                color: active ? INK : INK_2,
                background: active ? "#ffffff" : "transparent",
                borderLeft: `2px solid ${active ? INK : "transparent"}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              <span>{cat}</span>
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 11,
                  color: INK_MUTED,
                  letterSpacing: "0.05em",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );

  // ---------- Main content ----------
  const Main = () => (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex-1 min-w-0"
      style={{ background: PAPER, color: INK, fontFamily: BODY }}
    >
      {/* Mobile header */}
      <header
        className="lg:hidden sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{ background: PAPER, borderBottom: `1px solid ${PAPER_2}` }}
      >
        <button
          onClick={() => navigate("/settings")}
          className="text-[11px] uppercase"
          style={{ fontFamily: DISPLAY, letterSpacing: "0.24em", color: INK_2 }}
        >
          ← Back
        </button>
        <span
          className="text-[11px] uppercase"
          style={{ fontFamily: DISPLAY, letterSpacing: "0.24em", color: INK }}
        >
          Integrations
        </span>
        <span style={{ width: 48 }} />
      </header>

      <div className="lg:hidden px-5 pt-7 pb-2">
        <h1
          className="leading-[1.05]"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            color: INK,
            fontSize: 32,
            letterSpacing: "-0.02em",
          }}
        >
          Integrations
        </h1>
        <p
          className="mt-2 text-[11px] uppercase"
          style={{ fontFamily: DISPLAY, letterSpacing: "0.22em", color: INK_MUTED }}
        >
          {connectedCount} / {integrations.length} Connected
        </p>
      </div>

      {/* Toolbar */}
      <div
        className="sticky top-0 lg:top-0 z-[5] px-5 lg:px-10 py-5"
        style={{ background: PAPER, borderBottom: `1px solid ${PAPER_2}` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations"
            className="flex-1 px-4 py-2.5 text-[14px] outline-none focus:border-[#0d0d0d] transition-colors"
            style={{
              background: "#ffffff",
              border: `1px solid ${PAPER_2}`,
              color: INK,
              fontFamily: BODY,
            }}
          />
          <div
            className="hidden sm:flex items-center px-4"
            style={{
              fontFamily: DISPLAY,
              fontSize: 11,
              letterSpacing: "0.22em",
              color: INK_MUTED,
            }}
          >
            <span className="uppercase">
              {filtered.length} {filtered.length === 1 ? "Result" : "Results"}
            </span>
          </div>
        </div>

        {/* Mobile category chips */}
        <div className="lg:hidden mt-4 -mx-5 px-5 overflow-x-auto flex gap-2 scrollbar-hide">
          {INTEGRATION_CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-4 py-1.5 text-[11px] uppercase whitespace-nowrap transition-colors"
                style={{
                  fontFamily: DISPLAY,
                  letterSpacing: "0.2em",
                  background: active ? INK : "transparent",
                  color: active ? PAPER : INK_2,
                  border: `1px solid ${active ? INK : PAPER_2}`,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="px-0 lg:px-10 py-2 lg:py-6">
        {isLoadingConnections ? (
          <div
            className="text-center py-24 text-[12px] uppercase"
            style={{ fontFamily: DISPLAY, letterSpacing: "0.24em", color: INK_MUTED }}
          >
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-24 mx-5 lg:mx-0"
            style={{ border: `1px dashed ${PAPER_2}` }}
          >
            <p
              className="uppercase text-[12px]"
              style={{ fontFamily: DISPLAY, letterSpacing: "0.24em", color: INK }}
            >
              No matches
            </p>
            <p className="text-[12px] mt-2" style={{ color: INK_MUTED }}>
              Try a different keyword or category.
            </p>
          </div>
        ) : (
          <div style={{ borderTop: `1px solid ${PAPER_2}` }}>
            {filtered.map((i) => (
              <Row key={i.id} integration={i} />
            ))}
          </div>
        )}
      </div>

      <IntegrationDetailModal
        integration={selectedIntegration}
        isConnected={selectedIntegration ? isConnected(selectedIntegration.app) : false}
        isLoading={selectedIntegration ? loadingApp === selectedIntegration.id : false}
        meta={selectedIntegration ? appMeta[selectedIntegration.app] : undefined}
        onConnect={(form) => selectedIntegration && handleConnect(selectedIntegration, form)}
        onDisconnect={() => selectedIntegration && handleDisconnect(selectedIntegration)}
        onClose={() => setSelectedIntegration(null)}
      />
    </motion.main>
  );

  if (isMobile) {
    return <MobileIntegrationsView
      filtered={filtered}
      query={query}
      setQuery={setQuery}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      connectedCount={connectedCount}
      isConnected={isConnected}
      isLoadingConnections={isLoadingConnections}
      onPick={setSelectedIntegration}
      selectedIntegration={selectedIntegration}
      handleConnect={handleConnect}
      handleDisconnect={handleDisconnect}
      loadingApp={loadingApp}
      appMeta={appMeta}
      toolEnabled={toolEnabled}
      toggleTool={toggleTool}
    />;
  }

  return (
    <div
      className="flex w-full"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: BODY,
        minHeight: "100dvh",
      }}
    >
      <Sidebar />
      <Main />
    </div>
  );
};

// ---------- Mobile cartoon view ----------
type MobileViewProps = {
  filtered: Integration[];
  query: string;
  setQuery: (s: string) => void;
  activeCategory: string;
  setActiveCategory: (s: string) => void;
  connectedCount: number;
  isConnected: (a: string) => boolean;
  isLoadingConnections: boolean;
  onPick: (i: Integration) => void;
  selectedIntegration: Integration | null;
  handleConnect: (i: Integration, form?: any) => void;
  handleDisconnect: (i: Integration) => void;
  loadingApp: string | null;
  appMeta: Record<string, any>;
  toolEnabled: Record<string, boolean>;
  toggleTool: (app: string, next: boolean) => void;
};

const CARTOON_FAVICON = (domain: string) => [
  `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
];

const CartoonLogo = ({ integration }: { integration: Integration }) => {
  const [srcIdx, setSrcIdx] = useState(0);
  const sources = integration.domain ? CARTOON_FAVICON(integration.domain) : [];
  const url = sources[srcIdx];
  return (
    <div
      className="grid place-items-center shrink-0 rounded-2xl"
      style={{ width: 48, height: 48, background: "#fff", border: `2px solid ${CARTOON_INK}` }}
    >
      {url ? (
        <img
          src={url}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          className="object-contain"
          onError={() => setSrcIdx((i) => i + 1)}
        />
      ) : (
        <span style={{ color: CARTOON_INK, fontWeight: 900, fontSize: 18 }}>{integration.name.charAt(0)}</span>
      )}
    </div>
  );
};

function MobileIntegrationsView(p: MobileViewProps) {
  const navigate = useNavigate();
  const catTones = [YELLOW, MINT, PINK, LAVENDER, PEACH];
  return (
    <div className="relative min-h-[100dvh] overflow-y-auto" style={{ backgroundColor: PAGE_BG, color: CARTOON_TEXT }}>
      <header
        className="sticky top-0 z-20"
        style={{
          backgroundColor: `${PAGE_BG}E6`,
          backdropFilter: "saturate(160%) blur(18px)",
          WebkitBackdropFilter: "saturate(160%) blur(18px)",
          borderBottom: `1.5px solid ${BORDER}`,
        }}
      >
        <div className="max-w-lg mx-auto px-5 flex items-center justify-between py-3 safe-top">
          <button
            onClick={() => navigate("/settings")}
            className="grid h-10 w-10 place-items-center rounded-full active:translate-x-[1px] active:translate-y-[1px] transition"
            style={{ backgroundColor: SURFACE, border: `2px solid ${BORDER}`, color: CARTOON_TEXT }}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px]" style={{ fontWeight: 900, letterSpacing: "-0.02em", color: CARTOON_TEXT }}>
            Integrations
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-12 safe-bottom">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div
            className="mt-4 rounded-[28px] p-6 flex flex-col items-center text-center"
            style={{ backgroundColor: LAVENDER, border: `2.5px solid ${CARTOON_INK}`, boxShadow: `4px 4px 0 ${CARTOON_INK}` }}
          >
            <img src={integrationsSticker} alt="" width={130} height={130} loading="lazy" />
            <h2 className="mt-2 text-[20px]" style={{ fontWeight: 900, color: CARTOON_INK, letterSpacing: "-0.02em" }}>
              Connect your tools
            </h2>
            <p className="mt-1 text-[13px] max-w-[280px]" style={{ fontWeight: 700, color: CARTOON_INK, opacity: 0.8 }}>
              {p.connectedCount} of {integrations.length} connected
            </p>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: MUTED }}
              strokeWidth={2.5}
            />
            <input
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
              placeholder="Search integrations"
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-[14px] outline-none"
              style={{
                backgroundColor: SURFACE_2,
                border: `1.5px solid hsl(var(--surface-4))`,
                color: CARTOON_TEXT,
                fontWeight: 600,
              }}
            />
          </div>

          {/* Category chips */}
          <div className="mt-3 -mx-4 px-4 overflow-x-auto flex gap-2 scrollbar-hide">
            {INTEGRATION_CATEGORIES.map((cat, idx) => {
              const active = p.activeCategory === cat;
              const tone = catTones[idx % catTones.length];
              return (
                <button
                  key={cat}
                  onClick={() => p.setActiveCategory(cat)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap transition active:translate-x-[1px] active:translate-y-[1px]"
                  style={{
                    background: active ? tone : SURFACE,
                    color: active ? CARTOON_INK : CARTOON_TEXT,
                    border: `2px solid ${active ? CARTOON_INK : BORDER}`,
                    boxShadow: active ? `2px 2px 0 ${CARTOON_INK}` : "none",
                    fontWeight: 800,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="mt-4">
            {p.isLoadingConnections ? (
              <div
                className="text-center py-16 rounded-[22px] text-[12px]"
                style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}`, color: MUTED, fontWeight: 700 }}
              >
                Loading…
              </div>
            ) : p.filtered.length === 0 ? (
              <div
                className="text-center py-12 rounded-[22px]"
                style={{ backgroundColor: SURFACE, border: `1.5px dashed ${BORDER}` }}
              >
                <p className="text-[13px]" style={{ color: CARTOON_TEXT, fontWeight: 800 }}>No matches</p>
                <p className="text-[11px] mt-1" style={{ color: MUTED, fontWeight: 600 }}>Try another keyword.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {p.filtered.map((i) => {
                  const connected = p.isConnected(i.app);
                  const isPipedream = i.type === "pipedream";
                  const enabled = p.toolEnabled[i.app] !== false;
                  return (
                    <div
                      key={i.id}
                      className="rounded-[20px] p-3.5 flex items-center gap-3"
                      style={{
                        backgroundColor: SURFACE,
                        border: `2px solid ${CARTOON_INK}`,
                        boxShadow: `3px 3px 0 ${CARTOON_INK}`,
                      }}
                    >
                      <button onClick={() => p.onPick(i)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                        <CartoonLogo integration={i} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] truncate" style={{ color: CARTOON_TEXT, fontWeight: 800 }}>{i.name}</p>
                            {connected && (
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider"
                                style={{ background: MINT, color: CARTOON_INK, border: `1px solid ${CARTOON_INK}`, fontWeight: 800 }}
                              >
                                On
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] mt-0.5 line-clamp-1" style={{ color: MUTED, fontWeight: 600 }}>
                            {i.description}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        {connected && isPipedream && (
                          <button
                            onClick={() => p.toggleTool(i.app, !enabled)}
                            aria-label="Toggle tool"
                            className="relative w-9 h-5 rounded-full transition"
                            style={{ background: enabled ? CARTOON_INK : SURFACE_2, border: `2px solid ${CARTOON_INK}` }}
                          >
                            <span
                              className="absolute top-[1px] w-3 h-3 rounded-full transition-transform"
                              style={{
                                background: enabled ? MINT : MUTED,
                                transform: enabled ? "translateX(16px)" : "translateX(1px)",
                              }}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => p.onPick(i)}
                          className="px-3 py-1.5 rounded-full text-[11px] active:translate-x-[1px] active:translate-y-[1px] transition"
                          style={{
                            background: connected ? SURFACE_2 : YELLOW,
                            color: connected ? CARTOON_TEXT : CARTOON_INK,
                            border: `2px solid ${CARTOON_INK}`,
                            fontWeight: 800,
                          }}
                        >
                          {connected ? "Manage" : "Connect"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <IntegrationDetailModal
        integration={p.selectedIntegration}
        isConnected={p.selectedIntegration ? p.isConnected(p.selectedIntegration.app) : false}
        isLoading={p.selectedIntegration ? p.loadingApp === p.selectedIntegration.id : false}
        meta={p.selectedIntegration ? p.appMeta[p.selectedIntegration.app] : undefined}
        onConnect={(form) => p.selectedIntegration && p.handleConnect(p.selectedIntegration, form)}
        onDisconnect={() => p.selectedIntegration && p.handleDisconnect(p.selectedIntegration)}
        onClose={() => p.onPick(null as unknown as Integration)}
      />
    </div>
  );
}

export default IntegrationsPage;
