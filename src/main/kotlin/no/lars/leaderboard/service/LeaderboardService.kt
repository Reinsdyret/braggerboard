package no.lars.leaderboard.service

import no.lars.leaderboard.domain.Leaderboard
import no.lars.leaderboard.domain.LeaderboardDetails
import no.lars.leaderboard.domain.MatchFormat
import no.lars.leaderboard.domain.ParticipantStanding
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.LeaderboardRepository
import no.lars.leaderboard.repository.MatchRepository
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
    private val matchRepository: MatchRepository,
) {

    fun create(name: String, scoringMode: ScoringMode, matchFormat: MatchFormat?): Leaderboard {
        require(name.isNotBlank()) { "Leaderboard name must not be blank" }
        require(scoringMode != ScoringMode.ELO || matchFormat != null) {
            "An Elo leaderboard needs a match format"
        }
        return leaderboardRepository.create(name.trim(), scoringMode, if (scoringMode == ScoringMode.ELO) matchFormat else null)
    }

    fun getDetails(leaderboardId: UUID): LeaderboardDetails {
        val leaderboard = leaderboardRepository.findById(leaderboardId)
            ?: throw NoSuchElementException("Leaderboard $leaderboardId not found")

        val participants = participantRepository.findByLeaderboardId(leaderboardId)

        val standings = when (leaderboard.scoringMode) {
            ScoringMode.WIN_COUNT -> {
                val totalWins = roundRepository.totalWinsByLeaderboard(leaderboardId)
                participants
                    .map {
                        ParticipantStanding(
                            id = it.id,
                            name = it.name,
                            hasImage = it.hasImage,
                            totalWins = totalWins[it.id] ?: 0,
                            rating = 0,
                        )
                    }
                    .sortedWith(compareByDescending<ParticipantStanding> { it.totalWins }.thenBy { it.name })
            }

            ScoringMode.ELO -> {
                val matches = matchRepository.findByLeaderboardId(leaderboardId)
                val ratings = EloCalculator.computeRatings(participants.map { it.id }, matches)
                participants
                    .map {
                        ParticipantStanding(
                            id = it.id,
                            name = it.name,
                            hasImage = it.hasImage,
                            totalWins = 0,
                            rating = ratings[it.id] ?: EloCalculator.STARTING_RATING.toInt(),
                        )
                    }
                    .sortedWith(compareByDescending<ParticipantStanding> { it.rating }.thenBy { it.name })
            }
        }

        return LeaderboardDetails(
            id = leaderboard.id,
            name = leaderboard.name,
            scoringMode = leaderboard.scoringMode,
            matchFormat = leaderboard.matchFormat,
            createdAt = leaderboard.createdAt,
            participants = standings,
        )
    }

    fun requireExists(leaderboardId: UUID): Leaderboard =
        leaderboardRepository.findById(leaderboardId)
            ?: throw NoSuchElementException("Leaderboard $leaderboardId not found")
}
