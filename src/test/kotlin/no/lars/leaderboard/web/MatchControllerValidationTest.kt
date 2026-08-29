package no.lars.leaderboard.web

import no.lars.leaderboard.domain.MatchOutcome
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.LeaderboardRepository
import no.lars.leaderboard.repository.ParticipantRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class MatchControllerValidationTest {

    @Autowired
    lateinit var matchController: MatchController

    @Autowired
    lateinit var leaderboardRepository: LeaderboardRepository

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Test
    fun `the same elo leaderboard accepts a 1v1 match and then a 3v3 match`() {
        val board = leaderboardRepository.create("Mixed Sizes", ScoringMode.ELO, "test-hash")
        val names = ('a'..'h').map { participantRepository.create(board.id, it.toString(), null) }

        val oneVOne = matchController.create(
            board.id,
            CreateMatchRequest(listOf(names[0].id), listOf(names[1].id), MatchOutcome.TEAM_A),
        )
        assertThat(oneVOne.teamA).hasSize(1)

        val threeVThree = matchController.create(
            board.id,
            CreateMatchRequest(
                names.subList(2, 5).map { it.id },
                names.subList(5, 8).map { it.id },
                MatchOutcome.TEAM_B,
            ),
        )
        assertThat(threeVThree.teamA).hasSize(3)
        assertThat(threeVThree.teamB).hasSize(3)
    }

    @Test
    fun `rejects a match where the teams have different sizes`() {
        val board = leaderboardRepository.create("Uneven", ScoringMode.ELO, "test-hash")
        val alice = participantRepository.create(board.id, "Alice", null)
        val bob = participantRepository.create(board.id, "Bob", null)
        val carl = participantRepository.create(board.id, "Carl", null)

        assertThatThrownBy {
            matchController.create(
                board.id,
                CreateMatchRequest(listOf(alice.id, bob.id), listOf(carl.id), MatchOutcome.TEAM_A),
            )
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("same number of participants")
    }

    @Test
    fun `rejects a team larger than the max team size`() {
        val board = leaderboardRepository.create("Too Big", ScoringMode.ELO, "test-hash")
        val teamA = (1..5).map { participantRepository.create(board.id, "A$it", null) }
        val teamB = (1..5).map { participantRepository.create(board.id, "B$it", null) }

        assertThatThrownBy {
            matchController.create(
                board.id,
                CreateMatchRequest(teamA.map { it.id }, teamB.map { it.id }, MatchOutcome.TEAM_A),
            )
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("at most")
    }

    @Test
    fun `rejects an empty team`() {
        val board = leaderboardRepository.create("Empty Team", ScoringMode.ELO, "test-hash")
        val alice = participantRepository.create(board.id, "Alice", null)

        assertThatThrownBy {
            matchController.create(board.id, CreateMatchRequest(emptyList(), listOf(alice.id), MatchOutcome.TEAM_A))
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("at least one participant")
    }
}
