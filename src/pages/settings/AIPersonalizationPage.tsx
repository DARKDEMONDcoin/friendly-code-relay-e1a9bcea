// AI Personalization — neo-brutalist sticker style, matches Settings shell.
// Loads / saves to `ai_personalization`. These values are injected into the
// chat system prompt by supabase/functions/chat-alibaba so personalization
// actually affects every reply.
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { goBackOr } from "@/lib/navigation";
import { toast } from "sonner";
import { BackIcon } from "@/components/settings/SettingsIcons";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopSettingsLayout } from "@/components/settings/DesktopSettingsLayout";
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



const LANGUAGE_STYLES: { id: string; label: string; tone: string }[] = [
  { id: "mixed", label: "Auto", tone: MINT },
  { id: "casual", label: "Casual", tone: PINK },
  { id: "formal", label: "Formal", tone: LAVENDER },
  { id: "english", label: "English", tone: BLUE },
];

type Tier = "lite" | "pro" | "max";
const TIERS: { id: Tier; label: string; desc: string; paid: boolean; tone: string }[] = [
  { id: "lite", label: "Lite", desc: "Fast everyday", paid: false, tone: MINT },
  { id: "pro", label: "Pro", desc: "Smarter answers", paid: true, tone: YELLOW },
  { id: "max", label: "Max", desc: "Top-tier model", paid: true, tone: PINK },
];

