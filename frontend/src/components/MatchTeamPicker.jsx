import { useState } from "react";
import { Combobox, ComboboxItem } from "@kilden/designsystem";
import { cx } from "../utils/cx.js";

export const OUTCOMES = [
  { value: "TEAM_A", label: "Team A" },
  { value: "DRAW", label: "Draw" },
  { value: "TEAM_B", label: "Team B" },
];

/**
 * A participant slot you can type into to search by name. Kilden's built-in filtering matches on
 * the item value, which is a UUID here, so it's switched off and the list is filtered by name
 * instead. Case-insensitive substring match: "sin" finds Sindre. The search is cleared whenever the
 * list closes, so the closed field (which takes its label from the items) always has every name.
 */
function ParticipantCombobox({ value, options, onChange, label }) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const matches = query ? options.filter((p) => p.name.toLowerCase().includes(query)) : options;

  return (
    <Combobox
      value={value}
      onValueChange={(next) => {
        setSearch("");
        // Kilden reports "" when the list closes with nothing typed, e.g. clicking into a filled
        // slot and back out. That would silently wipe the pick, so only real choices go through.
        if (next) onChange(next);
      }}
      onSearchChange={setSearch}
      onOpenChange={(open) => !open && setSearch("")}
      shouldFilter={false}
      aria-label={label}
      placeholder="Search participant…"
      emptyMessage="No participant with that name"
    >
      {matches.map((p) => (
        <ComboboxItem key={p.id} value={p.id}>
          {p.name}
        </ComboboxItem>
      ))}
    </Combobox>
  );
}

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
            <ParticipantCombobox
              key={i}
              value={value}
              options={optionsFor(value)}
              onChange={(next) => updateSlot(onTeamAChange, teamA, i, next)}
              label={`Team A, player ${i + 1}`}
            />
          ))}
        </div>

        <span className="block self-center text-xs font-semibold text-neutral-text-subtle max-sm:hidden">VS</span>

        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">Team B</p>
          {teamB.map((value, i) => (
            <ParticipantCombobox
              key={i}
              value={value}
              options={optionsFor(value)}
              onChange={(next) => updateSlot(onTeamBChange, teamB, i, next)}
              label={`Team B, player ${i + 1}`}
            />
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
