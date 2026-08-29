package no.lars.leaderboard.service

import no.lars.leaderboard.domain.ScoringMode
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.SpringBootTest
import java.util.NoSuchElementException
import java.util.UUID

@SpringBootTest
class LeaderboardServiceTest {

    @Autowired
    lateinit var leaderboardService: LeaderboardService

    @Value("\${admin.password}")
    lateinit var adminPassword: String

    @Test
    fun `rejects a blank admin password`() {
        assertThatThrownBy { leaderboardService.create("No password", ScoringMode.WIN_COUNT, "") }
            .isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `the password set at creation is the one required to delete, not any other password`() {
        val board = leaderboardService.create("Custom Password Board", ScoringMode.WIN_COUNT, "my-secret")

        assertThatThrownBy { leaderboardService.delete(board.id, adminPassword) }
            .isInstanceOf(IllegalStateException::class.java)

        leaderboardService.delete(board.id, "my-secret")
        assertThatThrownBy { leaderboardService.requireExists(board.id) }
            .isInstanceOf(NoSuchElementException::class.java)
    }

    @Test
    fun `deleting with the correct admin password removes the leaderboard`() {
        val board = leaderboardService.create("To delete", ScoringMode.WIN_COUNT, adminPassword)

        leaderboardService.delete(board.id, adminPassword)

        assertThatThrownBy { leaderboardService.requireExists(board.id) }
            .isInstanceOf(NoSuchElementException::class.java)
    }

    @Test
    fun `deleting with the wrong admin password is rejected and keeps the leaderboard`() {
        val board = leaderboardService.create("Keep me", ScoringMode.WIN_COUNT, adminPassword)

        assertThatThrownBy { leaderboardService.delete(board.id, "wrong-password") }
            .isInstanceOf(IllegalStateException::class.java)

        assertThat(leaderboardService.requireExists(board.id).id).isEqualTo(board.id)
    }

    @Test
    fun `deleting a leaderboard that does not exist throws not-found`() {
        assertThatThrownBy { leaderboardService.delete(UUID.randomUUID(), adminPassword) }
            .isInstanceOf(NoSuchElementException::class.java)
    }
}
