<?php
// includes/api/cambiar_estado.php
require_once '../conexion.php';
header('Content-Type: application/json');

$id = $_POST['id_producto'] ?? null;
$estado = $_POST['estado'] ?? null;

if (!$id || $estado === null) {
    echo json_encode(['status' => 'error', 'msg' => 'Faltan datos']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE productos SET estado = ? WHERE id_producto = ?");
    $stmt->execute([$estado, $id]);
    
    $mensaje = $estado == 1 ? 'Producto visible en la tienda' : 'Producto oculto';
    echo json_encode(['status' => 'success', 'msg' => $mensaje]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => 'Error: ' . $e->getMessage()]);
}
?>