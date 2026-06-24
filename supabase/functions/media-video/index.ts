import { corsHeaders } from "../_shared/cors.ts";
// Thin adapter that translates the StudioPage / MediaHub video contract
// into the unified `openrouter-media` edge function.
//
// Frontend contract:
//   POST { prompt, model_slug, images[], start_frame, end_frame,
//          aspect_ratio, resolution, duration }             → { job_id }

import {
  createRunbaseRun,
  hasRunbaseKeys,
  resolveRunbaseModel,
} from "../_shared/runbase.ts";
import { alibabaGenerateVideo } from "../_shared/alibaba-direct.ts";




const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const TARGET = `${SUPABASE_URL}/functions/v1/openrouter-media`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRealUserAuth = (auth: string | null) => {
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice("Bearer ".length).trim();
  return !!token && token !== ANON_KEY && token !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
};

const premiumPaywall = (reason = "auth_required") =>
  json(
    {
      paywall: true,
      feature: "video",
      message: "توليد الفيديو متاح للمشتركين فقط. سجّل الدخول أو اشترك من صفحة الباقات.",
      upgrade_url: "/billing",
      reason,
    },
    200,
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const body = await req.json();
    const auth = req.headers.get("authorization");

    if (!isRealUserAuth(auth)) return premiumPaywall("auth_required");

    const startFrame = body.start_frame || (Array.isArray(body.images) ? body.images[0] : null);
    const endFrame = body.end_frame || null;

    // Runbase fast-path: route to runbase if we have a key + a known model.
    const requestedSlug = String(body.model_slug || body.model || "");
    const runbaseModel = resolveRunbaseModel(requestedSlug);
    if (runbaseModel && (await hasRunbaseKeys())) {
      const input: Record<string, unknown> = { prompt: body.prompt };
      if (body.aspect_ratio) input.aspect_ratio = body.aspect_ratio;
      if (body.resolution) input.resolution = body.resolution;
      if (body.duration) input.duration = body.duration;
      if (startFrame) input.start_frame = startFrame;
      if (endFrame) input.end_frame = endFrame;
      if (body.audio_url) input.audio_url = body.audio_url;
      if (body.video_url) input.video_url = body.video_url;
      if (Array.isArray(body.images) && body.images.length > 1) input.images = body.images;

      const rb = await createRunbaseRun(runbaseModel, input);
      if (rb.ok) {
        // Encode keyId so media-video-poll can re-use it.
        const jobId = `runbase:${rb.run.id}:${rb.keyId}`;
        return json({ job_id: jobId, status: rb.run.status || "pending", provider: "runbase" });
      }
      console.warn("[media-video] runbase failed, falling back:", rb.status, rb.error);
    }

    const requestedForFallback = String(body.model_slug || body.model || "");
    const likelyAlibaba = /wan|qwen|alibaba|dashscope|happyhorse/i.test(requestedForFallback);

    const payload: Record<string, unknown> = {
      kind: "video",
      async: true,
      model: body.model_slug || body.model || "wan-2-7-t2v",
      prompt: body.prompt,
      aspect_ratio: body.aspect_ratio,
      resolution: body.resolution,
      duration: body.duration,
    };
    if (startFrame) payload.first_frame = startFrame;
    if (endFrame) payload.last_frame = endFrame;
    // NEW: forward audio + video inputs for models that support them
    // (Veo3-style audio, Runway/Firefly/VACE video-to-video edits, etc.)
    if (body.audio_url) payload.audio_url = String(body.audio_url);
    if (body.video_url) payload.video_url = String(body.video_url);
    if (Array.isArray(body.images) && body.images.length > 1) payload.images = body.images;


    const modelFallbacks = likelyAlibaba
      ? [String(payload.model), "wan-2-7-t2v", "happyhorse-1.0-t2v", "wan-2-5-t2v", "wan-2-2-t2v-plus"]
      : [String(payload.model), "wan-2-7-t2v"];
    let upstream: Response | null = null;
    let data: any = {};
    for (const model of Array.from(new Set(modelFallbacks.filter(Boolean)))) {
      upstream = await fetch(TARGET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          ...(auth ? { Authorization: auth } : { Authorization: `Bearer ${ANON_KEY}` }),
        },
        body: JSON.stringify({ ...payload, model }),
      });
      data = await upstream.json().catch(() => ({}));
      const job = data?.jobId || data?.job_id;
      if (upstream.ok && job && !data?.error && !data?.paywall) break;
      const errText = JSON.stringify(data || {});
      if (/auth_required|free_trial_exhausted|subscription|required|invalid_token|insufficient|credit|quota|balance/i.test(errText)) break;
      if (!/unknown model|model .*not|all_models_exhausted|provider_error|no_task_id|InvalidParameter|Model not exist/i.test(errText) && !upstream.ok) break;
    }
    if (!upstream) return json({ error: "video_request_not_started" }, 500);

    const upstreamText = JSON.stringify(data || {});
    const billingFailure =
      upstream.status === 401 ||
      upstream.status === 402 ||
      /auth_required|free_trial_exhausted|subscription|required|invalid_token|insufficient|credit|quota|balance/i.test(upstreamText);
    if (billingFailure) {
      const reason = data?.message || data?.error || data?.reason || `video_${upstream.status}`;
      return premiumPaywall(String(reason));
    }

    // ── LAST-RESORT FALLBACK: direct Alibaba DashScope video ─────────────
    // If openrouter-media failed OR returned no job_id, try our direct
    // Alibaba key as a final attempt before surfacing the error.
    const upstreamJobId = data?.jobId || data?.job_id;
    const upstreamFailed = !upstream.ok || !upstreamJobId;
    if (upstreamFailed) {
      console.warn(
        "[media-video] openrouter-media failed — trying direct Alibaba fallback",
        upstream.status,
        data?.error,
      );
      const ali = await alibabaGenerateVideo({
        prompt: String(body.prompt || ""),
        aspect_ratio: body.aspect_ratio,
        duration: Number(body.duration) || 5,
        start_frame: startFrame,
      });
      if (ali.ok && ali.urls && ali.urls.length > 0) {
        // Encode the finished URL into a synthetic job id; media-video-poll
        // decodes the "direct:" prefix and returns complete immediately.
        const b64 = btoa(ali.urls[0]).replace(/=+$/, "");
        return json({
          job_id: `direct:${b64}`,
          status: "complete",
          provider: "alibaba-direct",
          video_url: ali.urls[0],
        });
      }
      console.warn("[media-video] alibaba-direct fallback failed:", ali.error);

      if (!upstream.ok) {
        const reason = data?.message || data?.error || `video_${upstream.status}`;
        const paywall =
          upstream.status === 401 ||
          upstream.status === 402 ||
          /auth_required|free_trial_exhausted|insufficient|credit|quota|balance|invalid_token/i.test(
            JSON.stringify(data || {}) + ` ${reason}`,
          );
        if (paywall) {
          return json(
            {
              paywall: true,
              feature: "video",
              message: "اشترك في خطة مدفوعة أو اشحن رصيدك لتوليد الفيديو.",
              upgrade_url: "/billing",
              reason,
            },
            200,
          );
        }
        return json(data, upstream.status);
      }
      return json({ error: "no_job_returned", raw: data }, 502);
    }

    return json({ job_id: upstreamJobId, status: data?.status || "pending" });

  } catch (err) {
    return json(
      { error: "internal_error", message: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});