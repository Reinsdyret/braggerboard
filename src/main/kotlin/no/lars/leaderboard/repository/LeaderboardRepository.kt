package no.lars.leaderboard.repository

import no.lars.leaderboard.domain.Leaderboard
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

@Repository
class LeaderboardRepository(private val jdbcTemplate: JdbcTemplate) {

    private val rowMapper = RowMapper { rs, _ ->
        Leaderboard(
            id = UUID.fromString(rs.getString("id")),
            name = rs.getString("name"),
            createdAt = rs.getTimestamp("created_at").toInstant(),
        )
    }

    fun create(name: String): Leaderboard {
        val leaderboard = Leaderboard(id = UUID.randomUUID(), name = name, createdAt = Instant.now())
        jdbcTemplate.update(
            "INSERT INTO leaderboard (id, name, created_at) VALUES (?, ?, ?)",
            leaderboard.id,
            leaderboard.name,
            Timestamp.from(leaderboard.createdAt),
        )
        return leaderboard
    }

    fun findById(id: UUID): Leaderboard? =
        jdbcTemplate.query("SELECT id, name, created_at FROM leaderboard WHERE id = ?", rowMapper, id)
            .firstOrNull()
}
