// Lazy-loaded heavy/conditionally-rendered components extracted from
// ChatPage.tsx. Keeping these in their own module shrinks the chat page
// source file and makes the lazy boundary easy to audit.
import { lazy } from "react";

export const SlidesDeckCard = lazy(() => import("@/components/chat/SlidesDeckCard"));
export const StandardSlidesCard = lazy(() => import("@/components/chat/StandardSlidesCard"));
export const ImageSlidesCard = lazy(() => import("@/components/chat/ImageSlidesCard"));
export const MediaPlanCard = lazy(() => import("@/components/chat/media/MediaPlanCard"));
export const MediaResultCard = lazy(() => import("@/components/chat/media/MediaResultCard"));

export const OperatorInlineBubbleLazy = lazy(() =>
  import("@/components/operator/OperatorInlineBubble").then((m) => ({
    default: m.OperatorInlineBubble,
  })),
);

export const InChatTimerCard = lazy(() => import("@/components/learn/InChatTimerCard"));
export const ConnectorsDialog = lazy(() => import("@/components/integrations/ConnectorsDialog"));
export const DirectoryDialog = lazy(() => import("@/components/integrations/DirectoryDialog"));
export const TemplatePickerSheet = lazy(() => import("@/components/files/TemplatePickerSheet"));
export const DocsArtifactCard = lazy(() => import("@/components/chat/agents/docs/DocsArtifactCard"));
export const DocsClarifyCard = lazy(() => import("@/components/chat/agents/docs/DocsClarifyCard"));
