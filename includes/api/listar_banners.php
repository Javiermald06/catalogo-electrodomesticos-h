<?php
// includes/api/listar_banners.php
require_once '../conexion.php';
header('Content-Type: application/json');
try {
    // ¡AQUÍ CAMBIAMOS EL ORDER BY!
    $stmt = $pdo->query("SELECT * FROM banners ORDER BY orden ASC, id_banner DESC");
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch(PDOException $e) { echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]); }
?>