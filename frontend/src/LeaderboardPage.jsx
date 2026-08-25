import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { deleteParticipant, getLeaderboard, getRounds } from "./api.js";
import { saveRecent } from "./recents.js";
import StandingsTable from "./components/StandingsTable.jsx";
import AddParticipantForm from "./components/AddParticipantForm.jsx";
import AddRoundForm from "./components/AddRoundForm.jsx";
import RoundHistory from "./components/RoundHistory.jsx";

export default function LeaderboardPage() {
  const { leaderboardId } = useParams();
  const [leaderboard, setLeaderboard] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [details, roundList] = await Promise.all([
        getLeaderboard(leaderboardId),
        getRounds(leaderboardId),
      ]);
      setLeaderboard(details);
      setRounds(roundList);
      saveRecent(details);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [leaderboardId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDeleteParticipant(participant) {
    if (!confirm(`Remove ${participant.name} from the leaderboard? This also deletes their round history.`)) {
      return;
    }
    try {
      await deleteParticipant(participant.id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (error && !leaderboard) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <a href="#/">Back home</a>
      </div>
    );
  }

  if (!leaderboard) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <a className="back-link" href="#/">
        ← All leaderboards
      </a>
      <h1>{leaderboard.name}</h1>

      <div className="share-row">
        <span>Share this link so others can view and update this leaderboard:</span>
        <button className="link-button" onClick={copyLink}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <StandingsTable participants={leaderboard.participants} onDelete={handleDeleteParticipant} />

      <AddParticipantForm leaderboardId={leaderboardId} onAdded={refresh} />

      <AddRoundForm
        leaderboardId={leaderboardId}
        participants={leaderboard.participants}
        onAdded={refresh}
      />

      <h2>Round history</h2>
      <RoundHistory rounds={rounds} />
    </div>
  );
}
