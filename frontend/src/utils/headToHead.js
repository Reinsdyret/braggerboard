export function outcomeFor(myTeam, outcome) {
  if (outcome === "DRAW") return "draw";
  const won = (myTeam === "A" && outcome === "TEAM_A") || (myTeam === "B" && outcome === "TEAM_B");
  return won ? "win" : "loss";
}

/**
 * Computes a participant's overall record and per-opponent head-to-head record from
 * match history. "Best against" / "toughest opponent" are ranked by net wins
 * (wins - losses) rather than win percentage, so a 5-1 record outranks a 1-0 record.
 */
export function computeHeadToHead(participantId, matches) {
  let played = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  const byOpponent = new Map();

  for (const match of matches) {
    const inTeamA = match.teamA.some((p) => p.participantId === participantId);
    const inTeamB = match.teamB.some((p) => p.participantId === participantId);
    if (!inTeamA && !inTeamB) continue;

    const myTeam = inTeamA ? "A" : "B";
    const opponents = inTeamA ? match.teamB : match.teamA;
    const result = outcomeFor(myTeam, match.outcome);

    played += 1;
    if (result === "win") wins += 1;
    else if (result === "loss") losses += 1;
    else draws += 1;

    for (const opponent of opponents) {
      const entry = byOpponent.get(opponent.participantId) ?? {
        id: opponent.participantId,
        name: opponent.participantName,
        wins: 0,
        losses: 0,
        draws: 0,
      };
      if (result === "win") entry.wins += 1;
      else if (result === "loss") entry.losses += 1;
      else entry.draws += 1;
      byOpponent.set(opponent.participantId, entry);
    }
  }

  const opponents = [...byOpponent.values()].map((o) => ({ ...o, net: o.wins - o.losses }));
  const best = opponents.length
    ? opponents.reduce((a, b) => (b.net > a.net ? b : a))
    : null;
  const worst = opponents.length
    ? opponents.reduce((a, b) => (b.net < a.net ? b : a))
    : null;

  return { played, wins, losses, draws, opponents, best, worst };
}
