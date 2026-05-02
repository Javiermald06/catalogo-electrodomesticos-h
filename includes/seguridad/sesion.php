<?php
// includes/seguridad/sesion.php
// ============================================================
// MÓDULO: Gestión de Sesiones y Autenticación
// ============================================================

require_once __DIR__ . '/../config.php';

/**
 * Inicia una sesión con configuración segura.
 * - Cookies httponly (no accesibles desde JS)
 * - SameSite=Strict (protección CSRF)
 * - Regeneración periódica del ID de sesión
 */
function iniciar_sesion_segura() {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    $cookieParams = [
        'lifetime' => SESSION_LIFETIME,
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Strict'
    ];

    session_set_cookie_params($cookieParams);
    session_name(SESSION_NAME);
    session_start();

    // Regenerar ID de sesión periódicamente (cada 30 min)
    if (!isset($_SESSION['_last_regeneration'])) {
        $_SESSION['_last_regeneration'] = time();
    } elseif (time() - $_SESSION['_last_regeneration'] > 1800) {
        session_regenerate_id(true);
        $_SESSION['_last_regeneration'] = time();
    }
}

/**
 * Verifica que el usuario actual sea administrador.
 * Si no lo es, responde con HTTP 401 y termina la ejecución.
 */
function verificar_admin() {
    iniciar_sesion_segura();
    
    if (!isset($_SESSION['id_admin'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'msg' => 'No autorizado. Inicie sesión como administrador.'
        ]);
        exit;
    }
}
