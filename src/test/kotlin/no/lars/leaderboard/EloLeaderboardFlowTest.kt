package no.lars.leaderboard

import no.lars.leaderboard.domain.MatchFormat
import no.lars.leaderboard.domain.MatchInput
import no.lars.leaderboard.domain.MatchOutcome
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.LeaderboardRepository
import no.lars.leaderboard.repository.MatchRepository
import no.lars.leaderboard.repository.ParticipantRepository
import no.lars.leaderboard.service.LeaderboardService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class EloLeaderboardFlowTest {

    @Autowired
    lateinit var leaderboardRepository: LeaderboardRepository

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Autowired
    lateinit var matchRepository: MatchRepository

    @Autowired
    lateinit var leaderboardService: LeaderboardService

    @Test
    fun `1v1 elo leaderboard ranks winner above loser after a match`() {
        val leaderboard = leaderboardRepository.create("Chess Club", ScoringMode.ELO, MatchFormat.ONE_V_ONE)
        val alice = participantRepository.create(leaderboard.id, "Alice", null)
        val bob = participantRepository.create(leaderboard.id, "Bob", null)

        matchRepository.create(leaderboard.id, MatchInput(listOf(alice.id), listOf(bob.id), MatchOutcome.TEAM_A))

        val details = leaderboardService.getDetails(leaderboard.id)

        assertThat(details.scoringMode).isEqualTo(ScoringMode.ELO)
        assertThat(details.participants[0].name).isEqualTo("Alice")
        assertThat(details.participants[0].rating).isEqualTo(1016)
        assertThat(details.participants[1].name).isEqualTo("Bob")
        assertThat(details.participants[1].rating).isEqualTo(984)
    }

    @Test
    fun `2v2 elo leaderboard applies the team delta to both teammates`() {
        val leaderboard = leaderboardRepository.create("Foosball", ScoringMode.ELO, MatchFormat.TWO_V_TWO)
        val p1 = participantRepository.create(leaderboard.id, "P1", null)
        val p2 = participantRepository.create(leaderboard.id, "P2", null)
        val p3 = participantRepository.create(leaderboard.id, "P3", null)
        val p4 = participantRepository.create(leaderboard.id, "P4", null)

        matchRepository.create(
            leaderboard.id,
            MatchInput(listOf(p1.id, p2.id), listOf(p3.id, p4.id), MatchOutcome.TEAM_B),
        )

        val details = leaderboardService.getDetails(leaderboard.id)
        val ratingsByName = details.participants.associate { it.name to it.rating }

        assertThat(ratingsByName["P3"]).isEqualTo(1016)
        assertThat(ratingsByName["P4"]).isEqualTo(1016)
        assertThat(ratingsByName["P1"]).isEqualTo(984)
        assertThat(ratingsByName["P2"]).isEqualTo(984)
    }
}
