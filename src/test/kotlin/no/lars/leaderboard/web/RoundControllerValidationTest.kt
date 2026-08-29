package no.lars.leaderboard.web

import no.lars.leaderboard.domain.RoundResultInput
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.LeaderboardRepository
import no.lars.leaderboard.repository.ParticipantRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class RoundControllerValidationTest {

    @Autowired
    lateinit var roundController: RoundController

    @Autowired
    lateinit var leaderboardRepository: LeaderboardRepository

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Test
    fun `rejects a round result for a participant from a different leaderboard`() {
        val boardA = leaderboardRepository.create("Board A", ScoringMode.WIN_COUNT, null, "test-hash")
        val boardB = leaderboardRepository.create("Board B", ScoringMode.WIN_COUNT, null, "test-hash")
        val outsider = participantRepository.create(boardB.id, "Outsider", null)

        assertThatThrownBy {
            roundController.create(boardA.id, CreateRoundRequest(null, listOf(RoundResultInput(outsider.id, 1))))
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("must belong to this leaderboard")
    }

    @Test
    fun `accepts a round result for a participant that does belong to the leaderboard`() {
        val board = leaderboardRepository.create("Board C", ScoringMode.WIN_COUNT, null, "test-hash")
        val alice = participantRepository.create(board.id, "Alice", null)

        val round = roundController.create(board.id, CreateRoundRequest("Week 1", listOf(RoundResultInput(alice.id, 2))))

        assertThat(round.results).hasSize(1)
        assertThat(round.results[0].wins).isEqualTo(2)
    }
}
