import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Download, Film, Loader2, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaSceneResult {
  index: number;
  title: string;
  status: "pending" | "running" | "done" | "error";
  url?: string;
  error?: string;
  type: "image" | "video";
}

interface Props {
  results: MediaSceneResult[];
  onRetry: (index: number) => void;
  /** Triggered when the user presses "Merge into one video". Only shown for video
   * results once 2+ scenes have finished successfully. */
  onMergeVideos?: () => void;
  mergeStatus?: "idle" | "merging" | "done" | "error";
  mergeError?: string;
  finalVideoUrl?: string;
}

export default function MediaResultCard({
  results,
  onRetry,
  onMergeVideos,
  mergeStatus = "idle",
  mergeError,
  finalVideoUrl,
}: Props) {
  // Show running tiles too so users see live progress
  const visibleResults = results.filter(
    (r) => r.status === "running" || r.status === "done" || r.status === "error",
  );
  if (!visibleResults.length) return null;

  const isSingle = visibleResults.length === 1;
  const videoDone = results.filter((r) => r.type === "video" && r.status === "done" && r.url);
  const allVideos = results.length > 0 && results.every((r) => r.type === "video");
  const allTerminal = results.every((r) => r.status === "done" || r.status === "error");
  const canMerge =
    allVideos && allTerminal && videoDone.length >= 2 && !!onMergeVideos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`my-2 grid max-w-[640px] gap-2 ${
        isSingle ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      <AnimatePresence initial={false}>
        {visibleResults.map((r) => (
          <motion.div
            key={r.index}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur overflow-hidden"
          >
            <div
              className={`w-full relative flex items-center justify-center overflow-hidden bg-[hsl(var(--muted))]/30 ${
                r.type === "video" ? "aspect-[9/16]" : "aspect-square"
              }`}
            >
              {r.status === "done" && r.url ? (
                r.type === "video" ? (
                  <motion.video
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={r.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <motion.img
                    initial={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.45 }}
                    src={r.url}
                    alt={r.title}
                    className="w-full h-full object-cover"
                  />
                )
              ) : r.status === "running" ? (
                <>
                  {/* Soft uniform skeleton */}
                  <div className="absolute inset-0 bg-[hsl(var(--muted))]/40" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.8, ease: "linear", repeat: Infinity }}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2.5 px-3 text-foreground/75">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
                      className="w-8 h-8 rounded-full border-[2px] border-foreground/10 border-t-foreground/60"
                    />
                    <span className="text-[11px] font-medium tracking-wide whitespace-nowrap">
                      {r.type === "video" ? "Rendering video…" : "Painting pixels…"}
                    </span>
                  </div>
                </>
              ) : r.status === "error" ? (
                <div className="flex flex-col items-center gap-1.5 text-destructive p-3 text-center">
                  <AlertCircle className="w-5 h-5" />
                  <span className="line-clamp-2 text-[11px]">{r.error || "Generation failed"}</span>
                </div>
              ) : null}

              <span className="absolute top-1.5 start-1.5 text-[10px] font-semibold bg-background/80 backdrop-blur px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                {r.status === "running" && (
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                )}
                #{r.index}
              </span>
            </div>
            <div className="p-2 flex items-center justify-between gap-1">
              <span className="text-[11px] font-medium truncate flex-1 min-w-0">{r.title}</span>
              {r.status === "done" && r.url && (
                <a
                  href={r.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground p-1 -m-1 transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
              {r.status === "error" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => onRetry(r.index)}
                >
                  <RotateCw className="w-3 h-3 me-1" />
                  Retry
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Merge into one video ───────────────────────────────────── */}
      {(canMerge || mergeStatus !== "idle" || finalVideoUrl) && (
        <div className="sm:col-span-2 mt-1 rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-3 space-y-2">
          {finalVideoUrl ? (
            <>
              <div className="flex items-center gap-2 text-[12px] font-medium">
                <Film className="w-4 h-4 text-primary" />
                <span>Final stitched video</span>
                <a
                  href={finalVideoUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="ms-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
              <video
                src={finalVideoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-xl bg-black"
              />
            </>
          ) : mergeStatus === "merging" ? (
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Stitching {videoDone.length} clips into one video… this can take a minute.
            </div>
          ) : mergeStatus === "error" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[12px] text-destructive">
                <AlertCircle className="w-4 h-4" />
                {mergeError || "Merge failed"}
              </div>
              <Button size="sm" variant="outline" onClick={onMergeVideos}>
                <RotateCw className="w-3.5 h-3.5 me-1" />
                Try merge again
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={onMergeVideos}
              className="w-full sm:w-auto"
            >
              <Film className="w-3.5 h-3.5 me-1.5" />
              Merge {videoDone.length} clips into one video
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
