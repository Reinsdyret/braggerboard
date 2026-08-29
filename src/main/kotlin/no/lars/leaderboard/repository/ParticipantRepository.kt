package no.lars.leaderboard.repository

import no.lars.leaderboard.domain.ChangeField
import no.lars.leaderboard.domain.Participant
import no.lars.leaderboard.domain.ParticipantChange
import no.lars.leaderboard.domain.ParticipantImage
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

@Repository
class ParticipantRepository(private val jdbcTemplate: JdbcTemplate) {

    private val rowMapper = RowMapper { rs, _ ->
        Participant(
            id = UUID.fromString(rs.getString("id")),
            leaderboardId = UUID.fromString(rs.getString("leaderboard_id")),
            name = rs.getString("name"),
            hasImage = rs.getBoolean("has_image"),
            createdAt = rs.getTimestamp("created_at").toInstant(),
        )
    }

    fun create(leaderboardId: UUID, name: String, image: ParticipantImage?): Participant {
        val participant = Participant(
            id = UUID.randomUUID(),
            leaderboardId = leaderboardId,
            name = name,
            hasImage = image != null,
            createdAt = Instant.now(),
        )
        jdbcTemplate.update(
            "INSERT INTO participant (id, leaderboard_id, name, image_data, image_content_type, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?)",
            participant.id,
            participant.leaderboardId,
            participant.name,
            image?.data,
            image?.contentType,
            Timestamp.from(participant.createdAt),
        )
        return participant
    }

    fun findByLeaderboardId(leaderboardId: UUID): List<Participant> =
        jdbcTemplate.query(
            "SELECT id, leaderboard_id, name, created_at, (image_data IS NOT NULL) AS has_image " +
                "FROM participant WHERE leaderboard_id = ? ORDER BY created_at ASC",
            rowMapper,
            leaderboardId,
        )

    fun findById(id: UUID): Participant? =
        jdbcTemplate.query(
            "SELECT id, leaderboard_id, name, created_at, (image_data IS NOT NULL) AS has_image " +
                "FROM participant WHERE id = ?",
            rowMapper,
            id,
        ).firstOrNull()

    fun findImage(id: UUID): ParticipantImage? =
        jdbcTemplate.query(
            "SELECT image_data, image_content_type FROM participant WHERE id = ? AND image_data IS NOT NULL",
            { rs, _ -> ParticipantImage(data = rs.getBytes("image_data"), contentType = rs.getString("image_content_type")) },
            id,
        ).firstOrNull()

    fun delete(id: UUID): Boolean =
        jdbcTemplate.update("DELETE FROM participant WHERE id = ?", id) > 0

    fun updateName(id: UUID, name: String) {
        jdbcTemplate.update("UPDATE participant SET name = ? WHERE id = ?", name, id)
    }

    fun updateImage(id: UUID, image: ParticipantImage?) {
        jdbcTemplate.update(
            "UPDATE participant SET image_data = ?, image_content_type = ? WHERE id = ?",
            image?.data,
            image?.contentType,
            id,
        )
    }

    fun logChange(participantId: UUID, field: ChangeField, oldValue: String?, newValue: String?) {
        jdbcTemplate.update(
            "INSERT INTO participant_change (id, participant_id, field, old_value, new_value, changed_at) " +
                "VALUES (?, ?, ?, ?, ?, ?)",
            UUID.randomUUID(),
            participantId,
            field.name,
            oldValue,
            newValue,
            Timestamp.from(Instant.now()),
        )
    }

    fun findChanges(participantId: UUID): List<ParticipantChange> =
        jdbcTemplate.query(
            "SELECT id, participant_id, field, old_value, new_value, changed_at " +
                "FROM participant_change WHERE participant_id = ? ORDER BY changed_at DESC",
            { rs, _ ->
                ParticipantChange(
                    id = UUID.fromString(rs.getString("id")),
                    participantId = UUID.fromString(rs.getString("participant_id")),
                    field = ChangeField.valueOf(rs.getString("field")),
                    oldValue = rs.getString("old_value"),
                    newValue = rs.getString("new_value"),
                    changedAt = rs.getTimestamp("changed_at").toInstant(),
                )
            },
            participantId,
        )
}
