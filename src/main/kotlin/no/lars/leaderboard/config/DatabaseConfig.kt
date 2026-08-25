package no.lars.leaderboard.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import javax.sql.DataSource

@Configuration
class DatabaseConfig(val dataSource: DataSource) {

    @Bean
    fun jdbcTemplate(): JdbcTemplate =
        JdbcTemplate(dataSource)

    @Bean
    fun namedParameterJdbcTemplate(): NamedParameterJdbcTemplate =
        NamedParameterJdbcTemplate(dataSource)
}
