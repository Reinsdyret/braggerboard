package no.lars.leaderboard.domain

import java.time.Instant
import java.util.UUID

data class Participant(
    val id: UUID,
    val leaderboardId: UUID,
    val name: String,
    val hasImage: Boolean,
    val createdAt: Instant,
)

data class ParticipantImage(
    val data: ByteArray,
    val contentType: String,
)
