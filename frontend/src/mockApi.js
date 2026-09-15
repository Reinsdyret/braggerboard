// In-memory stand-in for api.js so the frontend can be exercised without the Kotlin backend
// running. Mirrors the real endpoints' request validation, response shapes, and sort orders
// (see LeaderboardService/*Repository.kt) closely enough that components can't tell the
// difference. Enabled by VITE_USE_MOCK_API=true (see `npm run dev:mock`).
import { computeRatingHistory, STARTING_RATING } from "./utils/ratingHistory.js";
import { MAX_TEAM_SIZE } from "./constants.js";
import { loadRecents, saveRecent } from "./recents.js";

const NETWORK_DELAY_MS = 150;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_NAME_LENGTH = 100;

const db = {
  leaderboards: new Map(),
  participants: new Map(),
  matches: new Map(),
  rounds: new Map(),
  changes: new Map(),
};

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));
}

function uuid() {
  return crypto.randomUUID();
}

function daysAgo(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function participantName(id) {
  return db.participants.get(id)?.name ?? "Unknown";
}

function participantsOf(leaderboardId) {
  return [...db.participants.values()].filter((p) => p.leaderboardId === leaderboardId);
}

function logChange(participantId, field, oldValue, newValue, changedAt = new Date().toISOString()) {
  const list = db.changes.get(participantId) ?? [];
  list.push({ id: uuid(), participantId, field, oldValue, newValue, changedAt });
  db.changes.set(participantId, list);
}

function toParticipantDto(p) {
  return { id: p.id, leaderboardId: p.leaderboardId, name: p.name, hasImage: p.hasImage, createdAt: p.createdAt };
}

function toMatchDto(match) {
  return {
    id: match.id,
    leaderboardId: match.leaderboardId,
    teamA: match.teamA.map((t) => ({ participantId: t.participantId, participantName: participantName(t.participantId) })),
    teamB: match.teamB.map((t) => ({ participantId: t.participantId, participantName: participantName(t.participantId) })),
    outcome: match.outcome,
    createdAt: match.createdAt,
  };
}

function toRoundDto(round) {
  const results = round.results
    .map((r) => ({ participantId: r.participantId, participantName: participantName(r.participantId), wins: r.wins }))
    .sort((a, b) => b.wins - a.wins || a.participantName.localeCompare(b.participantName));
  return { id: round.id, leaderboardId: round.leaderboardId, label: round.label, createdAt: round.createdAt, results };
}

function validateTeams(leaderboardId, teamA, teamB) {
  if (!teamA?.length) throw new Error("Each team needs at least one participant");
  if (teamA.length !== teamB.length) throw new Error("Both teams must have the same number of participants");
  if (teamA.length > MAX_TEAM_SIZE) throw new Error(`Each team can have at most ${MAX_TEAM_SIZE} participants`);
  const allIds = [...teamA, ...teamB];
  if (new Set(allIds).size !== allIds.length) throw new Error("A participant can't appear more than once in a match");
  const knownIds = new Set(participantsOf(leaderboardId).map((p) => p.id));
  if (!allIds.every((id) => knownIds.has(id))) throw new Error("All participants must belong to this leaderboard");
}

function ensureRecent(leaderboard) {
  if (!loadRecents().some((r) => r.id === leaderboard.id)) {
    saveRecent(leaderboard);
  }
}

// --- seed data -----------------------------------------------------------------------------

function pickOutcome(skillA, skillB) {
  const expectedA = 1 / (1 + Math.pow(10, (skillB - skillA) / 400));
  const r = Math.random();
  if (r < 0.08) return "DRAW";
  return r < 0.08 + expectedA * 0.92 ? "TEAM_A" : "TEAM_B";
}

function seedEloLeaderboard() {
  const leaderboardId = "demo-elo";
  const leaderboard = {
    id: leaderboardId,
    name: "Foosball Fridays",
    scoringMode: "ELO",
    createdAt: daysAgo(75),
    adminPassword: "demo",
  };
  db.leaderboards.set(leaderboardId, leaderboard);

  const roster = [
    { name: "Alice", skill: 1250, joinedDaysAgo: 74 },
    { name: "Bob", skill: 1050, joinedDaysAgo: 74 },
    { name: "Charlie", skill: 950, joinedDaysAgo: 70 },
    { name: "Dana", skill: 1150, joinedDaysAgo: 68 },
    { name: "Erik", skill: 1000, joinedDaysAgo: 40 },
    // Joined last week, one lucky win - the case the provisional group exists for.
    { name: "Vera", skill: 1000, joinedDaysAgo: 3, provisional: true },
  ];

  const participants = roster.map((r) => {
    const id = uuid();
    db.participants.set(id, {
      id,
      leaderboardId,
      name: r.name,
      hasImage: false,
      imageDataUrl: null,
      createdAt: daysAgo(r.joinedDaysAgo),
    });
    return { id, ...r };
  });

  const erik = participants.find((p) => p.name === "Erik");
  logChange(erik.id, "NAME", "Eric", "Erik", daysAgo(35));

  let t = 68;
  for (let i = 0; i < 50 && t > 0.3; i++) {
    t -= 0.5 + Math.random() * 2.2;
    if (t < 0.2) t = 0.2;
    const eligible = participants.filter((p) => p.joinedDaysAgo >= t && !p.provisional);
    if (eligible.length < 2) continue;
    const [pa, pb] = [...eligible].sort(() => Math.random() - 0.5);
    const matchId = uuid();
    db.matches.set(matchId, {
      id: matchId,
      leaderboardId,
      teamA: [{ participantId: pa.id }],
      teamB: [{ participantId: pb.id }],
      outcome: pickOutcome(pa.skill, pb.skill),
      createdAt: daysAgo(t),
    });
  }

  // Vera's single match, hard-coded rather than left to the random generator so the provisional
  // group is always there to look at in mock mode.
  const vera = participants.find((p) => p.name === "Vera");
  const alice = participants.find((p) => p.name === "Alice");
  const veraMatchId = uuid();
  db.matches.set(veraMatchId, {
    id: veraMatchId,
    leaderboardId,
    teamA: [{ participantId: vera.id }],
    teamB: [{ participantId: alice.id }],
    outcome: "TEAM_A",
    createdAt: daysAgo(2),
  });

  ensureRecent(leaderboard);
}

function seedElo2v2Leaderboard() {
  const leaderboardId = "demo-elo-2v2";
  const leaderboard = {
    id: leaderboardId,
    name: "Foosball Doubles",
    scoringMode: "ELO",
    createdAt: daysAgo(60),
    adminPassword: "demo",
  };
  db.leaderboards.set(leaderboardId, leaderboard);

  const roster = [
    { name: "Nora", skill: 1200, joinedDaysAgo: 59 },
    { name: "Omar", skill: 1100, joinedDaysAgo: 59 },
    { name: "Priya", skill: 1050, joinedDaysAgo: 58 },
    { name: "Quentin", skill: 950, joinedDaysAgo: 55 },
    { name: "Rosa", skill: 1150, joinedDaysAgo: 50 },
    { name: "Sam", skill: 1000, joinedDaysAgo: 40 },
    { name: "Tara", skill: 900, joinedDaysAgo: 25 },
    { name: "Uma", skill: 1080, joinedDaysAgo: 15 },
  ];

  const participants = roster.map((r) => {
    const id = uuid();
    db.participants.set(id, {
      id,
      leaderboardId,
      name: r.name,
      hasImage: false,
      imageDataUrl: null,
      createdAt: daysAgo(r.joinedDaysAgo),
    });
    return { id, ...r };
  });

  let t = 58;
  for (let i = 0; i < 70 && t > 0.3; i++) {
    t -= 0.3 + Math.random() * 1.5;
    if (t < 0.2) t = 0.2;
    const eligible = participants.filter((p) => p.joinedDaysAgo >= t);
    // Mostly 2v2, occasionally 1v1 when there aren't enough people around (or just for variety).
    const wantsDuo = Math.random() < 0.8;
    const teamSize = wantsDuo && eligible.length >= 4 ? 2 : 1;
    if (eligible.length < teamSize * 2) continue;

    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const teamAPlayers = shuffled.slice(0, teamSize);
    const teamBPlayers = shuffled.slice(teamSize, teamSize * 2);
    const skillA = teamAPlayers.reduce((sum, p) => sum + p.skill, 0) / teamSize;
    const skillB = teamBPlayers.reduce((sum, p) => sum + p.skill, 0) / teamSize;

    const matchId = uuid();
    db.matches.set(matchId, {
      id: matchId,
      leaderboardId,
      teamA: teamAPlayers.map((p) => ({ participantId: p.id })),
      teamB: teamBPlayers.map((p) => ({ participantId: p.id })),
      outcome: pickOutcome(skillA, skillB),
      createdAt: daysAgo(t),
    });
  }

  ensureRecent(leaderboard);
}

function seedWinCountLeaderboard() {
  const leaderboardId = "demo-wins";
  const leaderboard = {
    id: leaderboardId,
    name: "Ping Pong Club",
    scoringMode: "WIN_COUNT",
    createdAt: daysAgo(50),
    adminPassword: "demo",
  };
  db.leaderboards.set(leaderboardId, leaderboard);

  const roster = [
    { name: "Fatima", weight: 1.3, joinedDaysAgo: 49 },
    { name: "George", weight: 1.0, joinedDaysAgo: 49 },
    { name: "Hana", weight: 0.8, joinedDaysAgo: 45 },
    { name: "Ivan", weight: 1.1, joinedDaysAgo: 30 },
  ];

  const participants = roster.map((r) => {
    const id = uuid();
    db.participants.set(id, {
      id,
      leaderboardId,
      name: r.name,
      hasImage: false,
      imageDataUrl: null,
      createdAt: daysAgo(r.joinedDaysAgo),
    });
    return { id, ...r };
  });

  let t = 47;
  for (let i = 0; i < 16 && t > 0.3; i++) {
    t -= 1 + Math.random() * 2.5;
    if (t < 0.2) t = 0.2;
    const eligible = participants.filter((p) => p.joinedDaysAgo >= t && Math.random() > 0.15);
    if (eligible.length === 0) continue;
    const results = eligible
      .map((p) => ({ participantId: p.id, wins: Math.round(Math.random() * 3 * p.weight) }))
      .filter((r) => r.wins > 0);
    if (results.length === 0) continue;
    const roundId = uuid();
    db.rounds.set(roundId, {
      id: roundId,
      leaderboardId,
      label: i % 3 === 0 ? `Week ${i + 1}` : null,
      createdAt: daysAgo(t),
      results,
    });
  }

  ensureRecent(leaderboard);
}

seedEloLeaderboard();
seedElo2v2Leaderboard();
seedWinCountLeaderboard();

// --- public API, mirroring api.js's signatures ---------------------------------------------

export async function createLeaderboard(name, scoringMode, password) {
  await delay();
  const trimmed = (name ?? "").trim();
  if (!trimmed) throw new Error("Leaderboard name must not be blank");
  if (trimmed.length > MAX_NAME_LENGTH) throw new Error(`Leaderboard name must be ${MAX_NAME_LENGTH} characters or fewer`);
  if (!password) throw new Error("Admin password must not be blank");

  const id = uuid();
  const leaderboard = { id, name: trimmed, scoringMode, createdAt: new Date().toISOString(), adminPassword: password };
  db.leaderboards.set(id, leaderboard);
  return { id: leaderboard.id, name: leaderboard.name, scoringMode: leaderboard.scoringMode, createdAt: leaderboard.createdAt };
}

export async function getLeaderboard(id) {
  await delay();
  const leaderboard = db.leaderboards.get(id);
  if (!leaderboard) throw new Error(`Leaderboard ${id} not found`);

  const participants = participantsOf(id);
  let standings;

  if (leaderboard.scoringMode === "ELO") {
    const matches = [...db.matches.values()].filter((m) => m.leaderboardId === id);
    standings = participants
      .map((p) => {
        const history = computeRatingHistory(p.id, matches);
        const rating = history.length ? history[history.length - 1].rating : STARTING_RATING;
        return { id: p.id, name: p.name, hasImage: p.hasImage, totalWins: 0, rating, createdAt: p.createdAt };
      })
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  } else {
    const rounds = [...db.rounds.values()].filter((r) => r.leaderboardId === id);
    standings = participants
      .map((p) => {
        const totalWins = rounds.reduce((sum, r) => sum + (r.results.find((res) => res.participantId === p.id)?.wins ?? 0), 0);
        return { id: p.id, name: p.name, hasImage: p.hasImage, totalWins, rating: 0, createdAt: p.createdAt };
      })
      .sort((a, b) => b.totalWins - a.totalWins || a.name.localeCompare(b.name));
  }

  return {
    id: leaderboard.id,
    name: leaderboard.name,
    scoringMode: leaderboard.scoringMode,
    createdAt: leaderboard.createdAt,
    participants: standings,
  };
}

export async function deleteLeaderboard(id, password) {
  await delay();
  const leaderboard = db.leaderboards.get(id);
  if (!leaderboard) throw new Error(`Leaderboard ${id} not found`);
  if (password !== leaderboard.adminPassword) throw new Error("Incorrect admin password");

  db.leaderboards.delete(id);
  for (const p of participantsOf(id)) {
    db.participants.delete(p.id);
    db.changes.delete(p.id);
  }
  for (const m of [...db.matches.values()]) if (m.leaderboardId === id) db.matches.delete(m.id);
  for (const r of [...db.rounds.values()]) if (r.leaderboardId === id) db.rounds.delete(r.id);
  return null;
}

export async function addParticipant(leaderboardId, name, imageFile) {
  await delay();
  if (!db.leaderboards.has(leaderboardId)) throw new Error(`Leaderboard ${leaderboardId} not found`);
  const trimmed = (name ?? "").trim();
  if (!trimmed) throw new Error("Participant name must not be blank");
  if (trimmed.length > MAX_NAME_LENGTH) throw new Error(`Participant name must be ${MAX_NAME_LENGTH} characters or fewer`);

  const imageDataUrl = imageFile ? await fileToDataUrl(imageFile) : null;
  const id = uuid();
  const participant = {
    id,
    leaderboardId,
    name: trimmed,
    hasImage: Boolean(imageDataUrl),
    imageDataUrl,
    createdAt: new Date().toISOString(),
  };
  db.participants.set(id, participant);
  return toParticipantDto(participant);
}

export async function deleteParticipant(participantId) {
  await delay();
  if (!db.participants.has(participantId)) throw new Error(`Participant ${participantId} not found`);
  db.participants.delete(participantId);
  db.changes.delete(participantId);
  for (const m of db.matches.values()) {
    m.teamA = m.teamA.filter((t) => t.participantId !== participantId);
    m.teamB = m.teamB.filter((t) => t.participantId !== participantId);
  }
  for (const r of db.rounds.values()) {
    r.results = r.results.filter((res) => res.participantId !== participantId);
  }
  return null;
}

export async function updateParticipant(participantId, { name, imageFile, removeImage } = {}) {
  await delay();
  const participant = db.participants.get(participantId);
  if (!participant) throw new Error(`Participant ${participantId} not found`);

  if (name !== undefined && name !== null) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Participant name must not be blank");
    if (trimmed.length > MAX_NAME_LENGTH) throw new Error(`Participant name must be ${MAX_NAME_LENGTH} characters or fewer`);
    if (trimmed !== participant.name) {
      logChange(participantId, "NAME", participant.name, trimmed);
      participant.name = trimmed;
    }
  }

  if (imageFile) {
    const imageDataUrl = await fileToDataUrl(imageFile);
    logChange(participantId, "IMAGE", participant.hasImage ? "photo" : "none", "photo");
    participant.imageDataUrl = imageDataUrl;
    participant.hasImage = true;
  } else if (removeImage && participant.hasImage) {
    logChange(participantId, "IMAGE", "photo", "none");
    participant.imageDataUrl = null;
    participant.hasImage = false;
  }

  return toParticipantDto(participant);
}

