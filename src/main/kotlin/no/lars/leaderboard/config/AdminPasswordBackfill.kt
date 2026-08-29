package no.lars.leaderboard.config

import no.lars.leaderboard.repository.LeaderboardRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

/**
 * Leaderboards created before the admin-password-to-delete feature existed have no
 * admin_password_hash yet. Give them the same default password as new leaderboards.
 */
@Component
class AdminPasswordBackfill(
    private val leaderboardRepository: LeaderboardRepository,
    private val passwordEncoder: PasswordEncoder,
    @Value("\${admin.password}") private val defaultAdminPassword: String,
) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        leaderboardRepository.backfillMissingAdminPasswordHashes(passwordEncoder.encode(defaultAdminPassword))
    }
}
