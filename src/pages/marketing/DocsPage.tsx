/** @doc The page you're reading — the comprehensive, self-updating Megsy AI documentation. */
// Megsy AI — Comprehensive Docs page (/docs)
// Cartoon / brand-ink design system, matching the landing page + settings.
// One long, fully-indexed reference for EVERY feature, page, agent, setting,
// integration, plan, policy, route and shortcut on megsyai.com.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Presentation,
  FileText,
  Microscope,
  Globe,
  Code2,
  GraduationCap,
  Users,
  Share2,
  Bell,
  Brain,
  Palette,
  Shield,
  Wallet,
  Gift,
  Link2,
  Smartphone,
  Monitor,
  Apple,
  Keyboard,
  HelpCircle,
  Rocket,
  Search,
  ChevronRight,
  CheckCircle2,
  Workflow,
  Settings as SettingsIcon,
  ScrollText,
  Wand2,
  Mic,
  Music,
  Languages,
  Building2,
  LayoutGrid,
  Bot,
  ShieldCheck,
  BookOpen,
  MapPin,
  PaintBucket,
  Database,
  Eye,
  Zap,
  Crown,
  ListTree,
  Pin,
  FolderTree,
  Upload,
  Download,
  RefreshCw,
  Globe2,
  Lock,
  CreditCard,
  Receipt,
  BadgeCheck,
  Layers,
  Cpu,
  Pencil,
  Link as LinkIcon,
  Copy,
  Check,
  ChevronLeft,
  History,
  PlusCircle,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import MegsyStar from "@/components/branding/MegsyStar";
import SEOHead from "@/components/common/SEOHead";

import pwaIos from "@/assets/docs/pwa-ios.png";
import pwaAndroid from "@/assets/docs/pwa-android.png";
import pwaDesktop from "@/assets/docs/pwa-desktop.png";

// ⭐ LIVE DATA IMPORTS — Docs auto-updates whenever any of these change.
// Add a plan, model, FAQ, blog post, comparison or landing anywhere on the
// site → it appears here automatically, no edit to /docs needed.
import {
  PLANS,
  FAQS,
  SERVICES_GUIDE,
  ENTERPRISE_FEATURES,
  PLAN_MONTHLY_CREDITS,
} from "@/data/pricingData";
import { BLOG_POSTS } from "@/data/blogPosts";
import { COMPARISONS } from "@/data/comparisons";
import { SERVICE_LANDINGS } from "@/data/serviceLandings";
import { AGENTS } from "@/lib/agentRegistry";
import {
  CREDITS_PER_SIGNUP,
  COMMISSION_PCT,
  MIN_PAYOUT,
} from "@/pages/billing/ReferralsPage";
import {
  DOC_PAGES,
  DOC_EDGE_FUNCTIONS,
  DOC_REGISTRY_STATS,
  groupPagesByFolder,
} from "@/lib/docsRegistry";
import { integrations as INTEGRATIONS_LIST, INTEGRATION_CATEGORIES } from "@/lib/integrationsData";
import { SLIDES_TEMPLATES } from "@/lib/slidesTemplates";
import { SKILL_TOOLS, SKILL_MODELS } from "@/lib/skillTools";

const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));

// Brand tokens — same palette used by settings + landing.
const INK = "hsl(var(--brand-ink))";
const PARCHMENT = "hsl(var(--brand-parchment))";
const ACTION = "hsl(var(--brand-action))";
const MINT = "hsl(var(--brand-mint))";
const BLUSH = "hsl(var(--brand-blush))";

/* ───────────────────────── Doc data model ───────────────────────── */

type DocBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "kv"; rows: { k: string; v: string }[] }
  | { kind: "code"; text: string; lang?: string }
  | { kind: "note"; text: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "link"; href: string; label: string };

interface DocSection {
  id: string;
  title: string;
  icon: LucideIcon;
  intro?: string;
  blocks: DocBlock[];
  accent?: string; // sticker accent color
}

interface DocGroup {
  id: string;
  label: string;
  sections: DocSection[];
}

