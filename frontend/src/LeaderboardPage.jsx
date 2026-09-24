import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, AlertCircle, Trash2 } from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "@kilden/designsystem";
import { deleteParticipant, getLeaderboard, getRounds, getMatches, deleteMatch } from "./api.js";
import { saveRecent, removeRecent } from "./recents.js";
import { useToast } from "./components/ui/ToastProvider.jsx";
import { computeEloTimelines, computeWinTimelines } from "./utils/contestantHistory.js";
import { partitionByActivity } from "./utils/matchesPlayed.js";
import StandingsTable from "./components/StandingsTable.jsx";
import ContestantsChart from "./components/ContestantsChart.jsx";
import AddParticipantForm from "./components/AddParticipantForm.jsx";
import AddRoundForm from "./components/AddRoundForm.jsx";
import RoundHistory from "./components/RoundHistory.jsx";
import AddMatchForm from "./components/AddMatchForm.jsx";
import MatchHistory from "./components/MatchHistory.jsx";
import PlayerCard from "./components/PlayerCard.jsx";
import EditMatchDialog from "./components/EditMatchDialog.jsx";
import EditParticipantDialog from "./components/EditParticipantDialog.jsx";
import DeleteLeaderboardDialog from "./components/DeleteLeaderboardDialog.jsx";

export default function LeaderboardPage() {
  const { leaderboardId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [deletingLeaderboard, setDeletingLeaderboard] = useState(false);
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

  // Errors (e.g. a wrong admin password) propagate so the dialog can show them inline.
  async function handleDeleteParticipant(participant, password) {
    await deleteParticipant(participant.id, password);
    addToast(`${participant.name} removed`, { type: "error", duration: 2500 });
    await refresh();
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

  function handleLeaderboardDeleted() {
    removeRecent(leaderboardId);
    addToast("Leaderboard deleted", { type: "error", duration: 2500 });
    navigate("/");
  }

  if (loadError && !leaderboard) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-background-tinted text-danger-text-default">
          <AlertCircle size={22} />
        </div>
        <p className="mb-4 text-sm text-neutral-text-subtle">{loadError}</p>
        <a href="#/" className="text-sm font-semibold text-neutral-text-default hover:underline">
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
  // Only Elo standings skew: win counts are cumulative totals, so a one-round player can't leapfrog
  // a regular, and round results only record winners - "rounds played" there would be a lie.
  const { ranked, provisional } = isElo
    ? partitionByActivity(leaderboard.participants, matches)
    : { ranked: leaderboard.participants, provisional: [] };
  // Before anyone has qualified there is nothing to plot, so fall back to the whole roster rather
  // than showing an empty-graph message on a board that clearly has matches.
  const charted = ranked.length > 0 ? ranked : leaderboard.participants;
  const colorOrder = [...leaderboard.participants]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((p) => p.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <a
        href="#/"
        className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-text-subtle transition-colors hover:text-neutral-text-default"
      >
        <ArrowLeft size={16} />
        All leaderboards
      </a>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-text-default sm:text-3xl">
          {leaderboard.name}
        </h1>
        {isElo && (
          <span className="rounded-full bg-accent-background-tinted px-2.5 py-1 text-xs font-semibold text-accent-text-default">
            Elo rating
          </span>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeletingLeaderboard(true)}
          className="ml-auto gap-1.5"
        >
          <Trash2 size={16} />
          Delete leaderboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between gap-3 !py-3.5">
          <span className="min-w-0 truncate text-sm text-neutral-text-subtle">
            <span className="sm:hidden">Share this leaderboard</span>
            <span className="max-sm:hidden">Share this link so others can view and update this leaderboard</span>
          </span>
          <Button variant="secondary" size="sm" onClick={copyLink} className="shrink-0 gap-1.5">
            <Copy size={16} />
            Copy link
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6">
        <StandingsTable
          participants={ranked}
          provisional={provisional}
          onDelete={handleDeleteParticipant}
          onSelect={setSelectedParticipant}
          scoringMode={leaderboard.scoringMode}
          matches={matches}
          rounds={rounds}
        />
      </div>

      {leaderboard.participants.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <ContestantsChart
                title={isElo ? "Rating over time" : "Wins over time"}
                valueLabel={isElo ? "Rating" : "Wins"}
                timelines={
                  isElo ? computeEloTimelines(charted, matches) : computeWinTimelines(charted, rounds)
                }
                colorOrder={colorOrder}
                emptyMessage={
                  isElo ? "Play a match to start tracking rating history." : "Add a round to start tracking wins."
                }
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <AddParticipantForm leaderboardId={leaderboardId} onAdded={refresh} />
      </div>

      <div className="mb-8">
        {isElo ? (
          <AddMatchForm
            leaderboardId={leaderboardId}
            participants={leaderboard.participants}
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

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-neutral-text-subtle uppercase">
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

      <DeleteLeaderboardDialog
        leaderboardId={leaderboardId}
        leaderboardName={leaderboard.name}
        isOpen={deletingLeaderboard}
        onOpenChange={setDeletingLeaderboard}
        onDeleted={handleLeaderboardDeleted}
      />
    </div>
  );
}
