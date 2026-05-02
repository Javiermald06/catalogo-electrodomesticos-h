<?php
// includes/seguridad/headers.php
// ============================================================
// MÓDULO: Headers HTTP de Seguridad
// ============================================================

/**
 * Envía headers HTTP que protegen contra ataques comunes:
 * - X-Content-Type-Options: evita MIME sniffing (XSS via upload)
 * - X-Frame-Options: previene clickjacking
 * - X-XSS-Protection: activa filtro XSS del navegador
 * - Referrer-Policy: controla información en el header Referer
 * - Permissions-Policy: desactiva APIs sensibles innecesarias
 */
function enviar_headers_seguridad() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
}
