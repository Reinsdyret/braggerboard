export function outcomeFor(myTeam, outcome) {
  if (outcome === "DRAW") return "draw";
  const won = (myTeam === "A" && outcome === "TEAM_A") || (myTeam === "B" && outcome === "TEAM_B");
  return won ? "win" : "loss";
}

function tallyInto(records, people, result) {
  for (const person of people) {
    const entry = records.get(person.participantId) ?? {
      id: person.participantId,
      name: person.participantName,
      wins: 0,
      losses: 0,
      draws: 0,
    };
    if (result === "win") entry.wins += 1;
    else if (result === "loss") entry.losses += 1;
    else entry.draws += 1;
    records.set(person.participantId, entry);
  }
}

/** Net wins is what "best" and "worst" are ranked by, so a 5-1 record outranks a 1-0 one. */
function withNet(records) {
  return [...records.values()].map((r) => ({ ...r, net: r.wins - r.losses }));
}

/**
 * Computes a participant's overall record plus their record alongside each teammate and
 * against each opponent. Teammates are only ever populated on team matches - on a leaderboard
 * played entirely 1v1 the list stays empty, and callers are expected to hide the section.
 */
export function computeHeadToHead(participantId, matches) {
  let played = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let lastPlayedAt = null;
  const opponentRecords = new Map();
  const teammateRecords = new Map();

  for (const match of matches) {
    const inTeamA = match.teamA.some((p) => p.participantId === participantId);
    const inTeamB = match.teamB.some((p) => p.participantId === participantId);
    if (!inTeamA && !inTeamB) continue;

    const myTeam = inTeamA ? "A" : "B";
    const opponents = inTeamA ? match.teamB : match.teamA;
    const teammates = (inTeamA ? match.teamA : match.teamB).filter((p) => p.participantId !== participantId);
    const result = outcomeFor(myTeam, match.outcome);

    played += 1;
    if (result === "win") wins += 1;
    else if (result === "loss") losses += 1;
    else draws += 1;
    if (!lastPlayedAt || new Date(match.createdAt) > new Date(lastPlayedAt)) lastPlayedAt = match.createdAt;

    tallyInto(opponentRecords, opponents, result);
    tallyInto(teammateRecords, teammates, result);
  }

  return {
    played,
    wins,
    losses,
    draws,
    opponents: withNet(opponentRecords),
    teammates: withNet(teammateRecords),
    lastPlayedAt,
  };
}
