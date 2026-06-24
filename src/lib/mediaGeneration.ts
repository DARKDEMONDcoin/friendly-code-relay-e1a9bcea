// Parallel runner for the chat-driven media generation flow.
// Calls existing edge functions `media-image` / `media-video` (+ poll) for all scenes
// together and reports progress via callbacks so the UI updates as each result lands.

import { supabase } from "@/integrations/supabase/client";
import type { MediaPlan, MediaPlanScene } from "@/components/chat/media/MediaPlanCard";
import type { MediaSceneResult } from "@/components/chat/media/MediaResultCard";

const VIDEO_POLL_INTERVAL_MS = 4000;
const VIDEO_POLL_MAX_MS = 8 * 60 * 1000; // 8 minutes per scene

async function generateImageScene(
  scene: MediaPlanScene,
  modelSlug: string,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("media-image", {
    body: {
      prompt: scene.prompt,
      model_slug: modelSlug,
      num_images: 1,
    },
  });
  if (error) throw new Error(error.message || "image gen failed");
  if (data?.paywall) throw new Error(data.message || "Upgrade required");
  if (data?.error) throw new Error(data.message || data.error);
  const url =
    data?.image_url ||
    (Array.isArray(data?.image_urls) ? data.image_urls[0] : null);
  if (!url) throw new Error("no image returned");
  return url;
}

async function generateVideoScene(
  scene: MediaPlanScene,
  modelSlug: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    prompt: scene.prompt,
    model_slug: modelSlug,
    duration: scene.duration_seconds || 5,
  };
  if (scene.first_frame_url) body.start_frame = scene.first_frame_url;
  if (scene.last_frame_url) body.end_frame = scene.last_frame_url;
  const { data, error } = await supabase.functions.invoke("media-video", {
    body,
  });
  if (error) throw new Error(error.message || "video gen failed");
  if (data?.paywall) throw new Error(data.message || "Upgrade required");
  if (data?.error) throw new Error(data.message || data.error);

  // Direct video URL response
  const directUrl = data?.video_url || data?.url;
  if (directUrl) return String(directUrl);

  // Async job: poll
  const jobId = data?.job_id || data?.id;
  if (!jobId) throw new Error("no video job id");

  const started = Date.now();
  while (Date.now() - started < VIDEO_POLL_MAX_MS) {
    await new Promise((r) => setTimeout(r, VIDEO_POLL_INTERVAL_MS));
    const { data: poll, error: pollErr } = await supabase.functions.invoke(
      "media-video-poll",
      { body: { job_id: jobId } },
    );
    if (pollErr) continue;
    const status = poll?.status;
    if (
      status === "complete" ||
      status === "completed" ||
      status === "succeeded" ||
      status === "success"
    ) {
      const u = poll?.video_url || poll?.url || poll?.output_url;
      if (u) return String(u);
      throw new Error("completed but no URL");
    }
    if (status === "failed" || status === "error" || status === "cancelled") {
      throw new Error(poll?.error || "video job failed");
    }
  }
  throw new Error("timeout");
}

export interface RunMediaPlanOptions {
  plan: MediaPlan;
  onSceneStart: (index: number) => void;
  onSceneDone: (result: MediaSceneResult) => void;
  shouldCancel?: () => boolean;
}

export async function runMediaPlan(opts: RunMediaPlanOptions): Promise<void> {
  const { plan, onSceneStart, onSceneDone, shouldCancel } = opts;
  await Promise.allSettled(plan.scenes.map(async (scene) => {
    if (shouldCancel?.()) return;
    onSceneStart(scene.index);
    try {
      const url =
        plan.mode === "video"
          ? await generateVideoScene(scene, plan.modelSlug)
          : await generateImageScene(scene, plan.modelSlug);
      onSceneDone({
        index: scene.index,
        title: scene.title,
        status: "done",
        url,
        type: plan.mode === "video" ? "video" : "image",
      });
    } catch (e) {
      onSceneDone({
        index: scene.index,
        title: scene.title,
        status: "error",
        error: e instanceof Error ? e.message : "failed",
        type: plan.mode === "video" ? "video" : "image",
      });
    }
  }));
}

export async function regenerateScene(
  plan: MediaPlan,
  sceneIndex: number,
): Promise<MediaSceneResult> {
  const scene = plan.scenes.find((s) => s.index === sceneIndex);
  if (!scene) throw new Error("scene not found");
  try {
    const url =
      plan.mode === "video"
        ? await generateVideoScene(scene, plan.modelSlug)
        : await generateImageScene(scene, plan.modelSlug);
    return {
      index: scene.index,
      title: scene.title,
      status: "done",
      url,
      type: plan.mode === "video" ? "video" : "image",
    };
  } catch (e) {
    return {
      index: scene.index,
      title: scene.title,
      status: "error",
      error: e instanceof Error ? e.message : "failed",
      type: plan.mode === "video" ? "video" : "image",
    };
  }
}
