// Memory — what Megsy remembers about you.
// Source of truth = `user_memory_entries` (written by chat-alibaba's background
// memory extractor) + `user_memory_profiles.preferences.enabled` toggle, which
// chat-alibaba and memory-bg.ts both respect. Styled to match AI Personalization.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Trash2, RotateCcw, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopSettingsLayout } from "@/components/settings/DesktopSettingsLayout";
import { BackIcon } from "@/components/settings/SettingsIcons";
import { Switch } from "@/components/ui/switch";
import { goBackOr } from "@/lib/navigation";
import {
  INK,
  YELLOW,
  PINK,
  MINT,
  LAVENDER,
  PEACH,
  BLUE,
  SURFACE,
  SURFACE_2,
  BORDER,
  TEXT,
  MUTED,
  PAGE_BG,
} from "@/pages/billing/ReferralsPage";


interface MemoryEntry {
  id: string;
  title: string;
  summary: string;
  scope: string | null;
  created_at: string;
}

interface MemoryProfile {
  account_summary: string | null;
  preferences: Record<string, any> | null;
}

const MemoryPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [profile, setProfile] = useState<MemoryProfile | null>(null);
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  // Manual add
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      await refresh(user.id);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async (uid: string) => {
    const [{ data: prof }, { data: rows }] = await Promise.all([
      supabase
        .from("user_memory_profiles")
        .select("account_summary, preferences")
        .eq("user_id", uid)
        .maybeSingle(),
      supabase
        .from("user_memory_entries")
        .select("id, title, summary, scope, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    setProfile((prof as MemoryProfile) ?? { account_summary: null, preferences: null });
    setEnabled(((prof as any)?.preferences?.enabled ?? true) !== false);
    setEntries((rows as MemoryEntry[]) ?? []);
  };

  const handleToggle = async (next: boolean) => {
    if (!userId) return;
    setBusy(true);
    setEnabled(next);
    try {
      const nextPrefs = { ...(profile?.preferences ?? {}), enabled: next };
      const { error } = await supabase
        .from("user_memory_profiles")
        .upsert(
          { user_id: userId, preferences: nextPrefs },
          { onConflict: "user_id" },
        );
      if (error) throw error;
      setProfile((p) => ({ ...(p ?? { account_summary: null, preferences: null }), preferences: nextPrefs }));
      toast.success(next ? "Memory enabled" : "Memory paused");
    } catch (e: any) {
      setEnabled(!next);
      toast.error(e?.message || "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("user_memory_entries").delete().eq("id", id);
      if (error) throw error;
      setEntries((es) => es.filter((e) => e.id !== id));
      toast.success("Memory removed");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReset = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("user_memory_entries")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
      setEntries([]);
      setResetOpen(false);
      toast.success("All memories reset");
    } catch (e: any) {
      toast.error(e?.message || "Failed to reset");
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async () => {
    if (!userId) return;
    const title = newTitle.trim().slice(0, 200);
    const summary = newSummary.trim().slice(0, 2000);
    if (!title || !summary) {
      toast.error("Title and summary are required");
      return;
    }
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("user_memory_entries")
        .insert({ user_id: userId, title, summary, scope: "manual" })
        .select("id, title, summary, scope, created_at")
        .maybeSingle();
      if (error) throw error;
      if (data) setEntries((es) => [data as MemoryEntry, ...es]);
      setNewTitle("");
      setNewSummary("");
      setAddOpen(false);
      toast.success("Memory added");
    } catch (e: any) {
      toast.error(e?.message || "Failed to add");
    } finally {
      setAdding(false);
    }
  };

  const grouped = useMemo(() => {
    const auto = entries.filter((e) => e.scope !== "manual");
    const manual = entries.filter((e) => e.scope === "manual");
    return { auto, manual };
  }, [entries]);

  if (loading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: PAGE_BG, color: TEXT }}
      >
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: MUTED }} />
      </div>
    );
  }

  const content = (
    <div className="space-y-5">
      {/* Status */}
      <section
        className="rounded-[22px] p-4 flex items-center justify-between"
        style={{
          backgroundColor: SURFACE,
          border: `2.5px solid ${INK}`,
          boxShadow: `3px 3px 0 ${INK}`,
        }}
      >
        <div>
          <p className="text-[14px]" style={{ fontWeight: 900, color: TEXT }}>
            {enabled ? "Memory is active" : "Memory is paused"}
          </p>
          <p className="text-[11.5px] mt-0.5" style={{ color: MUTED, fontWeight: 600 }}>
            {enabled
              ? "Megsy will quietly remember durable facts you share."
              : "New facts won't be saved and existing ones won't be recalled."}
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} disabled={busy} />
      </section>

      {/* Account summary (if any) */}
      {profile?.account_summary && (
        <section
          className="rounded-[22px] overflow-hidden"
          style={{
            backgroundColor: SURFACE,
            border: `2.5px solid ${INK}`,
            boxShadow: `3px 3px 0 ${INK}`,
          }}
        >
          <div
            className="px-4 py-3"
            style={{ backgroundColor: LAVENDER, borderBottom: `2.5px solid ${INK}` }}
          >
            <h3
              className="text-[12px] uppercase tracking-[0.16em]"
              style={{ fontWeight: 900, color: INK }}
            >
              Account Summary
            </h3>
          </div>
          <p
            className="p-4 text-[13px] leading-relaxed whitespace-pre-wrap"
            style={{ color: TEXT, fontWeight: 600 }}
          >
            {profile.account_summary}
          </p>
        </section>
      )}

      {/* Memories */}
      <section
        className="rounded-[22px] overflow-hidden"
        style={{
          backgroundColor: SURFACE,
          border: `2.5px solid ${INK}`,
          boxShadow: `3px 3px 0 ${INK}`,
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: PEACH, borderBottom: `2.5px solid ${INK}` }}
        >
          <h3
            className="text-[12px] uppercase tracking-[0.16em]"
            style={{ fontWeight: 900, color: INK }}
          >
            What Megsy Remembers ({entries.length})
          </h3>
          <button
            type="button"
            onClick={() => setAddOpen((o) => !o)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            style={{
              backgroundColor: "#ffffff",
              color: INK,
              fontWeight: 900,
              border: `2px solid ${INK}`,
              boxShadow: `2px 2px 0 ${INK}`,
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            Add
          </button>
        </div>

        {addOpen && (
          <div className="p-4 space-y-3" style={{ borderBottom: `1.5px solid ${BORDER}` }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Short title (e.g. Loves espresso)"
              maxLength={200}
              className="w-full px-3.5 py-2.5 rounded-xl text-[13.5px] outline-none"
              style={{
                backgroundColor: PAGE_BG,
                color: TEXT,
                border: `2px solid ${BORDER}`,
                fontWeight: 600,
              }}
            />
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="One-sentence fact Megsy should remember about you"
              rows={2}
              maxLength={2000}
              className="w-full px-3.5 py-2.5 rounded-xl text-[13.5px] outline-none resize-none"
              style={{
                backgroundColor: PAGE_BG,
                color: TEXT,
                border: `2px solid ${BORDER}`,
                fontWeight: 600,
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  setNewTitle("");
                  setNewSummary("");
                }}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-[12.5px]"
                style={{
                  backgroundColor: SURFACE_2,
                  color: TEXT,
                  fontWeight: 800,
                  border: `2px solid ${INK}`,
                  boxShadow: `2px 2px 0 ${INK}`,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12.5px] disabled:opacity-60"
                style={{
                  backgroundColor: MINT,
                  color: INK,
                  fontWeight: 900,
                  border: `2px solid ${INK}`,
                  boxShadow: `2px 2px 0 ${INK}`,
                }}
              >
                {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div
            className="p-6 text-center text-[13px]"
            style={{ color: MUTED, fontWeight: 600 }}
          >
            Nothing remembered yet. Share durable facts in chat ("I'm a designer based in Cairo")
            and Megsy will save them automatically.
          </div>
        ) : (
          <div>
            {grouped.manual.length > 0 && (
              <div>
                <div
                  className="px-4 py-2 text-[10.5px] uppercase tracking-wider"
                  style={{ color: MUTED, fontWeight: 800, backgroundColor: PAGE_BG }}
                >
                  Added by you
                </div>
                {grouped.manual.map((e, idx) => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    first={idx === 0}
                    deleting={deletingId === e.id}
                    onDelete={() => handleDelete(e.id)}
                  />
                ))}
              </div>
            )}
            {grouped.auto.length > 0 && (
              <div>
                <div
                  className="px-4 py-2 text-[10.5px] uppercase tracking-wider"
                  style={{ color: MUTED, fontWeight: 800, backgroundColor: PAGE_BG }}
                >
                  Learned from chats
                </div>
                {grouped.auto.map((e, idx) => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    first={idx === 0}
                    deleting={deletingId === e.id}
                    onDelete={() => handleDelete(e.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Reset */}
      {entries.length > 0 && !resetOpen && (
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[13px]"
          style={{
            backgroundColor: SURFACE,
            color: "#FF6B6B",
            fontWeight: 800,
            border: `2px solid ${BORDER}`,
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
          Reset all memories
        </button>
      )}

      {resetOpen && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            backgroundColor: SURFACE,
            color: TEXT,
            border: `2.5px solid ${INK}`,
            boxShadow: `3px 3px 0 ${INK}`,
          }}
        >
          <div>
            <p className="text-[17px]" style={{ fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}>
              Reset all memories?
            </p>
            <p className="text-[13px] leading-relaxed mt-2" style={{ color: MUTED }}>
              Megsy will forget every fact it learned about you. This can't be undone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2" style={{ borderTop: `1.5px solid ${BORDER}` }}>
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="w-full sm:flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px]"
              style={{
                backgroundColor: SURFACE_2,
                color: TEXT,
                fontWeight: 800,
                border: `2px solid ${INK}`,
                boxShadow: `2px 2px 0 ${INK}`,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={busy}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] disabled:opacity-60"
              style={{
                backgroundColor: "#FF6B6B",
                color: "#ffffff",
                fontWeight: 900,
                border: `2px solid ${INK}`,
                boxShadow: `2px 2px 0 ${INK}`,
              }}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Reset everything
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (!isMobile) {
    return (
      <DesktopSettingsLayout
        title="Memory"
        subtitle="What Megsy remembers about you, across every conversation."
      >
        <div className="max-w-3xl">{content}</div>
      </DesktopSettingsLayout>
    );
  }

  return (
    <div
      className="relative min-h-[100dvh] overflow-y-auto pb-16"
      style={{ backgroundColor: PAGE_BG, color: TEXT }}
    >
      <header
        className="sticky top-0 z-10"
        style={{
          backgroundColor: `${PAGE_BG}E6`,
          backdropFilter: "saturate(160%) blur(18px)",
          WebkitBackdropFilter: "saturate(160%) blur(18px)",
          borderBottom: `1.5px solid ${BORDER}`,
        }}
      >
        <div className="max-w-lg mx-auto px-5 flex items-center justify-between py-3 safe-top">
          <button
            onClick={() => goBackOr(navigate, "/settings")}
            className="grid h-10 w-10 place-items-center rounded-full active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
            style={{ backgroundColor: SURFACE, border: `2px solid ${BORDER}`, color: TEXT }}
            aria-label="Back"
          >
            <BackIcon className="w-5 h-5" />
          </button>
          <h1
            className="text-[17px]"
            style={{ fontWeight: 900, letterSpacing: "-0.02em", color: TEXT }}
          >
            Memory
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 safe-bottom">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div
            className="mt-4 rounded-[28px] p-5"
            style={{
              backgroundColor: BLUE,
              border: `2.5px solid ${INK}`,
              boxShadow: `4px 4px 0 ${INK}`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-[18px]"
                style={{ fontWeight: 900, color: INK, letterSpacing: "-0.02em" }}
              >
                Megsy's Memory
              </p>
              <p
                className="text-[12px] mt-1"
                style={{ fontWeight: 700, color: INK, opacity: 0.75 }}
              >
                Powered by the same models that run your chats. You're in control — pause it,
                delete any memory, or add your own.
              </p>
            </div>
          </div>

          <div className="mt-5">{content}</div>
        </motion.div>
      </div>
    </div>
  );
};

function EntryRow({
  entry,
  first,
  deleting,
  onDelete,
}: {
  entry: MemoryEntry;
  first: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-start justify-between gap-3 px-4 py-3"
      style={{ borderTop: first ? "none" : `1px solid ${BORDER}` }}
    >
      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] leading-snug"
          style={{ color: TEXT, fontWeight: 800 }}
        >
          {entry.title}
        </p>
        <p
          className="text-[12.5px] leading-relaxed mt-1 whitespace-pre-wrap"
          style={{ color: MUTED, fontWeight: 600 }}
        >
          {entry.summary}
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="grid h-8 w-8 place-items-center rounded-lg shrink-0"
        style={{ backgroundColor: "transparent", color: "#FF6B6B" }}
        aria-label="Delete memory"
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}

export default MemoryPage;
