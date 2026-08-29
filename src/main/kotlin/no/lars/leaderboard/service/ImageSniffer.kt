package no.lars.leaderboard.service

/**
 * Detects an image's real format from its file signature (magic bytes) instead of trusting the
 * client-supplied Content-Type header, which is attacker-controlled. Deliberately excludes SVG:
 * it's XML and can carry a <script>, which would execute if the stored file is later opened
 * directly (e.g. "open image in new tab") rather than embedded via <img>.
 */
object ImageSniffer {

    fun detect(bytes: ByteArray): String? = when {
        matches(bytes, 0, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A) -> "image/png"
        matches(bytes, 0, 0xFF, 0xD8, 0xFF) -> "image/jpeg"
        matches(bytes, 0, 0x47, 0x49, 0x46, 0x38) -> "image/gif"
        matches(bytes, 0, 0x52, 0x49, 0x46, 0x46) && matches(bytes, 8, 0x57, 0x45, 0x42, 0x50) -> "image/webp"
        else -> null
    }

    private fun matches(bytes: ByteArray, offset: Int, vararg signature: Int): Boolean {
        if (bytes.size < offset + signature.size) return false
        return signature.indices.all { i -> (bytes[offset + i].toInt() and 0xFF) == signature[i] }
    }
}
