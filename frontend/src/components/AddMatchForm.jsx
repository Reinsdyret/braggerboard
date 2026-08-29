import { useState } from "react";
import { Zap, AlertCircle } from "@untitledui/icons";
import { addMatch } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
import Button from "./ui/Button.jsx";
import Card from "./ui/Card.jsx";
import MatchTeamPicker from "./MatchTeamPicker.jsx";
import { MAX_TEAM_SIZE } from "../constants.js";
import { cx } from "../utils/cx.js";

const TEAM_SIZES = Array.from({ length: MAX_TEAM_SIZE }, (_, i) => i + 1);

export default function AddMatchForm({ leaderboardId, participants, onAdded }) {
  const [teamSize, setTeamSize] = useState(1);
  const [teamA, setTeamA] = useState(() => Array(1).fill(""));
  const [teamB, setTeamB] = useState(() => Array(1).fill(""));
  const [outcome, setOutcome] = useState("TEAM_A");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

  function handleTeamSizeChange(size) {
    setTeamSize(size);
    setTeamA(Array(size).fill(""));
    setTeamB(Array(size).fill(""));
  }

  const chosenIds = [...teamA, ...teamB].filter(Boolean);
  const allSlotsFilled = chosenIds.length === teamSize * 2;
  const noDuplicates = new Set(chosenIds).size === chosenIds.length;
  const canSubmit = allSlotsFilled && noDuplicates;

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

  if (participants.length < 2) {
    return (
      <Card>
        <div className="mb-1 flex items-center gap-2">
          <Zap size={18} className="text-brand-600" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add match</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Add at least 2 participants to record a match.</p>
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
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Team size
          </p>
          <div className="grid grid-cols-4 gap-2">
            {TEAM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleTeamSizeChange(size)}
                className={cx(
                  "rounded-lg border py-2 text-sm font-semibold transition-colors",
                  teamSize === size
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600",
                )}
              >
                {size}v{size}
              </button>
            ))}
          </div>
        </div>

        {participants.length < teamSize * 2 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add at least {teamSize * 2} participants to record a {teamSize}v{teamSize} match.
          </p>
        ) : (
          <MatchTeamPicker
            participants={participants}
            teamA={teamA}
            teamB={teamB}
            outcome={outcome}
            onTeamAChange={setTeamA}
            onTeamBChange={setTeamB}
            onOutcomeChange={setOutcome}
          />
        )}

        <Button
          type="submit"
          isLoading={submitting}
          isDisabled={!canSubmit || participants.length < teamSize * 2}
          className="self-start"
        >
          Save match
        </Button>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </p>
        )}
      </form>
    </Card>
  );
}
