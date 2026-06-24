import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, ChevronRight, Copy } from "lucide-react";
import {
  EmptyState, MIN_PAYOUT, fmtDate, statusLabel, useReferrals,
  INK, YELLOW, PINK, MINT, LAVENDER, PEACH,
  SURFACE, SURFACE_2, BORDER, TEXT, MUTED,
} from "../ReferralsPage";

const AVATAR_TONES = [LAVENDER, PINK, YELLOW, MINT, PEACH];

export default function DashboardTab() {
  const navigate = useNavigate();
  const {
    totalEarned, available, committed, signups, canWithdraw,
    refs, earns, wds, link, justCopied, copyLink, openPromoter,
  } = useReferrals();
  const [tab, setTab] = useState<"referrals" | "earnings" | "withdrawals">("referrals");

  return (
    <section className="mt-5 space-y-4" style={{ color: TEXT }}>
      {/* Balance hero — mint sticker on dark */}
      <div
        className="relative overflow-hidden rounded-[28px] p-5"
        style={{
          backgroundColor: MINT,
          border: `2.5px solid ${INK}`,
          boxShadow: `4px 4px 0 ${MINT}30`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1" style={{ color: INK }}>
              <span className="text-[20px]" style={{ fontWeight: 800 }}>$</span>
              <span
                className="text-[44px] leading-none tabular-nums"
                style={{ fontWeight: 900, letterSpacing: "-0.03em" }}
              >
                {available.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/settings/withdraw")}
            disabled={!canWithdraw}
            className="rounded-full px-4 py-2.5 text-[13px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: INK, color: YELLOW, fontWeight: 800,
              border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`,
            }}
          >
            Withdraw
          </button>
        </div>

        <div
          className="mt-5 grid grid-cols-3 gap-3 pt-4"
          style={{ borderTop: `2px dashed ${INK}`, color: INK }}
        >
          {[
            { label: "Signups", value: signups.toString() },
            { label: "Earned", value: `$${totalEarned.toFixed(0)}` },
            { label: "Paid", value: `$${committed.toFixed(0)}` },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10.5px] uppercase tracking-wider" style={{ fontWeight: 800, opacity: 0.65 }}>
                {s.label}
              </p>
              <p className="mt-1 text-[20px] tabular-nums" style={{ fontWeight: 900 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* You earned + arrow chip */}
      <div
        className="flex items-center justify-between rounded-[24px] px-5 py-4"
        style={{
          backgroundColor: SURFACE,
          border: `1.5px solid ${BORDER}`,
        }}
      >
        <span className="text-[16px]" style={{ fontWeight: 700, color: TEXT }}>
          Total earned
        </span>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3.5 py-1 text-[18px] leading-none tabular-nums"
            style={{
              backgroundColor: PINK, color: INK, fontWeight: 900,
              border: `2px solid ${INK}`, letterSpacing: "-0.01em",
            }}
          >
            ${totalEarned.toFixed(2)}
          </span>
          <span
            className="grid h-8 w-8 place-items-center rounded-full"
            style={{ backgroundColor: YELLOW, border: `2px solid ${INK}` }}
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={3} style={{ color: INK }} />
          </span>
        </div>
      </div>

      {/* Referrals avatars */}
      <div
        className="rounded-[24px] p-5"
        style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px]" style={{ fontWeight: 800, color: TEXT }}>
            Referrals
          </h3>
          <span className="text-[13px] tabular-nums" style={{ color: MUTED, fontWeight: 700 }}>
            {signups}
          </span>
        </div>

        {refs.length === 0 ? (
          <p className="mt-3 text-[13.5px]" style={{ color: MUTED, fontWeight: 500 }}>
            No referrals yet. Share your link to invite your first friend.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-4 gap-3">
            {refs.slice(0, 8).map((r, i) => {
              const tone = AVATAR_TONES[i % AVATAR_TONES.length];
              const letter = (r.id?.[0] ?? "U").toUpperCase();
              return (
                <li key={r.id} className="flex flex-col items-center gap-2">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl"
                    style={{ backgroundColor: tone, border: `2px solid ${INK}` }}
                  >
                    <span className="text-[22px]" style={{ color: INK, fontWeight: 900 }}>
                      {letter}
                    </span>
                  </div>
                  <span className="text-center text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>
                    Friend
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Referral link copy card */}
      <button
        onClick={copyLink}
        className="flex w-full items-center justify-between rounded-[22px] px-5 py-4 text-left transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        style={{
          backgroundColor: SURFACE_2,
          border: `1.5px solid ${BORDER}`,
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide" style={{ color: MUTED, fontWeight: 800 }}>
            Your referral link
          </p>
          <p className="mt-1 truncate text-[13.5px]" style={{ color: TEXT, fontWeight: 700 }}>
            {link || "—"}
          </p>
        </div>
        <span
          className="ml-3 grid h-10 w-10 shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: justCopied ? MINT : YELLOW,
            border: `2px solid ${INK}`,
          }}
        >
          {justCopied ? (
            <Check className="h-5 w-5" strokeWidth={3} style={{ color: INK }} />
          ) : (
            <Copy className="h-5 w-5" strokeWidth={2.5} style={{ color: INK }} />
          )}
        </span>
      </button>

      {/* VIP upgrade card */}
      <div
        className="rounded-[24px] p-5"
        style={{
          backgroundColor: PINK,
          border: `2.5px solid ${INK}`,
          boxShadow: `4px 4px 0 ${PINK}30`,
        }}
      >
        <span
          className="inline-block rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider"
          style={{ backgroundColor: INK, color: PINK, fontWeight: 800 }}
        >
          VIP
        </span>
        <h3 className="mt-2 text-[20px] leading-tight" style={{ fontWeight: 900, letterSpacing: "-0.02em", color: INK }}>
          Reach up to 50% commission
        </h3>
        <p className="mt-1.5 text-[13px]" style={{ fontWeight: 600, color: INK, opacity: 0.75 }}>
          Apply to become a top promoter — higher rates and VIP perks.
        </p>
        <button
          onClick={openPromoter}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={{
            backgroundColor: INK, color: PINK, fontWeight: 800,
            border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`,
          }}
        >
          Apply via WhatsApp <ChevronRight className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>

      {/* Activity */}
      <div>
        <h2 className="px-1 text-[18px]" style={{ fontWeight: 900, letterSpacing: "-0.02em", color: TEXT }}>
          Activity
        </h2>

        <div
          className="mt-3 flex gap-1 rounded-full p-1.5"
          style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}` }}
        >
          {(
            [
              ["referrals", "Referrals", refs.length],
              ["earnings", "Earnings", earns.length],
              ["withdrawals", "Payouts", wds.length],
            ] as const
          ).map(([k, label, count]) => {
            const active = tab === k;
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="flex-1 rounded-full py-2 text-[12.5px] transition"
                style={{
                  backgroundColor: active ? YELLOW : "transparent",
                  color: active ? INK : TEXT,
                  fontWeight: active ? 800 : 700,
                  opacity: active ? 1 : 0.65,
                }}
              >
                {label} <span className="ml-1 tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-3 rounded-[22px] px-4"
          style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}` }}
        >
          {tab === "referrals" && (refs.length === 0 ? (
            <EmptyState title="No referrals yet" hint="Share your link to start earning." />
          ) : (
            <ul className="divide-y" style={{ borderColor: BORDER }}>
              {refs.map((r, i) => (
                <li key={r.id} className="flex items-center justify-between py-3" style={{ borderColor: BORDER }}>
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full text-[12px] tabular-nums"
                      style={{ backgroundColor: MINT, border: `2px solid ${INK}`, fontWeight: 900, color: INK }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[14px]" style={{ fontWeight: 800, color: TEXT }}>Friend #{i + 1}</p>
                      <p className="text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>{fmtDate(r.created_at)}</p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px]"
                    style={{ backgroundColor: SURFACE_2, border: `1.5px solid ${BORDER}`, fontWeight: 800, color: TEXT }}
                  >
                    {statusLabel(r.status)}
                  </span>
                </li>
              ))}
            </ul>
          ))}

          {tab === "earnings" && (earns.length === 0 ? (
            <EmptyState title="No earnings yet" hint="Commissions appear after a friend subscribes." />
          ) : (
            <ul className="divide-y" style={{ borderColor: BORDER }}>
              {earns.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3" style={{ borderColor: BORDER }}>
                  <div>
                    <p className="text-[14px]" style={{ fontWeight: 800, color: TEXT }}>{e.source_action}</p>
                    <p className="text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>{fmtDate(e.created_at)}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[13px] tabular-nums"
                    style={{ backgroundColor: MINT, border: `2px solid ${INK}`, fontWeight: 900, color: INK }}
                  >
                    +${Number(e.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ))}

          {tab === "withdrawals" && (wds.length === 0 ? (
            <EmptyState title="No payouts yet" hint={`Request a withdrawal once you reach $${MIN_PAYOUT}.`} />
          ) : (
            <ul className="divide-y" style={{ borderColor: BORDER }}>
              {wds.map((w) => (
                <li key={w.id} className="flex items-center justify-between py-3" style={{ borderColor: BORDER }}>
                  <div>
                    <p className="text-[14px] tabular-nums" style={{ fontWeight: 800, color: TEXT }}>${Number(w.amount).toFixed(2)}</p>
                    <p className="text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>{w.method} · {fmtDate(w.created_at)}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px]"
                    style={{ backgroundColor: SURFACE_2, border: `1.5px solid ${BORDER}`, fontWeight: 800, color: TEXT }}
                  >
                    {statusLabel(w.status)}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
