<?php
// includes/seguridad/csrf.php
// ============================================================
// MÓDULO: Protección CSRF (Cross-Site Request Forgery)
// ============================================================

require_once __DIR__ . '/../config.php';

/**
 * Genera un token CSRF único por sesión.
 * @return string El token CSRF almacenado en la sesión.
 */
function generar_csrf() {
    iniciar_sesion_segura();
    
    if (empty($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Verifica que el token CSRF enviado sea válido.
 * Busca el token en POST o en el header X-CSRF-TOKEN.
 * Si es inválido, responde con HTTP 403 y termina la ejecución.
 */
function verificar_csrf() {
    iniciar_sesion_segura();
    
    $token = $_POST[CSRF_TOKEN_NAME] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    
    if (empty($token) || !hash_equals($_SESSION[CSRF_TOKEN_NAME] ?? '', $token)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'msg' => 'Token de seguridad inválido. Recargue la página e intente de nuevo.'
        ]);
        exit;
    }
}