export default function AIPersonalizationPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");

  const [callName, setCallName] = useState("");
  const [profession, setProfession] = useState("");
  const [about, setAbout] = useState("");

  const [toneFormality, setToneFormality] = useState(50);
  const [toneVerbosity, setToneVerbosity] = useState(50);
  const [toneCreativity, setToneCreativity] = useState(50);

  const [languageStyle, setLanguageStyle] = useState("mixed");
  const [interests, setInterests] = useState<string[]>([]);
  const [aiTraits, setAiTraits] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");

  const [preferredTier, setPreferredTier] = useState<Tier>("lite");

  const savedSnapshotRef = useRef<string>("");
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");

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

      const [profileRes, persRes] = await Promise.all([
        supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
        supabase.from("ai_personalization").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      setUserPlan((profileRes.data as any)?.plan || "free");

      const d: any = persRes.data || {};
      setCallName(d.call_name || "");
      setProfession(d.profession || "");
      setAbout(d.about || "");
      setAiTraits(d.ai_traits || "");
      setCustomInstructions(d.custom_instructions || "");
      setToneFormality(d.tone_formality ?? 50);
      setToneVerbosity(d.tone_verbosity ?? 50);
      setToneCreativity(d.tone_creativity ?? 50);
      setLanguageStyle(d.language_style || "mixed");
      setInterests(Array.isArray(d.interests) ? d.interests : []);
      setPreferredTier((d.preferred_tier as Tier) || "lite");

      const snap = JSON.stringify({
        callName: d.call_name || "",
        profession: d.profession || "",
        about: d.about || "",
        aiTraits: d.ai_traits || "",
        customInstructions: d.custom_instructions || "",
        toneFormality: d.tone_formality ?? 50,
        toneVerbosity: d.tone_verbosity ?? 50,
        toneCreativity: d.tone_creativity ?? 50,
        languageStyle: d.language_style || "mixed",
        interests: Array.isArray(d.interests) ? d.interests : [],
        preferredTier: (d.preferred_tier as Tier) || "lite",
      });
      savedSnapshotRef.current = snap;
      setSavedSnapshot(snap);
      setLoading(false);
    })();
  }, [navigate]);

  const isPaid = userPlan !== "free" && userPlan !== "trial";

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        callName,
        profession,
        about,
        aiTraits,
        customInstructions,
        toneFormality,
        toneVerbosity,
        toneCreativity,
        languageStyle,
        interests,
        preferredTier,
      }),
    [
      callName,
      profession,
      about,
      aiTraits,
      customInstructions,
      toneFormality,
      toneVerbosity,
      toneCreativity,
      languageStyle,
      interests,
      preferredTier,
    ],
  );

  const isDirty = currentSnapshot !== savedSnapshot;

  const save = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    const payload: any = {
      user_id: userId,
      call_name: callName.trim() || null,
      profession: profession.trim() || null,
      about: about.trim() || null,
      ai_traits: aiTraits.trim() || null,
      custom_instructions: customInstructions.trim() || null,
      tone_formality: toneFormality,
      tone_verbosity: toneVerbosity,
      tone_creativity: toneCreativity,
      language_style: languageStyle,
      interests,
      preferred_tier: preferredTier,
    };
    const { error } = await supabase
      .from("ai_personalization")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error("Failed to save");
      return;
    }
    setSavedSnapshot(currentSnapshot);
    savedSnapshotRef.current = currentSnapshot;
    toast.success("Preferences saved — Megsy will use them in every reply");
  }, [
    userId,
    callName,
    profession,
    about,
    aiTraits,
    customInstructions,
    toneFormality,
    toneVerbosity,
    toneCreativity,
    languageStyle,
    interests,
    preferredTier,
    currentSnapshot,
  ]);



  const [autofilling, setAutofilling] = useState(false);
  const [autofillOpen, setAutofillOpen] = useState(false);

  const autofill = useCallback(async () => {
    setAutofilling(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-alibaba", {
        body: { action: "personalization_suggest" },
      });
      if (error) {
        toast.error(error.message || "Auto-fill failed");
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      const s = (data as any)?.suggestion as
        | {
            call_name?: string;
            profession?: string;
            about?: string;
            interests?: string[];
            ai_traits?: string;
            custom_instructions?: string;
          }
        | undefined;
      if (!s) {
        toast.error("No suggestions returned");
        return;
      }
      let filled = 0;
      if (!callName.trim() && s.call_name) {
        setCallName(s.call_name);
        filled++;
      }
      if (!profession.trim() && s.profession) {
        setProfession(s.profession);
        filled++;
      }
      if (!about.trim() && s.about) {
        setAbout(s.about);
        filled++;
      }
      if (interests.length === 0 && Array.isArray(s.interests) && s.interests.length) {
        setInterests(s.interests);
        filled++;
      }
      if (!aiTraits.trim() && s.ai_traits) {
        setAiTraits(s.ai_traits);
        filled++;
      }
      if (!customInstructions.trim() && s.custom_instructions) {
        setCustomInstructions(s.custom_instructions);
        filled++;
      }
      if (filled === 0) {
        toast.info("Nothing to fill — your empty fields didn't have enough signal yet");
      } else {
        toast.success(`Filled ${filled} field${filled === 1 ? "" : "s"} from your real data`);
      }
      setAutofillOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Auto-fill failed");
    } finally {
      setAutofilling(false);
    }
  }, [callName, profession, about, interests, aiTraits, customInstructions]);

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

  const sections = (
    <div className="space-y-5">
      {/* Auto-fill from real user data */}
      <button
        type="button"
        onClick={() => setAutofillOpen(true)}
        className="w-full inline-flex items-center justify-center rounded-2xl px-4 py-3 text-[13px] transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        style={{
          backgroundColor: LAVENDER,
          color: INK,
          fontWeight: 900,
          border: `2.5px solid ${INK}`,
          boxShadow: `3px 3px 0 ${INK}`,
        }}
      >
        Auto-fill empty fields from my real data
      </button>

      {autofillOpen && (
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
            <p
              className="text-[18px]"
              style={{ fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}
            >
              Auto-fill empty fields?
            </p>
            <p
              className="text-[13px] leading-relaxed mt-2"
              style={{ color: MUTED }}
            >
              Megsy will read your profile and recent chats to suggest personalization values.
              Only empty fields will be filled.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row pt-2" style={{ borderTop: `1.5px solid ${BORDER}` }}>
            <button
              type="button"
              onClick={() => setAutofillOpen(false)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px] transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
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
              onClick={autofill}
              disabled={autofilling}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60"
              style={{
                backgroundColor: LAVENDER,
                color: INK,
                fontWeight: 900,
                border: `2px solid ${INK}`,
                boxShadow: `2px 2px 0 ${INK}`,
              }}
            >
              {autofilling && <Loader2 className="w-4 h-4 animate-spin" />}
              {autofilling ? "Reading…" : "Activate"}
            </button>
          </div>
        </div>
      )}

      <StickerCard title="Preferred Model" tone={YELLOW}>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => {
            const locked = t.paid && !isPaid;
            const active = preferredTier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (locked) {
                    toast.info(`Megsy ${t.label} requires a paid plan`);
                    return;
                  }
                  setPreferredTier(t.id);
                }}
                className="px-2 py-3 rounded-2xl text-center transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                style={{
                  backgroundColor: active ? t.tone : SURFACE,
                  border: `2.5px solid ${INK}`,
                  boxShadow: active ? `3px 3px 0 ${INK}` : `2px 2px 0 ${BORDER}`,
                  color: active ? INK : TEXT,
                }}
              >
                <div className="text-[13px]" style={{ fontWeight: 900 }}>
                  {t.label}
                </div>
                <div
                  className="text-[10.5px] mt-0.5"
                  style={{ fontWeight: 700, opacity: 0.75 }}
                >
                  {locked ? "Pro plan" : t.desc}
                </div>
              </button>
            );
          })}
        </div>
      </StickerCard>

      {/* About you */}
      <StickerCard title="About You" tone={PINK}>
        <Field label="What should Megsy call you?">
          <StickerInput
            value={callName}
            onChange={setCallName}
            placeholder="e.g. Alex"
          />
        </Field>
        <Field label="Your role or field">
          <StickerInput
            value={profession}
            onChange={setProfession}
            placeholder="Developer, designer, student…"
          />
        </Field>
        <Field label="A short bio">
          <StickerTextarea
            value={about}
            onChange={setAbout}
            rows={2}
            placeholder="Anything that helps Megsy understand you…"
          />
        </Field>
      </StickerCard>

      {/* Tone */}
      <StickerCard title="Reply Tone" tone={MINT}>
        <Slider
          label="Tone"
          leftLabel="Formal"
          rightLabel="Friendly"
          value={toneFormality}
          onChange={setToneFormality}
        />
        <Slider
          label="Length"
          leftLabel="Concise"
          rightLabel="Detailed"
          value={toneVerbosity}
          onChange={setToneVerbosity}
        />
        <Slider
          label="Style"
          leftLabel="Conservative"
          rightLabel="Creative"
          value={toneCreativity}
          onChange={setToneCreativity}
        />
      </StickerCard>

      {/* Language */}
      <StickerCard title="Language" tone={LAVENDER}>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGE_STYLES.map((s) => {
            const active = languageStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setLanguageStyle(s.id)}
                className="px-3 py-2.5 rounded-2xl text-[13px] transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-between"
                style={{
                  backgroundColor: active ? s.tone : SURFACE,
                  border: `2.5px solid ${INK}`,
                  boxShadow: active ? `3px 3px 0 ${INK}` : `2px 2px 0 ${BORDER}`,
                  color: active ? INK : TEXT,
                  fontWeight: active ? 900 : 700,
                }}
              >
                <span>{s.label}</span>
                {active && <Check className="w-4 h-4" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </StickerCard>

      {/* Interests */}
      <StickerCard
        title="Interests"
        tone={PEACH}
        hint={interests.length ? `${interests.length} added` : "Optional"}
      >
        <Field label="Your interests (comma separated)">
          <StickerTextarea
            value={interests.join(", ")}
            onChange={(v) =>
              setInterests(
                v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            rows={2}
            placeholder="e.g. photography, indie music, hiking, AI research…"
          />
        </Field>
      </StickerCard>


      {/* Advanced */}
      <StickerCard title="Advanced Instructions" tone={BLUE}>
        <Field label="Personality traits for Megsy">
          <StickerInput
            value={aiTraits}
            onChange={setAiTraits}
            placeholder="e.g. playful, direct, uses examples"
          />
        </Field>
        <Field label="Anything else Megsy should know">
          <StickerTextarea
            value={customInstructions}
            onChange={setCustomInstructions}
            rows={3}
            placeholder="e.g. always cite sources, avoid emojis…"
          />
        </Field>
      </StickerCard>
    </div>
  );

  const desktopSaveButton = (
    <button
      onClick={save}
      disabled={saving || !isDirty}
      className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40"
      style={{
        backgroundColor: MINT,
        color: INK,
        fontWeight: 900,
        border: `2.5px solid ${INK}`,
        boxShadow: `3px 3px 0 ${INK}`,
      }}
    >
      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
      {saving ? "Saving…" : isDirty ? "Save preferences" : "Saved"}
    </button>
  );

  if (!isMobile) {
    return (
      <DesktopSettingsLayout
        title="AI Personalization"
        subtitle="Customize how Megsy responds to you. These settings are applied to every reply."
        action={<div className="w-56">{desktopSaveButton}</div>}
      >
        <div className="max-w-3xl">{sections}</div>
      </DesktopSettingsLayout>
    );
  }

  return (
    <div
      className="relative min-h-[100dvh] overflow-y-auto pb-32"
      style={{ backgroundColor: PAGE_BG, color: TEXT }}
    >
      {/* Header */}
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
            AI Personalization
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 safe-bottom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Hero */}
          <div
            className="mt-4 rounded-[28px] p-5"
            style={{
              backgroundColor: PINK,
              border: `2.5px solid ${INK}`,
              boxShadow: `4px 4px 0 ${INK}`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-[18px]"
                style={{ fontWeight: 900, color: INK, letterSpacing: "-0.02em" }}
              >
                Make Megsy yours
              </p>
              <p
                className="text-[12px] mt-1"
                style={{ fontWeight: 700, color: INK, opacity: 0.75 }}
              >
                Nothing is required — leave anything blank. Saved settings shape every reply.
              </p>
            </div>
          </div>

          <div className="mt-5">{sections}</div>
        </motion.div>
      </div>

      {/* Sticky save */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 p-4"
        style={{
          backgroundColor: `${PAGE_BG}E6`,
          backdropFilter: "saturate(160%) blur(18px)",
          WebkitBackdropFilter: "saturate(160%) blur(18px)",
          borderTop: `1.5px solid ${BORDER}`,
        }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={save}
            disabled={saving || !isDirty}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40"
            style={{
              backgroundColor: MINT,
              color: INK,
              fontWeight: 900,
              border: `2.5px solid ${INK}`,
              boxShadow: `4px 4px 0 ${INK}`,
            }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : isDirty ? "Save preferences" : "Saved"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Sticker primitives ----------

function StickerCard({
  title,
  tone,
  hint,
  children,
}: {
  title: string;
  tone: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section
      className="rounded-[22px] overflow-hidden"
      style={{
        backgroundColor: SURFACE,
        border: `2.5px solid ${INK}`,
        boxShadow: `3px 3px 0 ${INK}`,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
        style={{ backgroundColor: tone, borderBottom: open ? `2.5px solid ${INK}` : "none" }}
        aria-expanded={open}
      >
        <h3
          className="text-[12px] uppercase tracking-[0.16em]"
          style={{ fontWeight: 900, color: INK }}
        >
          {title}
        </h3>
        <span className="flex items-center gap-2">
          {hint && (
            <span className="text-[10.5px]" style={{ color: INK, fontWeight: 800, opacity: 0.8 }}>
              {hint}
            </span>
          )}
          <span
            className="grid place-items-center rounded-full"
            style={{
              width: 22,
              height: 22,
              border: `2px solid ${INK}`,
              backgroundColor: "#ffffff",
              color: INK,
              fontWeight: 900,
              fontSize: 14,
              lineHeight: 1,
              transform: open ? "rotate(45deg)" : "none",
              transition: "transform 150ms ease",
            }}
            aria-hidden
          >
            +
          </span>
        </span>
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </section>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="text-[11px] mb-1.5 block uppercase tracking-wider"
        style={{ color: MUTED, fontWeight: 800 }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function StickerInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl text-[13.5px] outline-none transition-colors"
      style={{
        backgroundColor: PAGE_BG,
        color: TEXT,
        border: `2px solid ${BORDER}`,
        fontWeight: 600,
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = INK)}
      onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
    />
  );
}

function StickerTextarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl text-[13.5px] outline-none transition-colors resize-none"
      style={{
        backgroundColor: PAGE_BG,
        color: TEXT,
        border: `2px solid ${BORDER}`,
        fontWeight: 600,
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = INK)}
      onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
    />
  );
}

function Slider({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div
        className="flex items-center justify-between text-[11px] mb-1.5 uppercase tracking-wider"
        style={{ color: MUTED, fontWeight: 800 }}
      >
        <span>{label}</span>
        <span
          className="tabular-nums px-2 py-0.5 rounded-full"
          style={{ backgroundColor: INK, color: YELLOW, fontWeight: 900 }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: INK }}
      />
      <div
        className="flex justify-between text-[10.5px] mt-1 px-0.5"
        style={{ color: MUTED, fontWeight: 700 }}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