const STATIC_GROUPS: DocGroup[] = [
  /* ─────────────────────────── Introduction ─────────────────────────── */
  {
    id: "intro",
    label: "Introduction",
    sections: [
      {
        id: "overview",
        title: "What is Megsy AI?",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy AI is an all-in-one creative & productivity platform powered by a single shared credit balance called Megsy Credits (MC). One subscription unlocks chat, images, video, websites, code, slides, docs, deep research, voice, music, learning, autonomous agents and 1,000+ integrations — no tool-hopping, no extra logins.",
        blocks: [
          { kind: "h", text: "What you get out of the box" },
          { kind: "ul", items: [
            "A unified chat workspace where every modality lives behind the same composer — switch from text to image to video to a full website without leaving the conversation.",
            "The Megsy model family (Lite, AI, Max) plus 80+ best-in-class third-party models — GPT, Claude, Gemini, Grok, Qwen, DeepSeek, Llama, Flux, Recraft, Ideogram, Imagen, Sora, Veo, Kling, Pixverse, Runway, Hailuo, Seedance and more.",
            "Built-in image / video editing, lip-sync, faceswap, upscaling, music, voice cloning, slides, long-form docs and an AI website builder with one-click publish.",
            "Operator (Megsy OS) — autonomous browser-using agents that work for hours unattended and ship results to your inbox.",
            "Team workspaces, shared memory, shared skills, role-based permissions and pooled credits.",
            "Installable as a real native-feeling app on iPhone, iPad, Android, macOS, Windows and Linux (PWA).",
            "Auto-mirroring of your language and dialect — Egyptian Arabic stays Egyptian, French stays French. Never translates or switches on you.",
            "Privacy-first: your prompts and outputs are yours. Never used to train any third-party model.",
          ]},
          { kind: "note", text: "A Free plan with starter MC is included — no card required to try every tool." },
          { kind: "link", href: "/features-guide", label: "See the full features guide →" },
          { kind: "link", href: "/pricing", label: "Compare plans & top-ups →" },
        ],
      },
      {
        id: "quickstart",
        title: "Quick start — your first 5 minutes",
        icon: Rocket,
        accent: MINT,
        intro:
          "A guided walkthrough from signing up to publishing your first creation. Each step takes under a minute.",
        blocks: [
          { kind: "ol", items: [
            "Go to megsyai.com and click ‘Sign in’ in the top right. Choose email, Google, or Apple. New accounts are created instantly with starter MC.",
            "You land on /chat — the main workspace. The composer at the bottom is where you type. The model name above the composer (e.g. ‘Megsy AI’) is tappable to switch models.",
            "Above the composer is the Mode Bar: Chat, Create Website, Images, Videos, Deep Research, Slides, Docs, Learning, Code, Operator. Tap any chip to enter that mode — the composer adapts (e.g. shows aspect ratio for Images, depth slider for Research).",
            "Type a prompt. Attach files with the paperclip (PDF, DOCX, XLSX, CSV, images, audio, video, code). Press Enter to send, Shift+Enter for a new line.",
            "When the answer arrives you can: regenerate, branch, copy, share, edit, read aloud, translate, fork into a new chat, or rate it. Edit any of YOUR messages and the rest of the thread regenerates automatically.",
            "Open the sidebar (Cmd/Ctrl + B) to see all chats. Pin important ones, drag them into folders, search with Cmd/Ctrl + K.",
            "Open Settings → Customization to pick an accent color, message bubble style, and your preferred reply tone.",
            "Install Megsy as an app (see the PWA section) for full-screen, offline-friendly use with push notifications.",
          ]},
          { kind: "note", text: "Tip: the very first chat you start is auto-titled by Megsy after your second message — you don’t have to name it." },
        ],
      },
      {
        id: "site-map",
        title: "Site map — every public page on megsyai.com",
        icon: MapPin,
        accent: BLUSH,
        intro:
          "A single index of every route on the site, grouped by area. Click any path to jump straight there. If a page is gated, you’ll be sent to /auth first and bounced back after sign-in.",
        blocks: [
          { kind: "h", text: "Core app" },
          { kind: "kv", rows: [
            { k: "/", v: "Home — landing, hero, showcase, featured demos." },
            { k: "/chat", v: "Main chat workspace, all modes, all models, all attachments." },
            { k: "/share/:id", v: "Public read-only link to a shared chat." },
            { k: "/pricing", v: "Plans, yearly toggle, MC top-up packs, FAQ." },
            { k: "/features-guide", v: "Long-form feature tour with screenshots and comparisons." },
            { k: "/about", v: "About the team, mission, and timeline." },
            { k: "/enterprise", v: "Enterprise capabilities, SSO, DPA, sales contact form." },
            { k: "/egypt", v: "Egypt-focused regional landing — pricing in EGP, local payment methods." },
            { k: "/blog", v: "Auto-publishing blog (3 fresh articles per day, every language)." },
            { k: "/docs", v: "This documentation hub — searchable, complete." },
            { k: "/support", v: "AI support chat (24/7) — knows every page of these docs." },
            { k: "/contact", v: "Human contact form — routes to support@megsyai.com." },
          ]},
          { kind: "h", text: "Auth & onboarding" },
          { kind: "kv", rows: [
            { k: "/auth", v: "Combined sign-in / sign-up / password reset." },
            { k: "/auth/two-factor", v: "TOTP code challenge after login." },
            { k: "/auth/mfa-challenge", v: "Backup-code or recovery challenge." },
            { k: "/auth/accept-invite", v: "Accept a personal chat invite." },
            { k: "/auth/accept-workspace-invite", v: "Accept a workspace seat invite." },
            { k: "/auth/oauth/authorize", v: "OAuth approval screen when a third-party app asks for access." },
            { k: "/auth/oauth/callback", v: "Return URL after an OAuth handshake." },
            { k: "/auth/reset-password", v: "Set a new password from a reset link." },
            { k: "/auth/change-email", v: "Confirm a new email from an emailed link." },
            { k: "/auth/change-password", v: "Self-serve change while signed in." },
            { k: "/auth/delete-account", v: "Final confirmation to permanently delete an account." },
            { k: "/r/:code", v: "Referral redirect — drops the referral cookie and sends to /auth." },
          ]},
          { kind: "h", text: "Settings" },
          { kind: "kv", rows: [
            { k: "/settings", v: "Settings home." },
            { k: "/settings/profile", v: "Name, avatar, pronouns, bio." },
            { k: "/settings/billing", v: "Plan, invoices, payment method, MC usage, top-ups." },
            { k: "/settings/language", v: "Force the UI language (otherwise auto-detected)." },
            { k: "/settings/memory", v: "Long-term AI memory — review, edit, delete each fact." },
            { k: "/settings/customization", v: "Accent color, reply tone, response shape, persona." },
            { k: "/settings/integrations", v: "Connect Gmail, Slack, Notion, GitHub, Telegram and 1,000+ apps." },
            { k: "/settings/notifications", v: "Push, email and in-app notification controls." },
            { k: "/settings/skills", v: "Build, edit and share custom Skills." },
            { k: "/settings/skills/new", v: "New Skill wizard." },
            { k: "/settings/operator", v: "Megsy OS — autonomous agents home." },
            { k: "/settings/operator/agents", v: "Create / configure agents and recurring runs." },
            { k: "/settings/operator/audit", v: "Full action audit log for every agent run." },
            { k: "/settings/two-factor", v: "Enable / disable 2FA, view recovery codes." },
            { k: "/settings/change-email · /settings/change-password · /settings/delete-account", v: "Self-serve account changes." },
            { k: "/settings/security", v: "Sessions, devices, login alerts." },
            { k: "/settings/privacy", v: "Data export, training opt-out toggles." },
            { k: "/settings/help", v: "Help center — links to /docs and the AI support chat." },
            { k: "/settings/contact", v: "In-app contact form." },
            { k: "/settings/system-status", v: "Live status of every Megsy service." },
            { k: "/settings/switch-account", v: "Add and toggle multiple accounts on one device." },
            { k: "/settings/referrals", v: "Referrals dashboard (tabs: Dashboard, Program, Tasks, Withdrawals)." },
            { k: "/settings/referrals/resources", v: "Marketing kit — videos, captions, banners to repost." },
          ]},
          { kind: "h", text: "Workspaces & billing" },
          { kind: "kv", rows: [
            { k: "/workspaces", v: "List of workspaces you belong to." },
            { k: "/workspaces/new", v: "Create a new workspace." },
            { k: "/workspaces/:id", v: "Workspace overview — members, chats, assets, settings." },
            { k: "/workspaces/:id/tasks", v: "Task board for the workspace (Kanban-style)." },
            { k: "/billing/success", v: "Confirmation page shown after a successful payment." },
            { k: "/billing/withdraw", v: "Request a cash withdrawal of referral earnings." },
          ]},
          { kind: "h", text: "Legal & trust" },
          { kind: "kv", rows: [
            { k: "/terms · /privacy · /cookies · /refund", v: "Core legal." },
            { k: "/acceptable-use · /policies/content", v: "What you may and may not generate." },
            { k: "/legal/ai-disclaimer", v: "Important AI limitations & user responsibility." },
            { k: "/legal/dmca · /legal/dpa · /legal/affiliate", v: "Copyright, data processing, affiliate terms." },
            { k: "/legal/moderation · /legal/age", v: "Moderation framework and minimum-age rules." },
            { k: "/legal/subprocessors · /legal/accessibility · /legal/compliance", v: "Vendor list, WCAG conformance, regional compliance." },
            { k: "/security · /trust", v: "Security posture and trust center." },
          ]},
        ],
      },
      {
        id: "anatomy",
        title: "Anatomy of the chat workspace",
        icon: LayoutGrid,
        accent: ACTION,
        intro:
          "Every pixel of /chat explained — what each region does, where to click, and the keyboard shortcut where one exists.",
        blocks: [
          { kind: "h", text: "Left sidebar" },
          { kind: "ul", items: [
            "Top: Megsy logo (returns to /chat) and the New Chat button (Cmd/Ctrl + N).",
            "Search bar — full-text search across every chat (Cmd/Ctrl + K).",
            "Pinned section — chats you’ve pinned stay on top across sessions.",
            "Folders — drag and drop chats into folders, nest folders, rename inline.",
            "Recent — newest chats first, lazy-loaded as you scroll.",
            "Workspace switcher (bottom) — flip between personal and team workspaces.",
            "Account menu — profile, settings, billing, sign out.",
            "Collapse / expand toggle (Cmd/Ctrl + B) — frees screen space on small displays.",
          ]},
          { kind: "h", text: "Top bar" },
          { kind: "ul", items: [
            "Chat title — click to rename inline. Auto-generated after your second message.",
            "Share button — generates a public read-only link or invites a person to co-chat live.",
            "Model name — tap to open the Model Picker.",
            "Branch / Fork — opens the current thread in a new chat without affecting this one.",
            "Menu (⋯) — archive, delete, export, move to folder, pin.",
          ]},
          { kind: "h", text: "Composer (bottom)" },
          { kind: "ul", items: [
            "Mode Bar above the composer — Chat, Create Website, Images, Videos, Deep Research, Slides, Docs, Learning, Code, Operator. Active mode is highlighted; tap the small ‘×’ on a non-chat mode to return to plain chat.",
            "Paperclip — attach files (PDF, DOCX, XLSX, CSV, MD, TXT, images, audio, video, ZIP, code).",
            "Mic — push-to-talk voice input.",
            "Globe — toggle web search grounding for this message.",
            "Slash ‘/’ — open the Skills launcher (your custom prompts).",
            "‘@’ — mention an agent (e.g. @images, @videos, @docs, @slides, @research, @megsy-os).",
            "Send button — Enter to send, Shift+Enter for newline.",
            "Below the composer: model cost preview, attached file chips, voice/transcript controls.",
          ]},
          { kind: "h", text: "Message actions (hover any reply)" },
          { kind: "ul", items: [
            "Copy — copy as Markdown.",
            "Regenerate — re-run the same prompt; previous reply is kept as a branch.",
            "Try another model — open the picker and compare.",
            "Read aloud — TTS in 30+ languages.",
            "Translate — convert to any language without losing context.",
            "Share this single answer as a public mini-link.",
            "Save to memory — add a fact to /settings/memory.",
            "Flag — report a problem; helps our moderation queue.",
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Account & billing ─────────────────────────── */
  {
    id: "account",
    label: "Account & billing",
    sections: [
      {
        id: "auth",
        title: "Sign in, sign up & account security",
        icon: Shield,
        accent: ACTION,
        intro: "Every way to get into Megsy and every control over your account.",
        blocks: [
          { kind: "h", text: "Sign-in methods" },
          { kind: "ul", items: [
            "Email + password — set during sign-up; resettable any time via /auth.",
            "Google sign-in — one tap, no password.",
            "Apple sign-in — works on iOS/macOS and the web.",
            "Magic link — receive a one-time link by email, click to sign in.",
            "Single Sign-On (SAML / OIDC) — available on Enterprise.",
          ]},
          { kind: "h", text: "Two-Factor Authentication (2FA)" },
          { kind: "ol", items: [
            "Open /settings/two-factor.",
            "Scan the QR code with any TOTP app (Google Authenticator, 1Password, Authy, Bitwarden).",
            "Enter the 6-digit code to confirm.",
            "SAVE the recovery codes shown on screen — they are the only way back in if you lose your device.",
            "Next sign-in will prompt for a code at /auth/two-factor.",
          ]},
          { kind: "h", text: "Account management" },
          { kind: "ul", items: [
            "Change email — Settings → Change Email. Confirmation goes to both addresses.",
            "Change password — Settings → Change Password. Current password required.",
            "Active sessions — Settings → Security → ‘Sign out remote devices’.",
            "Switch / add accounts — Settings → Switch Account. Up to 5 accounts on one device.",
            "Delete account — Settings → Delete Account. Permanent; data is purged within 30 days per GDPR Art. 17.",
            "Data export — Settings → Privacy → ‘Download my data’ for a ZIP of chats, files, settings.",
          ]},
          { kind: "link", href: "/security", label: "Read the full security posture →" },
        ],
      },
      {
        id: "credits",
        title: "Megsy Credits (MC) — how the economy works",
        icon: Wallet,
        accent: MINT,
        intro:
          "Every action on Megsy spends MC. A single shared balance powers chat, images, video, slides, docs, research, voice, music, Operator and integrations — no per-tool sub-quotas, no expiring buckets.",
        blocks: [
          { kind: "h", text: "How MC is consumed" },
          { kind: "ul", items: [
            "Each model shows its MC cost above the composer before you send.",
            "Cheap actions (a Megsy Lite reply, a Nano Banana image) cost just 1–3 MC.",
            "Premium actions (a Sora video, a Veo 3.1 generation, a 200-source Deep Research) cost more — you always see the price first.",
            "Failed generations are auto-refunded — the refund line appears in Settings → Billing → Usage.",
            "Web search and integrations cost 0 MC (your plan’s usage cap still applies).",
          ]},
          { kind: "h", text: "How MC is earned" },
          { kind: "ul", items: [
            "Free starter MC on sign-up — no card required.",
            "Monthly grant on every paid plan (Pro, Elite, Business).",
            "Yearly billing grants extra MC up front.",
            "Top-up packs from /settings/billing — instant, never expires.",
            "Referrals — both sides get 15 MC per signup.",
            "Tasks — /settings/referrals/tasks lists small actions (verify email, install PWA, share on social) that grant bonus MC.",
          ]},
          { kind: "h", text: "Unlimited windows on paid plans" },
          { kind: "ul", items: [
            "Pro — 7-day unlimited window per month for image + video tools (capped at fair-use).",
            "Elite — 15-day unlimited window, priority queue, higher export resolution.",
            "Business — full-month unlimited window plus shared workspace credits.",
            "Megsy AI text chat is unlimited on every paid plan (Pro and above).",
          ]},
        ],
      },
      {
        id: "plans",
        title: "Plans & pricing in detail",
        icon: Crown,
        accent: ACTION,
        intro:
          "Compare every plan. All prices in USD. Yearly billing always lowers the effective monthly price and grants extra MC up front. Local currency (EUR, GBP, EGP, SAR, AED, INR…) is shown automatically at checkout.",
        blocks: [
          { kind: "kv", rows: [
            { k: "Free — $0", v: "Starter MC, Megsy Lite chat, watermarked previews on heavy media tools. Great for trying the platform with no card." },
            { k: "Pro — $25 / month", v: "Unlimited Megsy AI text chat, full Mode Bar, 7-day unlimited window per month for images & videos, all standard models, all integrations." },
            { k: "Elite — $59 / month", v: "Everything in Pro, 15-day unlimited window, priority generation queue, higher resolution exports, premium model access (Veo 3.1, Sora 2 Pro, Kling Master)." },
            { k: "Business — $149 / month", v: "Everything in Elite, full-month unlimited window, team workspaces, pooled credits, shared skills & memory, role-based access, audit log, REST API." },
            { k: "Enterprise — custom", v: "Custom MC pools, SSO (SAML/OIDC), SCIM, DPA, region pinning, dedicated success manager, priority SLA, custom invoicing. Contact sales at /enterprise." },
          ]},
          { kind: "h", text: "Add-ons that work on every plan" },
          { kind: "ul", items: [
            "MC top-ups — buy extra credits any time from /settings/billing. They never expire.",
            "Yearly upgrade — switch monthly→yearly mid-cycle; we credit the unused days automatically.",
            "Workspace seats (Business+) — add seats from /workspaces/:id → Members.",
          ]},
          { kind: "link", href: "/pricing", label: "Open the live pricing page →" },
        ],
      },
      {
        id: "billing-dashboard",
        title: "Billing dashboard — where every money control lives",
        icon: Receipt,
        accent: BLUSH,
        intro:
          "Settings → Billing is the single source of truth for everything financial about your account.",
        blocks: [
          { kind: "h", text: "Sections inside /settings/billing" },
          { kind: "ul", items: [
            "Plan card — current plan, monthly/yearly toggle, next renewal date, change/cancel/downgrade buttons.",
            "Credits card — current MC balance, this month’s grant, top-up shortcut, low-balance threshold.",
            "Usage breakdown — MC spent per tool, per day, per model. Refunds are listed in green.",
            "Payment method — add or remove your card. All checkout is securely handled by Dodo Payments with bank-grade encryption; we never store card details.",
            "Invoices — download a PDF for every charge.",
            "Tax — set a tax/VAT ID for compliant invoices (EU, UK, GCC, etc.).",
            "Cancel subscription — access continues until the end of the paid period; downgrade preserves any MC top-ups.",
          ]},
          { kind: "link", href: "/refund", label: "Refund policy →" },
        ],
      },
      {
        id: "referrals",
        title: "Referrals & affiliate program — exact numbers",
        icon: Gift,
        accent: ACTION,
        intro:
          "Share Megsy, earn lifetime cash. Only the numbers in this section are real — anything else online is unofficial.",
        blocks: [
          { kind: "h", text: "How it works" },
          { kind: "ul", items: [
            "Get your link from /settings/referrals → Program tab.",
            "Share it anywhere — TikTok, X, YouTube, WhatsApp, your blog.",
            "When a friend signs up via your link: they get 15 free MC, and you get 15 free MC.",
            "When that friend ever pays for any Megsy plan or top-up, you earn 20% cash commission — for life.",
            "Withdraw cash once your balance reaches the $10 minimum, via PayPal, bank transfer, or USDT.",
          ]},
          { kind: "h", text: "Dashboard tabs (/settings/referrals)" },
          { kind: "ul", items: [
            "Dashboard — totals, signups, pending and paid commissions, click-through stats.",
            "Program — your link, QR code, social share buttons, custom UTM tags.",
            "Tasks — small bonus tasks (verify email, post a video, install PWA) that grant extra MC.",
            "Withdrawals — payout history, request a new withdrawal at /settings/withdraw. Up to 2 withdrawals per month; minimum $10 per request.",
            "Resources (/settings/referrals/resources) — videos, captions, image banners and reels you can re-post as-is.",
          ]},
          { kind: "note", text: "Do not believe any number you see elsewhere — only ‘15 MC per signup’, ‘20% lifetime cash’, and ‘$10 minimum payout’ are real." },
          { kind: "link", href: "/settings/referrals", label: "Open the referral dashboard →" },
          { kind: "link", href: "/legal/affiliate", label: "Affiliate terms →" },
        ],
      },
    ],
  },

  /* ─────────────────────────── Chat & models ─────────────────────────── */
  {
    id: "chat",
    label: "Chat & models",
    sections: [
      {
        id: "chat-basics",
        title: "Chat basics — every gesture explained",
        icon: MessageSquare,
        accent: ACTION,
        blocks: [
          { kind: "ul", items: [
            "Type anything — Megsy keeps the full conversation context automatically; nothing to ‘load’.",
            "Attach files via paperclip or drag-drop: PDF, DOCX, XLSX, CSV, MD, TXT, images, audio (MP3/WAV/M4A), video (MP4/MOV/WebM), code, ZIP. Multiple files per message.",
            "Paste a screenshot directly (Cmd/Ctrl + V) — Megsy reads it with vision.",
            "Voice input via the mic icon; voice reply via the speaker icon on any message.",
            "Edit any of YOUR messages — the rest of the thread regenerates from that point.",
            "Regenerate, branch, and compare answers from different models on the same prompt without losing the original.",
            "Pin chats from the sidebar; rename / share / archive / delete / move from the chat ⋯ menu.",
            "Folders & tags to organize long histories.",
            "Search across every chat from Cmd/Ctrl + K — searches messages, attachments, file names and shared links.",
            "Each chat has a permanent URL — bookmark or share it.",
          ]},
        ],
      },
      {
        id: "models",
        title: "Models & the model picker",
        icon: Brain,
        accent: MINT,
        intro:
          "Tap the model name above the composer to switch. Megsy AI is the default and is unlimited on every paid plan. Each model shows its strengths, context size and MC cost per message before you send.",
        blocks: [
          { kind: "h", text: "The Megsy family" },
          { kind: "kv", rows: [
            { k: "Megsy Lite", v: "Free tier — fast everyday answers. Best for short Q&A, summaries, small drafts." },
            { k: "Megsy AI", v: "Default flagship reasoning model. Unlimited on Pro+. Best balance of speed, depth and cost." },
            { k: "Megsy Max", v: "Deep reasoning routed to the current frontier model. For complex math, multi-step reasoning, code refactors." },
          ]},
          { kind: "h", text: "Third-party text models (one balance, one picker)" },
          { kind: "kv", rows: [
            { k: "GPT family (OpenAI)", v: "Premium reasoning and writing." },
            { k: "Claude family (Anthropic)", v: "Best long-form writing & document analysis." },
            { k: "Gemini family (Google)", v: "Multimodal, web-grounded answers." },
            { k: "Grok (xAI)", v: "Real-time web-aware chat." },
            { k: "Qwen, DeepSeek, Llama", v: "Open & alternative frontier models for code and reasoning." },
          ]},
          { kind: "h", text: "Image models" },
          { kind: "kv", rows: [
            { k: "Megsy Image", v: "House model — clean, brand-safe, ~8 MC." },
            { k: "Nano Banana / Nano Banana 2 / Nano Banana Pro", v: "Fastest, cheapest (~2–4 MC)." },
            { k: "Gemini 3 Pro Image", v: "Multimodal precision (~10 MC)." },
            { k: "GPT Image 2 / GPT-5 Image / GPT-5.4 Image 2", v: "OpenAI’s image family for typography & branded outputs (~6–14 MC)." },
            { k: "Flux, Recraft, Ideogram, Imagen, ByteDance Seed", v: "Available via the model picker for specific styles." },
          ]},
          { kind: "h", text: "Video models" },
          { kind: "kv", rows: [
            { k: "Megsy Video", v: "House model — ~40 MC." },
            { k: "Seedance 2.0 / 2.0 Fast / 1.5 Pro", v: "Fast cinematic clips (~30–60 MC)." },
            { k: "Hailuo 2.3", v: "Stylised motion (~40 MC)." },
            { k: "Kling Master", v: "Long, coherent clips (~90 MC)." },
            { k: "Veo 3.1 / Veo 3.1 Lite", v: "Google’s flagship video model (~50–80 MC)." },
            { k: "Sora 2 Pro", v: "OpenAI cinema-grade (~100 MC)." },
          ]},
          { kind: "note", text: "Switching mid-thread keeps your context — the new model sees the whole conversation." },
        ],
      },
      {
        id: "web-search",
        title: "Web search & citations",
        icon: Globe,
        accent: BLUSH,
        blocks: [
          { kind: "p", text: "Toggle the globe icon on the composer to ground answers in live web results. Replies include inline numbered citations you can click — each opens the original source in a new tab. Megsy picks reputable sources, filters spam, and cross-checks claims. Cost: 0 MC; subject to fair-use throttling on the Free plan." },
        ],
      },
      {
        id: "voice",
        title: "Voice — talk and listen",
        icon: Mic,
        accent: ACTION,
        blocks: [
          { kind: "ul", items: [
            "Push-to-talk via the mic icon — hold to record, release to send.",
            "Hands-free voice mode — open from the bottom-right of the composer for a real spoken conversation with interruptions and turn-taking.",
            "30+ natural voices across English, Arabic (incl. Egyptian dialect), French, Spanish, German, Portuguese, Italian, Turkish, Russian, Hindi, Chinese, Japanese, Korean and more.",
            "Auto language detection — Megsy replies in the language you spoke.",
            "Read any message aloud with one tap (speaker icon).",
            "Voice cloning available in @voice → Voice Clone (5 MC) — upload a 30-second sample.",
          ]},
        ],
      },
      {
        id: "files",
        title: "Files, vision & document analysis",
        icon: FileText,
        accent: MINT,
        blocks: [
          { kind: "ul", items: [
            "Drag any file into the composer. Up to 20 files per message.",
            "Supported: PDF (incl. scanned, OCR), DOCX, XLSX, CSV, MD, TXT, JSON, YAML, HTML, images, audio, video, code (any language), ZIP (auto-extracted).",
            "Per-file limit: 200 MB on Free, up to 2 GB on Business/Enterprise.",
            "Megsy can read very long PDFs in chunks and synthesise across them.",
            "Vision: paste or attach an image — Megsy describes it, extracts text (OCR), reads tables, identifies objects.",
            "Audio: transcribe with timestamps; summarise meetings; identify speakers.",
            "Video: scene-by-scene summary, transcript, key frame extraction.",
            "All uploaded files are stored privately under your account and reusable across chats via the library.",
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Agents & creative tools ─────────────────────────── */
  {
    id: "agents",
    label: "Agents & creative tools",
    sections: [
      {
        id: "agents-website",
        title: "Create Website (Megsy Builder)",
        icon: Globe,
        accent: ACTION,
        intro:
          "Describe what you want and Megsy builds a real, deployable site in seconds. Iterate by chatting — the live preview updates as code is written.",
        blocks: [
          { kind: "ul", items: [
            "Production stack: React 18 + Vite + Tailwind CSS + TypeScript.",
            "One-click publish to a free megsy.app subdomain or your own custom domain.",
            "Attach a database (Postgres), authentication, payments (Stripe / Paddle / Dodo), file storage and edge functions in a click.",
            "Push directly to GitHub — your repo is the source of truth.",
            "Built-in SEO: titles, descriptions, OG/Twitter cards, sitemap.xml, robots.txt, JSON-LD, canonical tags.",
            "Accessibility checks on every build (WCAG AA).",
            "Mobile-first responsive previews — phone, tablet, desktop side by side.",
            "Roll back to any previous version from the version history.",
            "Invite collaborators — they can edit prompts, not just see them.",
          ]},
          { kind: "h", text: "Tips for the best results" },
          { kind: "ul", items: [
            "Be explicit about brand vibe, target audience, and required pages.",
            "Attach a reference screenshot — Megsy will match the layout.",
            "Ask for ‘design directions’ first to compare 2–3 visual options before committing.",
            "Use the version history to A/B compare versions without losing work.",
          ]},
        ],
      },
      {
        id: "agents-images",
        title: "Images — generation & editing",
        icon: ImageIcon,
        accent: MINT,
        intro:
          "State-of-the-art image generation with multiple models (Megsy Image, Flux, Recraft, Ideogram, GPT-Image, Google Imagen, ByteDance Seed, Nano Banana) in one panel.",
        blocks: [
          { kind: "h", text: "Controls available before generating" },
          { kind: "ul", items: [
            "Model — see MC cost per image before sending.",
            "Aspect ratio — 1:1, 4:5, 9:16, 16:9, 21:9 and custom.",
            "Resolution — up to 4K on Elite+.",
            "Quality / steps / guidance — fine-tune on advanced models.",
            "Style presets — photoreal, cinematic, anime, 3D, sticker, line-art, watercolor and more.",
            "Negative prompt — what to AVOID (‘no blur’, ‘no watermark’).",
            "Seed — pin a seed for reproducible results.",
            "Reference images — drag any image to anchor character, style or composition.",
          ]},
          { kind: "h", text: "Edit tools (after generation)" },
          { kind: "ul", items: [
            "Inpaint — repaint a masked area.",
            "Outpaint — extend the canvas in any direction.",
            "Upscale — 2×, 4×, 8× super-resolution.",
            "Background remove / replace.",
            "Magic erase — remove objects with one tap.",
            "Style transfer — repaint the image in a new style.",
            "Face swap — between two reference faces.",
            "Variations — generate 4 close cousins of an image you like.",
            "All assets stored in your private library and reusable as references.",
          ]},
        ],
      },
      {
        id: "agents-video",
        title: "Videos & Cinema mode",
        icon: Video,
        accent: BLUSH,
        intro:
          "Generate cinematic clips with Sora, Veo, Kling, Pixverse, Runway, Luma, Hailuo and Seedance. Optional start/end frame, motion control and audio.",
        blocks: [
          { kind: "ul", items: [
            "Text-to-video and image-to-video both supported.",
            "Lip-sync mode: portrait + audio → talking video.",
            "Start frame + end frame: pin the first and last image for clean motion.",
            "Camera motion controls (pan, zoom, orbit) where the model supports it.",
            "Duration: from 4s to 30s per clip; chain in Cinema mode for longer films.",
            "Cinema mode — give a script or storyboard and Megsy stitches multi-scene films with consistent characters.",
            "Audio — generate music & SFX layers in @music; mix in the editor.",
            "Exports — MP4, MOV, WebM, up to 4K on Elite+.",
          ]},
        ],
      },
      {
        id: "agents-research",
        title: "Deep Research",
        icon: Microscope,
        accent: ACTION,
        intro:
          "Multi-source web research that returns a structured report with citations, charts and a downloadable PDF.",
        blocks: [
          { kind: "ul", items: [
            "Depth slider — quick (~30 sources), standard (~80), deep (~200).",
            "Cross-checks claims and flags contradictions in the report.",
            "Generates charts, tables and an executive summary.",
            "Every claim is footnoted with the exact source URL.",
            "Downloadable as PDF, DOCX or shareable web link.",
            "Can be re-run on a schedule via Operator for live competitive intel.",
          ]},
        ],
      },
      {
        id: "agents-slides",
        title: "Slides",
        icon: Presentation,
        accent: MINT,
        intro:
          "Generates a full editable presentation from a prompt. Pick a theme, regenerate any slide, edit text inline, export to PPTX or share a live link.",
        blocks: [
          { kind: "ul", items: [
            "Dozens of designer themes — corporate, editorial, playful, dark, minimal, pitch-deck.",
            "AI image fill per slide — Megsy picks or generates the right image.",
            "Speaker notes generated automatically.",
            "Inline editing on any text element; re-prompt any single slide without affecting the rest.",
            "Charts (bar, line, pie, area) generated from data you paste or attach.",
            "Export to .pptx (perfect PowerPoint fidelity), PDF, or share a live web link with presenter mode.",
            "Custom branding — drop a logo + 2 colors and the whole deck restyles.",
          ]},
        ],
      },
      {
        id: "agents-docs",
        title: "Docs (long-form writer)",
        icon: ScrollText,
        accent: BLUSH,
        intro:
          "Long-form document writer — proposals, contracts, essays, manuals, resumes, business plans. Export to DOCX, PDF or Google Docs.",
        blocks: [
          { kind: "ul", items: [
            "Live A4 preview as you chat.",
            "Tone & length controls (concise, balanced, exhaustive).",
            "Insert images, tables and charts inline.",
            "Templates: resume, cover letter, NDA, MSA, proposal, brief, research memo, business plan, contract, white paper.",
            "Track changes — every edit you make is versioned and revertable.",
            "Multi-language — write in one language, export translated copies in one click.",
          ]},
        ],
      },
      {
        id: "agents-learning",
        title: "Learning",
        icon: GraduationCap,
        accent: ACTION,
        intro:
          "Adaptive tutor that explains, quizzes, summarises and builds personalised study plans from any source (URL, PDF, video, photo of a textbook).",
        blocks: [
          { kind: "ul", items: [
            "‘Explain like I’m 5/15/expert’ toggle on every answer.",
            "Spaced-repetition flashcards generated from any source.",
            "Quizzes with instant feedback and explanations.",
            "Personalised study plans with deadlines and weekly check-ins.",
            "Pomodoro timer card with focus music.",
            "Subject library: math, physics, chemistry, biology, history, languages, coding, finance.",
          ]},
        ],
      },
      {
        id: "agents-operator",
        title: "Operator — autonomous agents (Megsy OS)",
        icon: Workflow,
        accent: MINT,
        intro:
          "Hand off multi-step browser & API tasks. Operator opens a virtual browser, logs in (with your approval), fills forms, scrapes data, and reports back. Pro+ only.",
        blocks: [
          { kind: "ul", items: [
            "Pre-built agents: research, lead-gen, monitoring, social posting, price tracker, inbox triage.",
            "Custom agents — describe the goal in plain English at /settings/operator/agents.",
            "Schedule — one-off, hourly, daily, weekly, or webhook-triggered.",
            "Approvals — you can require a manual ‘OK’ before any destructive action (sending an email, making a purchase).",
            "Full audit log of every action — /settings/operator/audit. Replay any step.",
            "Outputs land in chat or get emailed / Slack-pinged.",
            "Concurrency — run many agents in parallel; quota set by your plan.",
          ]},
        ],
      },
      {
        id: "agents-code",
        title: "Code",
        icon: Code2,
        accent: BLUSH,
        intro:
          "Write, debug and refactor code in any language with full repo-level context. Pair with Megsy Builder to ship full apps.",
        blocks: [
          { kind: "ul", items: [
            "Upload a folder or connect a GitHub repo — Megsy indexes it.",
            "Inline diff suggestions you can apply or reject.",
            "Run code in a sandbox (Python, Node, Bash) and get the output back.",
            "Generate unit tests, fixtures and CI configs.",
            "Push commits directly to GitHub from chat.",
          ]},
        ],
      },
      {
        id: "agents-music",
        title: "Music & audio",
        icon: Music,
        accent: ACTION,
        intro: "Generate songs, jingles, voiceovers and background scores from a prompt.",
        blocks: [
          { kind: "ul", items: [
            "Mood, tempo, genre, instruments and length controls.",
            "Lyrics generation in any language — or paste your own.",
            "Vocal style controls (male/female, soft, raspy, operatic).",
            "Export WAV / MP3 — stems available on Business+.",
            "Voice cloning (5 MC) for narration.",
          ]},
        ],
      },
      {
        id: "agents-skills",
        title: "Skills — your custom prompts as launchable commands",
        icon: Wand2,
        accent: MINT,
        intro:
          "Package your favourite prompts as reusable Skills with a name, icon, slash trigger and variables. Share with your workspace or keep them private.",
        blocks: [
          { kind: "ul", items: [
            "Build a Skill from any great prompt — Settings → Skills → New.",
            "Add variables — Megsy asks you to fill them in before running.",
            "Trigger from the composer with `/skillname` or from the Skills launcher.",
            "Share with your workspace — everyone gets the Skill automatically.",
            "Versioning — every edit is kept; roll back any time.",
          ]},
          { kind: "link", href: "/settings/skills", label: "Manage skills →" },
        ],
      },
    ],
  },

  /* ─────────────────────────── Workspaces & sharing ─────────────────────────── */
  {
    id: "workspace",
    label: "Workspaces, sharing & integrations",
    sections: [
      {
        id: "workspaces",
        title: "Workspaces & teams",
        icon: Users,
        accent: ACTION,
        intro:
          "A workspace is a shared space with pooled MC, shared chats, shared assets, shared skills and a shared brand memory. Business plan and above.",
        blocks: [
          { kind: "h", text: "Roles" },
          { kind: "kv", rows: [
            { k: "Owner", v: "Billing, deleting the workspace, all settings." },
            { k: "Admin", v: "Manage members, settings, integrations, skills." },
            { k: "Member", v: "Use everything, create chats, run agents." },
            { k: "Viewer", v: "Read-only access to shared chats and assets." },
          ]},
          { kind: "h", text: "Day-to-day" },
          { kind: "ul", items: [
            "Invite by email or shareable link from /workspaces/:id → Members.",
            "Switch active workspace from the account switcher in the sidebar (bottom-left).",
            "Pooled MC — everyone draws from one balance; the dashboard shows who used what.",
            "Workspace-wide memory keeps your team brand voice consistent (e.g. tone, banned words).",
            "Shared Skills — push prompts to every teammate at once.",
            "Tasks board per workspace — /workspaces/:id/tasks. Kanban with assignees, due dates and AI summaries.",
            "Audit log — every member action, exportable on Enterprise.",
          ]},
          { kind: "link", href: "/workspaces", label: "Open workspaces →" },
        ],
      },
      {
        id: "sharing",
        title: "Sharing & collaboration",
        icon: Share2,
        accent: BLUSH,
        blocks: [
          { kind: "ul", items: [
            "Share any chat as a read-only public link — /share/:id. Revocable any time.",
            "Invite a person to a chat — they can reply alongside you in real-time.",
            "Slides, Docs, research reports and websites all have their own share links with view-only or comment-only modes.",
            "Export anything to PDF, DOCX, PPTX, MP4, MP3, WAV, ZIP or JSON.",
            "Embed any answer or media via an `<iframe>` snippet (settings → Privacy must allow embeds).",
          ]},
        ],
      },
      {
        id: "integrations",
        title: "Integrations (1,000+ apps via standard connectors)",
        icon: Link2,
        accent: MINT,
        intro:
          "Connect Megsy to your stack from /settings/integrations — Gmail, Google Drive, Notion, Slack, GitHub, Linear, Jira, HubSpot, Salesforce, Stripe, Shopify, Telegram, Zapier, Pipedream and 1,000+ apps via standard connectors. API keys available on Business+.",
        blocks: [
          { kind: "h", text: "Most-used connections" },
          { kind: "kv", rows: [
            { k: "Email", v: "Gmail, Outlook — read, draft, send, schedule, summarise inboxes." },
            { k: "Chat", v: "Slack, Discord, Microsoft Teams, Telegram, Zoom — read channels, post, summarise meetings." },
            { k: "Knowledge", v: "Notion, Google Docs, Google Drive, Dropbox — read & write pages, files, folders." },
            { k: "Project", v: "Trello, Asana, ClickUp, Linear, Jira — create, update, close tickets." },
            { k: "Code", v: "GitHub, GitLab — open PRs, review code, comment." },
            { k: "Social", v: "LinkedIn, X / Twitter, Instagram, Facebook, YouTube — post, schedule, analyse." },
            { k: "Sales / commerce", v: "HubSpot, Salesforce, Stripe, Shopify — read CRM, run reports, manage products." },
            { k: "Data", v: "Airtable, Google Sheets — read, write, append rows." },
            { k: "Calendar", v: "Google Calendar — read, create, move events." },
          ]},
          { kind: "h", text: "How a connection works" },
          { kind: "ol", items: [
            "Open /settings/integrations and tap the app.",
            "You’re sent to that app’s OAuth screen. Approve the requested scopes.",
            "You return to Megsy and the connection appears as ‘Active’.",
            "Use it in chat — ‘Summarise unread Slack messages in #marketing’ — Megsy will call the connector with your permission.",
            "Revoke any time from the same page — the OAuth token is destroyed.",
          ]},
        ],
      },
      {
        id: "telegram",
        title: "Telegram bot (optional)",
        icon: Bot,
        accent: ACTION,
        intro:
          "Connect Megsy to Telegram from Settings → Integrations → Telegram. The bot is fully optional and runs forever once enabled — no maintenance required.",
        blocks: [
          { kind: "ul", items: [
            "Get the auto-published daily blog summaries pushed to your chat.",
            "Run quick tasks from anywhere: ‘/ask’, ‘/image’, ‘/research’, ‘/translate’.",
            "Receive job-done pings when a long Operator run or video finishes.",
            "Chat with Megsy in any language — the same auto-mirror dialect rules apply.",
            "Disconnect any time from the same settings page.",
          ]},
        ],
      },
      {
        id: "api",
        title: "REST API & webhooks",
        icon: Code2,
        accent: BLUSH,
        intro:
          "Business and Enterprise plans expose REST endpoints for chat, image, video, research and Operator. Generate keys in /settings (Developers section). Rate limits scale with your MC pool.",
        blocks: [
          { kind: "code", text: `curl https://api.megsyai.com/v1/chat/completions \\
  -H "Authorization: Bearer $MEGSY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"megsy-ai","messages":[{"role":"user","content":"Hi!"}]}'` },
          { kind: "ul", items: [
            "OpenAI-compatible schema — drop-in replacement for many SDKs.",
            "Streaming responses (SSE).",
            "Webhooks for long jobs — image, video, Operator, Deep Research.",
            "Per-key MC budgets and IP allow-lists on Enterprise.",
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Personalization ─────────────────────────── */
  {
    id: "personalize",
    label: "Personalization",
    sections: [
      {
        id: "memory",
        title: "Long-term memory",
        icon: Brain,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "Megsy remembers important facts about you across chats — your name, role, projects, preferences, writing style, banned topics. New memories are formed automatically when something is clearly worth remembering, and you can also add facts manually." },
          { kind: "ul", items: [
            "Review every saved memory at /settings/memory.",
            "Edit or delete any individual fact — changes apply immediately to every future chat.",
            "Pause memory globally with one toggle (Privacy mode).",
            "Workspace memory is separate from personal memory and is shared across teammates.",
            "Memories are encrypted at rest and never used to train any third-party model.",
          ]},
        ],
      },
      {
        id: "personalization",
        title: "AI personalization — how Megsy talks to you",
        icon: SettingsIcon,
        accent: MINT,
        intro:
          "/settings/customization lets you shape every reply without re-typing instructions in each chat.",
        blocks: [
          { kind: "ul", items: [
            "Tone — friendly, professional, witty, concise, formal, casual.",
            "Language preference — even when auto-detect is on you can pin a default.",
            "Expertise level — beginner / intermediate / expert (changes vocabulary and depth).",
            "Format preference — bullets, paragraphs, tables, code blocks first.",
            "Length preference — short, medium, exhaustive.",
            "Persona — give Megsy a name, role and signature style if you want.",
            "Banned words & topics — hard guardrails Megsy will never violate in your chats.",
            "Always-on system prompt — appended to every chat invisibly.",
          ]},
        ],
      },
      {
        id: "theme",
        title: "Theme & customization (accent colors, bubbles, motion)",
        icon: Palette,
        accent: BLUSH,
        intro:
          "Megsy ships with a curated dark theme tuned for long sessions — the only mode we support. From /settings/customization you control the visual identity inside it.",
        blocks: [
          { kind: "ul", items: [
            "18 premium accent colors — recolors your message bubbles, the send button, focused inputs and chip highlights.",
            "Wallpaper presets for the chat canvas (subtle gradients, dots, grid, aurora, noise).",
            "Message bubble shapes — rounded, squared, bubble-tail, minimal.",
            "Avatar shape — circle, soft square, Megsy star.",
            "Interface density — compact, comfortable, spacious.",
            "Text size — small, medium, large, extra-large with live preview.",
            "Animation level — reduced motion, normal, playful (auto-respects OS ‘reduce motion’ setting).",
            "Glow / shadow style — soft, sharp, neon.",
            "Live preview — a mini fake chat updates as you change every option.",
            "Export / import theme — copy your full setup as a shareable link or JSON.",
            "Custom name, avatar and pronouns from /settings/profile.",
          ]},
        ],
      },
      {
        id: "language",
        title: "Language & localization",
        icon: Languages,
        accent: ACTION,
        intro:
          "Megsy auto-mirrors the language AND dialect of your last message. Egyptian Arabic stays Egyptian. MSA stays MSA. French stays French. It never switches on you and never mixes.",
        blocks: [
          { kind: "ul", items: [
            "Force the UI language from /settings/language if you prefer a fixed one.",
            "Supported: English, Arabic (incl. Egyptian, Gulf, Levantine, Maghrebi dialects), French, Spanish, German, Portuguese, Italian, Turkish, Russian, Polish, Dutch, Hindi, Urdu, Bengali, Chinese (Simplified & Traditional), Japanese, Korean, Indonesian, Vietnamese, Thai, Hebrew, Greek, Czech, Romanian, Hungarian, Ukrainian and more.",
            "Right-to-left layouts (Arabic, Hebrew, Urdu, Persian) are fully supported.",
            "All blog articles auto-translate into every supported language.",
            "Voice mode follows the same auto-mirror rule.",
          ]},
        ],
      },
      {
        id: "notifications",
        title: "Notifications",
        icon: Bell,
        accent: MINT,
        intro:
          "/settings/notifications controls every ping. Per-channel and per-event — nothing is forced on you.",
        blocks: [
          { kind: "ul", items: [
            "Channels — push (browser & PWA), email, in-app badge, Telegram (if connected).",
            "Events — long jobs finished, credits low, mentions in shared chats, weekly summary, security alerts, new product features, blog digests.",
            "Quiet hours — silence everything between fixed times in your timezone.",
            "Per-workspace overrides — separate settings for personal vs work.",
            "Test button — fire a sample notification on every channel.",
          ]},
        ],
      },
      {
        id: "privacy",
        title: "Privacy controls",
        icon: Lock,
        accent: BLUSH,
        intro:
          "/settings/privacy is the single place to control what Megsy stores, shows and shares.",
        blocks: [
          { kind: "ul", items: [
            "Pause memory — Megsy will not learn new facts about you.",
            "Pause history — chats won’t be saved (good for one-off sensitive work).",
            "Training opt-out — your data is never used to train any model regardless, but you can also opt out of anonymous product analytics.",
            "Download all my data — ZIP of every chat, file, setting (GDPR Art. 15).",
            "Delete account — permanent erasure (GDPR Art. 17). Completes within 30 days.",
            "Sub-processor list & DPA at /legal/subprocessors and /legal/dpa.",
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── PWA ─────────────────────────── */
  {
    id: "pwa",
    label: "Install as an app (PWA)",
    sections: [
      {
        id: "pwa-ios",
        title: "Install on iPhone & iPad",
        icon: Apple,
        accent: ACTION,
        intro: "Megsy installs as a full-screen iOS app via Safari’s Add to Home Screen.",
        blocks: [
          { kind: "ol", items: [
            "Open megsyai.com in Safari (iOS only allows PWA installs from Safari).",
            "Tap the Share button at the bottom (square with an arrow pointing up).",
            "Scroll the share sheet down and tap ‘Add to Home Screen’.",
            "Confirm the name ‘Megsy AI’ and tap Add.",
            "Open it — it runs full-screen with its own animated splash screen, exactly like a native app.",
          ]},
          { kind: "image", src: pwaIos, alt: "iPhone Safari share sheet with Add to Home Screen highlighted", caption: "iOS — Safari → Share → Add to Home Screen" },
          { kind: "note", text: "On iPadOS the Share button lives in the top toolbar — same flow. The first launch shows a Megsy splash with two bouncing dots." },
        ],
      },
      {
        id: "pwa-android",
        title: "Install on Android",
        icon: Smartphone,
        accent: MINT,
        intro: "On Android, Chrome (and most Chromium browsers) offer one-tap install.",
        blocks: [
          { kind: "ol", items: [
            "Open megsyai.com in Chrome.",
            "Tap the three-dot menu in the top-right.",
            "Tap ‘Install app’ (or ‘Add to Home screen’).",
            "Confirm. Megsy is added to your home screen and your app drawer.",
            "Optional: long-press the icon → Add to Home for one-tap launch.",
          ]},
          { kind: "image", src: pwaAndroid, alt: "Android Chrome menu showing Install app option", caption: "Android — Chrome → ⋮ → Install app" },
          { kind: "note", text: "Samsung Internet, Edge, Brave and Firefox all support install — wording is similar." },
        ],
      },
      {
        id: "pwa-desktop",
        title: "Install on Mac, Windows & Linux",
        icon: Monitor,
        accent: BLUSH,
        intro: "Megsy installs as a real desktop app on macOS, Windows and Linux via Chrome, Edge, Brave or Safari.",
        blocks: [
          { kind: "ol", items: [
            "Open megsyai.com in Chrome, Edge or Brave.",
            "Look for the install icon on the right side of the address bar (small monitor with a down arrow).",
            "Click it and confirm ‘Install’.",
            "Megsy opens in its own window — pin it to your Dock (Mac), Taskbar (Windows) or app menu (Linux).",
            "It launches with its own icon and runs without browser chrome.",
          ]},
          { kind: "image", src: pwaDesktop, alt: "Desktop Chrome address bar with Install Megsy AI icon highlighted", caption: "Desktop — click the install icon in the address bar" },
          { kind: "note", text: "Safari on macOS Sonoma+: File → Add to Dock also installs Megsy as a standalone app." },
        ],
      },
      {
        id: "pwa-features",
        title: "What you get after installing",
        icon: CheckCircle2,
        accent: ACTION,
        blocks: [
          { kind: "ul", items: [
            "Full-screen experience, no browser tabs or address bar.",
            "Dedicated app icon and animated Megsy splash on launch.",
            "Faster start-up — assets are cached locally.",
            "Push notifications for finished jobs, mentions, new product updates.",
            "Works on poor connections — recent chats stay readable offline.",
            "Auto-updates silently in the background — no app store needed.",
          ]},
          { kind: "note", text: "Installed PWA stuck on an old build? Close & relaunch, or visit /?sw=off once to reset the service worker." },
        ],
      },
    ],
  },

  /* ─────────────────────────── Blog & content ─────────────────────────── */
  {
    id: "blog-system",
    label: "Blog, comparisons & content",
    sections: [
      {
        id: "blog",
        title: "Auto-publishing blog (3 articles/day, every language)",
        icon: BookOpen,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "/blog publishes 3 fresh articles every single day — fully autonomous, no human in the loop required. Topics rotate across product news, comparisons, deep dives, tutorials, AI literacy and Megsy-specific how-tos. Each article is translated into every supported language at publish time." },
          { kind: "ul", items: [
            "Daily rotation: one explainer, one comparison/vs piece, one how-to.",
            "All translations live at /blog with locale routing.",
            "Articles power the auto-updating sitemap (/sitemap-blog.xml).",
            "Optional digest can be pushed via Telegram or email (Notifications page).",
          ]},
        ],
      },
      {
        id: "comparisons",
        title: "Comparisons (Megsy vs …)",
        icon: LayoutGrid,
        accent: MINT,
        blocks: [
          { kind: "p", text: "Head-to-head comparisons at /vs/<competitor> — pricing, features, models, quotas, side-by-side outputs and an honest verdict. Updated automatically as competitor offerings change so the data never goes stale." },
        ],
      },
      {
        id: "service-landings",
        title: "Service & feature landing pages",
        icon: Sparkles,
        accent: BLUSH,
        blocks: [
          { kind: "p", text: "Dedicated SEO landings for every capability: AI image generator, AI video generator, AI website builder, AI slides, AI resume builder, AI faceswap, AI cover letter, AI translator, AI lip-sync, AI music and many more. Each has live demos, CTAs and links back to the right mode inside /chat." },
        ],
      },
    ],
  },

  /* ─────────────────────────── Enterprise & security ─────────────────────────── */
  {
    id: "enterprise",
    label: "Enterprise, security & trust",
    sections: [
      {
        id: "enterprise-overview",
        title: "Enterprise plan",
        icon: Building2,
        accent: ACTION,
        intro: "Custom plan for teams that need governance, scale and a contract.",
        blocks: [
          { kind: "ul", items: [
            "Custom MC pools and seat counts.",
            "SSO via SAML or OIDC (Okta, Azure AD, Google Workspace, Auth0).",
            "SCIM provisioning — automatic onboarding and off-boarding.",
            "DPA, MSA, custom contracts, invoicing in any currency.",
            "Region pinning — data processed only in your chosen region.",
            "Private model routing.",
            "Audit log export to your SIEM (S3 / Splunk / Datadog).",
            "Dedicated success manager & priority SLA.",
            "Penetration test reports and SOC 2 evidence on request.",
          ]},
          { kind: "link", href: "/enterprise", label: "Talk to sales →" },
        ],
      },
      {
        id: "security",
        title: "Security posture",
        icon: ShieldCheck,
        accent: MINT,
        blocks: [
          { kind: "ul", items: [
            "Data encrypted in transit (TLS 1.3) and at rest (AES-256).",
            "Row-level security enforced on every user-owned database row — your data is impossible to read across accounts.",
            "Hardened auth: 2FA (TOTP), session expiry, device alerts.",
            "Privacy-first: prompts and outputs never train third-party models.",
            "Sub-processor list at /legal/subprocessors.",
            "DPA at /legal/dpa.",
            "Vulnerability disclosure: /.well-known/security.txt.",
            "Status page: /settings/system-status.",
            "Trust center: /trust.",
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Legal & policies ─────────────────────────── */
  {
    id: "legal",
    label: "Legal & policies",
    sections: [
      {
        id: "legal-index",
        title: "Every legal page",
        icon: ScrollText,
        accent: ACTION,
        intro:
          "These are binding for every Megsy user. Read them once — we’ll alert you in-app any time a material change is made.",
        blocks: [
          { kind: "kv", rows: [
            { k: "/terms", v: "Terms of service — your rights and ours." },
            { k: "/privacy", v: "Privacy policy — what we collect, store and never share." },
            { k: "/cookies", v: "Cookie policy — analytics & preference cookies only, no ad cookies." },
            { k: "/refund", v: "Refund policy — windows and process." },
            { k: "/acceptable-use", v: "Acceptable use — what you may and may not do on Megsy." },
            { k: "/policies/content", v: "Content policy — what may and may not be generated." },
            { k: "/legal/ai-disclaimer", v: "AI disclaimer — limitations and user responsibility." },
            { k: "/legal/dmca", v: "DMCA & copyright takedown process." },
            { k: "/legal/dpa", v: "Data Processing Addendum (GDPR / UK GDPR)." },
            { k: "/legal/affiliate", v: "Affiliate program terms." },
            { k: "/legal/moderation", v: "Moderation framework and appeals." },
            { k: "/legal/age", v: "Age policy (13+ with guardian consent in the EU, 16+ elsewhere where required)." },
            { k: "/legal/subprocessors", v: "Sub-processor list — every vendor we share data with." },
            { k: "/legal/accessibility", v: "Accessibility statement — WCAG 2.2 AA target." },
            { k: "/legal/compliance", v: "Regional compliance — GDPR, CCPA, UK GDPR, KSA PDPL, UAE PDPL." },
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Advanced ─────────────────────────── */
  {
    id: "advanced",
    label: "Advanced & power-user",
    sections: [
      {
        id: "shortcuts",
        title: "Keyboard shortcuts",
        icon: Keyboard,
        accent: BLUSH,
        blocks: [
          { kind: "kv", rows: [
            { k: "Enter", v: "Send message" },
            { k: "Shift + Enter", v: "New line in the composer" },
            { k: "Cmd / Ctrl + K", v: "Open command bar / chat search" },
            { k: "Cmd / Ctrl + /", v: "Focus composer search filters" },
            { k: "Cmd / Ctrl + N", v: "New chat" },
            { k: "Cmd / Ctrl + B", v: "Toggle sidebar" },
            { k: "Cmd / Ctrl + Shift + L", v: "Open model picker" },
            { k: "Cmd / Ctrl + Shift + M", v: "Toggle voice mode" },
            { k: "Cmd / Ctrl + Shift + .", v: "Toggle web search for next message" },
            { k: "/", v: "Open Skills launcher in the composer" },
            { k: "@", v: "Mention an agent (e.g. @images, @videos)" },
            { k: "Esc", v: "Close any modal / popover" },
            { k: "↑ in empty composer", v: "Edit your last message" },
            { k: "Cmd / Ctrl + S", v: "Save current artifact (slide, doc, image) to library" },
          ]},
        ],
      },
      {
        id: "files-power",
        title: "Power tips for files & attachments",
        icon: Upload,
        accent: ACTION,
        blocks: [
          { kind: "ul", items: [
            "Paste a screenshot directly into the composer — fastest way to ask about something visual.",
            "Drop a folder (Chrome / Edge) — Megsy ingests every supported file inside.",
            "Add a URL — Megsy fetches the page (or PDF behind the link) and treats it as an attachment.",
            "ZIP an entire repo and drop it — Megsy will index code and answer cross-file questions.",
            "Combine: ‘read meeting.mp4, then summarise into one Slide deck’ runs end-to-end in a single message.",
          ]},
        ],
      },
      {
        id: "automations",
        title: "Automations & scheduled runs",
        icon: RefreshCw,
        accent: MINT,
        blocks: [
          { kind: "ul", items: [
            "Any prompt can be scheduled via Operator → New Agent.",
            "Triggers: time (cron-style), webhook, new email, new Slack message, calendar event, Stripe event.",
            "Actions: send email, post to Slack, write to Notion / Airtable / Sheets, push to GitHub, run another agent.",
            "Variables — pass data from one step to another.",
            "Versioned — every edit kept, replay any past run.",
            "Failure handling — retries, fallback steps, ping-on-error.",
          ]},
        ],
      },
      {
        id: "troubleshoot",
        title: "Troubleshooting playbook",
        icon: HelpCircle,
        accent: BLUSH,
        intro: "The fastest fix for each common problem.",
        blocks: [
          { kind: "ul", items: [
            "Page won’t load — hard refresh (Cmd/Ctrl + Shift + R) and try Incognito.",
            "Installed PWA stuck on an old version — close & relaunch, or visit /?sw=off once to reset the service worker.",
            "Credits look wrong — open /settings/billing → Usage; refresh after 30 seconds. Failed jobs are auto-refunded and appear as a green line.",
            "Generation failed — most failures auto-refund MC. Try a different model from the picker; check /settings/system-status for incidents.",
            "Can’t sign in / Google login fails — clear cookies for megsyai.com, try Incognito, or reset password at /auth.",
            "2FA lost — contact support; recovery requires identity verification.",
            "Didn’t receive credits / plan after payment — check /settings/billing → Invoices first; if missing after 10 minutes, contact support with the order email + time.",
            "Workspace invite not arriving — resend from /workspaces/:id; check spam; ensure the invitee email matches their Megsy account.",
            "Telegram bot silent — re-link from /settings/integrations → Telegram → Reconnect.",
            "Image / video quality poor — switch model in the picker; add a reference image; use a stronger, more specific prompt.",
            "Voice mode not hearing me — check mic permission in browser site settings; on iOS, voice requires Safari.",
            "Still stuck? Use the AI support chat (always live) or email support@megsyai.com.",
          ]},
          { kind: "link", href: "/support", label: "Open AI support (24/7) →" },
          { kind: "link", href: "/contact", label: "Contact a human →" },
        ],
      },
      {
        id: "status",
        title: "System status",
        icon: BadgeCheck,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "Live status of every Megsy service — chat, image, video, research, builder, voice, music, integrations, API — at /settings/system-status. Past incidents are kept for transparency, with root-cause notes." },
        ],
      },
      {
        id: "shortcuts-mobile",
        title: "Mobile gestures",
        icon: Smartphone,
        accent: MINT,
        blocks: [
          { kind: "kv", rows: [
            { k: "Swipe right from left edge", v: "Open sidebar" },
            { k: "Swipe left on a chat row", v: "Reveal pin / archive / delete" },
            { k: "Long-press a message", v: "Open the actions sheet (copy, branch, regenerate, share)" },
            { k: "Pull down on a chat", v: "Refresh / sync" },
            { k: "Double-tap a message", v: "Quick-react with a thumbs up" },
            { k: "Pinch on an image / slide", v: "Zoom in fullscreen" },
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Hidden gems / global behaviours ─────────────────────────── */
  {
    id: "globals",
    label: "Global behaviours & hidden gems",
    sections: [
      {
        id: "url-tricks",
        title: "URL tricks (query parameters that change behaviour)",
        icon: Link2,
        accent: ACTION,
        intro: "Powerful query strings you can append to any megsyai.com URL.",
        blocks: [
          { kind: "kv", rows: [
            { k: "?theme=dark", v: "Force the dark theme for this session (default)." },
            { k: "?theme=light", v: "Temporary light-theme override; persisted to localStorage so it sticks." },
            { k: "?theme=ocean", v: "Hidden ocean theme override." },
            { k: "?theme=sunset", v: "Hidden sunset theme override." },
            { k: "?sw=off", v: "Kill switch — unregisters the PWA service worker so a stuck install can fully refresh." },
            { k: "?dodo_return=1", v: "Used by the Dodo Payments return flow — auto-redirects to /billing/success." },
            { k: "?checkout_cancelled=1", v: "Used after a cancelled checkout — surfaces a friendly retry CTA." },
          ]},
        ],
      },
      {
        id: "promo-banner",
        title: "Unlimited promo banner",
        icon: Sparkles,
        accent: MINT,
        blocks: [
          { kind: "ul", items: [
            "Top-of-page countdown showing days / hours / minutes / seconds remaining on the current promotion.",
            "Tapping the banner sends you to /pricing.",
            "Dismissible per session — closes for the rest of the browser session via sessionStorage.",
            "Visibility is controlled globally by the PromoBannerContext — pages can hide it on demand.",
            "Only shown while a promotion is active; disappears automatically when the timer expires.",
          ]},
        ],
      },
      {
        id: "onboarding",
        title: "Onboarding checklist (new users)",
        icon: CheckCircle2,
        accent: BLUSH,
        intro:
          "A floating, collapsible checklist that appears for brand-new accounts and ticks itself off as you explore.",
        blocks: [
          { kind: "ol", items: [
            "Send your first chat.",
            "Generate your first image.",
            "Create your first document or slide.",
            "Invite a friend (uses your referral link automatically).",
            "Activate a paid plan — uses the WELCOME50 promo code link for an extra discount.",
          ]},
          { kind: "note", text: "Progress is saved to localStorage — closes once every step is done. You won’t see it again." },
        ],
      },
      {
        id: "system-extras",
        title: "Cookie consent · offline banner · ambient background · PWA splash",
        icon: Shield,
        accent: ACTION,
        blocks: [
          { kind: "ul", items: [
            "Cookie consent — GDPR banner appears on first visit. Choose ‘Accept all’ or ‘Essential only’ — your choice is remembered.",
            "Offline banner — Megsy detects loss of network connectivity and shows a banner; recent chats remain readable from cache.",
            "Ambient background — a subtle animated background renders behind every page; respects the OS ‘reduce motion’ setting automatically.",
            "PWA splash — when you launch the installed app, an animated Megsy splash with bouncing dots plays for the first frame.",
          ]},
        ],
      },
      {
        id: "auto-referral-claim",
        title: "Automatic referral attribution",
        icon: Gift,
        accent: MINT,
        blocks: [
          { kind: "p", text: "If you arrive via /r/:code or /ref/:code, your referral code is stored in localStorage. The moment you complete sign-up — even days later through the email-confirmation flow — Megsy automatically calls claim_referral_signup so your referrer gets credit. No manual ‘enter code’ step." },
        ],
      },
      {
        id: "account-switch-cache",
        title: "Multi-account cache isolation",
        icon: Users,
        accent: BLUSH,
        blocks: [
          { kind: "p", text: "Switching accounts (/settings/switch) automatically wipes every megsy_cache_* localStorage key and the React Query cache. You never see another account’s chats or balances bleed through — even on the same device, same browser." },
        ],
      },
    ],
  },

  /* ─────────────────────────── Page-by-page deep dive ─────────────────────────── */
  {
    id: "pages-deep",
    label: "Every page — deep dive",
    sections: [
      {
        id: "page-se",
        title: "/se — internal templates & resources library",
        icon: ListTree,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "A curated, categorised resource library used by the team and power users. Browse by category: templates · components · assets · design · skills · landings · backgrounds. Add, edit and delete skill entries directly from the page." },
        ],
      },
      {
        id: "page-egypt",
        title: "/egypt — regional showcase",
        icon: Globe2,
        accent: MINT,
        blocks: [
          { kind: "p", text: "A dedicated landing celebrating Egypt mega-projects (New Administrative Capital, Suez Canal expansion, national road network and more). Branded marketing/PR page with localised content." },
        ],
      },
      {
        id: "page-research-preview",
        title: "/research/preview — Deep Research reports",
        icon: Microscope,
        accent: BLUSH,
        intro: "Every Deep Research run produces a full standalone web article.",
        blocks: [
          { kind: "kv", rows: [
            { k: "/research/preview/new", v: "Start a brand-new report from a prompt." },
            { k: "/research/preview/:id", v: "View one of your own reports (signed-in only)." },
            { k: "/research/share/:token", v: "Public, read-only share link for a report." },
          ]},
          { kind: "h", text: "Reading experience" },
          { kind: "ul", items: [
            "Auto-generated Table of Contents pinned to the side.",
            "Scroll-progress bar across the top.",
            "Inline numbered citations with the source URL on hover.",
            "Full RTL support for Arabic, Hebrew and Farsi.",
            "Export to PDF or push directly to Google Drive.",
            "Share dialog generates a public-token URL you can revoke anytime.",
          ]},
        ],
      },
      {
        id: "page-oauth",
        title: "/oauth/authorize — Megsy as an OAuth provider",
        icon: Shield,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "Third-party apps can request access to your Megsy account. The /oauth/authorize page shows the requesting app’s name, logo and the exact scopes it wants. You choose Approve or Deny. Approved scopes are revocable at any time from /settings/security." },
        ],
      },
      {
        id: "page-tombstones",
        title: "Legacy routes & permanent redirects",
        icon: RefreshCw,
        accent: MINT,
        intro: "Older URLs still work — they 301-redirect to the current home so old bookmarks never break.",
        blocks: [
          { kind: "kv", rows: [
            { k: "/media · /gallery · /preview/:type · /template/:id", v: "→ /  (legacy media studio routes folded into chat)" },
            { k: "/images/studio · /videos · /videos/studio", v: "→ /  (image & video studios now live inside the composer)" },
            { k: "/cinema · /cinema/studio · /cinema/start-end-frame", v: "→ /  (Cinema mode is now an option inside @videos)" },
            { k: "/tools/*", v: "→ /images/tools/*  (legacy tool URLs)" },
            { k: "/billing", v: "→ /settings/billing" },
            { k: "/referrals · /billing/referrals", v: "→ /settings/referrals" },
            { k: "/workspaces · /workspaces/:id", v: "→ /settings/workspaces" },
            { k: "/legal/acceptable-use · /legal/moderation", v: "→ /policies/content (merged content policy)" },
            { k: "/legal/subprocessors · /legal/accessibility · /legal/compliance", v: "→ /trust (merged trust center)" },
          ]},
        ],
      },
      {
        id: "page-locale-landings",
        title: "Multilingual SEO landings (25 locales)",
        icon: Languages,
        accent: BLUSH,
        intro:
          "Every service landing is published in 25 languages with the proper hreflang signals — Google serves the right one to the right user.",
        blocks: [
          { kind: "p", text: "Prefix the slug with a locale code: /ar, /es, /fr, /de, /pt, /it, /tr, /ru, /zh, /ja, /ko, /hi, /id, /nl, /sv, /cs, /ro, /el, /uk, /he, /fa, /vi, /th, /pl. RTL languages render with full right-to-left layout. Default English is served at the unprefixed path." },
        ],
      },
      {
        id: "page-vs",
        title: "/vs/:slug — competitor comparisons",
        icon: LayoutGrid,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "Each /vs page is a structured, honest comparison: side-by-side feature matrix, pricing breakdown, ‘best for’ lists, an honest note, and a verdict. Updated as competitor offerings change. See the live index in the auto-generated Comparisons section above." },
        ],
      },
      {
        id: "page-share",
        title: "/share/:shareId — public read-only chats",
        icon: Share2,
        accent: MINT,
        blocks: [
          { kind: "p", text: "Any chat can be turned into a public share link from the chat ⋯ menu → ‘Share’. The /share URL renders the conversation without auth, read-only, with the Megsy chrome stripped. The owner can revoke the link any time — visitors then see a 404." },
        ],
      },
    ],
  },

  /* ─────────────────────────── Settings — per page ─────────────────────────── */
  {
    id: "settings-deep",
    label: "Settings — every sub-page in detail",
    sections: [
      {
        id: "set-profile",
        title: "/settings/profile",
        icon: SettingsIcon,
        accent: ACTION,
        blocks: [
          { kind: "ul", items: [
            "Display name — shown on shared chats and workspace activity.",
            "Avatar upload — auto-cropped to a circle; saved to your private bucket.",
            "Quick-links: change email · change password · enable 2FA · delete account.",
          ]},
        ],
      },
      {
        id: "set-customization",
        title: "/settings/customization",
        icon: Palette,
        accent: MINT,
        blocks: [
          { kind: "ul", items: [
            "18 preset accent swatches — drives both the UI accent and the chat-bubble colour at once.",
            "Live preview — a mock chat updates as you pick a colour.",
            "Dark theme is enforced on load (the URL ?theme= override still works for the curious).",
          ]},
        ],
      },
      {
        id: "set-ai-personalization",
        title: "/settings/ai-personalization",
        icon: Brain,
        accent: BLUSH,
        intro:
          "Everything here is injected into every chat’s system prompt — no need to retype it each time.",
        blocks: [
          { kind: "ul", items: [
            "Name to call you (e.g. ‘Hala’, ‘boss’, ‘team’).",
            "Profession — anchors examples and tone (e.g. ‘doctor’, ‘designer’, ‘founder’).",
            "About-me bio — a free-text paragraph Megsy uses as context.",
            "Response language style — Auto · Casual · Formal · English only.",
            "Tone sliders — Formality and Verbosity.",
            "Preferred model tier — Lite · Pro · Max (default for new chats).",
          ]},
        ],
      },
      {
        id: "set-memory",
        title: "/settings/memory",
        icon: Database,
        accent: ACTION,
        blocks: [
          { kind: "ul", items: [
            "Every memory has a title, a summary and a scope (personal or workspace).",
            "Create a memory manually with the ‘+ Add memory’ button.",
            "Edit or delete any memory — changes apply to every future chat immediately.",
            "Pause memory globally to stop forming new memories.",
          ]},
        ],
      },
      {
        id: "set-skills",
        title: "/settings/skills",
        icon: Wand2,
        accent: MINT,
        intro: "Custom Skills are persona-based system-prompt overlays you can launch with `/`.",
        blocks: [
          { kind: "h", text: "Per-skill options" },
          { kind: "ul", items: [
            "Name, description and an icon.",
            "System prompt body — the heart of the skill.",
            "Trigger phrases — type any of these to instantly invoke the skill.",
            "Enabled tools — pick which agents (images, videos, research, code…) this skill may use.",
            "Preferred model — pin a specific model for runs of this skill.",
            "Toggle enable/disable without deleting.",
            "Import a skill from a JSON / Markdown file.",
            "‘AI-seed’ — describe what you want in one sentence and Megsy drafts the whole skill for you.",
          ]},
          { kind: "p", text: "The streamlined creation flow lives at /agents/skills/new with suggestion chips to get you started in one click." },
        ],
      },
      {
        id: "set-operator",
        title: "/settings/operator — Megsy OS controls",
        icon: Workflow,
        accent: BLUSH,
        intro:
          "Megsy OS is the autonomous cloud-computer agent. Every safety lever lives on this page.",
        blocks: [
          { kind: "h", text: "Safety toggles" },
          { kind: "ul", items: [
            "Ask before sensitive actions (sending emails, making purchases, deleting data).",
            "Ask before anything (maximum paranoia — every step requires your tap).",
            "Allow free shell — let the agent run shell commands in its sandbox.",
            "Allow browser automation — let it open a virtual browser and fill forms.",
            "Allow dynamic agents — let it spawn sub-agents on the fly.",
          ]},
          { kind: "h", text: "Throttles" },
          { kind: "ul", items: [
            "Max parallel agents — slider 1 to 10.",
            "Budget cap — hard MC ceiling per run; Megsy stops automatically when reached.",
          ]},
          { kind: "kv", rows: [
            { k: "/settings/operator/agents", v: "Every dynamically created sub-agent — key, label, description, usage count. Delete one with a tap." },
            { k: "/settings/operator/audit", v: "Last 200 audit entries — agent, action, payload, error, run ID, timestamp. Replay any run." },
          ]},
        ],
      },
      {
        id: "set-language",
        title: "/settings/language",
        icon: Languages,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "Pick the UI language from 25 BCP-47 options. Independent from Megsy’s auto-mirror of your chat language (which always follows your latest message)." },
        ],
      },
      {
        id: "set-notifications",
        title: "/settings/notifications",
        icon: Bell,
        accent: MINT,
        intro: "Granular email category toggles.",
        blocks: [
          { kind: "kv", rows: [
            { k: "Account", v: "Welcome flow & onboarding nudges." },
            { k: "Transactions & receipts", v: "Every payment, invoice and refund." },
            { k: "Security alerts", v: "Sign-ins from new devices, password changes, 2FA events." },
            { k: "Product updates", v: "New models, new tools, new agents — opt out anytime." },
            { k: "Referral activity", v: "Signups attributed to you, commissions earned, payout status." },
          ]},
        ],
      },
      {
        id: "set-integrations",
        title: "/settings/integrations",
        icon: Link2,
        accent: BLUSH,
        intro:
          "30 native connectors plus 1,000+ apps via Pipedream Connect. All free — no per-action MC charge for the connection itself.",
        blocks: [
          { kind: "p", text: "See the full list in the Agents catalog above (@integrations). New connections use the standard OAuth flow — Megsy never sees your password." },
        ],
      },
      {
        id: "set-system-status",
        title: "/settings/system-status",
        icon: BadgeCheck,
        accent: ACTION,
        blocks: [
          { kind: "p", text: "Live, real-time indicator (Operational · Degraded · Outage) for every service: chat, image, video, research, builder, voice, music, integrations, API. Past incidents are kept with root-cause notes." },
        ],
      },
      {
        id: "set-withdraw",
        title: "/settings/withdraw — referral cash-out",
        icon: Wallet,
        accent: MINT,
        blocks: [
          { kind: "ul", items: [
            `Minimum payout: $${MIN_PAYOUT}.`,
            "Maximum: 2 withdrawals per month per account.",
            "Add a payment method (PayPal, bank transfer or USDT) — first withdrawal requires admin verification.",
            "Status timeline: requested → reviewed → paid; you’re emailed at every step.",
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Workspaces — every tab ─────────────────────────── */
  {
    id: "workspaces-tabs",
    label: "Workspaces — every tab",
    sections: [
      {
        id: "ws-tabs",
        title: "Every tab inside /settings/workspaces/:id",
        icon: Users,
        accent: ACTION,
        intro:
          "A workspace bundles shared chats, assets, skills and a pooled MC balance behind role-based access. Each tab below is a dedicated page.",
        blocks: [
          { kind: "kv", rows: [
            { k: "Overview (index)", v: "At-a-glance dashboard: members online, MC remaining, recent activity, quick actions." },
            { k: "General", v: "Workspace name, slug, description, time-zone, default language." },
            { k: "Members", v: "List of members with role (Owner · Admin · Member · Viewer); promote, demote or remove." },
            { k: "Invites", v: "Pending invitations + ‘Send invite’ by email or shareable link." },
            { k: "Brand", v: "Workspace logo, brand colour and reusable brand assets — propagates into Slides/Docs exports." },
            { k: "Security", v: "Workspace-level security policy: enforce 2FA, restrict sign-in to specific email domains, IP allow-lists (Enterprise)." },
            { k: "Billing", v: "Workspace plan and payment method; invoices for the whole team." },
            { k: "Usage", v: "MC consumption per member, per tool, per day; export to CSV." },
            { k: "Notifications", v: "Workspace-level notification routing (digest emails, Slack/Telegram pings)." },
            { k: "Activity", v: "Full audit feed of every workspace event (joins, removes, billing changes, agent runs)." },
            { k: "Data", v: "Export everything as a ZIP (chats, files, settings) — GDPR-friendly." },
            { k: "Danger", v: "Rename, transfer ownership, archive, or permanently delete the workspace." },
            { k: "/workspaces/:id/tasks", v: "Standalone Kanban task board with assignees, due dates and AI summaries." },
          ]},
        ],
      },
    ],
  },

  /* ─────────────────────────── Edge functions — what each does for users ─────────────────────────── */
  {
    id: "edge-functions",
    label: "Behind the scenes — every service",
    sections: [
      {
        id: "edge-fns",
        title: "What each backend service does for you",
        icon: Cpu,
        accent: ACTION,
        intro:
          "You never call these directly, but knowing what they do helps you understand exactly what Megsy is doing on your behalf.",
        blocks: [
          { kind: "kv", rows: [
            { k: "blog-daily-publish", v: "Cron at 06:00 UTC — picks up to 3 topics, generates and translates each, pings Google/Bing IndexNow. Fully autonomous." },
            { k: "blog-generate", v: "Writes one ~2,000–2,800-word English article tuned for E-E-A-T with FAQ schema." },
            { k: "blog-translate", v: "Translates each new article into 24 languages and groups them as a translation set with hreflang." },
            { k: "chat-alibaba", v: "Primary chat router. Injects your AI Personalization preamble. Handles Deep Research planning." },
            { k: "chat-slides-stream", v: "Streams slide generation as SSE phases (search → outline → content → images → finalize)." },
            { k: "deep-research-job", v: "Multi-agent pipeline: plan → your approval → search + extract + synthesize. Update or cancel anytime." },
            { k: "docs-generate", v: "Streams long-form HTML for documents, reports and contracts. Asks clarifying questions when prompts are vague." },
            { k: "generate-builder-schema", v: "Returns structured JSON for file builders (docs, resume, report, timeline…)." },
            { k: "github-push", v: "Pushes generated code/assets straight to a GitHub repository you own." },
            { k: "media-image", v: "Image generation adapter — supports prompt enhancement and multi-model fan-out." },
            { k: "media-plan", v: "Analyzes a video/image prompt and returns a scene-by-scene plan for you to approve." },
            { k: "media-video / media-video-poll", v: "Submits a video job, then polls until ready." },
            { k: "openrouter-media", v: "Unified backend that routes to Alibaba DashScope, BytePlus Ark and Apify actors. API keys rotated automatically." },
            { k: "operator-orchestrator", v: "Megsy OS engine — maps operator_runs to Manus API tasks, persists every step and message." },
            { k: "pipedream-connect", v: "Mints short-lived Pipedream Connect tokens so you can wire up 1,000+ apps without sharing passwords." },
            { k: "report-error", v: "Multi-route — error reporting, user notifications, workspace notifications, GitHub import, secret checks." },
            { k: "sitemap-blog", v: "Dynamic multilingual blog sitemap with full hreflang alternates." },
            { k: "slides-api", v: "Public API for slides: list_templates, get_template, create_deck, export_pptx. API-key authenticated (Business+)." },
            { k: "slides-export-pptx", v: "Turns a deck into a real downloadable .pptx via python-pptx in a sandbox — RTL and themed colours preserved." },
            { k: "telegram-tasks-bot", v: "Webhook for the Telegram bot — manage workspace tasks from Telegram; also media storage proxy." },
            { k: "upload-asset", v: "Uploads files to Cloudflare R2 (max 10 MB). Images are converted to WebP client-side before upload." },
            { k: "video-agent", v: "Plans a long video as multiple shots, dispatches each, polls, then merges with ffmpeg.wasm into a single MP4 — that’s how Cinema mode works." },
          ]},
        ],
      },
    ],
  },

  /* ─────────────── Realtime, mobile & resilience ─────────────── */
  {
    id: "realtime-mobile",
    label: "Realtime, mobile & resilience",
    sections: [
      {
        id: "realtime-chat",
        title: "Realtime collaboration",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "Every conversation in Megsy is a live, multiplayer room. When you invite a teammate or join a shared workspace, presence, typing indicators, reactions and read-receipts stream through Supabase Realtime channels in milliseconds.",
        blocks: [
          { kind: "h", text: "What syncs live" },
          { kind: "ul", items: [
            "Messages — new turns, edits and deletions appear instantly without refresh.",
            "Typing indicators — see exactly who in the room is composing right now.",
            "Member presence — coloured dots show who is online; each member gets a stable colour.",
            "Reactions — emoji reactions propagate to every viewer the moment they're added.",
            "Read receipts — know which teammates have seen each message.",
            "Tool activity — long-running tools (research, video, slides) broadcast their step changes.",
          ]},
          { kind: "h", text: "How it works under the hood" },
          { kind: "ul", items: [
            "Each conversation subscribes to a dedicated Supabase Realtime channel keyed by conversation id.",
            "Subscriptions live inside React `useEffect` hooks and are torn down on unmount — no leaked channels.",
            "Row-Level Security still applies: you only receive rows you're allowed to read.",
            "Reconnection is automatic — if your network drops, the channel resumes where it left off.",
          ]},
          { kind: "note", text: "Realtime requires being logged in. Anonymous shared chats render statically from a snapshot URL." },
        ],
      },
      {
        id: "mobile-experience",
        title: "The mobile experience",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Megsy on a phone is not a shrunken desktop — it's its own carefully built surface with native-feeling gestures, safe-area handling and haptics. Install the PWA and you get a real app icon, splash screen and offline shell.",
        blocks: [
          { kind: "h", text: "Mobile-first details" },
          { kind: "ul", items: [
            "Bottom composer dock with sticky safe-area padding for iPhone home-bar and Android gesture nav.",
            "Pull-to-refresh anywhere a list is rendered (conversations, notifications, integrations).",
            "Swipe gestures: swipe a conversation row to archive; long-press a message for reactions.",
            "Haptic feedback on every primary action (send, react, save, delete) via the Web Vibration API.",
            "Glass sheets and bottom drawers replace desktop dropdowns for one-thumb reach.",
            "Mobile mode-bar at the top switches between Chat, Image, Video, Slides, Docs, Research, Operator.",
            "Auto-scroll-to-bottom that respects the user — stops following if you scroll up to read history.",
          ]},
          { kind: "h", text: "Installing as a real app (PWA)" },
          { kind: "p", text: "See the dedicated 'Install as an app' group for iPhone, Android, macOS, Windows and Linux walk-throughs. Once installed, Megsy launches full-screen with its own splash and shows up in the system app switcher." },
        ],
      },
      {
        id: "offline-and-errors",
        title: "Offline mode & error handling",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy keeps working when your connection is shaky. We cache the shell, queue safe actions, surface friendly errors and never leak technical details to end users.",
        blocks: [
          { kind: "h", text: "Offline behaviour" },
          { kind: "ul", items: [
            "Offline banner: a slim notice appears the moment the browser reports the network is down, and disappears when it returns.",
            "Service worker caches the app shell — opening Megsy with no connection still loads instantly.",
            "Already-loaded conversations, settings pages and docs remain readable offline.",
            "Sending messages, generating media or saving settings requires connectivity — these actions show an inline 'You're offline' state instead of failing silently.",
          ]},
          { kind: "h", text: "Error boundaries" },
          { kind: "ul", items: [
            "A global ErrorBoundary catches React crashes and shows a friendly recovery screen with a single 'Reload' button — your session and draft are preserved.",
            "Each lazy-loaded route has its own fallback, so a broken route never takes down the rest of the app.",
            "All thrown errors are sanitised via `sanitizeError` before display — no stack traces, no internal paths, no secrets.",
            "Retries with exponential backoff are built into network calls (`guards/retry.ts`); transient failures self-heal.",
          ]},
          { kind: "note", text: "Crashes are reported privately to the `report-error` edge function so we can fix them, but no personal data, prompts or outputs are ever included in the report." },
        ],
      },
      {
        id: "performance",
        title: "Performance & loading philosophy",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "Megsy is built to feel instant on a 5-year-old phone over a 3G connection. Every route is code-split, every image is lazy-loaded and converted to WebP, and the shell loads from cache on second visit.",
        blocks: [
          { kind: "h", text: "Techniques we use everywhere" },
          { kind: "ul", items: [
            "Route-level code splitting — only the page you're on gets shipped to your device.",
            "`lazyWithRetry` — lazy imports auto-retry on transient chunk-load failures (common after a deploy).",
            "Images converted to WebP client-side before upload to cut bandwidth ~40% vs PNG/JPEG.",
            "Smart image component lazily loads off-screen images and serves a tiny blurred placeholder.",
            "Videos use `<video preload=\"metadata\">` and only buffer when in viewport.",
            "Local cache (`useLocalCache`) memoises expensive computations across sessions.",
            "Edge-function responses are streamed token-by-token where possible — you read while the model writes.",
          ]},
          { kind: "h", text: "What you can do" },
          { kind: "p", text: "Nothing — performance is automatic. But if a page ever feels slow, the System Status page shows current latency for every region and provider in real time." },
          { kind: "link", href: "/settings/system-status", label: "Open System Status →" },
        ],
      },
      {
        id: "i18n-deep",
        title: "Languages, RTL & dialects",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Megsy speaks every major language and respects your dialect. The interface mirrors right-to-left for Arabic, Hebrew and Persian automatically; the AI mirrors your exact dialect so Egyptian Arabic stays Egyptian and never gets 'translated' to MSA.",
        blocks: [
          { kind: "h", text: "Languages the marketing site is fully translated into" },
          { kind: "p", text: "Arabic · English · Spanish · French · German · Italian · Portuguese · Dutch · Polish · Czech · Greek · Romanian · Swedish · Russian · Ukrainian · Turkish · Hebrew · Persian · Hindi · Chinese · Japanese · Korean · Thai · Vietnamese · Indonesian — 25+ locales, with full RTL support where the script requires it." },
          { kind: "h", text: "Dialect mirroring in chat" },
          { kind: "ul", items: [
            "We detect language and dialect on every turn (`detectLang`, `detectLanguage`).",
            "Egyptian Arabic, Levantine Arabic, Gulf Arabic, Maghrebi Arabic, MSA — Megsy replies in the same.",
            "Same for European vs Brazilian Portuguese, European vs Latin Spanish, Simplified vs Traditional Chinese, etc.",
            "If you switch language mid-conversation, Megsy switches with you and never reverts.",
          ]},
          { kind: "h", text: "RTL details" },
          { kind: "ul", items: [
            "Layout, icons, gradients and scroll directions all flip automatically when the document direction is `rtl`.",
            "Code blocks and math always render LTR even inside an RTL page — code is universal.",
            "Mixed-direction text (e.g. an English brand name inside Arabic prose) uses Unicode bidi marks for correct rendering.",
          ]},
          { kind: "link", href: "/settings/language", label: "Change your language →" },
        ],
      },
      {
        id: "accessibility-deep",
        title: "Accessibility commitments",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy aims for WCAG 2.2 AA across every page. Keyboard-only navigation, screen-reader labels, visible focus rings, sufficient contrast in both themes and respect for the user's reduce-motion preference are non-negotiable.",
        blocks: [
          { kind: "h", text: "What we guarantee" },
          { kind: "ul", items: [
            "Every interactive element is reachable by keyboard, with a clearly visible focus ring.",
            "Every icon-only button has an `aria-label` or `title` describing its action.",
            "Dialogs, sheets and dropdowns are real ARIA dialogs — focus is trapped while open and restored on close.",
            "Live regions announce streaming AI replies and tool-status changes to screen readers.",
            "All animations honour `prefers-reduced-motion: reduce` — they instantly become non-animated.",
            "Color contrast meets AA in both light and dark themes; never relies on colour alone to convey meaning.",
            "Forms have associated `<label>`s, inline error text and `aria-describedby` for help text.",
          ]},
          { kind: "link", href: "/accessibility", label: "Read our full accessibility statement →" },
        ],
      },
    ],
  },

  /* ─────────────── Power workflows & creative recipes ─────────────── */
  {
    id: "power-recipes",
    label: "Power workflows & creative recipes",
    sections: [
      {
        id: "keyboard-shortcuts",
        title: "Every keyboard shortcut",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy is built so a power user never needs the mouse. Every shortcut works on macOS (⌘) and Windows/Linux (Ctrl).",
        blocks: [
          { kind: "h", text: "Global" },
          { kind: "kv", rows: [
            { k: "⌘ / Ctrl + K", v: "Open the command palette — jump to any conversation, page, model or setting." },
            { k: "⌘ / Ctrl + /", v: "Toggle the sidebar." },
            { k: "⌘ / Ctrl + Shift + L", v: "Switch light / dark theme." },
            { k: "⌘ / Ctrl + ,", v: "Open Settings." },
            { k: "G then H", v: "Go home (landing / chat depending on auth)." },
            { k: "?", v: "Show this shortcut cheat-sheet from any page." },
          ]},
          { kind: "h", text: "Inside a conversation" },
          { kind: "kv", rows: [
            { k: "Enter", v: "Send the message." },
            { k: "Shift + Enter", v: "New line inside the composer." },
            { k: "↑ (in empty composer)", v: "Edit your last message." },
            { k: "⌘ / Ctrl + Enter", v: "Send and force-cancel the previous streaming reply." },
            { k: "Esc", v: "Cancel the current streaming reply." },
            { k: "⌘ / Ctrl + U", v: "Upload a file." },
            { k: "⌘ / Ctrl + Shift + M", v: "Open the model picker." },
            { k: "@", v: "Mention an integration, skill or workspace member." },
            { k: "/", v: "Insert a slash command (mode switch, template, skill)." },
            { k: "⌘ / Ctrl + B / I / E", v: "Bold / italic / inline-code on selected text." },
          ]},
        ],
      },
      {
        id: "command-palette",
        title: "The command palette (⌘K)",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "The command palette is the fastest way to navigate Megsy. It searches across every conversation, every page, every model, every setting, every integration and every doc section in real time.",
        blocks: [
          { kind: "h", text: "What you can do from ⌘K" },
          { kind: "ul", items: [
            "Jump to any conversation by title, content snippet or member name.",
            "Open any page in the app (Settings, Billing, Integrations, Docs, etc.).",
            "Switch the active model without leaving the keyboard.",
            "Run a skill or trigger a saved automation.",
            "Search this entire documentation — results are highlighted with the matching snippet.",
            "Toggle theme, language or any boolean setting.",
          ]},
          { kind: "note", text: "The palette respects recency — your most-used commands float to the top automatically." },
        ],
      },
      {
        id: "share-and-export",
        title: "Sharing & exporting your work",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Anything you create in Megsy can be shared with a link or exported to a real file. We never lock you into proprietary formats — your data is yours.",
        blocks: [
          { kind: "h", text: "Shareable links" },
          { kind: "ul", items: [
            "Chats → public read-only URL with optional password and expiry.",
            "Documents → live preview link that updates as you edit.",
            "Slide decks → presentation URL with speaker-notes view (?notes=1).",
            "Research reports → article-style page with table of contents and citations.",
            "Operator runs → audit-trail page showing every step the agent took.",
            "Workspaces → invite links scoped to a single role (viewer / editor / admin).",
          ]},
          { kind: "h", text: "Export formats" },
          { kind: "kv", rows: [
            { k: "Slides", v: "PPTX (real PowerPoint, themes preserved), PDF, and PNG per slide." },
            { k: "Documents", v: "PDF, DOCX, Markdown and HTML." },
            { k: "Spreadsheets", v: "XLSX (formulas preserved) and CSV." },
            { k: "Chats", v: "Markdown transcript or JSON (for programmatic processing)." },
            { k: "Images", v: "Original WebP/PNG/JPEG + downloadable in any of the three." },
            { k: "Videos", v: "MP4 (H.264) and WebM (VP9)." },
            { k: "Research", v: "PDF (article layout) or Markdown with inline citation links." },
          ]},
        ],
      },
      {
        id: "notifications-deep",
        title: "Notifications — where, when, how",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy can reach you in three places: in-app, by email, and by push (if you installed the PWA and granted permission). Every category is independently toggleable in Settings → Notifications.",
        blocks: [
          { kind: "h", text: "Categories" },
          { kind: "ul", items: [
            "Long jobs (research, video, slides) finishing — high signal, on by default.",
            "Workspace invites and role changes — on by default.",
            "Mentions in shared conversations — on by default.",
            "Credit balance warnings (50%, 10%, exhausted) — on by default.",
            "Operator run results (Megsy OS) — on by default.",
            "Referral rewards and withdrawals — on by default.",
            "Product updates and tips — off by default; opt in if you want them.",
          ]},
          { kind: "h", text: "Quiet hours" },
          { kind: "p", text: "Set a do-not-disturb window per timezone. Email and push are queued until your quiet hours end; in-app notifications still show but never make a sound." },
          { kind: "link", href: "/settings/notifications", label: "Open notification settings →" },
        ],
      },
      {
        id: "credits-math",
        title: "How Megsy Credits (MC) actually work",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "Every Megsy plan grants a monthly bucket of Megsy Credits (MC). Different actions cost different amounts — there are no hidden surcharges, and your remaining balance is shown on every relevant button before you commit.",
        blocks: [
          { kind: "h", text: "Cost guide (approximate)" },
          { kind: "kv", rows: [
            { k: "Chat turn (Megsy Lite)", v: "Free on every paid plan — unlimited." },
            { k: "Chat turn (Megsy AI / Max)", v: "1–5 MC depending on output length and tool usage." },
            { k: "Frontier model turn (GPT-5, Claude Opus, Gemini Ultra…)", v: "10–30 MC per turn." },
            { k: "Image (standard)", v: "5–15 MC per image." },
            { k: "Image (premium: Flux Pro, Recraft v3, Ideogram v3…)", v: "20–50 MC per image." },
            { k: "Video (5s, standard)", v: "30–80 MC." },
            { k: "Video (10s, premium: Kling 2.0, Veo 3, Sora…)", v: "150–400 MC." },
            { k: "Deep research run", v: "50–200 MC depending on depth." },
            { k: "Slide deck (10 slides)", v: "30–80 MC including images." },
            { k: "Long document (5k words)", v: "20–60 MC." },
            { k: "Operator autonomous run", v: "Variable — billed per browser-minute and tool call, capped per run." },
          ]},
          { kind: "note", text: "Exact costs are always shown live next to every generate button — what you see is what you pay. Free tier and yearly plans get bonus MC." },
          { kind: "link", href: "/pricing", label: "Compare plans and credit allowances →" },
        ],
      },
      {
        id: "creative-recipes",
        title: "Creative recipes — what Megsy users actually do",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Quick, opinionated workflows that show what's possible when you combine modes. Each recipe takes under 5 minutes.",
        blocks: [
          { kind: "h", text: "Recipe 1 — Brand kit in one chat" },
          { kind: "ol", items: [
            "Describe your brand in plain language (audience, vibe, three competitor names).",
            "Ask Megsy to generate a logo (uses Recraft/Ideogram for vector quality).",
            "In the same chat: 'Now make a colour palette and a Google Fonts pairing that match.'",
            "Then: 'Render a hero image and three social posts using the palette.'",
            "Export — every asset downloads with your brand name as filename prefix.",
          ]},
          { kind: "h", text: "Recipe 2 — Research → slides → PDF" },
          { kind: "ol", items: [
            "Switch to Research mode, type your topic, choose depth 'Standard'.",
            "When the report finishes, click 'Turn into slides' — Megsy converts the outline.",
            "Pick a template, hit Generate, then Export → PPTX or PDF.",
            "Total time: ~7 minutes for a 12-slide investor-grade brief." ,
          ]},
          { kind: "h", text: "Recipe 3 — Long video from a single prompt" },
          { kind: "ol", items: [
            "Switch to Video → Cinema mode.",
            "Describe the full 30-second story in one paragraph; Megsy auto-splits into shots.",
            "Pick your video model and aspect ratio; Megsy plans, dispatches, polls and merges into a single MP4 via ffmpeg.wasm.",
            "Add a music track from the Music agent or upload your own; download the final cut." ,
          ]},
          { kind: "h", text: "Recipe 4 — Always-on Operator" },
          { kind: "ol", items: [
            "Open Megsy OS, click 'New run', describe the goal: 'Every morning at 8am, summarise my Notion inbox and email me the top 5 action items.'",
            "Connect Notion and Gmail when prompted; pick the schedule.",
            "Done — the agent runs autonomously, with a full audit log in Settings → Operator audit.",
          ]},
        ],
      },
      {
        id: "tips-and-tricks",
        title: "Tips, easter eggs & power moves",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Small touches Megsy users discover over time. Not strictly necessary — but they make the experience faster, friendlier and a little more fun.",
        blocks: [
          { kind: "ul", items: [
            "Type `/clear` in any conversation to start fresh without losing the title.",
            "Drag an image directly from another browser tab into the composer — no save-to-disk needed.",
            "Paste a URL → Megsy auto-fetches the page and shows a preview card you can attach.",
            "Paste a YouTube URL → Megsy extracts the transcript and lets you ask questions about it.",
            "Triple-click any AI reply to copy the entire message (works on desktop and mobile long-press).",
            "Add `?reduce_motion=1` to any URL to disable animations even if your OS setting says otherwise.",
            "Add `?theme=dark` (or `light`) to any URL to override your theme for this session only.",
            "Tap the Megsy logo 7 times in the sidebar — there's a tiny surprise.",
            "Hold ⌥ / Alt while clicking a model badge to pin it to your favourites bar.",
            "Right-click any conversation in the sidebar for advanced actions (export, fork, rename, archive, delete).",
          ]},
          { kind: "note", text: "We keep adding these — check back monthly or watch the blog for 'Megsy Tips' posts." },
        ],
      },
    ],
  },
];




/* ────────────── ⭐ AUTO-GENERATED GROUPS (live from data files) ────────────── */
// These groups are rebuilt from the live data on every page render. Any change
// to /data/pricingData, /data/blogPosts, /data/comparisons, /data/serviceLandings
// or /lib/agentRegistry shows up here immediately — zero manual edits.

function buildAutoGroups(): DocGroup[] {
  // — Plans (auto from PLANS) —
  const planRows = PLANS.map((p) => ({
    k: `${p.name} — $${p.monthlyPrice}/mo · $${p.yearlyPrice}/yr`,
    v: `${p.monthlyCredits} · ${p.yearlyCredits}. ${p.features.slice(0, 3).join(" · ")}…`,
  }));

  const creditsRows = (Object.entries(PLAN_MONTHLY_CREDITS) as [string, number][]).map(
    ([tier, mc]) => ({ k: tier.toUpperCase(), v: `${mc} MC included every month` }),
  );

  // — Agents (auto from AGENTS registry) —
  const agentSections: DocSection[] = AGENTS.map((a) => ({
    id: `agent-${a.id}`,
    title: `${a.label} — ${a.mention}`,
    icon: a.icon,
    accent: a.category === "images" ? BLUSH : a.category === "videos" ? ACTION : MINT,
    intro: a.description,
    blocks: a.models && a.models.length > 0
      ? [
          { kind: "h", text: "Available models & MC cost per generation" },
          {
            kind: "kv",
            rows: a.models.map((m) => ({
              k: m.label,
              v: m.cost === 0 ? "Free — counts against your plan’s usage cap." : `${m.cost} MC per run`,
            })),
          },
          { kind: "note", text: `Trigger inside any chat with ${a.mention} or pick it from the Mode Bar.` },
        ]
      : [
          { kind: "p", text: `Trigger from the composer Mode Bar or by typing ${a.mention} in chat. Category: ${a.category}.` },
        ],
  }));

  // — Blog posts (auto from BLOG_POSTS) —
  const blogRows = BLOG_POSTS.map((p) => ({
    k: `/blog/${p.slug}`,
    v: `${p.title} — ${p.category} · ${p.readTime}.`,
  }));

  // — Comparisons (auto from COMPARISONS) —
  const compareRows = COMPARISONS.map((c) => ({
    k: `/vs/${c.slug}`,
    v: `Megsy vs ${c.competitorName} — ${c.competitorTagline}.`,
  }));

  // — Service landings (auto from SERVICE_LANDINGS) —
  // Group by category for readability.
  const landingsByCategory = SERVICE_LANDINGS.reduce<Record<string, typeof SERVICE_LANDINGS>>(
    (acc, l) => {
      (acc[l.category] ||= []).push(l);
      return acc;
    },
    {},
  );
  const landingsBlocks: DocBlock[] = [];
  for (const [cat, items] of Object.entries(landingsByCategory)) {
    landingsBlocks.push({ kind: "h", text: `${cat} (${items.length})` });
    landingsBlocks.push({
      kind: "kv",
      rows: items.slice(0, 40).map((l) => ({
        k: `/${l.slug}${l.locale && l.locale !== "en" ? ` · ${l.locale.toUpperCase()}` : ""}`,
        v: l.title,
      })),
    });
  }

  // — Pages (auto-detected & described via docsRegistry) —
  // Adding a new page anywhere under src/pages automatically appears here.
  // Add `/** @doc Short description */` at the top of the file for a rich
  // human-readable summary.
  const pagesByFolder = groupPagesByFolder();
  const pagesBlocks: DocBlock[] = [];
  for (const [folder, items] of Object.entries(pagesByFolder).sort()) {
    pagesBlocks.push({ kind: "h", text: `${folder} (${items.length} pages)` });
    pagesBlocks.push({
      kind: "kv",
      rows: items.map((p) => ({ k: p.id, v: p.description })),
    });
  }

  // — Edge functions (auto-detected & described via docsRegistry) —
  const edgeFnBlocks: DocBlock[] = [
    {
      kind: "kv",
      rows: DOC_EDGE_FUNCTIONS.map((fn) => ({ k: fn.id, v: fn.description })),
    },
  ];

  // — Integrations / connectors (auto from integrationsData) —
  const integrationsByCategory = INTEGRATIONS_LIST.reduce<Record<string, typeof INTEGRATIONS_LIST>>(
    (acc, i) => {
      (acc[i.category] ||= []).push(i);
      return acc;
    },
    {},
  );
  const integrationsBlocks: DocBlock[] = [];
  for (const [cat, items] of Object.entries(integrationsByCategory).sort()) {
    integrationsBlocks.push({ kind: "h", text: `${cat} (${items.length})` });
    integrationsBlocks.push({
      kind: "kv",
      rows: items.map((i) => ({ k: i.name, v: `${i.description} — type: ${i.type}` })),
    });
  }


  return [
    {
      id: "live-pricing",
      label: "Live pricing & FAQ (auto-sync)",
      sections: [
        {
          id: "live-plans",
          title: "Live plans — pulled directly from /pricing",
          icon: Crown,
          accent: ACTION,
          intro: `Updated automatically from src/data/pricingData.ts. ${PLANS.length} paid plans available right now.`,
          blocks: [
            { kind: "kv", rows: planRows },
            { kind: "h", text: "Monthly MC grant per tier" },
            { kind: "kv", rows: creditsRows },
            { kind: "link", href: "/pricing", label: "Open live pricing page →" },
          ],
        },
        {
          id: "live-services",
          title: "What each capability includes",
          icon: Layers,
          accent: MINT,
          intro: "Source of truth: SERVICES_GUIDE. Stays in sync forever.",
          blocks: [
            {
              kind: "kv",
              rows: SERVICES_GUIDE.map((s) => ({ k: s.name, v: s.desc })),
            },
          ],
        },
        {
          id: "live-enterprise",
          title: "Enterprise features",
          icon: Building2,
          accent: BLUSH,
          intro: "Auto-synced list of everything Enterprise customers get on top of Business.",
          blocks: [
            { kind: "ul", items: ENTERPRISE_FEATURES },
            { kind: "link", href: "/enterprise", label: "Talk to sales →" },
          ],
        },
        {
          id: "live-faq",
          title: "Frequently asked questions (verbatim from /pricing)",
          icon: HelpCircle,
          accent: ACTION,
          intro: `${FAQS.length} official Q&As — the only authoritative source.`,
          blocks: FAQS.flatMap<DocBlock>((f) => [
            { kind: "h", text: f.q },
            { kind: "p", text: f.a },
          ]),
        },
        {
          id: "live-referrals",
          title: "Referral program — exact verified numbers",
          icon: Gift,
          accent: MINT,
          intro:
            "These numbers come directly from the running app code — never out of date.",
          blocks: [
            {
              kind: "kv",
              rows: [
                { k: "Per signup (both sides)", v: `${CREDITS_PER_SIGNUP} MC` },
                { k: "Lifetime cash commission", v: `${COMMISSION_PCT}% of every payment your referral ever makes` },
                { k: "Minimum payout", v: `$${MIN_PAYOUT}` },
                { k: "Dashboard", v: "/settings/referrals (tabs: Dashboard, Program, Tasks, Withdrawals)" },
                { k: "Marketing kit", v: "/settings/referrals/resources" },
                { k: "Withdraw", v: "/settings/withdraw" },
              ],
            },
            { kind: "note", text: "Only the numbers above are real. Ignore any other figure you may see elsewhere." },
          ],
        },
      ],
    },
    {
      id: "live-agents",
      label: `Agents catalog (${AGENTS.length} — auto-sync)`,
      sections: [
        {
          id: "agents-overview-live",
          title: `Every agent on Megsy (${AGENTS.length})`,
          icon: Bot,
          accent: ACTION,
          intro:
            "Auto-generated from the live agent registry. Mention an agent with @name from the composer, or tap its chip in the Mode Bar.",
          blocks: [
            {
              kind: "kv",
              rows: AGENTS.map((a) => ({ k: `${a.mention}`, v: `${a.label} — ${a.description}` })),
            },
          ],
        },
        ...agentSections,
      ],
    },
    {
      id: "live-content",
      label: "Content index (auto-sync)",
      sections: [
        {
          id: "live-blog",
          title: `Blog — ${BLOG_POSTS.length} long-form posts indexed`,
          icon: BookOpen,
          accent: ACTION,
          intro:
            "Plus 3 fresh AI-published articles per day at /blog, auto-translated into every supported language.",
          blocks: [
            { kind: "kv", rows: blogRows },
            { kind: "link", href: "/blog", label: "Open the blog →" },
          ],
        },
        {
          id: "live-comparisons",
          title: `Comparisons — Megsy vs ${COMPARISONS.length} tools`,
          icon: LayoutGrid,
          accent: MINT,
          intro: "Honest head-to-head comparisons — auto-listed from /data/comparisons.ts.",
          blocks: [{ kind: "kv", rows: compareRows }],
        },
        {
          id: "live-landings",
          title: `Service & feature landings — ${SERVICE_LANDINGS.length} pages`,
          icon: Sparkles,
          accent: BLUSH,
          intro:
            "Dedicated SEO landings for every capability and locale. Auto-grouped by category from /data/serviceLandings.ts.",
          blocks: landingsBlocks,
        },
      ],
    },
    {
      id: "live-surface",
      label: `Site surface (${DOC_REGISTRY_STATS.pageCount} pages · ${DOC_REGISTRY_STATS.edgeFunctionCount} functions — auto-detected)`,
      sections: [
        {
          id: "live-pages",
          title: `Every page on the site — ${DOC_REGISTRY_STATS.pageCount} detected`,
          icon: ListTree,
          accent: ACTION,
          intro:
            "Auto-discovered at build time via Vite glob over src/pages/**. Each row shows the file path and a one-line description parsed from the page's leading `/** @doc ... */` comment. New pages appear automatically — adding a `@doc` tag gives a richer summary, but pages without one still show up with a humanized fallback so nothing ever silently disappears.",
          blocks: pagesBlocks,
        },
        {
          id: "live-edge-fns",
          title: `Backend edge functions — ${DOC_REGISTRY_STATS.edgeFunctionCount} detected`,
          icon: Cpu,
          accent: MINT,
          intro:
            "Auto-discovered from supabase/functions/**. These run on the server (Deno runtime) for chat streaming, media generation, payments, blog publishing, OAuth, GitHub push, sitemap, and more. Descriptions are pulled from each function's `/** @doc ... */` header — add one to give the function a human-readable summary here.",
          blocks: edgeFnBlocks,
        },
        {
          id: "live-integrations",
          title: `Connectors & integrations — ${INTEGRATIONS_LIST.length} apps across ${INTEGRATION_CATEGORIES.length - 1} categories`,
          icon: Link2,
          accent: BLUSH,
          intro:
            "Auto-synced from src/lib/integrationsData.ts. Add a connector there and it appears here instantly, grouped by category, with its type (OAuth, notification, service, or Pipedream-powered) and description.",
          blocks: integrationsBlocks,
        },
        {
          id: "live-slides-templates",
          title: `Slides templates — ${SLIDES_TEMPLATES.length} available`,
          icon: Presentation,
          accent: ACTION,
          intro:
            "Every slide-deck template registered in src/lib/slidesTemplates.ts. Premium HTML templates (interactive 3D, animated) and standard print-friendly templates are auto-listed with their category.",
          blocks: [
            {
              kind: "kv",
              rows: SLIDES_TEMPLATES.map((t) => ({
                k: t.id,
                v: `${t.name || t.id} — ${t.category}${t.description ? ` · ${t.description}` : ""}`,
              })),
            },
          ],
        },
        {
          id: "live-skills",
          title: `Skill tools & models — ${SKILL_TOOLS.length} tools · ${SKILL_MODELS.length} models`,
          icon: Wand2,
          accent: MINT,
          intro:
            "Auto-synced catalog of every tool a custom Skill can call, and every base model a Skill can be wired to. Source of truth: src/lib/skillTools.ts.",
          blocks: [
            { kind: "h", text: "Tools available to skills" },
            { kind: "kv", rows: SKILL_TOOLS.map((t) => ({ k: t.name, v: `${t.label} — ${t.description}` })) },
            { kind: "h", text: "Base models available to skills" },
            { kind: "kv", rows: SKILL_MODELS.map((m) => ({ k: m.id, v: m.label })) },
          ],
        },
      ],
    },
  ];
}

const GROUPS: DocGroup[] = (() => {
  // Combine the hand-curated prose groups with the auto-generated live data.
  // The auto groups always come AFTER the prose so the narrative reads first
  // and the reference tables come at the end.
  return [...STATIC_GROUPS, ...buildAutoGroups()];
})();



/* ───────────────────────── Page ───────────────────────── */

const SectionFallback = () => (
  <div className="min-h-[200px] w-full px-4 py-16 mx-auto max-w-7xl">
    <div className="h-8 w-48 rounded-md bg-foreground/[0.04] animate-pulse mb-6" />
  </div>
);

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(GROUPS[0].sections[0].id);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      sections: g.sections.filter((s) => {
        if (s.title.toLowerCase().includes(q)) return true;
        if ((s.intro || "").toLowerCase().includes(q)) return true;
        return s.blocks.some((b) => {
          if (b.kind === "p" || b.kind === "note" || b.kind === "code" || b.kind === "h") return b.text.toLowerCase().includes(q);
          if (b.kind === "ul" || b.kind === "ol") return b.items.some((i) => i.toLowerCase().includes(q));
          if (b.kind === "kv") return b.rows.some((r) => r.k.toLowerCase().includes(q) || r.v.toLowerCase().includes(q));
          if (b.kind === "link") return b.label.toLowerCase().includes(q);
          return false;
        });
      }),
    })).filter((g) => g.sections.length > 0);
  }, [query]);

  // Scroll-spy for the sidebar TOC.
  useEffect(() => {
    const ids = GROUPS.flatMap((g) => g.sections.map((s) => s.id));
    const handler = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]?.target.id) setActiveId(visible[0].target.id);
    };
    const io = new IntersectionObserver(handler, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [filteredGroups]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: INK, color: PARCHMENT }}>
      <SEOHead
        title="Megsy AI Docs — The Complete Product Guide & PWA Install"
        description="The complete Megsy AI documentation: every feature, every agent, every setting, every page — explained in full. Plus step-by-step PWA install for iPhone, Android, Mac, Windows and Linux."
        path="/docs"
      />
      <LandingNavbar />

      {/* Hero — cartoon sticker style */}
      <header className="relative px-4 pt-28 pb-10 mx-auto max-w-7xl">
        <div
          className="rounded-[32px] p-8 md:p-14 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${PARCHMENT} 0%, #FFE9D6 100%)`,
            border: `2.5px solid ${INK}`,
            boxShadow: `6px 6px 0 ${INK}`,
            color: INK,
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
            style={{ backgroundColor: INK, color: PARCHMENT }}
          >
            <MegsyStar className="w-3.5 h-3.5" /> Documentation
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-[1.02]">
            Every atom of Megsy AI, <br className="hidden md:block" />
            in one beautiful place.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] md:text-[18px] font-semibold opacity-80">
            Search, browse and install — a complete, deeply detailed reference for every feature, every agent, every model, every setting, every page and every policy on megsyai.com. Updated continuously.
          </p>

          {/* Search */}
          <div className="mt-7 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: INK, opacity: 0.6 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the docs — try ‘install’, ‘credits’, ‘slides’, ‘operator’…"
              className="w-full h-12 pl-11 pr-4 rounded-2xl outline-none text-[15px] font-semibold"
              style={{
                backgroundColor: "#fff",
                border: `2px solid ${INK}`,
                boxShadow: `3px 3px 0 ${INK}`,
                color: INK,
              }}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {GROUPS.slice(0, 6).map((g) => (
              <a
                key={g.id}
                href={`#group-${g.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition active:translate-x-[1px] active:translate-y-[1px]"
                style={{ backgroundColor: "#fff", border: `2px solid ${INK}`, color: INK, boxShadow: `2px 2px 0 ${INK}` }}
              >
                {g.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="px-4 pb-24 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <nav className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.id}>
                <div
                  className="text-[11px] font-black uppercase tracking-widest mb-2 px-2"
                  style={{ color: PARCHMENT, opacity: 0.55 }}
                >
                  {group.label}
                </div>
                <ul className="space-y-0.5">
                  {group.sections.map((s) => {
                    const Icon = s.icon;
                    const active = s.id === activeId;
                    return (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] transition"
                          style={
                            active
                              ? {
                                  backgroundColor: PARCHMENT,
                                  color: INK,
                                  fontWeight: 800,
                                  border: `1.5px solid ${INK}`,
                                  boxShadow: `2px 2px 0 ${INK}`,
                                }
                              : { color: PARCHMENT, opacity: 0.75 }
                          }
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{s.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-16">
          {filteredGroups.length === 0 && (
            <div className="text-center py-24 opacity-70">
              No docs matched “{query}”. Try a different search.
            </div>
          )}

          {filteredGroups.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`} className="space-y-10">
              <h2
                id={`group-${group.id}`}
                className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em]"
                style={{ color: PARCHMENT, opacity: 0.55 }}
              >
                {group.label}
              </h2>

              {group.sections.map((s) => {
                const Icon = s.icon;
                const accent = s.accent ?? ACTION;
                return (
                  <article
                    key={s.id}
                    id={s.id}
                    className="scroll-mt-28 rounded-[28px] p-6 md:p-8"
                    style={{
                      backgroundColor: "hsl(var(--surface-1))",
                      border: `1.5px solid hsl(var(--surface-4))`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="inline-flex items-center justify-center w-11 h-11 rounded-2xl shrink-0"
                        style={{
                          backgroundColor: accent,
                          color: INK,
                          border: `2px solid ${INK}`,
                          boxShadow: `2.5px 2.5px 0 ${INK}`,
                        }}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                      </span>
                      <h3 className="text-2xl md:text-[28px] font-black tracking-tight leading-tight">
                        {s.title}
                      </h3>
                    </div>
                    {s.intro && (
                      <p className="text-[15px] leading-7 opacity-80 mb-4 max-w-3xl">{s.intro}</p>
                    )}
                    <div className="space-y-4 max-w-3xl">
                      {s.blocks.map((b, i) => (
                        <BlockView key={i} block={b} accent={accent} />
                      ))}
                    </div>
                  </article>
                );
              })}
            </section>
          ))}

          {/* Closing CTA */}
          <section
            className="mt-10 rounded-[28px] p-8 md:p-12"
            style={{
              background: `linear-gradient(135deg, ${PARCHMENT} 0%, #FFE0EC 100%)`,
              border: `2.5px solid ${INK}`,
              boxShadow: `5px 5px 0 ${INK}`,
              color: INK,
            }}
          >
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">Still have a question?</h3>
            <p className="mt-2 max-w-2xl font-semibold opacity-80">
              Our AI support assistant answers in any language, 24/7 — and it knows every page of this documentation by heart.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/support"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-black"
                style={{ backgroundColor: INK, color: PARCHMENT, boxShadow: `3px 3px 0 ${INK}` }}
              >
                Open AI support <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-black"
                style={{ backgroundColor: "#fff", color: INK, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
              >
                Contact our team
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-black"
                style={{ backgroundColor: "#fff", color: INK, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
              >
                See plans
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Suspense fallback={<SectionFallback />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}

/* ───────────────────────── Block renderer ───────────────────────── */

function BlockView({ block, accent }: { block: DocBlock; accent: string }) {
  switch (block.kind) {
    case "p":
      return <p className="text-[15px] leading-7 opacity-90">{block.text}</p>;
    case "h":
      return (
        <h4
          className="text-[13px] font-black uppercase tracking-[0.16em] pt-3"
          style={{ color: accent }}
        >
          {block.text}
        </h4>
      );
    case "ul":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-7 opacity-90">
              <CheckCircle2 className="w-4 h-4 mt-1.5 shrink-0" style={{ color: accent }} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-2.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-7 opacity-90">
              <span
                className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-black mt-0.5"
                style={{ backgroundColor: accent, color: INK, border: `1.5px solid ${INK}` }}
              >
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      );
    case "kv":
      return (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: `1.5px solid hsl(var(--surface-4))` }}
        >
          <dl className="divide-y" style={{ borderColor: "hsl(var(--surface-4))" }}>
            {block.rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(140px,38%)_1fr] gap-3 px-4 py-3 text-[14px]"
                style={{
                  borderTop: i === 0 ? undefined : `1px solid hsl(var(--surface-4))`,
                }}
              >
                <dt className="font-black" style={{ color: accent }}>{r.k}</dt>
                <dd className="opacity-90">{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "code":
      return (
        <pre
          className="rounded-xl p-4 overflow-x-auto text-[13px] leading-6"
          style={{ backgroundColor: "hsl(var(--surface-3))", border: `1px solid hsl(var(--surface-4))` }}
        >
          <code>{block.text}</code>
        </pre>
      );
    case "note":
      return (
        <div
          className="rounded-xl px-4 py-3 text-[14px]"
          style={{
            border: `1.5px solid ${accent}`,
            backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`,
          }}
        >
          <strong style={{ color: accent }}>Tip · </strong>
          <span className="opacity-90">{block.text}</span>
        </div>
      );
    case "image":
      return (
        <figure className="my-2">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full max-w-md mx-auto rounded-2xl"
            style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}`, backgroundColor: "#fff" }}
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-[12.5px] opacity-70">{block.caption}</figcaption>
          )}
        </figure>
      );
    case "link":
      return (
        <Link
          to={block.href}
          className="inline-flex items-center gap-1 font-black hover:underline text-[14.5px]"
          style={{ color: accent }}
        >
          {block.label}
        </Link>
      );
  }
}
