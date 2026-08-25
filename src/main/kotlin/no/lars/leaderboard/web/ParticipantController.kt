package no.lars.leaderboard.web

import no.lars.leaderboard.domain.Participant
import no.lars.leaderboard.domain.ParticipantImage
import no.lars.leaderboard.repository.ParticipantRepository
import no.lars.leaderboard.service.LeaderboardService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.NoSuchElementException
import java.util.UUID

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
        leaderboardService.requireExists(leaderboardId)

        val participantImage = image?.takeIf { !it.isEmpty }?.let {
            require(it.contentType?.startsWith("image/") == true) { "Uploaded file must be an image" }
            ParticipantImage(data = it.bytes, contentType = it.contentType!!)
        }

        return participantRepository.create(leaderboardId, name.trim(), participantImage)
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
}
