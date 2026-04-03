<?php
// includes/api/listar_productos_admin.php
require_once '../conexion.php';
header('Content-Type: application/json');

try {
    // Consulta perfecta: Usamos subconsultas para evitar errores de agrupamiento
    // Si la tabla galeria_imagenes está vacía, la subconsulta simplemente devolverá NULL sin romper nada.
    $sql = "SELECT 
            p.*, 
            m.nombre as marca, 
            c.nombre as categoria,
            (SELECT ruta_imagen FROM galeria_imagenes WHERE id_producto = p.id_producto AND img_principal = 1 LIMIT 1) as img_principal,
            (SELECT GROUP_CONCAT(CONCAT(nombre_atributo, ':', valor_atributo) SEPARATOR '||') FROM especificaciones WHERE id_producto = p.id_producto) as especificaciones_agrupadas
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        ORDER BY p.id_producto DESC";
    
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'data' => $productos]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>