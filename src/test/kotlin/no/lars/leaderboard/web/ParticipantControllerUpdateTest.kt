package no.lars.leaderboard.web

import no.lars.leaderboard.domain.ChangeField
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.LeaderboardRepository
import no.lars.leaderboard.repository.ParticipantRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockMultipartFile

@SpringBootTest
class ParticipantControllerUpdateTest {

    @Autowired
    lateinit var participantController: ParticipantController

    @Autowired
    lateinit var leaderboardRepository: LeaderboardRepository

    @Autowired
    lateinit var participantRepository: ParticipantRepository

    private val realPng = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0)

    @Test
    fun `renaming a participant logs the old and new name`() {
        val board = leaderboardRepository.create("Board", ScoringMode.WIN_COUNT, null, "test-hash")
        val alice = participantRepository.create(board.id, "Alice", null)

        val updated = participantController.update(alice.id, name = "Alicia", image = null, removeImage = false)

        assertThat(updated.name).isEqualTo("Alicia")
        val changes = participantController.changes(alice.id).body!!
        assertThat(changes).hasSize(1)
        assertThat(changes[0].field).isEqualTo(ChangeField.NAME)
        assertThat(changes[0].oldValue).isEqualTo("Alice")
        assertThat(changes[0].newValue).isEqualTo("Alicia")
    }

    @Test
    fun `renaming to the exact same name does not create a log entry`() {
        val board = leaderboardRepository.create("Board 2", ScoringMode.WIN_COUNT, null, "test-hash")
        val bob = participantRepository.create(board.id, "Bob", null)

        participantController.update(bob.id, name = "Bob", image = null, removeImage = false)

        assertThat(participantController.changes(bob.id).body).isEmpty()
    }

    @Test
    fun `adding then removing a photo logs both changes`() {
        val board = leaderboardRepository.create("Board 3", ScoringMode.WIN_COUNT, null, "test-hash")
        val carl = participantRepository.create(board.id, "Carl", null)
        val file = MockMultipartFile("image", "avatar.png", "image/png", realPng)

        val withPhoto = participantController.update(carl.id, name = null, image = file, removeImage = false)
        assertThat(withPhoto.hasImage).isTrue()

        val withoutPhoto = participantController.update(carl.id, name = null, image = null, removeImage = true)
        assertThat(withoutPhoto.hasImage).isFalse()

        val changes = participantController.changes(carl.id).body!!
        assertThat(changes).hasSize(2)
        assertThat(changes[0].field).isEqualTo(ChangeField.IMAGE) // most recent first
        assertThat(changes[0].oldValue).isEqualTo("photo")
        assertThat(changes[0].newValue).isEqualTo("none")
        assertThat(changes[1].oldValue).isEqualTo("none")
        assertThat(changes[1].newValue).isEqualTo("photo")
    }

    @Test
    fun `rejects a spoofed non-image file on update, same as on create`() {
        val board = leaderboardRepository.create("Board 4", ScoringMode.WIN_COUNT, null, "test-hash")
        val dave = participantRepository.create(board.id, "Dave", null)
        val fake = MockMultipartFile("image", "fake.png", "image/png", "not a real image".toByteArray())

        assertThatThrownBy {
            participantController.update(dave.id, name = null, image = fake, removeImage = false)
        }.isInstanceOf(IllegalArgumentException::class.java)

        assertThat(participantController.changes(dave.id).body).isEmpty()
    }

    @Test
    fun `rejects blank or too-long names on update`() {
        val board = leaderboardRepository.create("Board 5", ScoringMode.WIN_COUNT, null, "test-hash")
        val eve = participantRepository.create(board.id, "Eve", null)

        assertThatThrownBy {
            participantController.update(eve.id, name = "   ", image = null, removeImage = false)
        }.isInstanceOf(IllegalArgumentException::class.java)

        assertThatThrownBy {
            participantController.update(eve.id, name = "x".repeat(101), image = null, removeImage = false)
        }.isInstanceOf(IllegalArgumentException::class.java)
    }
}
