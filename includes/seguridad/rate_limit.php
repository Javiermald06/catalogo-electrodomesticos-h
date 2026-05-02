<?php
// includes/seguridad/rate_limit.php
// ============================================================
// MÓDULO: Rate Limiting para Login (anti fuerza bruta)
// ============================================================

require_once __DIR__ . '/../config.php';

/**
 * Verifica si la IP actual ha excedido el máximo de intentos de login.
 * Si se excede, responde con HTTP 429 (Too Many Requests) y bloquea.
 */
function verificar_rate_limit() {
    iniciar_sesion_segura();
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $clave = 'login_attempts_' . md5($ip);
    
    if (!isset($_SESSION[$clave])) {
        $_SESSION[$clave] = ['count' => 0, 'first_attempt' => time()];
    }

    $datos = &$_SESSION[$clave];

    // Si ya pasó el tiempo de bloqueo, reiniciar contador
    if (time() - $datos['first_attempt'] > LOGIN_LOCKOUT_TIME) {
        $datos['count'] = 0;
        $datos['first_attempt'] = time();
    }

    // Verificar si se excedió el límite
    if ($datos['count'] >= LOGIN_MAX_ATTEMPTS) {
        $tiempo_restante = LOGIN_LOCKOUT_TIME - (time() - $datos['first_attempt']);
        $minutos = ceil($tiempo_restante / 60);
        
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'msg' => "Demasiados intentos. Espere $minutos minutos antes de intentar de nuevo."
        ]);
        exit;
    }

    $datos['count']++;
}

/**
 * Resetea el contador de intentos tras un login exitoso.
 */
function resetear_rate_limit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $clave = 'login_attempts_' . md5($ip);
    unset($_SESSION[$clave]);
}
