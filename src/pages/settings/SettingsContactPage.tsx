// Contact human support — cartoon redesign on mobile.
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { HumanSupportIcon } from "@/components/settings/SettingsIcons";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopSettingsLayout } from "@/components/settings/DesktopSettingsLayout";
import { CartoonPage, CartoonHero, CartoonCard } from "@/components/settings/CartoonSettingsShell";
import { INK, MINT, PEACH, TEXT, MUTED, SURFACE_2 } from "@/pages/billing/ReferralsPage";
import contactSticker from "@/assets/settings/contact-sticker.png";

export default function SettingsContactPage() {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email || "");
      const meta = (u.user_metadata as any) || {};
      setName(meta.full_name || meta.name || u.email?.split("@")[0] || "");
    });
  }, []);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in name, email and message");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || null,
      message: message.trim(),
      form_type: "support",
    });
    setSending(false);
    if (error) {
      toast.error("Failed to send. Please try again.");
      return;
    }
    toast.success("Message sent. We'll reply by email within 24h.");
    setSubject("");
    setMessage("");
  };

  const desktopField =
    "w-full px-3.5 py-3 rounded-xl bg-muted/40 border border-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:bg-muted/60 focus:border-border transition-colors";

  const desktopForm = (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card mb-3">
        <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center text-foreground">
          <HumanSupportIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Human support</p>
          <p className="text-[11px] text-muted-foreground">Replies within 24 hours</p>
        </div>
      </div>
      <div>
        <label className="text-[11.5px] text-muted-foreground mb-1.5 block">Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={desktopField} />
      </div>
      <div>
        <label className="text-[11.5px] text-muted-foreground mb-1.5 block">Your email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={desktopField} />
      </div>
      <div>
        <label className="text-[11.5px] text-muted-foreground mb-1.5 block">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Billing question" className={desktopField} />
      </div>
      <div>
        <label className="text-[11.5px] text-muted-foreground mb-1.5 block">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Describe your issue in detail…"
          className={`${desktopField} resize-none`}
        />
      </div>
      <button
        onClick={submit}
        disabled={sending}
        className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {sending && <Loader2 className="w-4 h-4 animate-spin" />}
        {sending ? "Sending…" : "Send message"}
      </button>
    </div>
  );

  if (!isMobile) {
    return (
      <DesktopSettingsLayout title="Contact our team" subtitle="A human will reply by email within 24 hours.">
        {desktopForm}
      </DesktopSettingsLayout>
    );
  }

  const cartoonField = "w-full px-4 py-3 rounded-2xl text-[14px] outline-none transition";
  const fieldStyle = {
    backgroundColor: SURFACE_2,
    border: `1.5px solid hsl(var(--surface-4))`,
    color: TEXT,
    fontWeight: 600,
  } as const;

  return (
    <CartoonPage title="Contact our team">
      <CartoonHero
        sticker={contactSticker}
        bg={PEACH}
        title="We're here for you"
        subtitle="A human will reply by email within 24 hours."
      />

      <CartoonCard className="space-y-4 mt-3">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] mb-1.5 block" style={{ color: MUTED, fontWeight: 800 }}>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={cartoonField} style={fieldStyle} />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] mb-1.5 block" style={{ color: MUTED, fontWeight: 800 }}>Your email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={cartoonField} style={fieldStyle} />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] mb-1.5 block" style={{ color: MUTED, fontWeight: 800 }}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Billing question" className={cartoonField} style={fieldStyle} />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] mb-1.5 block" style={{ color: MUTED, fontWeight: 800 }}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Describe your issue in detail…"
            className={`${cartoonField} resize-none`}
            style={fieldStyle}
          />
        </div>

        <button
          onClick={submit}
          disabled={sending}
          className="w-full h-12 rounded-full text-[14px] flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] transition disabled:opacity-50"
          style={{ background: MINT, color: INK, border: `2.5px solid ${INK}`, fontWeight: 900, boxShadow: `3px 3px 0 ${INK}` }}
        >
          {sending && <Loader2 className="w-4 h-4 animate-spin" />}
          {sending ? "Sending…" : "Send message"}
        </button>
      </CartoonCard>
    </CartoonPage>
  );
}
