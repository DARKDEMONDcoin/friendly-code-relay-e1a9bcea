import { sanitizeLeakedToolText } from "../chatUtils";
import type { Message } from "../chatConstants";

type SenderMap = Record<string, { name: string | null; avatar: string | null }>;
type ConvMode = string | undefined;

/**
 * Maps a raw `messages` row from Supabase into the in-memory `Message`
 * shape used by the chat UI. Handles:
 *  - tool-text leak sanitization for assistant messages
 *  - sender name/avatar lookup from a pre-built profile map
 *  - kind → render-mode mapping for slides / images / operator / research
 *  - copying metadata payloads (slidesDeck, imageSlides, docsArtifact, …)
 *
 * Returns `null` for empty assistant rows with no images/metadata so the
 * caller can filter them out cleanly.
 */
export function rowToMessage(
  row: any,
  senderMap: SenderMap,
  convMode: ConvMode,
): Message | null {
  const role = row.role as "user" | "assistant";
  const content = role === "assistant" ? sanitizeLeakedToolText(row.content) : row.content;
  if (role === "assistant" && !content && !row.images?.length && !row.metadata) {
    return null;
  }
  const meta = (row.metadata || {}) as any;
  return {
    role,
    content,
    images: row.images || undefined,
    liked: row.liked,
    id: row.id,
    user_id: row.user_id,
    senderName: row.user_id ? senderMap[row.user_id]?.name : null,
    senderAvatar: row.user_id ? senderMap[row.user_id]?.avatar : null,
    mode:
      meta.kind === "operatorRun"
        ? "operator"
        : meta.kind === "imageSlides" || convMode === "slides-images"
          ? "slides-images"
          : meta.kind === "slidesDeck" ||
              meta.kind === "standardSlides" ||
              meta.kind === "slidesPending" ||
              convMode === "slides"
            ? "slides"
            : role === "assistant" && convMode === "research"
              ? "deep-research"
              : undefined,
    slidesDeck: meta.slidesDeck || undefined,
    standardSlides: meta.standardSlides || undefined,
    imageSlides: meta.imageSlides || undefined,
    slidesPendingTopic: meta.kind === "slidesPending" ? meta.topic : undefined,
    slidesJobId: meta.kind === "slidesPending" ? meta.slidesJobId : undefined,
    docsArtifact: meta.docsArtifact || undefined,
    docsClarify: meta.docsClarify || undefined,
    docsJobId: meta.kind === "docsPending" ? meta.docsJobId : undefined,
    chatJobId: meta.kind === "researchPending" ? meta.chatJobId : undefined,
    operatorRunId: meta.kind === "operatorRun" ? meta.operatorRunId : undefined,
    researchJobId: meta.kind === "researchPlan" ? meta.researchJobId : undefined,
  } as Message;
}
