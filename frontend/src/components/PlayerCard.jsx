import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@kilden/designsystem";
import { TrendingUp, TrendingDown, Users, Pencil } from "lucide-react";
import { getParticipantChanges } from "../api.js";
import Avatar from "./Avatar.jsx";
import RatingHistoryChart from "./RatingHistoryChart.jsx";
import StreakBadge from "./StreakBadge.jsx";
import ChangeLog from "./ChangeLog.jsx";
import { computeHeadToHead } from "../utils/headToHead.js";
import { computeRatingHistory } from "../utils/ratingHistory.js";
import { computeStreak } from "../utils/streak.js";
import { cx } from "../utils/cx.js";

function StatBox({ label, value }) {
  return (
    <div className="bg-neutral-background-tinted py-3 text-center">
      <p className="text-lg font-bold text-neutral-text-default">{value}</p>
      <p className="text-xs text-neutral-text-subtle">{label}</p>
    </div>
  );
}

function OpponentRow({ icon: Icon, iconClass, opponent }) {
  return (
    <div className="flex items-center gap-3 border border-neutral-border-subtle p-3">
      <div className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", iconClass)}>
        <Icon size={16} />
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-text-default">
        {opponent.name}
      </p>
      <p className="shrink-0 text-sm font-medium text-neutral-text-subtle">
        {opponent.wins}-{opponent.losses}
        {opponent.draws ? `-${opponent.draws}` : ""}
      </p>
    </div>
  );
}

function OpponentGroup({ title, icon, iconClass, opponents }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">{title}</p>
      {opponents.map((opponent) => (
        <OpponentRow key={opponent.id} icon={icon} iconClass={iconClass} opponent={opponent} />
      ))}
    </div>
  );
}

export default function PlayerCard({ participant, scoringMode, matches, isOpen, onOpenChange, onEdit }) {
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    if (!participant) {
      setChanges([]);
      return;
    }
    getParticipantChanges(participant.id)
      .then(setChanges)
      .catch(() => setChanges([]));
  }, [participant]);

  if (!participant) return null;

  const stats = scoringMode === "ELO" ? computeHeadToHead(participant.id, matches) : null;
  const opponents = stats?.opponents ?? [];
  const ratingHistory = scoringMode === "ELO" ? computeRatingHistory(participant.id, matches) : [];
  const streak = scoringMode === "ELO" ? computeStreak(participant.id, matches) : null;

  // Only frame it as "best vs toughest" when there's an actual gap between the top and bottom net
  // score - otherwise that framing is a contradiction, since it labels the exact same record as
  // both your best and worst matchup. When there IS a gap, everyone tied at the top (or bottom)
  // is shown - picking just one arbitrarily would hide an equally good (or bad) matchup.
  const topNet = opponents.length ? Math.max(...opponents.map((o) => o.net)) : null;
  const bottomNet = opponents.length ? Math.min(...opponents.map((o) => o.net)) : null;
  const hasClearSpread = topNet !== null && topNet > bottomNet;
  const bestGroup = hasClearSpread ? opponents.filter((o) => o.net === topNet) : [];
  const worstGroup = hasClearSpread ? opponents.filter((o) => o.net === bottomNet) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            onOpenChange(false);
            onEdit(participant);
          }}
          aria-label="Edit profile"
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-text-subtle hover:bg-neutral-surface-tinted hover:text-neutral-text-default"
        >
          <Pencil size={16} />
        </button>

        <div className="mb-5 flex flex-col items-center text-center">
          <Avatar participant={participant} size="lg" />
          <DialogTitle className="mt-3 text-lg font-bold text-neutral-text-default">
            {participant.name}
          </DialogTitle>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-neutral-text-subtle">
              {scoringMode === "ELO" ? `${participant.rating} rating` : `${participant.totalWins} wins`}
            </p>
            <StreakBadge streak={streak} />
          </div>
        </div>

        {scoringMode === "ELO" && stats && (
          <>
            <div className={cx("mb-5 grid gap-2", stats.draws > 0 ? "grid-cols-4" : "grid-cols-3")}>
              <StatBox label="Played" value={stats.played} />
              <StatBox label="Won" value={stats.wins} />
              <StatBox label="Lost" value={stats.losses} />
              {stats.draws > 0 && <StatBox label="Drawn" value={stats.draws} />}
            </div>

            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">
                Rating history
              </p>
              <RatingHistoryChart history={ratingHistory} />
            </div>

            {opponents.length === 0 && (
              <p className="text-center text-sm text-neutral-text-subtle">No matches recorded yet.</p>
            )}

            {opponents.length > 0 && hasClearSpread && (
              <div className="flex flex-col gap-4">
                <OpponentGroup
                  title="Best against"
                  icon={TrendingUp}
                  iconClass="bg-success-background-tinted text-success-text-default"
                  opponents={bestGroup}
                />
                <OpponentGroup
                  title="Toughest opponent"
                  icon={TrendingDown}
                  iconClass="bg-danger-background-tinted text-danger-text-default"
                  opponents={worstGroup}
                />
              </div>
            )}

            {opponents.length > 0 && !hasClearSpread && (
              <OpponentGroup
                title="Head to head"
                icon={Users}
                iconClass="bg-accent-background-tinted text-accent-text-default"
                opponents={opponents}
              />
            )}
          </>
        )}

        {changes.length > 0 && (
          <div className={scoringMode === "ELO" ? "mt-5" : ""}>
            <ChangeLog changes={changes} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
