import { AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";
import ComposerAttachments from "./ComposerAttachments";
import { RemoteAiBusyBanner } from "./RemoteAiBusyBanner";
import { MentionDropdown } from "./MentionDropdown";
import { ComposerMobileModeBar } from "./ComposerMobileModeBar";
import { ComposerAnimatedInput } from "./ComposerAnimatedInput";
import { DesktopIntegrationsStrip } from "./DesktopIntegrationsStrip";
import { DesktopModeChips } from "./DesktopModeChips";
import type { AttachedFile } from "../hooks/useAttachments";

interface ChatComposerSectionProps {
  sidebarCollapsed: boolean;
  loadingMessages: boolean;
  messagesLength: number;
  attachedFiles: AttachedFile[];
  removeAttachment: (i: number) => void;
  remoteAiBusy: { name: string } | null;
  plusMenuOpen: boolean;
  renderPlusMenu: () => ReactNode;
  mentionQuery: { q: string } | null;
  members: any[];
  onlineUsers: any;
  colorForUser: (id?: string | null) => any;
  insertMention: (name: string) => void;
  composerMobileModeBarProps: Record<string, any>;
  composerAnimatedInputProps: Record<string, any>;
  navigate: any;
  desktopModeChipsProps: Record<string, any>;
}

/**
 * Floating bottom composer dock. Lifts to vertical-center on empty desktop
 * state, otherwise sticks to the bottom. Hosts attachments preview, busy
 * banner, plus-menu overlay, @mention dropdown, mobile mode bar, animated
 * input, desktop integrations strip, and the desktop mode chips row.
 */
export function ChatComposerSection(props: ChatComposerSectionProps) {
  const {
    sidebarCollapsed,
    loadingMessages,
    messagesLength,
    attachedFiles,
    removeAttachment,
    remoteAiBusy,
    plusMenuOpen,
    renderPlusMenu,
    mentionQuery,
    members,
    onlineUsers,
    colorForUser,
    insertMention,
    composerMobileModeBarProps,
    composerAnimatedInputProps,
    navigate,
    desktopModeChipsProps,
  } = props;

  const isEmpty = messagesLength === 0 && !loadingMessages;
  const [modesShown, setModesShown] = useState(true);

  return (
    <div
      style={{
        ["--sb-left" as any]: (sidebarCollapsed ? 56 : 260) + "px",
      }}
      className={`fixed left-0 md:left-[var(--sb-left)] right-0 bottom-[var(--kb-offset,0px)] z-30 px-2 md:px-6 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] md:pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 md:pt-6 pointer-events-none transition-[left,top,bottom] duration-200 ease-out bg-transparent ${
        isEmpty
          ? "md:bottom-auto md:top-[calc(50%+40px)] md:-translate-y-1/2 md:bg-transparent md:backdrop-blur-0 md:border-0"
          : "md:bg-transparent md:backdrop-blur-0 md:border-0"
      }`}
    >
      <div className="max-w-3xl mx-auto space-y-2 pointer-events-auto">
        <ComposerAttachments files={attachedFiles} onRemove={removeAttachment} />

        <RemoteAiBusyBanner remoteAiBusy={remoteAiBusy} />

        <div className="relative mx-auto w-full max-w-3xl">
          <div data-tour="composer">
            <AnimatePresence>{plusMenuOpen && renderPlusMenu()}</AnimatePresence>

            {mentionQuery && (
              <MentionDropdown
                members={members}
                query={mentionQuery.q}
                onlineUsers={onlineUsers}
                colorForUser={colorForUser}
                insertMention={insertMention}
              />
            )}

            <ComposerMobileModeBar {...(composerMobileModeBarProps as any)} forceHidden={!modesShown} />

            <ComposerAnimatedInput
              {...(composerAnimatedInputProps as any)}
              modesToggleVisible
              modesShown={modesShown}
              onToggleModes={() => setModesShown((v) => !v)}
            />
          </div>

          {messagesLength === 0 && !sidebarCollapsed && (
            <DesktopIntegrationsStrip navigate={navigate} />
          )}

          <div
            className={`${messagesLength === 0 ? "hidden md:flex" : "hidden"} flex-wrap items-center justify-center gap-1.5 mt-2 px-1`}
          >
            <DesktopModeChips {...(desktopModeChipsProps as any)} />
          </div>
        </div>
      </div>
    </div>
  );
}
