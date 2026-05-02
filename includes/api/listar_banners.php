<?php
// includes/api/listar_banners.php
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');
try {
    $stmt = $pdo->query("SELECT * FROM banners ORDER BY orden ASC, id_banner DESC");
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch(PDOException $e) {
    respuesta_error($e, 'Error al cargar los banners.');
}
?>