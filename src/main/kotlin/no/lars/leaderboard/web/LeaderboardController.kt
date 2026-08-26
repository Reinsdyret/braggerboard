package no.lars.leaderboard.web

import no.lars.leaderboard.domain.Leaderboard
import no.lars.leaderboard.domain.LeaderboardDetails
import no.lars.leaderboard.service.LeaderboardService
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class CreateLeaderboardRequest(val name: String)

@RestController
class LeaderboardController(private val leaderboardService: LeaderboardService) {

    @PostMapping("/api/leaderboards")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody request: CreateLeaderboardRequest): Leaderboard =
        leaderboardService.create(request.name)

    @GetMapping("/api/leaderboards/{leaderboardId}")
    fun get(@PathVariable leaderboardId: UUID): ResponseEntity<LeaderboardDetails> =
        ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(leaderboardService.getDetails(leaderboardId))
}
