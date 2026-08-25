package no.lars.leaderboard.domain

import java.time.Instant
import java.util.UUID

data class Leaderboard(
    val id: UUID,
    val name: String,
    val createdAt: Instant,
)

data class LeaderboardDetails(
    val id: UUID,
    val name: String,
    val createdAt: Instant,
    val participants: List<ParticipantStanding>,
)

data class ParticipantStanding(
    val id: UUID,
    val name: String,
    val hasImage: Boolean,
    val totalWins: Int,
)
