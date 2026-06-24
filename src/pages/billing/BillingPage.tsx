// Billing — cartoon redesign. Mobile uses cartoon shell + sticker hero.
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopSettingsLayout } from "@/components/settings/DesktopSettingsLayout";
import visaBg from "@/assets/visa-bg.webp";
import MegsyStar from "@/components/branding/MegsyStar";
import { CartoonPage, CartoonHero, CartoonCard } from "@/components/settings/CartoonSettingsShell";
import { INK, MINT, YELLOW, PINK, LAVENDER, TEXT, MUTED } from "@/pages/billing/ReferralsPage";
import billingSticker from "@/assets/settings/billing-sticker.png";

const planTone = (plan: string) => {
  const p = plan.toLowerCase();
  if (p === "free") return "bg-white/10 text-foreground/80";
  if (p === "starter") return "bg-white/15 text-foreground";
  if (p === "pro") return "bg-white/20 text-foreground";
  if (p === "elite") return "bg-white/25 text-foreground";
  return "bg-white/30 text-foreground";
};

const BillingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState("Free");
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("credits, plan").eq("id", user.id).single();
      if (profile) {
        setCredits(Number(profile.credits) || 0);
        setPlan(profile.plan || "Free");
      }
      const { data: txns } = await supabase
        .from("credit_transactions").select("*")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (txns) setTransactions(txns);
    };
    load();
  }, []);

  const EARNED_ACTIONS = new Set([
    "credit_addition",
    "admin_topup",
    "code_build_refund",
    "subscription_purchase",
    "referral_bonus",
    "reward",
  ]);
  const isEarnedTx = (t: any) => {
    const amt = Number(t.amount) || 0;
    if (amt < 0) return false;
    if (EARNED_ACTIONS.has(String(t.action_type || "").toLowerCase())) return true;
    // Fallback heuristics on description
    const d = String(t.description || "").toLowerCase();
    return d.startsWith("reward") || d.includes("bonus") || d.includes("refund") || d.includes("top-up") || d.includes("topup");
  };
  const totalEarned = transactions
    .filter(isEarnedTx)
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalSpent = transactions
    .filter((t) => !isEarnedTx(t))
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const recentTransactions = transactions;

  const desktopContent = (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-xl mx-auto">
      <div className="relative w-full aspect-[1.7/1] rounded-3xl overflow-hidden shadow-xl ring-1 ring-white/5">
        <img src={visaBg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/55" />
        <div className="relative z-10 flex flex-col justify-between h-full p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/55 text-[10px] uppercase tracking-[0.28em] font-medium">Balance</p>
              <p className="text-foreground text-[34px] font-black tracking-tight mt-1.5 leading-none">
                {credits.toLocaleString()}
                <span className="text-base font-normal text-foreground/55 ml-1.5">MC</span>
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${planTone(plan)}`}>{plan}</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1.5 text-foreground">
              <MegsyStar className="w-4 h-4 opacity-90" />
              <span className="text-base font-bold tracking-wide">Megsy</span>
            </div>
            <div className="flex">
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm" />
              <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm -ml-3" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => navigate("/pricing")} className="py-3 rounded-xl text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity">Add MC</button>
        <button onClick={() => navigate("/settings/referrals")} className="py-3 rounded-xl text-sm font-medium text-foreground border border-border hover:bg-muted/40 transition-colors">Earn MC</button>
      </div>
      <section>
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-2 px-1">Overview</p>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          <DesktopRow label="MC left" value={credits.toLocaleString()} />
          <DesktopRow label="Total spent" value={totalSpent.toLocaleString()} />
          <DesktopRow label="Total earned" value={totalEarned.toLocaleString()} />
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">Recent activity</p>
          <p className="text-[11px] text-muted-foreground">{transactions.length} entries</p>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border border-dashed border-border">
            <Clock className="w-7 h-7 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-foreground/80">No transactions yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {recentTransactions.map((tx) => {
              const isDeduction = !isEarnedTx(tx);
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3.5 px-4">
                  <div className="w-9 h-9 rounded-xl bg-muted grid place-items-center shrink-0 text-foreground/70">
                    {isDeduction ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{tx.description || tx.action_type}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {isDeduction ? "-" : "+"}{Math.abs(tx.amount)} <span className="text-muted-foreground font-normal">MC</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );

  if (!isMobile) {
    return (
      <DesktopSettingsLayout title="Billing" subtitle="Manage your MC balance and view transaction history">
        {desktopContent}
      </DesktopSettingsLayout>
    );
  }

  const StatCard = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
    <div
      className="rounded-[18px] p-3"
      style={{ backgroundColor: tone, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
    >
      <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: INK, fontWeight: 800, opacity: 0.7 }}>{label}</p>
      <p className="text-[20px] mt-0.5" style={{ color: INK, fontWeight: 900, letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );

  return (
    <CartoonPage title="Billing">
      <CartoonHero
        sticker={billingSticker}
        bg={MINT}
        title={`${credits.toLocaleString()} MC`}
        subtitle={`You're on the ${plan} plan.`}
        trailing={
          <div className="mt-4 grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => navigate("/pricing")}
              className="py-2.5 rounded-full text-[13px] active:translate-x-[1px] active:translate-y-[1px] transition"
              style={{ background: INK, color: "#fff", border: `2px solid ${INK}`, fontWeight: 800, boxShadow: `2px 2px 0 ${INK}` }}
            >
              Add MC
            </button>
            <button
              onClick={() => navigate("/settings/referrals")}
              className="py-2.5 rounded-full text-[13px] active:translate-x-[1px] active:translate-y-[1px] transition"
              style={{ background: YELLOW, color: INK, border: `2px solid ${INK}`, fontWeight: 800, boxShadow: `2px 2px 0 ${INK}` }}
            >
              Earn MC
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-2 mt-3">
        <StatCard label="Left" value={credits.toLocaleString()} tone={YELLOW} />
        <StatCard label="Spent" value={totalSpent.toLocaleString()} tone={PINK} />
        <StatCard label="Earned" value={totalEarned.toLocaleString()} tone={LAVENDER} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: MUTED, fontWeight: 800 }}>Recent activity</p>
          <p className="text-[11px]" style={{ color: MUTED, fontWeight: 700 }}>{transactions.length} entries</p>
        </div>
        {transactions.length === 0 ? (
          <CartoonCard className="text-center py-10">
            <Clock className="w-7 h-7 mx-auto mb-3" style={{ color: MUTED }} />
            <p className="text-sm" style={{ color: TEXT, fontWeight: 800 }}>No transactions yet</p>
            <p className="text-[11px] mt-1" style={{ color: MUTED }}>Your MC history will appear here</p>
          </CartoonCard>
        ) : (
          <CartoonCard className="!p-0 overflow-hidden">
            {recentTransactions.map((tx, idx) => {
              const isDeduction = !isEarnedTx(tx);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3.5 px-4"
                  style={{ borderTop: idx === 0 ? "none" : `1px solid hsl(var(--surface-4))` }}
                >
                  <div
                    className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
                    style={{ background: isDeduction ? PINK : MINT, color: INK, border: `2px solid ${INK}` }}
                  >
                    {isDeduction ? <TrendingDown className="w-3.5 h-3.5" strokeWidth={3} /> : <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] truncate" style={{ color: TEXT, fontWeight: 700 }}>{tx.description || tx.action_type}</p>
                    <p className="text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>
                      {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-[13.5px] tabular-nums" style={{ color: TEXT, fontWeight: 800 }}>
                    {isDeduction ? "-" : "+"}{Math.abs(tx.amount)} <span style={{ color: MUTED, fontWeight: 600 }}>MC</span>
                  </span>
                </div>
              );
            })}
          </CartoonCard>
        )}
      </div>
    </CartoonPage>
  );
};

function DesktopRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[13.5px] text-muted-foreground">{label}</span>
      <span className="text-[14px] font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

export default BillingPage;
