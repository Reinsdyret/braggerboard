import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@kilden/designsystem";
import { cx } from "../utils/cx.js";

export const OUTCOMES = [
  { value: "TEAM_A", label: "Team A" },
  { value: "DRAW", label: "Draw" },
  { value: "TEAM_B", label: "Team B" },
];

export default function MatchTeamPicker({
  participants,
  teamA,
  teamB,
  outcome,
  onTeamAChange,
  onTeamBChange,
  onOutcomeChange,
}) {
  const chosenIds = [...teamA, ...teamB].filter(Boolean);

  function updateSlot(onChange, current, index, value) {
    const next = [...current];
    next[index] = value;
    onChange(next);
  }

  function optionsFor(currentValue) {
    return participants.filter((p) => p.id === currentValue || !chosenIds.includes(p.id));
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">Team A</p>
          {teamA.map((value, i) => (
            <Select
              key={i}
              value={value || undefined}
              onValueChange={(next) => updateSlot(onTeamAChange, teamA, i, next)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose participant…" />
              </SelectTrigger>
              <SelectContent>
                {optionsFor(value).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <span className="block self-center text-xs font-semibold text-neutral-text-subtle max-sm:hidden">VS</span>

        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">Team B</p>
          {teamB.map((value, i) => (
            <Select
              key={i}
              value={value || undefined}
              onValueChange={(next) => updateSlot(onTeamBChange, teamB, i, next)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose participant…" />
              </SelectTrigger>
              <SelectContent>
                {optionsFor(value).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">Winner</p>
        <div className="grid grid-cols-3 gap-2">
          {OUTCOMES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onOutcomeChange(opt.value)}
              className={cx(
                "rounded-lg border py-2 text-sm font-semibold transition-colors",
                outcome === opt.value
                  ? "border-neutral-border-strong bg-neutral-base-default text-neutral-base-contrast-default"
                  : "border-neutral-border-subtle text-neutral-text-subtle hover:border-neutral-border-default",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
