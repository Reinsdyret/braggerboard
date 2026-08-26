import Select from "./ui/Select.jsx";
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
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Team A</p>
          {teamA.map((value, i) => (
            <Select key={i} value={value} onChange={(e) => updateSlot(onTeamAChange, teamA, i, e.target.value)}>
              <option value="">Choose participant…</option>
              {optionsFor(value).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          ))}
        </div>

        <span className="hidden self-center text-xs font-semibold text-gray-400 sm:block">VS</span>

        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Team B</p>
          {teamB.map((value, i) => (
            <Select key={i} value={value} onChange={(e) => updateSlot(onTeamBChange, teamB, i, e.target.value)}>
              <option value="">Choose participant…</option>
              {optionsFor(value).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Winner</p>
        <div className="grid grid-cols-3 gap-2">
          {OUTCOMES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onOutcomeChange(opt.value)}
              className={cx(
                "rounded-lg border py-2 text-sm font-semibold transition-colors",
                outcome === opt.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300",
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
