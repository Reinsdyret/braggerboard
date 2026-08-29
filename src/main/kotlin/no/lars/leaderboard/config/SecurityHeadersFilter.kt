package no.lars.leaderboard.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Spring Security isn't used here (no login/session model), so the usual default security
 * headers it would add for free don't exist unless set explicitly.
 */
@Component
class SecurityHeadersFilter : OncePerRequestFilter() {

    // React Aria Components injects one small runtime <style> tag (touch-action rules for
    // pressable elements) - this is its exact, library-controlled content, not user input.
    // Allowlisting it by hash keeps style-src strict instead of opening it up with 'unsafe-inline'.
    // If a react-aria-components upgrade changes this snippet, the browser console's CSP
    // violation error reports the new hash to swap in here.
    private val reactAriaPressableStyleHash = "'sha256-38RhXrc7EdReTKsOm23ZPOCUgniTUUcjky8QOOrQx6o='"

    private val csp = listOf(
        "default-src 'self'",
        "img-src 'self' blob:",
        "style-src 'self' $reactAriaPressableStyleHash",
        "script-src 'self'",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ).joinToString("; ")

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        response.setHeader("X-Content-Type-Options", "nosniff")
        response.setHeader("X-Frame-Options", "DENY")
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        response.setHeader("Content-Security-Policy", csp)
        if (request.isSecure) {
            response.setHeader("Strict-Transport-Security", "max-age=31536000")
        }
        filterChain.doFilter(request, response)
    }
}
