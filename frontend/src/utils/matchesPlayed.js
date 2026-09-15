import { MIN_MATCHES_TO_RANK } from "../constants.js";

/** Matches played, per participant id, in one pass over the match list. */
export function countMatchesPlayed(matches) {
  const played = new Map();
  for (const match of matches) {
    for (const p of [...match.teamA, ...match.teamB]) {
      played.set(p.participantId, (played.get(p.participantId) ?? 0) + 1);
    }
  }
  return played;
}

/**
 * Splits participants into those with enough matches to be ranked and those still provisional.
 * Provisional participants stay visible in the standings - they just don't compete for a rank,
 * and they're left out of the graph, where a one-point line is only noise.
 */
export function partitionByActivity(participants, matches) {
  const played = countMatchesPlayed(matches);
  const ranked = [];
  const provisional = [];
  for (const p of participants) {
    if ((played.get(p.id) ?? 0) >= MIN_MATCHES_TO_RANK) ranked.push(p);
    else provisional.push(p);
  }
  // Closest to qualifying first, so the group reads as a waiting list.
  provisional.sort((a, b) => (played.get(b.id) ?? 0) - (played.get(a.id) ?? 0) || a.name.localeCompare(b.name));
  return { ranked, provisional, played };
}
