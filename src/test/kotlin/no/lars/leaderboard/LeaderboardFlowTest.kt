package no.lars.leaderboard

import no.lars.leaderboard.domain.RoundResultInput
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.LeaderboardRepository
import no.lars.leaderboard.repository.ParticipantRepository
import no.lars.leaderboard.repository.RoundRepository
import no.lars.leaderboard.service.LeaderboardService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class LeaderboardFlowTest {

    @Autowired
    lateinit var leaderboardRepository: LeaderboardRepository

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Autowired
    lateinit var roundRepository: RoundRepository

    @Autowired
    lateinit var leaderboardService: LeaderboardService

    @Test
    fun `creating rounds accumulates standings correctly`() {
        val leaderboard = leaderboardRepository.create("Friday Darts", ScoringMode.WIN_COUNT, "test-hash")
        val alice = participantRepository.create(leaderboard.id, "Alice", null)
        val bob = participantRepository.create(leaderboard.id, "Bob", null)

        roundRepository.create(
            leaderboard.id,
            "Week 1",
            listOf(RoundResultInput(alice.id, 3), RoundResultInput(bob.id, 1)),
        )
        roundRepository.create(
            leaderboard.id,
            "Week 2",
            listOf(RoundResultInput(alice.id, 1), RoundResultInput(bob.id, 4)),
        )

        val details = leaderboardService.getDetails(leaderboard.id)

        assertThat(details.participants).hasSize(2)
        assertThat(details.participants[0].name).isEqualTo("Bob")
        assertThat(details.participants[0].totalWins).isEqualTo(5)
        assertThat(details.participants[1].name).isEqualTo("Alice")
        assertThat(details.participants[1].totalWins).isEqualTo(4)

        val rounds = roundRepository.findByLeaderboardId(leaderboard.id)
        assertThat(rounds).hasSize(2)
    }
}
