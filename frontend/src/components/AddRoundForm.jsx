import { useState } from "react";
import { addRound } from "../api.js";

export default function AddRoundForm({ leaderboardId, participants, onAdded }) {
  const [label, setLabel] = useState("");
  const [wins, setWins] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function setWinsFor(participantId, value) {
    setWins((prev) => ({ ...prev, [participantId]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const results = participants
      .map((p) => ({ participantId: p.id, wins: parseInt(wins[p.id], 10) || 0 }))
      .filter((r) => r.wins > 0);

    if (results.length === 0) {
      setError("Enter at least one win for a participant");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await addRound(leaderboardId, label.trim(), results);
      setLabel("");
      setWins({});
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (participants.length === 0) {
    return null;
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Add round</h3>
      <input
        type="text"
        placeholder="Round label (optional), e.g. Week 3"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="round-label-input"
      />
      <div className="round-inputs">
        {participants.map((p) => (
          <label key={p.id} className="round-input-row">
            <span>{p.name}</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={wins[p.id] ?? ""}
              onChange={(e) => setWinsFor(p.id, e.target.value)}
            />
          </label>
        ))}
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save round"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
