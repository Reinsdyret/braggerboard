const API_BASE = "/api";

async function handle(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function createLeaderboard(name, scoringMode = "WIN_COUNT", matchFormat = null) {
  return fetch(`${API_BASE}/leaderboards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, scoringMode, matchFormat }),
  }).then(handle);
}

export function getLeaderboard(id) {
  return fetch(`${API_BASE}/leaderboards/${id}`, { cache: "no-store" }).then(handle);
}

export function addParticipant(leaderboardId, name, imageFile) {
  const formData = new FormData();
  formData.append("name", name);
  if (imageFile) formData.append("image", imageFile);

  return fetch(`${API_BASE}/leaderboards/${leaderboardId}/participants`, {
    method: "POST",
    body: formData,
  }).then(handle);
}

export function deleteParticipant(participantId) {
  return fetch(`${API_BASE}/participants/${participantId}`, { method: "DELETE" }).then(handle);
}

export function addRound(leaderboardId, label, results) {
  return fetch(`${API_BASE}/leaderboards/${leaderboardId}/rounds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: label || null, results }),
  }).then(handle);
}

export function getRounds(leaderboardId) {
  return fetch(`${API_BASE}/leaderboards/${leaderboardId}/rounds`, { cache: "no-store" }).then(handle);
}

export function addMatch(leaderboardId, teamA, teamB, outcome) {
  return fetch(`${API_BASE}/leaderboards/${leaderboardId}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamA, teamB, outcome }),
  }).then(handle);
}

export function getMatches(leaderboardId) {
  return fetch(`${API_BASE}/leaderboards/${leaderboardId}/matches`, { cache: "no-store" }).then(handle);
}

export function updateMatch(matchId, teamA, teamB, outcome) {
  return fetch(`${API_BASE}/matches/${matchId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamA, teamB, outcome }),
  }).then(handle);
}

export function deleteMatch(matchId) {
  return fetch(`${API_BASE}/matches/${matchId}`, { method: "DELETE" }).then(handle);
}

export function participantImageUrl(participantId) {
  return `${API_BASE}/participants/${participantId}/image`;
}
