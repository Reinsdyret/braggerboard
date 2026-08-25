package no.lars.leaderboard.service

import no.lars.leaderboard.domain.Leaderboard
import no.lars.leaderboard.domain.LeaderboardDetails
import no.lars.leaderboard.domain.ParticipantStanding
import no.lars.leaderboard.repository.LeaderboardRepository
import no.lars.leaderboard.repository.ParticipantRepository
import no.lars.leaderboard.repository.RoundRepository
import org.springframework.stereotype.Service
import java.util.NoSuchElementException
import java.util.UUID

@Service
class LeaderboardService(
    private val leaderboardRepository: LeaderboardRepository,
    private val participantRepository: ParticipantRepository,
    private val roundRepository: RoundRepository,
) {

    fun create(name: String): Leaderboard {
        require(name.isNotBlank()) { "Leaderboard name must not be blank" }
        return leaderboardRepository.create(name.trim())
    }

    fun getDetails(leaderboardId: UUID): LeaderboardDetails {
        val leaderboard = leaderboardRepository.findById(leaderboardId)
            ?: throw NoSuchElementException("Leaderboard $leaderboardId not found")

        val participants = participantRepository.findByLeaderboardId(leaderboardId)
        val totalWins = roundRepository.totalWinsByLeaderboard(leaderboardId)

        val standings = participants
            .map {
                ParticipantStanding(
                    id = it.id,
                    name = it.name,
                    hasImage = it.hasImage,
                    totalWins = totalWins[it.id] ?: 0,
                )
            }
            .sortedWith(compareByDescending<ParticipantStanding> { it.totalWins }.thenBy { it.name })

        return LeaderboardDetails(
            id = leaderboard.id,
            name = leaderboard.name,
            createdAt = leaderboard.createdAt,
            participants = standings,
        )
    }

    fun requireExists(leaderboardId: UUID): Leaderboard =
        leaderboardRepository.findById(leaderboardId)
            ?: throw NoSuchElementException("Leaderboard $leaderboardId not found")
}
