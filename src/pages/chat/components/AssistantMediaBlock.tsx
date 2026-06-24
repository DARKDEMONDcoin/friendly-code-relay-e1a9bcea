import { Suspense } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { runMediaPlan, regenerateScene } from "@/lib/mediaGeneration";
import { MediaPlanCard, MediaResultCard } from "../lazyComponents";
import type { Message } from "../chatConstants";

interface Props {
  msg: Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setInput: (v: string) => void;
}

export default function AssistantMediaBlock({ msg, setMessages, setInput }: Props) {
  if (!msg.mediaPlan) return null;
  const targetKey = msg.id ?? msg.clientId;
  const matches = (mm: Message) =>
    targetKey ? mm.id === targetKey || mm.clientId === targetKey : mm === msg;

  return (
    <div className="px-3 md:px-12 space-y-2">
      <Suspense fallback={null}>
        <MediaPlanCard
          plan={msg.mediaPlan}
          status={msg.mediaStatus ?? "awaiting"}
          currentSceneIndex={msg.mediaCurrentScene}
          onStart={async () => {
            setMessages((prev) =>
              prev.map((mm) =>
                matches(mm)
                  ? { ...mm, mediaStatus: "running", mediaCurrentScene: 1 }
                  : mm,
              ),
            );
            await runMediaPlan({
              plan: msg.mediaPlan!,
              onSceneStart: (idx) => {
                setMessages((prev) =>
                  prev.map((mm) =>
                    matches(mm)
                      ? {
                          ...mm,
                          mediaCurrentScene: idx,
                          mediaResults: (mm.mediaResults ?? []).map((r) =>
                            r.index === idx ? { ...r, status: "running" as const } : r,
                          ),
                        }
                      : mm,
                  ),
                );
              },
              onSceneDone: (res) => {
                setMessages((prev) =>
                  prev.map((mm) =>
                    matches(mm)
                      ? {
                          ...mm,
                          mediaResults: (mm.mediaResults ?? []).map((r) =>
                            r.index === res.index ? res : r,
                          ),
                        }
                      : mm,
                  ),
                );
              },
            });
            setMessages((prev) =>
              prev.map((mm) => (matches(mm) ? { ...mm, mediaStatus: "done" } : mm)),
            );
          }}
          onEditPrompt={() => {
            setInput(msg.mediaPlan?.summary || "");
            toast.message("Edit the prompt and send again");
          }}
        />
        {msg.mediaResults && msg.mediaResults.length > 0 && (
          <MediaResultCard
            results={msg.mediaResults}
            finalVideoUrl={msg.mediaFinalVideoUrl}
            mergeStatus={msg.mediaMergeStatus}
            mergeError={msg.mediaMergeError}
            onMergeVideos={async () => {
              const urls = (msg.mediaResults ?? [])
                .filter((r) => r.type === "video" && r.status === "done" && r.url)
                .map((r) => r.url!) as string[];
              if (urls.length < 2) {
                toast.error("Need at least 2 finished clips to merge");
                return;
              }
              setMessages((prev) =>
                prev.map((mm) =>
                  matches(mm)
                    ? { ...mm, mediaMergeStatus: "merging", mediaMergeError: undefined }
                    : mm,
                ),
              );
              try {
                const { data, error } = await supabase.functions.invoke("video-agent", {
                  body: { action: "merge_urls", urls },
                });
                if (error || !data?.final_url) {
                  throw new Error(error?.message || data?.message || "Merge failed");
                }
                setMessages((prev) =>
                  prev.map((mm) =>
                    matches(mm)
                      ? {
                          ...mm,
                          mediaMergeStatus: "done",
                          mediaFinalVideoUrl: data.final_url,
                        }
                      : mm,
                  ),
                );
                toast.success("Final video ready");
              } catch (e) {
                const m = e instanceof Error ? e.message : "Merge failed";
                setMessages((prev) =>
                  prev.map((mm) =>
                    matches(mm)
                      ? { ...mm, mediaMergeStatus: "error", mediaMergeError: m }
                      : mm,
                  ),
                );
                toast.error(m);
              }
            }}
            onRetry={async (idx) => {
              setMessages((prev) =>
                prev.map((mm) =>
                  matches(mm)
                    ? {
                        ...mm,
                        mediaResults: (mm.mediaResults ?? []).map((r) =>
                          r.index === idx
                            ? { ...r, status: "running" as const, error: undefined }
                            : r,
                        ),
                      }
                    : mm,
                ),
              );
              const res = await regenerateScene(msg.mediaPlan!, idx);
              setMessages((prev) =>
                prev.map((mm) =>
                  matches(mm)
                    ? {
                        ...mm,
                        mediaResults: (mm.mediaResults ?? []).map((r) =>
                          r.index === idx ? res : r,
                        ),
                      }
                    : mm,
                ),
              );
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
