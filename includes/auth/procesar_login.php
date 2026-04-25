<?php
// includes/auth/procesar_login.php
require_once '../conexion.php';
header('Content-Type: application/json');

$user = $_POST['usuario'] ?? '';
$pass = $_POST['password'] ?? '';

if (empty($user) || empty($pass)) {
    echo json_encode(['status' => 'error', 'msg' => 'Completa todos los campos']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM administradores WHERE usuario = ? AND estado = 1");
$stmt->execute([$user]);
$admin = $stmt->fetch();

if ($admin && password_verify($pass, $admin['password_hash'])) {
    session_start();
    $_SESSION['id_admin'] = $admin['id_admin'];
    $_SESSION['usuario'] = $admin['usuario'];
    echo json_encode(['status' => 'success', 'redirect' => 'admin.php']);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Usuario o contraseña incorrectos']);
}