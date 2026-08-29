package no.lars.leaderboard.repository

import no.lars.leaderboard.domain.Leaderboard
import no.lars.leaderboard.domain.ScoringMode
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
            scoringMode = ScoringMode.valueOf(rs.getString("scoring_mode")),
            teamSize = rs.getObject("team_size") as Int?,
            createdAt = rs.getTimestamp("created_at").toInstant(),
        )
    }

    fun create(name: String, scoringMode: ScoringMode, teamSize: Int?): Leaderboard {
        val leaderboard = Leaderboard(
            id = UUID.randomUUID(),
            name = name,
            scoringMode = scoringMode,
            teamSize = teamSize,
            createdAt = Instant.now(),
        )
        jdbcTemplate.update(
            "INSERT INTO leaderboard (id, name, scoring_mode, team_size, created_at) VALUES (?, ?, ?, ?, ?)",
            leaderboard.id,
            leaderboard.name,
            leaderboard.scoringMode.name,
            leaderboard.teamSize,
            Timestamp.from(leaderboard.createdAt),
        )
        return leaderboard
    }

    fun findById(id: UUID): Leaderboard? =
        jdbcTemplate.query(
            "SELECT id, name, scoring_mode, team_size, created_at FROM leaderboard WHERE id = ?",
            rowMapper,
            id,
        ).firstOrNull()
}
