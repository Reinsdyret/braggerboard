package no.lars.leaderboard.config

import no.lars.leaderboard.repository.LeaderboardRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.DefaultApplicationArguments
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

@SpringBootTest
class AdminPasswordBackfillTest {

    @Autowired
    lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    lateinit var leaderboardRepository: LeaderboardRepository

    @Autowired
    lateinit var passwordEncoder: PasswordEncoder

    @Autowired
    lateinit var adminPasswordBackfill: AdminPasswordBackfill

    @Value("\${admin.password}")
    lateinit var adminPassword: String

    @Test
    fun `gives leaderboards from before this feature the default admin password`() {
        val legacyId = UUID.randomUUID()
        jdbcTemplate.update(
            "INSERT INTO leaderboard (id, name, scoring_mode, created_at, admin_password_hash) " +
                "VALUES (?, ?, ?, ?, NULL)",
            legacyId,
            "Pre-existing board",
            "WIN_COUNT",
            Timestamp.from(Instant.now()),
        )
        assertThat(leaderboardRepository.findAdminPasswordHash(legacyId)).isNull()

        adminPasswordBackfill.run(DefaultApplicationArguments())

        val hash = leaderboardRepository.findAdminPasswordHash(legacyId)
        assertThat(hash).isNotNull()
        assertThat(passwordEncoder.matches(adminPassword, hash)).isTrue()
    }
}
