<?php
// includes/api/guardar_producto.php
require_once '../conexion.php';
header('Content-Type: application/json');

$nombre = $_POST['nombre'] ?? '';
$sku = $_POST['sku'] ?? '';
$precio = $_POST['precio'] ?? 0;
$stock = $_POST['stock'] ?? 0;
$id_cat = $_POST['categoria'] ?? null;
$id_mar = $_POST['marca'] ?? null;

try {
    $sql = "INSERT INTO productos (sku, nombre, id_categoria, id_marca, precio_regular, stock) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$sku, $nombre, $id_cat, $id_mar, $precio, $stock]);

    echo json_encode(['status' => 'success', 'msg' => 'Producto guardado en la nube']);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => 'Error al guardar: ' . $e->getMessage()]);
}