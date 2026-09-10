import * as realApi from "./realApi.js";
import * as mockApi from "./mockApi.js";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
const impl = USE_MOCK_API ? mockApi : realApi;

if (USE_MOCK_API) {
  console.info(
    "[mock-api] Using in-memory test data, no backend required. Demo leaderboards: #/l/demo-elo (Elo) and #/l/demo-wins (win count).",
  );
}

export const createLeaderboard = impl.createLeaderboard;
export const getLeaderboard = impl.getLeaderboard;
export const deleteLeaderboard = impl.deleteLeaderboard;
export const addParticipant = impl.addParticipant;
export const deleteParticipant = impl.deleteParticipant;
export const updateParticipant = impl.updateParticipant;
export const getParticipantChanges = impl.getParticipantChanges;
export const addRound = impl.addRound;
export const getRounds = impl.getRounds;
export const addMatch = impl.addMatch;
export const getMatches = impl.getMatches;
export const updateMatch = impl.updateMatch;
export const deleteMatch = impl.deleteMatch;
export const participantImageUrl = impl.participantImageUrl;
