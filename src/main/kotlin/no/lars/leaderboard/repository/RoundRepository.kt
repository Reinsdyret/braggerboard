package no.lars.leaderboard.repository

import no.lars.leaderboard.domain.Round
import no.lars.leaderboard.domain.RoundResult
import no.lars.leaderboard.domain.RoundResultInput
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

@Repository
class RoundRepository(private val jdbcTemplate: JdbcTemplate) {

    @Transactional
    fun create(leaderboardId: UUID, label: String?, results: List<RoundResultInput>): Round {
        val roundId = UUID.randomUUID()
        val createdAt = Instant.now()

        jdbcTemplate.update(
            "INSERT INTO round (id, leaderboard_id, label, created_at) VALUES (?, ?, ?, ?)",
            roundId,
            leaderboardId,
            label,
            Timestamp.from(createdAt),
        )

        jdbcTemplate.batchUpdate(
            "INSERT INTO round_result (id, round_id, participant_id, wins) VALUES (?, ?, ?, ?)",
            results,
            results.size,
        ) { ps, result ->
            ps.setObject(1, UUID.randomUUID())
            ps.setObject(2, roundId)
            ps.setObject(3, result.participantId)
            ps.setInt(4, result.wins)
        }

        return findById(roundId)!!
    }

    fun findById(roundId: UUID): Round? {
        val round = jdbcTemplate.query(
            "SELECT id, leaderboard_id, label, created_at FROM round WHERE id = ?",
            { rs, _ ->
                Triple(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("leaderboard_id")),
                    rs.getString("label") to rs.getTimestamp("created_at").toInstant(),
                )
            },
            roundId,
        ).firstOrNull() ?: return null

        return Round(
            id = round.first,
            leaderboardId = round.second,
            label = round.third.first,
            createdAt = round.third.second,
            results = findResults(roundId),
        )
    }

    fun findByLeaderboardId(leaderboardId: UUID): List<Round> {
        val rounds = jdbcTemplate.query(
            "SELECT id, leaderboard_id, label, created_at FROM round WHERE leaderboard_id = ? ORDER BY created_at DESC",
            { rs, _ ->
                Round(
                    id = UUID.fromString(rs.getString("id")),
                    leaderboardId = UUID.fromString(rs.getString("leaderboard_id")),
                    label = rs.getString("label"),
                    createdAt = rs.getTimestamp("created_at").toInstant(),
                    results = emptyList(),
                )
            },
            leaderboardId,
        )
        return rounds.map { it.copy(results = findResults(it.id)) }
    }

    fun totalWinsByLeaderboard(leaderboardId: UUID): Map<UUID, Int> =
        jdbcTemplate.query(
            "SELECT rr.participant_id, SUM(rr.wins) AS total_wins " +
                "FROM round_result rr " +
                "JOIN round r ON r.id = rr.round_id " +
                "WHERE r.leaderboard_id = ? " +
                "GROUP BY rr.participant_id",
            { rs, _ -> UUID.fromString(rs.getString("participant_id")) to rs.getInt("total_wins") },
            leaderboardId,
        ).toMap()

    private fun findResults(roundId: UUID): List<RoundResult> =
        jdbcTemplate.query(
            "SELECT rr.participant_id, p.name AS participant_name, rr.wins " +
                "FROM round_result rr " +
                "JOIN participant p ON p.id = rr.participant_id " +
                "WHERE rr.round_id = ? " +
                "ORDER BY rr.wins DESC, p.name ASC",
            { rs, _ ->
                RoundResult(
                    participantId = UUID.fromString(rs.getString("participant_id")),
                    participantName = rs.getString("participant_name"),
                    wins = rs.getInt("wins"),
                )
            },
            roundId,
        )
}
