import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowNarrowLeft, Copy01, AlertCircle } from "@untitledui/icons";
import { deleteParticipant, getLeaderboard, getRounds, getMatches, deleteMatch } from "./api.js";
import { saveRecent } from "./recents.js";
import { useToast } from "./components/ui/ToastProvider.jsx";
import Button from "./components/ui/Button.jsx";
import Card from "./components/ui/Card.jsx";
import Skeleton from "./components/ui/Skeleton.jsx";
import StandingsTable from "./components/StandingsTable.jsx";
import AddParticipantForm from "./components/AddParticipantForm.jsx";
import AddRoundForm from "./components/AddRoundForm.jsx";
import RoundHistory from "./components/RoundHistory.jsx";
import AddMatchForm from "./components/AddMatchForm.jsx";
import MatchHistory from "./components/MatchHistory.jsx";
import PlayerCard from "./components/PlayerCard.jsx";
import EditMatchDialog from "./components/EditMatchDialog.jsx";
import EditParticipantDialog from "./components/EditParticipantDialog.jsx";

export default function LeaderboardPage() {
  const { leaderboardId } = useParams();
  const [leaderboard, setLeaderboard] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const addToast = useToast();

  const refresh = useCallback(async () => {
    try {
      const [details, roundList, matchList] = await Promise.all([
        getLeaderboard(leaderboardId),
        getRounds(leaderboardId),
        getMatches(leaderboardId),
      ]);
      setLeaderboard(details);
      setRounds(roundList);
      setMatches(matchList);
      saveRecent(details);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message);
    }
  }, [leaderboardId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDeleteParticipant(participant) {
    try {
      await deleteParticipant(participant.id);
      addToast(`${participant.name} removed`, { type: "error", duration: 2500 });
      await refresh();
    } catch (err) {
      addToast(err.message, { type: "error" });
    }
  }

  async function handleDeleteMatch(match) {
    try {
      await deleteMatch(match.id);
      addToast("Match deleted", { type: "error", duration: 2500 });
      await refresh();
    } catch (err) {
      addToast(err.message, { type: "error" });
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      addToast("Link copied to clipboard");
    });
  }

  if (loadError && !leaderboard) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-400/10">
          <AlertCircle size={22} />
        </div>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{loadError}</p>
        <a href="#/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          ← Back home
        </a>
      </div>
    );
  }

  if (!leaderboard) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="mb-4 h-4 w-28" />
        <Skeleton className="mb-6 h-8 w-56" />
        <Skeleton className="mb-6 h-14 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const isElo = leaderboard.scoringMode === "ELO";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <a
        href="#/"
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowNarrowLeft size={16} />
        All leaderboards
      </a>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
          {leaderboard.name}
        </h1>
        {isElo && (
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
            Elo · {leaderboard.teamSize}v{leaderboard.teamSize}
          </span>
        )}
      </div>

      <Card className="mb-6 flex items-center justify-between gap-3 !p-3.5 sm:!p-4">
        <span className="min-w-0 truncate text-sm text-gray-500 dark:text-gray-400">
          <span className="sm:hidden">Share this leaderboard</span>
          <span className="hidden sm:inline">Share this link so others can view and update this leaderboard</span>
        </span>
        <Button variant="secondary" size="sm" iconLeading={Copy01} onPress={copyLink} className="shrink-0">
          Copy link
        </Button>
      </Card>

      <div className="mb-6">
        <StandingsTable
          participants={leaderboard.participants}
          onDelete={handleDeleteParticipant}
          onSelect={setSelectedParticipant}
          scoringMode={leaderboard.scoringMode}
          matches={matches}
        />
      </div>

      <div className="mb-6">
        <AddParticipantForm leaderboardId={leaderboardId} onAdded={refresh} />
      </div>

      <div className="mb-8">
        {isElo ? (
          <AddMatchForm
            leaderboardId={leaderboardId}
            participants={leaderboard.participants}
            teamSize={leaderboard.teamSize}
            onAdded={refresh}
          />
        ) : (
          <AddRoundForm
            leaderboardId={leaderboardId}
            participants={leaderboard.participants}
            onAdded={refresh}
          />
        )}
      </div>

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {isElo ? "Match history" : "Round history"}
      </h2>
      {isElo ? (
        <MatchHistory matches={matches} onEdit={setEditingMatch} onDelete={handleDeleteMatch} />
      ) : (
        <RoundHistory rounds={rounds} />
      )}

      <PlayerCard
        participant={selectedParticipant}
        scoringMode={leaderboard.scoringMode}
        matches={matches}
        isOpen={Boolean(selectedParticipant)}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
        onEdit={setEditingParticipant}
      />

      {isElo && (
        <EditMatchDialog
          match={editingMatch}
          participants={leaderboard.participants}
          isOpen={Boolean(editingMatch)}
          onOpenChange={(open) => !open && setEditingMatch(null)}
          onUpdated={refresh}
        />
      )}

      <EditParticipantDialog
        participant={editingParticipant}
        isOpen={Boolean(editingParticipant)}
        onOpenChange={(open) => !open && setEditingParticipant(null)}
        onUpdated={refresh}
      />
    </div>
  );
}
