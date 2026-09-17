import { useState } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { Button, Card, CardContent } from "@kilden/designsystem";
import { addMatch } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
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
  // Bumped whenever the picks are cleared: the selects hold their own state while a slot is
  // empty, so they have to be remounted or they keep showing the participants we just cleared.
  const [pickerKey, setPickerKey] = useState(0);
  const addToast = useToast();

  function clearPicks(size) {
    setTeamA(Array(size).fill(""));
    setTeamB(Array(size).fill(""));
    setPickerKey((key) => key + 1);
  }

  function handleTeamSizeChange(size) {
    setTeamSize(size);
    clearPicks(size);
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
      clearPicks(teamSize);
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
        <CardContent className="pt-6">
          <div className="mb-1 flex items-center gap-2">
            <Zap size={18} className="text-neutral-text-default" />
            <h3 className="text-sm font-semibold text-neutral-text-default">Add match</h3>
          </div>
          <p className="text-sm text-neutral-text-subtle">Add at least 2 participants to record a match.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Zap size={18} className="text-neutral-text-default" />
          <h3 className="text-sm font-semibold text-neutral-text-default">Add match</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">
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
                      ? "border-neutral-border-strong bg-neutral-base-default text-neutral-base-contrast-default"
                      : "border-neutral-border-subtle text-neutral-text-subtle hover:border-neutral-border-default",
                  )}
                >
                  {size}v{size}
                </button>
              ))}
            </div>
          </div>

          {participants.length < teamSize * 2 ? (
            <p className="text-sm text-neutral-text-subtle">
              Add at least {teamSize * 2} participants to record a {teamSize}v{teamSize} match.
            </p>
          ) : (
            <MatchTeamPicker
              key={pickerKey}
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
            disabled={!canSubmit || participants.length < teamSize * 2}
            className="self-start"
          >
            Save match
          </Button>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-danger-text-default">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
