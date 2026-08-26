import { useState } from "react";
import { Plus, Minus, Flag01, AlertCircle } from "@untitledui/icons";
import { addRound } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
import Button from "./ui/Button.jsx";
import Card from "./ui/Card.jsx";
import Input from "./ui/Input.jsx";

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function AddRoundForm({ leaderboardId, participants, onAdded }) {
  const [label, setLabel] = useState("");
  const [wins, setWins] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

  function setWinsFor(participantId, value) {
    setWins((prev) => ({ ...prev, [participantId]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const results = participants
      .map((p) => ({ participantId: p.id, wins: wins[p.id] ?? 0 }))
      .filter((r) => r.wins > 0);

    if (results.length === 0) {
      setError("Give at least one participant a win for this round");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await addRound(leaderboardId, label.trim(), results);
      addToast(label.trim() ? `"${label.trim()}" saved` : "Round saved");
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
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Flag01 size={18} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-gray-700">Add round</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Round label (optional), e.g. Week 3"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <span className="truncate text-sm font-medium text-gray-800">{p.name}</span>
              <Stepper value={wins[p.id] ?? 0} onChange={(v) => setWinsFor(p.id, v)} />
            </div>
          ))}
        </div>

        <Button type="submit" isLoading={submitting} className="self-start">
          Save round
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
