package no.lars.leaderboard.domain

import java.time.Instant
import java.util.UUID

data class Round(
    val id: UUID,
    val leaderboardId: UUID,
    val label: String?,
    val createdAt: Instant,
    val results: List<RoundResult>,
)

data class RoundResult(
    val participantId: UUID,
    val participantName: String,
    val wins: Int,
)

data class RoundResultInput(
    val participantId: UUID,
    val wins: Int,
)
