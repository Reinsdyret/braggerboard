package no.lars.leaderboard.domain

import java.time.Instant
import java.util.UUID

enum class MatchOutcome {
    TEAM_A,
    TEAM_B,
    DRAW,
}

data class MatchParticipant(
    val participantId: UUID,
    val participantName: String,
)

data class Match(
    val id: UUID,
    val leaderboardId: UUID,
    val teamA: List<MatchParticipant>,
    val teamB: List<MatchParticipant>,
    val outcome: MatchOutcome,
    val createdAt: Instant,
)

data class MatchInput(
    val teamA: List<UUID>,
    val teamB: List<UUID>,
    val outcome: MatchOutcome,
)
