import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";
import UnlockProButton from "@/components/branding/UnlockProButton";
import { ChatOptionsDropdown } from "./ChatOptionsDropdown";
import { SocialLinks } from "./SocialLinks";

interface DesktopChatHeaderProps {
  hasConversation: boolean;
  userPlan: string | null;
  navigate: (path: string) => void;
  setSidebarOpen: (open: boolean) => void;
  conversationId: string | null;
  conversationTitle: string;
  isPinned: boolean;
  isDeleting: boolean;
  renameValue: string;
  setRenameValue: (v: string) => void;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteLink: string | null;
  inviteLoading: boolean;
  shareMode: "private" | "public";
  setShareMode: (m: "private" | "public") => void;
  generatedShareUrl: string | null;
  setGeneratedShareUrl: (v: string | null) => void;
  chatMenuView: any;
  setChatMenuView: (v: any) => void;
  onNewChat: () => void;
  onTogglePin: () => void;
  onRename: () => void;
  onSendInvite: () => void;
  onCopyInviteLink: () => void;
  onCopyShareLink: () => void;
  onCreateShareLink: () => void;
  onOpenInvite: () => void;
  onConfirmDelete: () => void;
}

/**
 * Sticky chat header rendered on top of the messages area.
 * Aether-inspired: hairline bottom border, tiny brand mark on the left when empty,
 * minimal controls on the right. Desktop-only styling — mobile branch is untouched.
 */
export function DesktopChatHeader(props: DesktopChatHeaderProps) {
  const {
    hasConversation,
    userPlan,
    navigate,
    setSidebarOpen,
    conversationId,
  } = props;

  const isProTier = ["pro", "business", "elite"].includes(
    (userPlan || "").toLowerCase(),
  );

  return (
    <div
      className="hidden md:flex absolute top-0 inset-x-0 z-20 items-center gap-2 px-5 py-3 min-h-[56px] pointer-events-none [&>*]:pointer-events-auto"
      style={{
        background: "transparent",
        borderBottom: "1px solid rgba(60,50,40,0.08)",
      }}
    >
      {!hasConversation && !isProTier && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <UnlockProButton
            onClick={() => navigate("/pricing")}
            aria-label="Unlock Pro"
            text="Unlock Pro"
          />
        </div>
      )}

      <MobileSidebarButton onClick={() => setSidebarOpen(true)} />

      <div className="hidden md:flex items-center gap-2 min-w-0">
        {hasConversation && conversationId ? (
          <ChatOptionsDropdown variant="desktop" {...props} />
        ) : null}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {!hasConversation && <SocialLinks />}

        {hasConversation && conversationId && (
          <ChatOptionsDropdown variant="mobile" {...props} />
        )}
      </div>
    </div>
  );
}

