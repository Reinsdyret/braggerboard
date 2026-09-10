import { useEffect, useState } from "react";
import { ModalOverlay, Modal, Dialog, Heading } from "react-aria-components";
import { X, AlertCircle } from "lucide-react";
import { deleteLeaderboard } from "../api.js";
import Button from "./ui/Button.jsx";
import Input from "./ui/Input.jsx";

export default function DeleteLeaderboardDialog({ leaderboardId, leaderboardName, isOpen, onOpenChange, onDeleted }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError(null);
    }
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await deleteLeaderboard(leaderboardId, password);
      onDeleted();
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
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-[#dedede]/50 backdrop-blur-[2px] sm:items-center sm:p-4"
    >
      <Modal className="animate-modal-in relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-[var(--shadow-popover)] outline-none sm:rounded-2xl">
        <Dialog className="outline-none">
          {({ close }) => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Heading slot="title" className="text-base font-semibold text-gray-900">
                  Delete leaderboard
                </Heading>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-600">
                This permanently deletes <span className="font-medium text-gray-700">{leaderboardName}</span>,
                its participants, and all recorded history. Enter the admin password to confirm.
              </p>

              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(error)}
                autoFocus
                required
              />

              <div className="flex gap-2">
                <Button type="button" variant="secondary" onPress={close} isDisabled={submitting} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger-solid"
                  isLoading={submitting}
                  isDisabled={!password}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-[#9c0f0f]">
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