export async function getParticipantChanges(participantId) {
  await delay();
  if (!db.participants.has(participantId)) throw new Error(`Participant ${participantId} not found`);
  const list = db.changes.get(participantId) ?? [];
  return [...list].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
}

export async function addRound(leaderboardId, label, results) {
  await delay();
  const leaderboard = db.leaderboards.get(leaderboardId);
  if (!leaderboard) throw new Error(`Leaderboard ${leaderboardId} not found`);
  if (leaderboard.scoringMode !== "WIN_COUNT") throw new Error("This leaderboard uses Elo scoring, not rounds");
  if (!results?.length) throw new Error("A round needs at least one result");
  if (results.some((r) => r.wins < 0)) throw new Error("Wins must not be negative");
  if ((label?.length ?? 0) > MAX_NAME_LENGTH) throw new Error(`Round label must be ${MAX_NAME_LENGTH} characters or fewer`);
  const knownIds = new Set(participantsOf(leaderboardId).map((p) => p.id));
  if (!results.every((r) => knownIds.has(r.participantId))) throw new Error("All participants must belong to this leaderboard");

  const id = uuid();
  const round = {
    id,
    leaderboardId,
    label: label?.trim() || null,
    createdAt: new Date().toISOString(),
    results: results.map((r) => ({ participantId: r.participantId, wins: r.wins })),
  };
  db.rounds.set(id, round);
  return toRoundDto(round);
}

