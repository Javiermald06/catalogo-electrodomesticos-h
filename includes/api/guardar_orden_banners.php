<?php
// includes/api/guardar_orden_banners.php
require_once '../conexion.php';
header('Content-Type: application/json');

// Recibimos el array con el nuevo orden desde JavaScript
$datos = json_decode(file_get_contents("php://input"), true);

if (!$datos) {
    echo json_encode(['status' => 'error', 'msg' => 'No se recibieron datos']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("UPDATE banners SET orden = ? WHERE id_banner = ?");

    // Guardamos el nuevo orden de cada banner uno por uno
    foreach ($datos as $item) {
        $stmt->execute([$item['orden'], $item['id_banner']]);
    }

    $pdo->commit();
    echo json_encode(['status' => 'success']);
} catch(PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>