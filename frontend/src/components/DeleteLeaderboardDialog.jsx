import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from "@kilden/designsystem";
import { deleteLeaderboard } from "../api.js";

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
    <Dialog open={isOpen} onOpenChange={(open) => !submitting && onOpenChange(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete leaderboard</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-neutral-text-subtle">
            This permanently deletes <span className="font-medium text-neutral-text-default">{leaderboardName}</span>,
            its participants, and all recorded history. Enter the admin password to confirm.
          </p>

          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ?? undefined}
            autoFocus
            required
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
            <Button
              type="submit"
              variant="destructive"
              isLoading={submitting}
              disabled={!password}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
