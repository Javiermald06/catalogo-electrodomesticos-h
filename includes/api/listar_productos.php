<?php
// includes/api/listar_productos.php
require_once '../conexion.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT 
            p.*, 
            m.nombre as marca, 
            c.nombre as categoria,
            (SELECT ruta_imagen FROM galeria_imagenes WHERE id_producto = p.id_producto AND img_principal = 1 LIMIT 1) as img_principal,
            (SELECT GROUP_CONCAT(ruta_imagen ORDER BY img_principal DESC SEPARATOR ',') FROM galeria_imagenes WHERE id_producto = p.id_producto) as galeria,
            (SELECT GROUP_CONCAT(CONCAT(e.nombre_atributo, ':', e.valor_atributo) SEPARATOR '||') FROM especificaciones e WHERE e.id_producto = p.id_producto) as especificaciones_agrupadas
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        WHERE p.estado = 1
        GROUP BY p.id_producto";
    
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'data' => $productos]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>