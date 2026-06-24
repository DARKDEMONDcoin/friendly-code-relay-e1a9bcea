import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, QrCode, X, Download, Share2, Check, Copy, Instagram, Send, MessageCircle, Facebook, Twitter, Music2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/layout/AppSidebar";
import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";
import referralHero from "@/assets/referral-hero.png";
import { safeCopyText } from "@/lib/safeClipboard";

export const WHATSAPP_PHONE = "201098821812";
export const PROMOTER_MESSAGE =
  "Hello, I want to join the Megsy AI promotion / referral system. Please send me the details.";
export const CREDITS_PER_SIGNUP = 15;
export const COMMISSION_PCT = 20;
export const MIN_PAYOUT = 10;

// Dark cartoon palette
export const PAGE_BG = "hsl(var(--brand-ink))";
export const SURFACE = "hsl(var(--surface-1))";
export const SURFACE_2 = "hsl(var(--surface-3))";
export const BORDER = "hsl(var(--surface-4))";
export const TEXT = "hsl(var(--brand-parchment))";
export const MUTED = "hsl(var(--brand-muted))";
export const INK = "hsl(var(--brand-ink))"; // used as border on bright stickers
export const YELLOW = "hsl(var(--brand-action))";
export const PINK = "hsl(var(--brand-blush))";
export const MINT = "hsl(var(--brand-mint))";
export const LAVENDER = "#C9A8FF";
export const PEACH = "#FFB088";
export const BLUE = "#5B8DEF";

export interface Referral { id: string; status: string; created_at: string; }
export interface Earning { id: string; amount: number; source_action: string; created_at: string; }
export interface Withdrawal { id: string; amount: number; status: string; method: string; created_at: string; }
export interface RewardTask {
  id: string; task_key: string; title: string; description: string | null;
  reward_credits: number; action_type: string; action_url: string | null;
  target_count: number; icon: string | null;
}
export interface UserTask { task_id: string; progress: number; completed_at: string | null; awarded_credits: number; }

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const statusTone = (s: string) => {
  if (s === "approved" || s === "paid" || s === "active")
    return "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20";
  if (s === "rejected") return "bg-rose-500/15 text-rose-400 ring-rose-500/20";
  return "bg-amber-500/15 text-amber-400 ring-amber-500/20";
};

export const statusLabel = (s: string) =>
  (({ approved: "Approved", pending: "Pending", rejected: "Rejected", paid: "Paid", active: "Active" }) as Record<string, string>)[s] ?? s;

export const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="flex flex-col items-center text-center py-10 px-4">
    <p className="text-[13.5px]" style={{ fontWeight: 700, color: TEXT }}>{title}</p>
    <p className="mt-1 text-[12px]" style={{ color: MUTED }}>{hint}</p>
  </div>
);

interface ReferralsContextValue {
  userId: string | null;
  code: string;
  link: string;
  refs: Referral[];
  earns: Earning[];
  wds: Withdrawal[];
  tasks: RewardTask[];
  userTasks: UserTask[];
  totalEarned: number;
  committed: number;
  available: number;
  signups: number;
  canWithdraw: boolean;
  justCopied: boolean;
  claimTask: (task: RewardTask) => Promise<unknown>;
  copyLink: () => Promise<void>;
  shareLink: () => Promise<void>;
  openPromoter: () => void;
  reload: () => Promise<void>;
}

const ReferralsCtx = createContext<ReferralsContextValue | null>(null);
export const useReferrals = () => {
  const v = useContext(ReferralsCtx);
  if (!v) throw new Error("useReferrals must be used inside ReferralsLayout");
  return v;
};

const TABS = [
  { to: "/settings/referrals", label: "Dashboard", end: true },
  { to: "/settings/referrals/program", label: "Program", end: false },
  { to: "/settings/referrals/tasks", label: "Tasks", end: false },
  { to: "/settings/referrals/withdrawals", label: "Withdraw", end: false },
] as const;

