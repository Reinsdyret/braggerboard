package no.lars.leaderboard.service

import no.lars.leaderboard.domain.Match
import no.lars.leaderboard.domain.MatchOutcome
import no.lars.leaderboard.domain.MatchParticipant
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class EloCalculatorTest {

    private fun match(
        teamA: List<UUID>,
        teamB: List<UUID>,
        outcome: MatchOutcome,
        secondsAfterEpoch: Long,
    ) = Match(
        id = UUID.randomUUID(),
        leaderboardId = UUID.randomUUID(),
        teamA = teamA.map { MatchParticipant(it, "A-$it") },
        teamB = teamB.map { MatchParticipant(it, "B-$it") },
        outcome = outcome,
        createdAt = Instant.EPOCH.plusSeconds(secondsAfterEpoch),
    )

    @Test
    fun `equal rated 1v1 - winner gains exactly K times half, loser loses the same`() {
        val a = UUID.randomUUID()
        val b = UUID.randomUUID()

        val ratings = EloCalculator.computeRatings(
            listOf(a, b),
            listOf(match(listOf(a), listOf(b), MatchOutcome.TEAM_A, 1)),
        )

        assertThat(ratings[a]).isEqualTo(1016)
        assertThat(ratings[b]).isEqualTo(984)
    }

    @Test
    fun `draw between equally rated players leaves ratings unchanged`() {
        val a = UUID.randomUUID()
        val b = UUID.randomUUID()

        val ratings = EloCalculator.computeRatings(
            listOf(a, b),
            listOf(match(listOf(a), listOf(b), MatchOutcome.DRAW, 1)),
        )

        assertThat(ratings[a]).isEqualTo(1000)
        assertThat(ratings[b]).isEqualTo(1000)
    }

    @Test
    fun `2v2 team rating is the average of teammates, delta applied equally to both`() {
        val p1 = UUID.randomUUID()
        val p2 = UUID.randomUUID()
        val p3 = UUID.randomUUID()
        val p4 = UUID.randomUUID()

        val ratings = EloCalculator.computeRatings(
            listOf(p1, p2, p3, p4),
            listOf(match(listOf(p1, p2), listOf(p3, p4), MatchOutcome.TEAM_A, 1)),
        )

        assertThat(ratings[p1]).isEqualTo(1016)
        assertThat(ratings[p2]).isEqualTo(1016)
        assertThat(ratings[p3]).isEqualTo(984)
        assertThat(ratings[p4]).isEqualTo(984)
    }

    @Test
    fun `beating a higher rated opponent gains more than K times half`() {
        val a = UUID.randomUUID()
        val b = UUID.randomUUID()
        val c = UUID.randomUUID()

        // Build up B's rating above A and C first, via repeated wins against C.
        val warmup = (1..5L).map { match(listOf(b), listOf(c), MatchOutcome.TEAM_A, it) }
        val ratingsAfterWarmup = EloCalculator.computeRatings(listOf(a, b, c), warmup)
        val bRatingBeforeUpset = ratingsAfterWarmup.getValue(b)
        assertThat(bRatingBeforeUpset).isGreaterThan(1000)

        // Now the underdog A beats the now-higher-rated B.
        val upsetMatch = match(listOf(a), listOf(b), MatchOutcome.TEAM_A, 100)
        val ratingsAfterUpset = EloCalculator.computeRatings(listOf(a, b, c), warmup + upsetMatch)

        val aGain = ratingsAfterUpset.getValue(a) - 1000
        assertThat(aGain).isGreaterThan(16)

        val bLoss = bRatingBeforeUpset - ratingsAfterUpset.getValue(b)
        assertThat(bLoss).isGreaterThan(16)
    }

    @Test
    fun `unknown participant defaults to the starting rating`() {
        val a = UUID.randomUUID()
        val b = UUID.randomUUID()

        val ratings = EloCalculator.computeRatings(
            listOf(a),
            listOf(match(listOf(a), listOf(b), MatchOutcome.TEAM_B, 1)),
        )

        assertThat(ratings[a]).isEqualTo(984)
        assertThat(ratings[b]).isEqualTo(1016)
    }
}
