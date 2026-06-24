# خطة حماية التطبيق من تصرفات المستخدمين

## النطاق

4 أنواع حماية × 3 أولويات صفحات (Billing/Settings, Auth, Chat). شغل وقائي بدون تغيير منطق الأعمال.

## الإصلاحات

### 1. Input Validation (zod schemas + تكامل في الفورمز)

ملف جديد `src/lib/validation/schemas.ts` يحتوي:

- `emailSchema` — trim + email + max 254
- `passwordSchema` — min 8, max 128, يحوي حرف ورقم
- `displayNameSchema` — trim, 1-50, بدون HTML tags
- `chatMessageSchema` — trim, 1-8000 chars
- `attachmentSchema` — max 25MB، أنواع mime مسموح بها فقط
- `referralCodeSchema` — alphanumeric, 3-20

**تطبيق:**
- `AuthPage.tsx` — استخدام schemas قبل `handleCheckEmail`, `handleSubmitPassword`, تظهر error inline
- composer الشات — التحقق قبل send، رفض الرسائل الفاضية أو > 8000 char، رفض المرفقات الكبيرة بـtoast واضح
- صفحات الإعدادات (Profile, ChangeEmail, ChangePassword) — نفس الـschemas

### 2. Confirmations على الـDestructive Actions

ملف جديد `src/components/common/ConfirmDialog.tsx` (يستخدم `AlertDialog` من shadcn) + hook `useConfirm()` يرجع promise.

**تطبيق:**
- حذف محادثة (chat sidebar) — "Delete this conversation? This cannot be undone"
- حذف رسالة
- Sign out من كل الأجهزة
- Cancel subscription
- Delete account (موجود غالباً — نتأكد)
- Clear chat history / memory
- Remove workspace member
- إلغاء job قيد التشغيل (research/video)

كل dialog يطلب الضغط مرتين، والـconfirm button احمر فيه نص يكتبه المستخدم للحذف الخطير (account, workspace).

### 3. Rate Limiting / Spam Guards (client-side)

ملف جديد `src/lib/guards/rateLimiter.ts`:

```ts
- useDebouncedAction(fn, ms)  // للأزرار اللي ممكن تتدبل-كليك
- useRateLimit(key, max, windowMs)  // sliding window في memory
- inflightGuard(key)  // منع نفس الـrequest مرتين بالتوازي
```

**تطبيق:**
- Send button في الشات — debounce 250ms + منع send لو في رسالة قيد الإرسال (موجود غالباً — نتأكد)
- Auth submit (login/signup) — منع double-submit + cooldown 1s
- "Resend OTP/email verification" — cooldown 30s مع countdown مرئي
- "Forgot password" — cooldown 60s
- Create new chat — debounce 500ms
- Like/feedback buttons — debounce
- Pricing checkout buttons — منع double-click (ممكن يخلق checkout مرتين)
- Save settings — منع spam save

### 4. Error Recovery & Retries

ملف جديد `src/lib/guards/retry.ts`:

```ts
- withRetry(fn, {retries, baseMs, shouldRetry})  // exponential backoff
- isTransientError(err)  // network/5xx/timeout
```

ملف جديد `src/components/common/NetworkStatus.tsx` — toast لما النت يقطع/يرجع (موجود OfflineBanner — نوسعه).

**تطبيق:**
- Supabase queries المهمة (load conversation, send message) — retry تلقائي 2 مرات للأخطاء العابرة
- Upload المرفقات — retry + رسالة "Retry" واضحة للمستخدم
- AI chat send — لو فشل، يحتفظ بالـdraft + زر "Retry"
- Auth submit — retry للـnetwork errors فقط (مش للـinvalid credentials)
- Error boundary موجود — نتأكد إنه fallback مفيد + زر "Try again" + "Go home"
- منع فقدان draft الرسالة لو حصل error — حفظ في sessionStorage

## ملفات جديدة

```text
src/lib/validation/schemas.ts
src/lib/guards/rateLimiter.ts
src/lib/guards/retry.ts
src/components/common/ConfirmDialog.tsx
src/hooks/useConfirm.tsx
```

## ملفات معدلة (تقريباً)

```text
src/pages/auth/AuthPage.tsx                   → zod, cooldowns, retry
src/pages/auth/ChangeEmailPage.tsx            → validation + confirm
src/pages/auth/ChangePasswordPage.tsx         → validation + confirm
src/pages/auth/DeleteAccountPage.tsx          → typed-confirm
src/pages/chat/ChatPage.tsx                   → schema + debounce + retry
src/components/chat/sidebar/* (delete convo)  → confirm
src/components/promo/* / pricing buttons      → inflight guard
src/pages/settings/SettingsPage.tsx           → save throttle
src/components/common/OfflineBanner.tsx       → expand for transient retry
```

## ما لن أعمله

- لن أضيف backend rate limiting (مش متاح كـprimitive حالياً — موضح في الـguidelines)
- لن أغير business logic أو UI styling
- لن ألمس Supabase tables أو RLS

## ترتيب التنفيذ

1. الـbuilding blocks (schemas + guards + ConfirmDialog) — أساس لكل اللي بعده
2. Auth (أعلى أثر أمني)
3. Chat composer (الأكثر استخداماً)
4. Billing/Settings (الأكثر خطورة على الفلوس والبيانات)

تأكد علشان أبدأ التنفيذ.
