import { useState } from "react";
import { addParticipant } from "../api.js";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function AddParticipantForm({ leaderboardId, onAdded }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(event) {
    const selected = event.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_IMAGE_SIZE_BYTES) {
      setError(
        `${selected.name} is ${(selected.size / (1024 * 1024)).toFixed(1)}MB, which is over the 5MB limit. Choose a smaller image.`,
      );
      event.target.value = "";
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await addParticipant(leaderboardId, name.trim(), file);
      setName("");
      setFile(null);
      event.target.reset();
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Add participant</h3>
      <div className="form-row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
