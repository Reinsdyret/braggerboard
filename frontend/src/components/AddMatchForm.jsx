import { useState } from "react";
import { Zap, AlertCircle } from "@untitledui/icons";
import { addMatch } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
import Button from "./ui/Button.jsx";
import Card from "./ui/Card.jsx";
import Select from "./ui/Select.jsx";
import { cx } from "../utils/cx.js";

const TEAM_SIZE = { ONE_V_ONE: 1, TWO_V_TWO: 2 };

const OUTCOMES = [
  { value: "TEAM_A", label: "Team A" },
  { value: "DRAW", label: "Draw" },
  { value: "TEAM_B", label: "Team B" },
];

export default function AddMatchForm({ leaderboardId, participants, matchFormat, onAdded }) {
  const teamSize = TEAM_SIZE[matchFormat] ?? 1;
  const [teamA, setTeamA] = useState(() => Array(teamSize).fill(""));
  const [teamB, setTeamB] = useState(() => Array(teamSize).fill(""));
  const [outcome, setOutcome] = useState("TEAM_A");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

  function updateSlot(setTeam, index, value) {
    setTeam((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  const chosenIds = [...teamA, ...teamB].filter(Boolean);
  const allSlotsFilled = chosenIds.length === teamSize * 2;
  const noDuplicates = new Set(chosenIds).size === chosenIds.length;
  const canSubmit = allSlotsFilled && noDuplicates;

  function optionsFor(currentValue) {
    return participants.filter((p) => p.id === currentValue || !chosenIds.includes(p.id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) {
      setError(
        !allSlotsFilled ? "Pick a participant for every slot" : "Each participant can only play once per match",
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await addMatch(leaderboardId, teamA, teamB, outcome);
      addToast("Match recorded");
      setTeamA(Array(teamSize).fill(""));
      setTeamB(Array(teamSize).fill(""));
      setOutcome("TEAM_A");
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (participants.length < teamSize * 2) {
    return (
      <Card>
        <div className="mb-1 flex items-center gap-2">
          <Zap size={18} className="text-brand-600" />
          <h3 className="text-sm font-semibold text-gray-700">Add match</h3>
        </div>
        <p className="text-sm text-gray-500">
          Add at least {teamSize * 2} participants to record a match.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Zap size={18} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-gray-700">Add match</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Team A</p>
            {teamA.map((value, i) => (
              <Select key={i} value={value} onChange={(e) => updateSlot(setTeamA, i, e.target.value)}>
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
              <Select key={i} value={value} onChange={(e) => updateSlot(setTeamB, i, e.target.value)}>
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
                onClick={() => setOutcome(opt.value)}
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

        <Button type="submit" isLoading={submitting} isDisabled={!canSubmit} className="self-start">
          Save match
        </Button>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </p>
        )}
      </form>
    </Card>
  );
}