const ReferralsPage = () => {
  const navigate = useNavigate();
  const qrRef = useRef<SVGSVGElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [refs, setRefs] = useState<Referral[]>([]);
  const [earns, setEarns] = useState<Earning[]>([]);
  const [wds, setWds] = useState<Withdrawal[]>([]);
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [justCopied, setJustCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: codes } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .limit(1);
    let row = codes?.[0] as { code: string } | undefined;
    if (!row) {
      const newCode = `MEGSY-${user.id.substring(0, 6).toUpperCase()}`;
      await supabase.from("referral_codes").insert({ user_id: user.id, code: newCode, referral_mode: "cash" });
      row = { code: newCode };
    }
    setCode(row.code);

    const [r, e, w, tk, ut] = await Promise.all([
      supabase.from("referrals").select("*").eq("referrer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("referral_earnings").select("*").eq("referrer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("reward_tasks").select("*").eq("active", true).order("sort_order"),
      supabase.from("user_reward_tasks").select("task_id, progress, completed_at, awarded_credits").eq("user_id", user.id),
    ]);
    setRefs(r.data ?? []);
    setEarns(e.data ?? []);
    setWds(w.data ?? []);
    setTasks((tk.data as RewardTask[]) ?? []);
    setUserTasks((ut.data as UserTask[]) ?? []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const grantCredits = async (amount: number, description: string) => {
    if (!userId || !amount) return null;
    const { data, error } = await supabase.rpc("add_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
    });
    if (error) {
      toast.error(`Couldn't credit your account: ${error.message}`);
      return false;
    }
    const payload = data as { success?: boolean; error?: string } | null;
    if (payload && payload.success === false) {
      toast.error(`Couldn't credit your account: ${payload.error ?? "Unknown error"}`);
      return false;
    }
    // Notify the rest of the app so the credits badge in the header refreshes immediately
    window.dispatchEvent(new Event("credits-changed"));
    return true;
  };

  const claimTask = async (task: RewardTask) => {
    if (!userId) return;
    const existing = userTasks.find((u) => u.task_id === task.id);
    if (existing?.completed_at) return;

    if (task.action_type === "invite_friends") {
      const progress = refs.length;
      if (progress < task.target_count) {
        toast.error(`Invite ${task.target_count - progress} more friends first`);
        return;
      }
      const { error } = await supabase.from("user_reward_tasks").upsert(
        { user_id: userId, task_id: task.id, progress, completed_at: new Date().toISOString(), awarded_credits: task.reward_credits },
        { onConflict: "user_id,task_id" },
      );
      if (error) return toast.error(error.message);
      const granted = await grantCredits(task.reward_credits, `Reward: ${task.title}`);
      if (granted !== false) toast.success(`+${task.reward_credits} credits added to your balance!`);
      loadData();
      return;
    }

    if (task.action_url) window.open(task.action_url, "_blank", "noopener,noreferrer");
    const { error } = await supabase.from("user_reward_tasks").upsert(
      { user_id: userId, task_id: task.id, progress: 1, completed_at: new Date().toISOString(), awarded_credits: task.reward_credits },
      { onConflict: "user_id,task_id" },
    );
    if (error) return toast.error(error.message);
    const granted = await grantCredits(task.reward_credits, `Reward: ${task.title}`);
    if (granted !== false) toast.success(`+${task.reward_credits} credits added to your balance!`);
    loadData();
  };

  const link = code ? `${window.location.origin}/ref/${code}` : "";
  const totalEarned = earns.reduce((s, x) => s + Number(x.amount), 0);
  const committed = wds.filter((w) => w.status !== "rejected").reduce((s, x) => s + Number(x.amount), 0);
  const available = totalEarned - committed;
  const signups = refs.length;
  const canWithdraw = available >= MIN_PAYOUT;

  const copyLink = async () => {
    if (!link) return;
    await safeCopyText(link);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1600);
    toast.success("Link copied");
  };

  const shareLink = async () => {
    if (!link) return;
    const shareText = `جرب Megsy AI واحصل على ${CREDITS_PER_SIGNUP} رصيدًا مجانيًا عند التسجيل باستخدام رابط الدعوة الخاص بي:\n${link}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Megsy AI",
          text: `جرب Megsy AI واحصل على ${CREDITS_PER_SIGNUP} رصيدًا مجانيًا عند التسجيل باستخدام رابط الدعوة الخاص بي:`,
          url: link,
        });
        return;
      } catch { /* fallthrough */ }
    }
    await safeCopyText(shareText);
    toast.success("تم نسخ رسالة الدعوة والرابط بنجاح!");
  };

  const openPromoter = () => {
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(PROMOTER_MESSAGE)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `megsy-referral-qr-${code}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("QR code downloaded");
  };

  const copyQRLink = async () => {
    if (!link) return;
    await safeCopyText(link);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1600);
    toast.success("Link copied");
  };

  const ctx: ReferralsContextValue = {
    userId, code, link, refs, earns, wds, tasks, userTasks,
    totalEarned, committed, available, signups, canWithdraw, justCopied,
    claimTask, copyLink, shareLink, openPromoter, reload: loadData,
  };

  return (
    <ReferralsCtx.Provider value={ctx}>
      <div className="md:hidden">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewChat={() => navigate("/")} currentMode="chat" />
      </div>
      <div
        dir="ltr"
        className="min-h-[100dvh] antialiased"
        style={{
          backgroundColor: PAGE_BG,
          color: TEXT,
          fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-40" style={{ backgroundColor: PAGE_BG, borderBottom: `1px solid ${BORDER}` }}>
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <MobileSidebarButton onClick={() => setSidebarOpen(true)} testId="mobile-open-sidebar" />
            <button
              onClick={() => setQrOpen(true)}
              aria-label="QR code"
              className="grid h-11 w-11 place-items-center rounded-full transition active:scale-90"
              style={{ color: TEXT }}
            >
              <QrCode className="h-6 w-6" strokeWidth={2.2} />
            </button>
          </div>
        </header>

        {/* QR Code Modal */}
        {qrOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            style={{ backgroundColor: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setQrOpen(false)}
          >
            <div
              className="relative w-full max-w-sm overflow-hidden rounded-[28px] p-6"
              style={{ backgroundColor: SURFACE, border: `2.5px solid ${BORDER}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setQrOpen(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full transition active:scale-90"
                style={{ backgroundColor: SURFACE_2, border: `2px solid ${BORDER}`, color: TEXT }}
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={3} />
              </button>

              <div className="text-center">
                <h2
                  className="text-[22px] leading-tight"
                  style={{ fontWeight: 900, letterSpacing: "-0.02em", color: TEXT }}
                >
                  Your QR code
                </h2>
                <p className="mx-auto mt-1 max-w-[220px] text-[13px]" style={{ color: MUTED, fontWeight: 500 }}>
                  Scan to join Megsy AI with your referral link.
                </p>
              </div>

              <div
                className="mx-auto mt-6 grid w-max place-items-center rounded-[24px] p-5"
                style={{ backgroundColor: "#FFFFFF", border: `2.5px solid ${INK}`, boxShadow: `6px 6px 0 ${YELLOW}30` }}
              >
                {link ? (
                  <QRCodeSVG
                    ref={qrRef}
                    value={link}
                    size={200}
                    bgColor="#FFFFFF"
                    fgColor="#101010"
                    level="M"
                    includeMargin={false}
                    imageSettings={{
                      src: "/favicon-32.png",
                      x: undefined,
                      y: undefined,
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                ) : (
                  <div className="h-[200px] w-[200px] animate-pulse rounded-xl" style={{ backgroundColor: SURFACE_2 }} />
                )}
              </div>

              <p
                className="mx-auto mt-5 max-w-[260px] truncate text-center text-[13px]"
                style={{ color: MUTED, fontWeight: 600 }}
              >
                {link || "—"}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={copyQRLink}
                  className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  style={{
                    backgroundColor: YELLOW,
                    color: INK,
                    fontWeight: 800,
                    border: `2.5px solid ${INK}`,
                    boxShadow: `4px 4px 0 ${YELLOW}40`,
                  }}
                >
                  {justCopied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" strokeWidth={2.5} />}
                  {justCopied ? "Copied" : "Copy link"}
                </button>
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  style={{
                    backgroundColor: MINT,
                    color: INK,
                    fontWeight: 800,
                    border: `2.5px solid ${INK}`,
                    boxShadow: `4px 4px 0 ${MINT}30`,
                  }}
                >
                  <Download className="h-4 w-4" strokeWidth={2.5} />
                  Download
                </button>
              </div>

              <button
                onClick={shareLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                style={{
                  backgroundColor: SURFACE_2,
                  color: TEXT,
                  fontWeight: 800,
                  border: `2px solid ${BORDER}`,
                }}
              >
                <Share2 className="h-4 w-4" strokeWidth={2.5} />
                Share link
              </button>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-2xl px-5 pb-36">
          {/* Cartoon hero */}
          <div className="mt-2 flex justify-center">
            <img
              src={referralHero}
              alt="Friends fist-bumping"
              width={1024}
              height={768}
              className="h-44 w-auto object-contain"
              style={{ filter: "drop-shadow(0 8px 24px rgba(59,130,246,0.15))" }}
            />
          </div>

          {/* Hero text */}
          <div className="mt-3 text-center">
            <h1
              className="text-[44px] leading-[0.95] tracking-tight"
              style={{ fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}
            >
              Invite friends!
            </h1>
            <p
              className="mx-auto mt-3 max-w-xs text-[16px] leading-snug"
              style={{ color: MUTED, fontWeight: 500 }}
            >
              Share one link — earn{" "}
              <span style={{ color: YELLOW, fontWeight: 800 }}>{CREDITS_PER_SIGNUP} credits</span>
              {" + "}
              <span style={{ color: MINT, fontWeight: 800 }}>{COMMISSION_PCT}% cash</span>{" "}
              for every friend.
            </p>
          </div>

          {/* Share link CTA — opens QR code card */}
          <button
            onClick={() => setQrOpen(true)}
            className="mt-7 w-full rounded-full px-6 py-5 text-[17px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{
              backgroundColor: YELLOW,
              color: INK,
              fontWeight: 800,
              border: `2.5px solid ${INK}`,
              boxShadow: `4px 4px 0 ${YELLOW}40`,
            }}
          >
            Share link
          </button>

          {/* Resources CTA */}
          <button
            onClick={() => navigate("/settings/referrals/resources")}
            className="mt-3 flex w-full items-center justify-center rounded-full px-5 py-4 text-[15px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{
              backgroundColor: BLUE,
              color: INK,
              fontWeight: 800,
              border: `2.5px solid ${INK}`,
              boxShadow: `4px 4px 0 ${BLUE}40`,
            }}
          >
            Need some resources to help you?
          </button>

          {/* Top tabs as routed NavLinks — dark pill bar */}
          <nav
            className="mt-6 flex items-center gap-1 overflow-x-auto no-scrollbar rounded-full p-1.5"
            style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}` }}
          >
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition",
                    isActive ? "" : "opacity-60 hover:opacity-100",
                  )
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: YELLOW,
                        color: INK,
                        fontWeight: 800,
                      }
                    : { color: TEXT, fontWeight: 700 }
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          <Outlet />
        </main>

        {/* Sticky invite button */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3"
          style={{
            background:
              `linear-gradient(to top, ${PAGE_BG} 60%, ${PAGE_BG}99 85%, transparent)`,
          }}
        >
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => setShareOpen(true)}
              className="w-full rounded-full px-5 py-4 text-[15px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              style={{
                backgroundColor: YELLOW,
                color: INK,
                fontWeight: 800,
                border: `2.5px solid ${INK}`,
                boxShadow: `4px 4px 0 ${YELLOW}40`,
              }}
            >
              Invite friends
            </button>
          </div>
        </div>

        {/* Social share sheet */}
        {shareOpen && (
          <ShareSheet
            link={link}
            onClose={() => setShareOpen(false)}
            onCopy={async () => {
              await safeCopyText(link);
              toast.success("Link copied");
            }}
          />
        )}
      </div>
    </ReferralsCtx.Provider>
  );
};

