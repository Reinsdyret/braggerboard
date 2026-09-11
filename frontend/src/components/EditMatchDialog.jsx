import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from "@kilden/designsystem";
import { AlertCircle } from "lucide-react";
import { updateMatch } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
import MatchTeamPicker from "./MatchTeamPicker.jsx";

export default function EditMatchDialog({ match, participants, isOpen, onOpenChange, onUpdated }) {
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [outcome, setOutcome] = useState("TEAM_A");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

  useEffect(() => {
    if (match) {
      setTeamA(match.teamA.map((p) => p.participantId));
      setTeamB(match.teamB.map((p) => p.participantId));
      setOutcome(match.outcome);
      setError(null);
    }
  }, [match]);

  if (!match) return null;

  const chosenIds = [...teamA, ...teamB].filter(Boolean);
  const allSlotsFilled = chosenIds.length === teamA.length + teamB.length;
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
      await updateMatch(match.id, teamA, teamB, outcome);
      addToast("Match updated");
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !submitting && onOpenChange(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit match</DialogTitle>
        </DialogHeader>

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

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={!canSubmit} className="flex-1">
              Save changes
            </Button>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-danger-text-default">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
