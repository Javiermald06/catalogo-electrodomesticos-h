<?php
// includes/api/get_stats.php
require_once '../conexion.php';
header('Content-Type: application/json');

try {
    $hoy = date('Y-m-d');

    // 1. Visitas de hoy (desde la nueva tabla diaria)
    $stmt = $pdo->prepare("SELECT cantidad FROM visitas_diarias WHERE fecha = ?");
    $stmt->execute([$hoy]);
    $visitas_hoy = $stmt->fetchColumn() ?: 0;

    // 2. Total Productos Activos/Ocultos
    $stmt = $pdo->query("SELECT COUNT(*) FROM productos");
    $total_productos = $stmt->fetchColumn();
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM productos WHERE estado = 0");
    $productos_ocultos = $stmt->fetchColumn();

    // 3. Total Categorías
    $stmt = $pdo->query("SELECT COUNT(*) FROM categorias");
    $total_categorias = $stmt->fetchColumn();

    // 4. Total Marcas
    $stmt = $pdo->query("SELECT COUNT(*) FROM marcas");
    $total_marcas = $stmt->fetchColumn();

    // 5. Gráfico circular: Productos por categoría
    $stmt = $pdo->query("SELECT c.nombre, COUNT(p.id_producto) as cantidad 
                        FROM categorias c 
                        LEFT JOIN productos p ON c.id_categoria = p.id_categoria 
                        GROUP BY c.id_categoria");
    $grafico_categorias = $stmt->fetchAll();

    // 6. Gráfico de barras: Visitas última semana
    $stmt = $pdo->query("SELECT fecha, cantidad FROM visitas_diarias 
                        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
                        ORDER BY fecha ASC");
    $visitas_semanales = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => [
            'visitas_hoy' => (int)$visitas_hoy,
            'productos' => (int)$total_productos,
            'productos_ocultos' => (int)$productos_ocultos,
            'categorias' => (int)$total_categorias,
            'marcas' => (int)$total_marcas,
            'grafico_categorias' => $grafico_categorias,
            'visitas_semanales' => $visitas_semanales
        ]
    ]);

} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
