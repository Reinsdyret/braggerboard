package no.lars.leaderboard.web

import no.lars.leaderboard.domain.ChangeField
import no.lars.leaderboard.domain.Participant
import no.lars.leaderboard.domain.ParticipantChange
import no.lars.leaderboard.domain.ParticipantImage
import no.lars.leaderboard.repository.ParticipantRepository
import no.lars.leaderboard.service.ImageSniffer
import no.lars.leaderboard.service.LeaderboardService
import org.springframework.http.CacheControl
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.NoSuchElementException
import java.util.UUID

private const val MAX_NAME_LENGTH = 100

@RestController
class ParticipantController(
    private val participantRepository: ParticipantRepository,
    private val leaderboardService: LeaderboardService,
) {

    @PostMapping(
        "/api/leaderboards/{leaderboardId}/participants",
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE],
    )
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @PathVariable leaderboardId: UUID,
        @RequestParam name: String,
        @RequestParam(required = false) image: MultipartFile?,
    ): Participant {
        require(name.isNotBlank()) { "Participant name must not be blank" }
        require(name.length <= MAX_NAME_LENGTH) { "Participant name must be $MAX_NAME_LENGTH characters or fewer" }
        leaderboardService.requireExists(leaderboardId)

        val participantImage = image?.takeIf { !it.isEmpty }?.let { validatedImage(it) }

        return participantRepository.create(leaderboardId, name.trim(), participantImage)
    }

    @PutMapping(
        "/api/participants/{participantId}",
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE],
    )
    fun update(
        @PathVariable participantId: UUID,
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) image: MultipartFile?,
        @RequestParam(required = false, defaultValue = "false") removeImage: Boolean,
    ): Participant {
        val existing = participantRepository.findById(participantId)
            ?: throw NoSuchElementException("Participant $participantId not found")

        if (name != null) {
            val trimmed = name.trim()
            require(trimmed.isNotBlank()) { "Participant name must not be blank" }
            require(trimmed.length <= MAX_NAME_LENGTH) { "Participant name must be $MAX_NAME_LENGTH characters or fewer" }
            if (trimmed != existing.name) {
                participantRepository.logChange(participantId, ChangeField.NAME, existing.name, trimmed)
                participantRepository.updateName(participantId, trimmed)
            }
        }

        val newImage = image?.takeIf { !it.isEmpty }?.let { validatedImage(it) }
        if (newImage != null) {
            participantRepository.logChange(
                participantId,
                ChangeField.IMAGE,
                if (existing.hasImage) "photo" else "none",
                "photo",
            )
            participantRepository.updateImage(participantId, newImage)
        } else if (removeImage && existing.hasImage) {
            participantRepository.logChange(participantId, ChangeField.IMAGE, "photo", "none")
            participantRepository.updateImage(participantId, null)
        }

        return participantRepository.findById(participantId)!!
    }

    @GetMapping("/api/participants/{participantId}/changes")
    fun changes(@PathVariable participantId: UUID): ResponseEntity<List<ParticipantChange>> {
        participantRepository.findById(participantId)
            ?: throw NoSuchElementException("Participant $participantId not found")
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(participantRepository.findChanges(participantId))
    }

    @GetMapping("/api/participants/{participantId}/image")
    fun getImage(@PathVariable participantId: UUID): ResponseEntity<ByteArray> {
        val image = participantRepository.findImage(participantId)
            ?: throw NoSuchElementException("No image for participant $participantId")

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, image.contentType)
            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
            .body(image.data)
    }

    @DeleteMapping("/api/participants/{participantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable participantId: UUID) {
        val deleted = participantRepository.delete(participantId)
        if (!deleted) throw NoSuchElementException("Participant $participantId not found")
    }

    private fun validatedImage(file: MultipartFile): ParticipantImage {
        val bytes = file.bytes
        val detectedType = ImageSniffer.detect(bytes)
            ?: throw IllegalArgumentException("Uploaded file must be a PNG, JPEG, GIF, or WebP image")
        return ParticipantImage(data = bytes, contentType = detectedType)
    }
}
