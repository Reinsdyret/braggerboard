import { useState } from "react";
import { Zap, AlertCircle } from "@untitledui/icons";
import { addMatch } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
import Button from "./ui/Button.jsx";
import Card from "./ui/Card.jsx";
import MatchTeamPicker from "./MatchTeamPicker.jsx";

const TEAM_SIZE = { ONE_V_ONE: 1, TWO_V_TWO: 2 };

export default function AddMatchForm({ leaderboardId, participants, matchFormat, onAdded }) {
  const teamSize = TEAM_SIZE[matchFormat] ?? 1;
  const [teamA, setTeamA] = useState(() => Array(teamSize).fill(""));
  const [teamB, setTeamB] = useState(() => Array(teamSize).fill(""));
  const [outcome, setOutcome] = useState("TEAM_A");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

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
        <MatchTeamPicker
          participants={participants}
          teamA={teamA}
          teamB={teamB}
          outcome={outcome}
          onTeamAChange={setTeamA}
          onTeamBChange={setTeamB}
          onOutcomeChange={setOutcome}
        />

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
