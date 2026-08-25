const RECENTS_KEY = "leaderboard.recents";

export function loadRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveRecent(leaderboard) {
  const recents = loadRecents().filter((r) => r.id !== leaderboard.id);
  recents.unshift({ id: leaderboard.id, name: leaderboard.name });
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, 10)));
}
