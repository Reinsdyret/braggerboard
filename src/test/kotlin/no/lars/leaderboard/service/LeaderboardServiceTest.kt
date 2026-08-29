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
    fun `accepts team sizes from 1 to 4`() {
        for (size in 1..4) {
            val board = leaderboardService.create("Board size $size", ScoringMode.ELO, size)
            assertThat(board.teamSize).isEqualTo(size)
        }
    }

    @Test
    fun `rejects a team size of 0`() {
        assertThatThrownBy { leaderboardService.create("Too small", ScoringMode.ELO, 0) }
            .isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `rejects a team size above 4`() {
        assertThatThrownBy { leaderboardService.create("Too big", ScoringMode.ELO, 5) }
            .isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `rejects an elo leaderboard with no team size`() {
        assertThatThrownBy { leaderboardService.create("No size", ScoringMode.ELO, null) }
            .isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `a win-count leaderboard ignores any team size passed in`() {
        val board = leaderboardService.create("Win count board", ScoringMode.WIN_COUNT, 3)
        assertThat(board.teamSize).isNull()
    }

    @Test
    fun `deleting with the correct admin password removes the leaderboard`() {
        val board = leaderboardService.create("To delete", ScoringMode.WIN_COUNT, null)

        leaderboardService.delete(board.id, adminPassword)

        assertThatThrownBy { leaderboardService.requireExists(board.id) }
            .isInstanceOf(NoSuchElementException::class.java)
    }

    @Test
    fun `deleting with the wrong admin password is rejected and keeps the leaderboard`() {
        val board = leaderboardService.create("Keep me", ScoringMode.WIN_COUNT, null)

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
