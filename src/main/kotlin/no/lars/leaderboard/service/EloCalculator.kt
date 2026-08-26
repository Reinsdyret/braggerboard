package no.lars.leaderboard.service

import no.lars.leaderboard.domain.Match
import no.lars.leaderboard.domain.MatchOutcome
import java.util.UUID
import kotlin.math.pow
import kotlin.math.roundToInt

object EloCalculator {
    const val STARTING_RATING = 1000.0
    const val K_FACTOR = 32.0

    /**
     * Replays matches in chronological order to derive current ratings, rather than storing a
     * mutable running total - stays correct even if a match or participant is later removed.
     * Team rating is the average of its members' current ratings; the resulting delta is applied
     * equally to every member of that team.
     */
    fun computeRatings(participantIds: Collection<UUID>, matches: List<Match>): Map<UUID, Int> {
        val ratings = participantIds.associateWith { STARTING_RATING }.toMutableMap()

        matches.sortedBy { it.createdAt }.forEach { match ->
            val teamAIds = match.teamA.map { it.participantId }
            val teamBIds = match.teamB.map { it.participantId }

            val ratingA = teamAIds.map { ratings.getOrPut(it) { STARTING_RATING } }.average()
            val ratingB = teamBIds.map { ratings.getOrPut(it) { STARTING_RATING } }.average()

            val expectedA = 1.0 / (1.0 + 10.0.pow((ratingB - ratingA) / 400.0))
            val scoreA = when (match.outcome) {
                MatchOutcome.TEAM_A -> 1.0
                MatchOutcome.TEAM_B -> 0.0
                MatchOutcome.DRAW -> 0.5
            }

            val deltaA = K_FACTOR * (scoreA - expectedA)
            val deltaB = -deltaA

            teamAIds.forEach { ratings[it] = ratings.getValue(it) + deltaA }
            teamBIds.forEach { ratings[it] = ratings.getValue(it) + deltaB }
        }

        return ratings.mapValues { it.value.roundToInt() }
    }
}