const SHARE_TEXT = (link: string) =>
  `جرب Megsy AI واحصل على ${CREDITS_PER_SIGNUP} رصيدًا مجانيًا عند التسجيل باستخدام رابط الدعوة الخاص بي:\n${link}`;

interface ShareSheetProps {
  link: string;
  onClose: () => void;
  onCopy: () => Promise<void>;
}

const ShareSheet = ({ link, onClose, onCopy }: ShareSheetProps) => {
  const text = SHARE_TEXT(link);
  const enc = encodeURIComponent(text);
  const encLink = encodeURIComponent(link);

  const copyAndOpen = async (url: string, label: string) => {
    try { await safeCopyText(text); } catch { /* noop */ }
    toast.success(`تم نسخ الرسالة — افتح ${label} والصق`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  type Item = { label: string; icon: typeof Instagram; bg: string; fg: string; onClick: () => void };
  const items: Item[] = [
    {
      label: "Instagram",
      icon: Instagram,
      bg: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF,#515BD4)",
      fg: "#FFFFFF",
      onClick: () => copyAndOpen("https://www.instagram.com/", "Instagram"),
    },
    {
      label: "TikTok",
      icon: Music2,
      bg: "#000000",
      fg: "#FFFFFF",
      onClick: () => copyAndOpen("https://www.tiktok.com/", "TikTok"),
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      bg: "#25D366",
      fg: "#FFFFFF",
      onClick: () => window.open(`https://wa.me/?text=${enc}`, "_blank", "noopener,noreferrer"),
    },
    {
      label: "Telegram",
      icon: Send,
      bg: "#229ED9",
      fg: "#FFFFFF",
      onClick: () => window.open(`https://t.me/share/url?url=${encLink}&text=${enc}`, "_blank", "noopener,noreferrer"),
    },
    {
      label: "X / Twitter",
      icon: Twitter,
      bg: "#0F1419",
      fg: "#FFFFFF",
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${enc}`, "_blank", "noopener,noreferrer"),
    },
    {
      label: "Facebook",
      icon: Facebook,
      bg: "#1877F2",
      fg: "#FFFFFF",
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encLink}`, "_blank", "noopener,noreferrer"),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-5"
      style={{ backgroundColor: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-[28px] sm:rounded-[28px] p-6 pb-8"
        style={{ backgroundColor: SURFACE, border: `2.5px solid ${BORDER}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full transition active:scale-90"
          style={{ backgroundColor: SURFACE_2, border: `2px solid ${BORDER}`, color: TEXT }}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={3} />
        </button>

        <div className="text-center">
          <h2 className="text-[22px] leading-tight" style={{ fontWeight: 900, letterSpacing: "-0.02em", color: TEXT }}>
            Share your link
          </h2>
          <p className="mx-auto mt-1 max-w-[260px] text-[13px]" style={{ color: MUTED, fontWeight: 500 }}>
            Pick where to post — the message will be pre-filled.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                onClick={it.onClick}
                className="flex flex-col items-center gap-2 rounded-2xl px-2 py-4 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                style={{
                  backgroundColor: SURFACE_2,
                  border: `2px solid ${BORDER}`,
                }}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-full"
                  style={{ background: it.bg, color: it.fg, border: `2px solid ${INK}` }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <span className="text-[12px]" style={{ color: TEXT, fontWeight: 700 }}>
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onCopy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={{
            backgroundColor: YELLOW,
            color: INK,
            fontWeight: 800,
            border: `2.5px solid ${INK}`,
            boxShadow: `4px 4px 0 ${YELLOW}40`,
          }}
        >
          <Copy className="h-4 w-4" strokeWidth={2.8} />
          Copy link
        </button>
      </div>
    </div>
  );
};

export default ReferralsPage;
