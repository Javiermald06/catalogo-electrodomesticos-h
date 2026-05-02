<?php
// includes/api/guardar_orden_banners.php
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');

// ─── SEGURIDAD: Solo administradores ───
verificar_admin();

// Recibimos el array con el nuevo orden desde JavaScript
$datos = json_decode(file_get_contents("php://input"), true);

if (!$datos || !is_array($datos)) {
    echo json_encode(['status' => 'error', 'msg' => 'No se recibieron datos válidos']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("UPDATE banners SET orden = ? WHERE id_banner = ?");

    // Guardamos el nuevo orden de cada banner uno por uno
    foreach ($datos as $item) {
        if (isset($item['orden'], $item['id_banner'])) {
            $stmt->execute([(int)$item['orden'], (int)$item['id_banner']]);
        }
    }

    $pdo->commit();
    echo json_encode(['status' => 'success']);
} catch(PDOException $e) {
    $pdo->rollBack();
    respuesta_error($e, 'Error al guardar el orden de banners.');
}
?>