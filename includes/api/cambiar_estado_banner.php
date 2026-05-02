<?php
// includes/api/cambiar_estado_banner.php
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');

// ─── SEGURIDAD: Solo administradores ───
verificar_admin();

$id = $_POST['id'] ?? null;
$estado = $_POST['estado'] ?? null;

if (!$id || $estado === null) {
    echo json_encode(['status' => 'error', 'msg' => 'Faltan datos']);
    exit;
}

// Sanitizar: estado solo puede ser 0 o 1
$estado = (int)$estado;
if ($estado !== 0 && $estado !== 1) {
    echo json_encode(['status' => 'error', 'msg' => 'Estado inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE banners SET estado = ? WHERE id_banner = ?");
    $stmt->execute([$estado, (int)$id]);
    echo json_encode(['status' => 'success']);
} catch(PDOException $e) {
    respuesta_error($e, 'Error al cambiar el estado del banner.');
}
?>