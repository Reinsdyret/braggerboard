package no.lars.leaderboard.domain

import java.time.Instant
import java.util.UUID

enum class ScoringMode {
    WIN_COUNT,
    ELO,
}

const val MAX_TEAM_SIZE = 4

data class Leaderboard(
    val id: UUID,
    val name: String,
    val scoringMode: ScoringMode,
    val teamSize: Int?,
    val createdAt: Instant,
)

data class LeaderboardDetails(
    val id: UUID,
    val name: String,
    val scoringMode: ScoringMode,
    val teamSize: Int?,
    val createdAt: Instant,
    val participants: List<ParticipantStanding>,
)

data class ParticipantStanding(
    val id: UUID,
    val name: String,
    val hasImage: Boolean,
    val totalWins: Int,
    val rating: Int,
)
