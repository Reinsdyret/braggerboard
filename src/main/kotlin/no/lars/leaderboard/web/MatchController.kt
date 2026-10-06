package no.lars.leaderboard.web

import no.lars.leaderboard.domain.Leaderboard
import no.lars.leaderboard.domain.MAX_TEAM_SIZE
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

// Editing or removing a recorded match rewrites everyone's Elo history, so it's admin-only.
data class UpdateMatchRequest(
    val teamA: List<UUID>,
    val teamB: List<UUID>,
    val outcome: MatchOutcome,
    val password: String = "",
)

data class DeleteMatchRequest(val password: String)

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
        val input = validated(leaderboard, request.teamA, request.teamB, request.outcome)
        return matchRepository.create(leaderboardId, input)
    }

    @PutMapping("/api/matches/{matchId}")
    fun update(@PathVariable matchId: UUID, @RequestBody request: UpdateMatchRequest): Match {
        val existing = matchRepository.findById(matchId) ?: throw NoSuchElementException("Match $matchId not found")
        leaderboardService.requireAdminPassword(existing.leaderboardId, request.password)
        val leaderboard = leaderboardService.requireExists(existing.leaderboardId)
        val input = validated(leaderboard, request.teamA, request.teamB, request.outcome)
        return matchRepository.update(matchId, input) ?: throw NoSuchElementException("Match $matchId not found")
    }

    @DeleteMapping("/api/matches/{matchId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable matchId: UUID, @RequestBody request: DeleteMatchRequest) {
        val existing = matchRepository.findById(matchId) ?: throw NoSuchElementException("Match $matchId not found")
        leaderboardService.requireAdminPassword(existing.leaderboardId, request.password)
        matchRepository.delete(matchId)
    }

    @GetMapping("/api/leaderboards/{leaderboardId}/matches")
    fun list(@PathVariable leaderboardId: UUID): ResponseEntity<List<Match>> {
        leaderboardService.requireExists(leaderboardId)
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(matchRepository.findByLeaderboardId(leaderboardId))
    }

    private fun validated(
        leaderboard: Leaderboard,
        teamA: List<UUID>,
        teamB: List<UUID>,
        outcome: MatchOutcome,
    ): MatchInput {
        require(leaderboard.scoringMode == ScoringMode.ELO) { "This leaderboard uses win-count scoring, not matches" }

        require(teamA.isNotEmpty()) { "Each team needs at least one participant" }
        require(teamA.size == teamB.size) { "Both teams must have the same number of participants" }
        require(teamA.size <= MAX_TEAM_SIZE) { "Each team can have at most $MAX_TEAM_SIZE participants" }

        val allIds = teamA + teamB
        require(allIds.toSet().size == allIds.size) { "A participant can't appear more than once in a match" }

        val knownIds = participantRepository.findByLeaderboardId(leaderboard.id).map { it.id }.toSet()
        require(allIds.all { it in knownIds }) { "All participants must belong to this leaderboard" }

        return MatchInput(teamA, teamB, outcome)
    }
}
