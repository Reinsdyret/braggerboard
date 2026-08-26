import { outcomeFor } from "./headToHead.js";

/**
 * The participant's current streak: how many of their most recent matches in a row share the
 * same result. A draw immediately breaks (and doesn't count toward) a streak. Only length >= 2
 * is considered a real streak - a single result isn't one.
 */
export function computeStreak(participantId, matches) {
  const results = matches
    .filter((m) => m.teamA.some((p) => p.participantId === participantId) || m.teamB.some((p) => p.participantId === participantId))
    .map((m) => {
      const inTeamA = m.teamA.some((p) => p.participantId === participantId);
      return { createdAt: m.createdAt, result: outcomeFor(inTeamA ? "A" : "B", m.outcome) };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (results.length === 0 || results[0].result === "draw") {
    return { type: null, length: 0 };
  }

  const type = results[0].result;
  let length = 0;
  for (const r of results) {
    if (r.result !== type) break;
    length += 1;
  }

  return { type, length: length >= 2 ? length : 0 };
}
