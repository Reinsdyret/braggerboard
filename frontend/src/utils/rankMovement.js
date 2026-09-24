import { MIN_MATCHES_TO_RANK } from "../constants.js";
import { computeRatingsAsOf, STARTING_RATING } from "./ratingHistory.js";

/**
 * Midnight at the start of the current week, in the viewer's own timezone. Sunday's getDay() is
 * 0, so it belongs to the week that began six days earlier rather than starting a new one.
 */
export function startOfWeek(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/** The backend's standings order: best score first, name as the tie-break (LeaderboardService). */
function rankByScore(entries) {
  const ranks = new Map();
  [...entries]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .forEach((entry, index) => ranks.set(entry.id, index + 1));
  return ranks;
}

function existedAt(participants, cutoff) {
  return participants.filter((p) => new Date(p.createdAt) <= cutoff);
}

/**
 * Elo standings as of `cutoff`. Applies the same provisional rule the live table does, using
 * the match count at the time - so someone who had only just joined then is correctly treated
 * as unranked rather than as having been in last place.
 */
function eloRanksAsOf(participants, matches, cutoff) {
  const past = matches.filter((m) => new Date(m.createdAt) <= cutoff);
  const ratings = computeRatingsAsOf(past, cutoff);

  const played = new Map();
  for (const match of past) {
    for (const p of [...match.teamA, ...match.teamB]) {
      played.set(p.participantId, (played.get(p.participantId) ?? 0) + 1);
    }
  }

  return rankByScore(
    existedAt(participants, cutoff)
      .filter((p) => (played.get(p.id) ?? 0) >= MIN_MATCHES_TO_RANK)
      .map((p) => ({ id: p.id, name: p.name, score: ratings.get(p.id) ?? STARTING_RATING })),
  );
}

/** Win-count standings as of `cutoff`: wins are cumulative, so just total the earlier rounds. */
function winCountRanksAsOf(participants, rounds, cutoff) {
  const wins = new Map();
  for (const round of rounds) {
    if (new Date(round.createdAt) > cutoff) continue;
    for (const result of round.results) {
      wins.set(result.participantId, (wins.get(result.participantId) ?? 0) + result.wins);
    }
  }

  return rankByScore(
    existedAt(participants, cutoff).map((p) => ({ id: p.id, name: p.name, score: wins.get(p.id) ?? 0 })),
  );
}

/**
 * How far each currently ranked participant has climbed or fallen this week, by rebuilding the
 * standings as they stood when the week began - last week's closing table - and diffing the two
 * orders. A positive `delta` is places gained. Early on a Monday that table is only minutes old
 * and every row will read as unchanged, which is the point: the week starts level.
 *
 * `previousRank` is null for someone who wasn't ranked back then (they hadn't joined yet, or
 * were still provisional) - there is no movement to report, only the fact that they're new.
 * Returns an empty map when nobody was ranked at the cutoff: on a board with no history from
 * before this week every row would read "new", which says nothing.
 */
export function computeRankMovement({
  participants,
  matches = [],
  rounds = [],
  scoringMode = "WIN_COUNT",
  cutoff = startOfWeek(),
}) {
  const previousRanks =
    scoringMode === "ELO"
      ? eloRanksAsOf(participants, matches, cutoff)
      : winCountRanksAsOf(participants, rounds, cutoff);

  const movement = new Map();
  if (previousRanks.size === 0) return movement;

  participants.forEach((p, index) => {
    const previousRank = previousRanks.get(p.id) ?? null;
    movement.set(p.id, {
      previousRank,
      delta: previousRank === null ? null : previousRank - (index + 1),
    });
  });
  return movement;
}
