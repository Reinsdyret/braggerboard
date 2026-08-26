import { ModalOverlay, Modal, Dialog, Heading } from "react-aria-components";
import { XClose, TrendUp01, TrendDown01, Users01 } from "@untitledui/icons";
import Avatar from "./Avatar.jsx";
import RatingHistoryChart from "./RatingHistoryChart.jsx";
import { computeHeadToHead } from "../utils/headToHead.js";
import { computeRatingHistory } from "../utils/ratingHistory.js";
import { cx } from "../utils/cx.js";

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 py-3 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function OpponentRow({ icon: Icon, iconClass, opponent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
      <div className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", iconClass)}>
        <Icon size={16} />
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{opponent.name}</p>
      <p className="shrink-0 text-sm font-medium text-gray-500">
        {opponent.wins}-{opponent.losses}
        {opponent.draws ? `-${opponent.draws}` : ""}
      </p>
    </div>
  );
}

function OpponentGroup({ title, icon, iconClass, opponents }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{title}</p>
      {opponents.map((opponent) => (
        <OpponentRow key={opponent.id} icon={icon} iconClass={iconClass} opponent={opponent} />
      ))}
    </div>
  );
}

export default function PlayerCard({ participant, scoringMode, matches, isOpen, onOpenChange }) {
  if (!participant) return null;

  const stats = scoringMode === "ELO" ? computeHeadToHead(participant.id, matches) : null;
  const opponents = stats?.opponents ?? [];
  const ratingHistory = scoringMode === "ELO" ? computeRatingHistory(participant.id, matches) : [];

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
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 backdrop-blur-[2px] sm:items-center sm:p-4"
    >
      <Modal className="animate-modal-in relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[var(--shadow-popover)] outline-none sm:rounded-2xl">
        <Dialog className="outline-none">
          {({ close }) => (
            <>
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <XClose size={18} />
              </button>

              <div className="mb-5 flex flex-col items-center text-center">
                <Avatar participant={participant} size="lg" />
                <Heading slot="title" className="mt-3 text-lg font-bold text-gray-900">
                  {participant.name}
                </Heading>
                <p className="text-sm text-gray-500">
                  {scoringMode === "ELO" ? `${participant.rating} rating` : `${participant.totalWins} wins`}
                </p>
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
                    <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Rating history
                    </p>
                    <RatingHistoryChart history={ratingHistory} />
                  </div>

                  {opponents.length === 0 && (
                    <p className="text-center text-sm text-gray-500">No matches recorded yet.</p>
                  )}

                  {opponents.length > 0 && hasClearSpread && (
                    <div className="flex flex-col gap-4">
                      <OpponentGroup
                        title="Best against"
                        icon={TrendUp01}
                        iconClass="bg-green-100 text-green-600"
                        opponents={bestGroup}
                      />
                      <OpponentGroup
                        title="Toughest opponent"
                        icon={TrendDown01}
                        iconClass="bg-red-100 text-red-500"
                        opponents={worstGroup}
                      />
                    </div>
                  )}

                  {opponents.length > 0 && !hasClearSpread && (
                    <OpponentGroup
                      title="Head to head"
                      icon={Users01}
                      iconClass="bg-brand-100 text-brand-600"
                      opponents={opponents}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
