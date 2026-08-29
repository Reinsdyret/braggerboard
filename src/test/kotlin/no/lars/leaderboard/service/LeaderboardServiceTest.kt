package no.lars.leaderboard.service

import no.lars.leaderboard.domain.ScoringMode
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class LeaderboardServiceTest {

    @Autowired
    lateinit var leaderboardService: LeaderboardService

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
}
