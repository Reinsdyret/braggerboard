export const MAX_TEAM_SIZE = 4;

// Elo rating is a rate, not a total, so a rating built from one or two matches says more about
// who the participant happened to play than about them. Below this many matches they are listed
// as provisional instead of competing for a rank.
export const MIN_MATCHES_TO_RANK = 3;
