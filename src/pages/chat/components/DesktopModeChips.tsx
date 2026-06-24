import { Atom, Telescope, Presentation, GraduationCap, NotebookPen, type LucideIcon } from "lucide-react";
import type { AgentDef } from "@/lib/agentRegistry";

type DesktopChipId = "megsy-os" | "deep-research" | "slides" | "learning" | "docs";

interface DesktopModeChipsProps {
  chatMode: string;
  selectedAgent: AgentDef | null;
  handleModeChange: (mode: any) => void;
  setChatMode: (mode: any) => void;
  setSelectedAgent: (agent: AgentDef | null) => void;
  tryActivateMegsyOs: () => void;
}

const CHIPS: { id: DesktopChipId; label: string; Icon: LucideIcon; color: string }[] = [
  { id: "megsy-os",      label: "Megsy OS",      Icon: Atom,          color: "hsl(var(--brand-action))" },
  { id: "deep-research", label: "Deep Research", Icon: Telescope,     color: "hsl(var(--brand-blush))" },
  { id: "slides",        label: "Slides",        Icon: Presentation,  color: "#FFB347" },
  { id: "learning",      label: "Learning",      Icon: GraduationCap, color: "#7DD3FC" },
  { id: "docs",          label: "Docs",          Icon: NotebookPen,   color: "#FF9F7A" },
];

// Color-mix tint helper — works with hex, hsl(var(--…)), or any CSS color.
const tint = (color: string, a: number) =>
  `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;

export const DesktopModeChips = ({
  chatMode,
  selectedAgent,
  handleModeChange,
  setChatMode,
  setSelectedAgent,
  tryActivateMegsyOs,
}: DesktopModeChipsProps) => {
  return (
    <>
      {CHIPS.map((a) => {
        const active =
          a.id === "docs"
            ? selectedAgent?.id === "docs"
            : a.id === "megsy-os"
              ? chatMode === "operator"
              : chatMode === a.id;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              if (a.id === "docs") {
                if (active) {
                  setSelectedAgent(null);
                } else {
                  setChatMode("normal");
                  import("@/lib/agentRegistry").then(({ AGENTS }) => {
                    const def = AGENTS.find((x) => x.id === "docs");
                    if (def) setSelectedAgent(def);
                  });
                }
              } else if (a.id === "megsy-os") {
                if (active) handleModeChange("normal");
                else tryActivateMegsyOs();
              } else {
                handleModeChange(active ? "normal" : a.id);
              }
            }}
            style={
              active
                ? {
                    backgroundColor: a.color,
                    color: "hsl(var(--brand-ink))",
                    borderColor: "hsl(var(--brand-ink))",
                    boxShadow: `2px 2px 0 ${tint(a.color, 0.35)}`,
                  }
                : {
                    backgroundColor: "hsl(var(--surface-1))",
                    color: "hsl(var(--brand-parchment))",
                    borderColor: tint(a.color, 0.55),
                    boxShadow: `2px 2px 0 ${tint(a.color, 0.18)}`,
                  }
            }
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border-2 text-[12px] font-black shrink-0 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <a.Icon className="w-3.5 h-3.5" strokeWidth={2.2} style={!active ? { color: a.color } : undefined} />
            <span>{a.label}</span>
          </button>
        );
      })}
    </>
  );
};

export default DesktopModeChips;