export async function getRounds(leaderboardId) {
  await delay();
  if (!db.leaderboards.has(leaderboardId)) throw new Error(`Leaderboard ${leaderboardId} not found`);
  const rounds = [...db.rounds.values()]
    .filter((r) => r.leaderboardId === leaderboardId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return rounds.map(toRoundDto);
}

export async function addMatch(leaderboardId, teamA, teamB, outcome) {
  await delay();
  const leaderboard = db.leaderboards.get(leaderboardId);
  if (!leaderboard) throw new Error(`Leaderboard ${leaderboardId} not found`);
  if (leaderboard.scoringMode !== "ELO") throw new Error("This leaderboard uses win-count scoring, not matches");
  validateTeams(leaderboardId, teamA, teamB);

  const id = uuid();
  const match = {
    id,
    leaderboardId,
    teamA: teamA.map((pid) => ({ participantId: pid })),
    teamB: teamB.map((pid) => ({ participantId: pid })),
    outcome,
    createdAt: new Date().toISOString(),
  };
  db.matches.set(id, match);
  return toMatchDto(match);
}

export async function getMatches(leaderboardId) {
  await delay();
  if (!db.leaderboards.has(leaderboardId)) throw new Error(`Leaderboard ${leaderboardId} not found`);
  const matches = [...db.matches.values()]
    .filter((m) => m.leaderboardId === leaderboardId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return matches.map(toMatchDto);
}

export async function updateMatch(matchId, teamA, teamB, outcome) {
  await delay();
  const match = db.matches.get(matchId);
  if (!match) throw new Error(`Match ${matchId} not found`);
  validateTeams(match.leaderboardId, teamA, teamB);

  match.teamA = teamA.map((pid) => ({ participantId: pid }));
  match.teamB = teamB.map((pid) => ({ participantId: pid }));
  match.outcome = outcome;
  return toMatchDto(match);
}

export async function deleteMatch(matchId) {
  await delay();
  if (!db.matches.has(matchId)) throw new Error(`Match ${matchId} not found`);
  db.matches.delete(matchId);
  return null;
}

export function participantImageUrl(participantId) {
  return db.participants.get(participantId)?.imageDataUrl ?? "";
}
