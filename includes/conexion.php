<?php
// includes/conexion.php
// ============================================================
// CONEXIÓN A BASE DE DATOS — ElectroHogar
// Las credenciales se leen desde config.php (nunca hardcodeadas aquí)
// ============================================================

require_once __DIR__ . '/config.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8";
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,  // Seguridad: fuerza prepared statements reales
    ]);
    
} catch(PDOException $e) {
    header('Content-Type: application/json');
    
    if (APP_DEBUG) {
        die(json_encode(['status' => 'error', 'msg' => 'Error de conexión: ' . $e->getMessage()]));
    } else {
        error_log('[ElectroHogar DB] ' . $e->getMessage());
        die(json_encode(['status' => 'error', 'msg' => 'Error de conexión al servidor. Intente más tarde.']));
    }
}
?>