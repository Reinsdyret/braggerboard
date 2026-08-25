import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLeaderboard } from "./api.js";
import { loadRecents, saveRecent } from "./recents.js";

export default function Home() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recents, setRecents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const leaderboard = await createLeaderboard(name.trim());
      saveRecent(leaderboard);
      navigate(`/l/${leaderboard.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Leaderboard</h1>
      <p className="subtitle">Create a leaderboard, share the link, track who's winning.</p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Leaderboard name, e.g. Friday Darts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create leaderboard"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>

      {recents.length > 0 && (
        <div className="recents">
          <h3>Your recent leaderboards</h3>
          <ul>
            {recents.map((r) => (
              <li key={r.id}>
                <a href={`#/l/${r.id}`}>{r.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
