package no.lars.leaderboard.repository

import no.lars.leaderboard.domain.Match
import no.lars.leaderboard.domain.MatchInput
import no.lars.leaderboard.domain.MatchOutcome
import no.lars.leaderboard.domain.MatchParticipant
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

@Repository
class MatchRepository(private val jdbcTemplate: JdbcTemplate) {

    @Transactional
    fun create(leaderboardId: UUID, input: MatchInput): Match {
        val matchId = UUID.randomUUID()
        val createdAt = Instant.now()

        jdbcTemplate.update(
            "INSERT INTO match (id, leaderboard_id, outcome, created_at) VALUES (?, ?, ?, ?)",
            matchId,
            leaderboardId,
            input.outcome.name,
            Timestamp.from(createdAt),
        )

        val rows = input.teamA.map { it to "A" } + input.teamB.map { it to "B" }
        jdbcTemplate.batchUpdate(
            "INSERT INTO match_participant (id, match_id, participant_id, team) VALUES (?, ?, ?, ?)",
            rows,
            rows.size,
        ) { ps, (participantId, team) ->
            ps.setObject(1, UUID.randomUUID())
            ps.setObject(2, matchId)
            ps.setObject(3, participantId)
            ps.setString(4, team)
        }

        return findById(matchId)!!
    }

    @Transactional
    fun update(matchId: UUID, input: MatchInput): Match? {
        val updated = jdbcTemplate.update(
            "UPDATE match SET outcome = ? WHERE id = ?",
            input.outcome.name,
            matchId,
        )
        if (updated == 0) return null

        jdbcTemplate.update("DELETE FROM match_participant WHERE match_id = ?", matchId)

        val rows = input.teamA.map { it to "A" } + input.teamB.map { it to "B" }
        jdbcTemplate.batchUpdate(
            "INSERT INTO match_participant (id, match_id, participant_id, team) VALUES (?, ?, ?, ?)",
            rows,
            rows.size,
        ) { ps, (participantId, team) ->
            ps.setObject(1, UUID.randomUUID())
            ps.setObject(2, matchId)
            ps.setObject(3, participantId)
            ps.setString(4, team)
        }

        return findById(matchId)
    }

    fun delete(matchId: UUID): Boolean =
        jdbcTemplate.update("DELETE FROM match WHERE id = ?", matchId) > 0

    fun findById(matchId: UUID): Match? {
        val match = jdbcTemplate.query(
            "SELECT id, leaderboard_id, outcome, created_at FROM match WHERE id = ?",
            { rs, _ ->
                MatchRow(
                    id = UUID.fromString(rs.getString("id")),
                    leaderboardId = UUID.fromString(rs.getString("leaderboard_id")),
                    outcome = MatchOutcome.valueOf(rs.getString("outcome")),
                    createdAt = rs.getTimestamp("created_at").toInstant(),
                )
            },
            matchId,
        ).firstOrNull() ?: return null

        val participants = findParticipants(matchId)
        return Match(
            id = match.id,
            leaderboardId = match.leaderboardId,
            teamA = participants.filter { it.first == "A" }.map { it.second },
            teamB = participants.filter { it.first == "B" }.map { it.second },
            outcome = match.outcome,
            createdAt = match.createdAt,
        )
    }

    fun findByLeaderboardId(leaderboardId: UUID): List<Match> {
        val matches = jdbcTemplate.query(
            "SELECT id, leaderboard_id, outcome, created_at FROM match WHERE leaderboard_id = ? ORDER BY created_at DESC",
            { rs, _ ->
                MatchRow(
                    id = UUID.fromString(rs.getString("id")),
                    leaderboardId = UUID.fromString(rs.getString("leaderboard_id")),
                    outcome = MatchOutcome.valueOf(rs.getString("outcome")),
                    createdAt = rs.getTimestamp("created_at").toInstant(),
                )
            },
            leaderboardId,
        )

        return matches.map { row ->
            val participants = findParticipants(row.id)
            Match(
                id = row.id,
                leaderboardId = row.leaderboardId,
                teamA = participants.filter { it.first == "A" }.map { it.second },
                teamB = participants.filter { it.first == "B" }.map { it.second },
                outcome = row.outcome,
                createdAt = row.createdAt,
            )
        }
    }

    private fun findParticipants(matchId: UUID): List<Pair<String, MatchParticipant>> =
        jdbcTemplate.query(
            "SELECT mp.team, mp.participant_id, p.name AS participant_name " +
                "FROM match_participant mp " +
                "JOIN participant p ON p.id = mp.participant_id " +
                "WHERE mp.match_id = ?",
            { rs, _ ->
                rs.getString("team") to MatchParticipant(
                    participantId = UUID.fromString(rs.getString("participant_id")),
                    participantName = rs.getString("participant_name"),
                )
            },
            matchId,
        )

    private data class MatchRow(
        val id: UUID,
        val leaderboardId: UUID,
        val outcome: MatchOutcome,
        val createdAt: Instant,
    )
}
