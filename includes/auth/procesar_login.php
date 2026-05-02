<?php
// includes/auth/procesar_login.php
// ============================================================
// AUTENTICACIÓN — Login de Administrador
// Incluye: rate limiting, sesión segura, regeneración de ID
// ============================================================

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../seguridad.php';

header('Content-Type: application/json');

// ─── Rate Limiting: evitar fuerza bruta ───
verificar_rate_limit();

$user = trim($_POST['usuario'] ?? '');
$pass = $_POST['password'] ?? '';

if (empty($user) || empty($pass)) {
    echo json_encode(['status' => 'error', 'msg' => 'Completa todos los campos']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM administradores WHERE usuario = ? AND estado = 1");
    $stmt->execute([$user]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($pass, $admin['password_hash'])) {
        // ─── Login exitoso ───
        
        // Resetear contador de intentos fallidos
        resetear_rate_limit();
        
        // Regenerar ID de sesión para prevenir session fixation
        session_regenerate_id(true);
        
        $_SESSION['id_admin'] = $admin['id_admin'];
        $_SESSION['usuario'] = $admin['usuario'];
        $_SESSION['_login_time'] = time();
        $_SESSION['_user_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
        
        // Generar token CSRF para las operaciones de admin
        generar_csrf();
        
        echo json_encode(['status' => 'success', 'redirect' => 'admin.php']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Usuario o contraseña incorrectos']);
    }
} catch(PDOException $e) {
    respuesta_error($e, 'Error al procesar el inicio de sesión.');
}