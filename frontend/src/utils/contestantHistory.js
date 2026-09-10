import { computeRatingHistory, STARTING_RATING } from "./ratingHistory.js";

/**
 * One timeline per participant, each anchored at their starting rating on the day they
 * joined - so a line's start position on the time axis shows when they joined, and its
 * end shows the last time they played, even if that's long before "now".
 */
export function computeEloTimelines(participants, matches) {
  return participants.map((participant) => {
    const history = computeRatingHistory(participant.id, matches);
    const points = [
      { date: participant.createdAt, value: STARTING_RATING },
      ...history.map((h) => ({ date: h.date, value: h.rating })),
    ];
    return { participant, points };
  });
}

/**
 * One timeline per participant: cumulative wins, snapshotted after every round they took
 * part in. Rounds they sat out don't move their line, so gaps in activity stay visible.
 */
export function computeWinTimelines(participants, rounds) {
  const sorted = [...rounds].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return participants.map((participant) => {
    let total = 0;
    const points = [{ date: participant.createdAt, value: 0 }];
    for (const round of sorted) {
      const result = round.results.find((r) => r.participantId === participant.id);
      if (result) {
        total += result.wins;
        points.push({ date: round.createdAt, value: total });
      }
    }
    return { participant, points };
  });
}
