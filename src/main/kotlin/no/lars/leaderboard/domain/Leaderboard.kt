package no.lars.leaderboard.domain

import java.time.Instant
import java.util.UUID

enum class ScoringMode {
    WIN_COUNT,
    ELO,
}

enum class MatchFormat {
    ONE_V_ONE,
    TWO_V_TWO,
    ;

    val teamSize: Int
        get() = when (this) {
            ONE_V_ONE -> 1
            TWO_V_TWO -> 2
        }
}

data class Leaderboard(
    val id: UUID,
    val name: String,
    val scoringMode: ScoringMode,
    val matchFormat: MatchFormat?,
    val createdAt: Instant,
)

data class LeaderboardDetails(
    val id: UUID,
    val name: String,
    val scoringMode: ScoringMode,
    val matchFormat: MatchFormat?,
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
