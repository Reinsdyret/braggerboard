package no.lars.leaderboard.web

import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.ParticipantRepository
import no.lars.leaderboard.service.LeaderboardService
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import java.util.NoSuchElementException
import java.util.UUID

@SpringBootTest
class ParticipantControllerDeleteTest {

    @Autowired
    lateinit var participantController: ParticipantController

    @Autowired
    lateinit var leaderboardService: LeaderboardService

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    @Test
    fun `deleting a participant requires the leaderboard's admin password`() {
        val board = leaderboardService.create("Delete board", ScoringMode.WIN_COUNT, "board-secret")
        val alice = participantRepository.create(board.id, "Alice", null)

        assertThatThrownBy { participantController.delete(alice.id, DeleteParticipantRequest("wrong")) }
            .isInstanceOf(IllegalStateException::class.java)
        assertThat(participantRepository.findById(alice.id)).isNotNull()

        participantController.delete(alice.id, DeleteParticipantRequest("board-secret"))
        assertThat(participantRepository.findById(alice.id)).isNull()
    }

    @Test
    fun `another leaderboard's admin password does not work`() {
        val board = leaderboardService.create("Board A", ScoringMode.WIN_COUNT, "secret-a")
        leaderboardService.create("Board B", ScoringMode.WIN_COUNT, "secret-b")
        val bob = participantRepository.create(board.id, "Bob", null)

        assertThatThrownBy { participantController.delete(bob.id, DeleteParticipantRequest("secret-b")) }
            .isInstanceOf(IllegalStateException::class.java)
        assertThat(participantRepository.findById(bob.id)).isNotNull()
    }

    @Test
    fun `deleting an unknown participant is not found`() {
        assertThatThrownBy { participantController.delete(UUID.randomUUID(), DeleteParticipantRequest("x")) }
            .isInstanceOf(NoSuchElementException::class.java)
    }
}
