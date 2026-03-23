<?php
// includes/api/listar_productos.php
require_once '../conexion.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT p.*, c.nombre as categoria, m.nombre as marca 
            FROM productos p 
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            LEFT JOIN marcas m ON p.id_marca = m.id_marca
            WHERE p.estado = 1";
    
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll();
    
    echo json_encode(['status' => 'success', 'data' => $productos]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}