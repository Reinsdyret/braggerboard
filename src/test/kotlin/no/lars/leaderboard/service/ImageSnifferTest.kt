package no.lars.leaderboard.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ImageSnifferTest {

    @Test
    fun `detects PNG from magic bytes`() {
        val png = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0)
        assertThat(ImageSniffer.detect(png)).isEqualTo("image/png")
    }

    @Test
    fun `detects JPEG from magic bytes`() {
        val jpeg = byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte(), 0, 0)
        assertThat(ImageSniffer.detect(jpeg)).isEqualTo("image/jpeg")
    }

    @Test
    fun `detects GIF from magic bytes`() {
        val gif = "GIF89a".toByteArray() + byteArrayOf(0, 0)
        assertThat(ImageSniffer.detect(gif)).isEqualTo("image/gif")
    }

    @Test
    fun `detects WebP from magic bytes`() {
        val webp = "RIFF".toByteArray() + byteArrayOf(0, 0, 0, 0) + "WEBP".toByteArray()
        assertThat(ImageSniffer.detect(webp)).isEqualTo("image/webp")
    }

    @Test
    fun `rejects SVG - it's XML and can carry a script`() {
        val svg = "<svg onload=\"alert(1)\"></svg>".toByteArray()
        assertThat(ImageSniffer.detect(svg)).isNull()
    }

    @Test
    fun `rejects a file with a spoofed image content-type but arbitrary bytes`() {
        val notAnImage = "<html><script>alert(document.cookie)</script></html>".toByteArray()
        assertThat(ImageSniffer.detect(notAnImage)).isNull()
    }

    @Test
    fun `rejects empty or too-short input`() {
        assertThat(ImageSniffer.detect(ByteArray(0))).isNull()
        assertThat(ImageSniffer.detect(byteArrayOf(0x89.toByte(), 0x50))).isNull()
    }
}
