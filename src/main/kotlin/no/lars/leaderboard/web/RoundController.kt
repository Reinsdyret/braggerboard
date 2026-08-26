package no.lars.leaderboard.web

import no.lars.leaderboard.domain.Round
import no.lars.leaderboard.domain.RoundResultInput
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.RoundRepository
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

data class CreateRoundRequest(val label: String?, val results: List<RoundResultInput>)

@RestController
class RoundController(
    private val roundRepository: RoundRepository,
    private val leaderboardService: LeaderboardService,
) {

    @PostMapping("/api/leaderboards/{leaderboardId}/rounds")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@PathVariable leaderboardId: UUID, @RequestBody request: CreateRoundRequest): Round {
        val leaderboard = leaderboardService.requireExists(leaderboardId)
        require(leaderboard.scoringMode == ScoringMode.WIN_COUNT) { "This leaderboard uses Elo scoring, not rounds" }
        require(request.results.isNotEmpty()) { "A round needs at least one result" }
        require(request.results.all { it.wins >= 0 }) { "Wins must not be negative" }

        return roundRepository.create(leaderboardId, request.label?.trim()?.ifBlank { null }, request.results)
    }

    @GetMapping("/api/leaderboards/{leaderboardId}/rounds")
    fun list(@PathVariable leaderboardId: UUID): ResponseEntity<List<Round>> {
        leaderboardService.requireExists(leaderboardId)
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(roundRepository.findByLeaderboardId(leaderboardId))
    }
}
