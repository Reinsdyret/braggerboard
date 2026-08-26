const STARTING_RATING = 1000;
const K_FACTOR = 32;

/**
 * Mirrors the backend's EloCalculator exactly (same starting rating, K-factor, and
 * team-average logic) but keeps a snapshot after every match the given participant played,
 * instead of only the final rating. Must replay ALL matches (not just the participant's own)
 * since a teammate's or opponent's rating at match time depends on matches they played
 * against other people too.
 */
export function computeRatingHistory(participantId, allMatches) {
  const ratings = new Map();
  const history = [];

  const sorted = [...allMatches].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  for (const match of sorted) {
    const teamAIds = match.teamA.map((p) => p.participantId);
    const teamBIds = match.teamB.map((p) => p.participantId);
    const getRating = (id) => ratings.get(id) ?? STARTING_RATING;

    const ratingA = teamAIds.reduce((sum, id) => sum + getRating(id), 0) / teamAIds.length;
    const ratingB = teamBIds.reduce((sum, id) => sum + getRating(id), 0) / teamBIds.length;
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const scoreA = match.outcome === "TEAM_A" ? 1 : match.outcome === "TEAM_B" ? 0 : 0.5;

    const deltaA = K_FACTOR * (scoreA - expectedA);
    const deltaB = -deltaA;

    teamAIds.forEach((id) => ratings.set(id, getRating(id) + deltaA));
    teamBIds.forEach((id) => ratings.set(id, getRating(id) + deltaB));

    if (teamAIds.includes(participantId) || teamBIds.includes(participantId)) {
      history.push({ date: match.createdAt, rating: Math.round(ratings.get(participantId)) });
    }
  }

  return history;
}
