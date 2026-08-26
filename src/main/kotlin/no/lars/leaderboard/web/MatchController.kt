package no.lars.leaderboard.web

import no.lars.leaderboard.domain.Leaderboard
import no.lars.leaderboard.domain.Match
import no.lars.leaderboard.domain.MatchInput
import no.lars.leaderboard.domain.MatchOutcome
import no.lars.leaderboard.domain.ScoringMode
import no.lars.leaderboard.repository.MatchRepository
import no.lars.leaderboard.repository.ParticipantRepository
import no.lars.leaderboard.service.LeaderboardService
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.NoSuchElementException
import java.util.UUID

data class CreateMatchRequest(val teamA: List<UUID>, val teamB: List<UUID>, val outcome: MatchOutcome)

@RestController
class MatchController(
    private val matchRepository: MatchRepository,
    private val participantRepository: ParticipantRepository,
    private val leaderboardService: LeaderboardService,
) {

    @PostMapping("/api/leaderboards/{leaderboardId}/matches")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@PathVariable leaderboardId: UUID, @RequestBody request: CreateMatchRequest): Match {
        val leaderboard = leaderboardService.requireExists(leaderboardId)
        val input = validated(leaderboard, request)
        return matchRepository.create(leaderboardId, input)
    }

    @PutMapping("/api/matches/{matchId}")
    fun update(@PathVariable matchId: UUID, @RequestBody request: CreateMatchRequest): Match {
        val existing = matchRepository.findById(matchId) ?: throw NoSuchElementException("Match $matchId not found")
        val leaderboard = leaderboardService.requireExists(existing.leaderboardId)
        val input = validated(leaderboard, request)
        return matchRepository.update(matchId, input) ?: throw NoSuchElementException("Match $matchId not found")
    }

    @DeleteMapping("/api/matches/{matchId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable matchId: UUID) {
        val deleted = matchRepository.delete(matchId)
        if (!deleted) throw NoSuchElementException("Match $matchId not found")
    }

    @GetMapping("/api/leaderboards/{leaderboardId}/matches")
    fun list(@PathVariable leaderboardId: UUID): ResponseEntity<List<Match>> {
        leaderboardService.requireExists(leaderboardId)
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(matchRepository.findByLeaderboardId(leaderboardId))
    }

    private fun validated(leaderboard: Leaderboard, request: CreateMatchRequest): MatchInput {
        require(leaderboard.scoringMode == ScoringMode.ELO) { "This leaderboard uses win-count scoring, not matches" }
        val format = leaderboard.matchFormat!!

        require(request.teamA.size == format.teamSize && request.teamB.size == format.teamSize) {
            "Each team needs exactly ${format.teamSize} participant(s) for this leaderboard's format"
        }
        val allIds = request.teamA + request.teamB
        require(allIds.toSet().size == allIds.size) { "A participant can't appear more than once in a match" }

        val knownIds = participantRepository.findByLeaderboardId(leaderboard.id).map { it.id }.toSet()
        require(allIds.all { it in knownIds }) { "All participants must belong to this leaderboard" }

        return MatchInput(request.teamA, request.teamB, request.outcome)
    }
}
