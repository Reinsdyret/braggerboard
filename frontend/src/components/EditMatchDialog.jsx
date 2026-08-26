import { useEffect, useState } from "react";
import { ModalOverlay, Modal, Dialog, Heading } from "react-aria-components";
import { XClose, AlertCircle } from "@untitledui/icons";
import { updateMatch } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
import Button from "./ui/Button.jsx";
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
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!submitting}
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 backdrop-blur-[2px] sm:items-center sm:p-4"
    >
      <Modal className="animate-modal-in relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-[var(--shadow-popover)] outline-none sm:rounded-2xl">
        <Dialog className="outline-none">
          {({ close }) => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Heading slot="title" className="text-base font-semibold text-gray-900">
                  Edit match
                </Heading>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <XClose size={18} />
                </button>
              </div>

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
                <Button type="button" variant="secondary" onPress={close} isDisabled={submitting} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} isDisabled={!canSubmit} className="flex-1">
                  Save changes
                </Button>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-red-600">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </p>
              )}
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
