<?php
// includes/api/listar_productos.php
require_once '../conexion.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT 
            p.*, 
            m.nombre as marca, 
            c.nombre as categoria,
            GROUP_CONCAT(CONCAT(e.nombre_atributo, ':', e.valor_atributo) SEPARATOR '||') as especificaciones_agrupadas
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN especificaciones e ON p.id_producto = e.id_producto
        WHERE p.estado = 1
        GROUP BY p.id_producto";
    
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll();
    
    echo json_encode(['status' => 'success', 'data' => $productos]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}