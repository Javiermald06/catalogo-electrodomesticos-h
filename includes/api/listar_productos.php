<?php
// includes/api/listar_productos.php
// API combinada: Productos + Filtros en una sola conexión
require_once '../conexion.php';
header('Content-Type: application/json');

$categoria = $_GET['categoria'] ?? '';
$max_filtros = 10;
$excluir_filtros = ['Modelo', 'Incluye', 'Profundidad', 'Garantía'];

try {
    // ═══════════════════════════════════════════
    // 1. PRODUCTOS (optimizado con LEFT JOIN en vez de subqueries)
    // ═══════════════════════════════════════════
    $sql = "SELECT 
            p.*, 
            m.nombre as marca, 
            c.nombre as categoria,
            gi_main.ruta_imagen as img_principal,
            gi_all.galeria
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN galeria_imagenes gi_main ON gi_main.id_producto = p.id_producto AND gi_main.img_principal = 1
        LEFT JOIN (
            SELECT id_producto, GROUP_CONCAT(ruta_imagen ORDER BY img_principal DESC SEPARATOR ',') as galeria
            FROM galeria_imagenes GROUP BY id_producto
        ) gi_all ON gi_all.id_producto = p.id_producto
        WHERE p.estado = 1";
    
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Especificaciones en batch
    if (count($productos) > 0) {
        $ids = array_column($productos, 'id_producto');
        $placeholders = str_repeat('?,', count($ids) - 1) . '?';
        
        $sqlSpecs = "SELECT id_producto, nombre_atributo, valor_atributo FROM especificaciones WHERE id_producto IN ($placeholders)";
        $stmtSpecs = $pdo->prepare($sqlSpecs);
        $stmtSpecs->execute($ids);
        $specsArr = $stmtSpecs->fetchAll(PDO::FETCH_ASSOC);
        
        $specsGrouped = [];
        foreach ($specsArr as $spec) {
            $specsGrouped[$spec['id_producto']][$spec['nombre_atributo']] = $spec['valor_atributo'];
        }
        
        foreach ($productos as &$prod) {
            $prod['atributos'] = isset($specsGrouped[$prod['id_producto']]) 
                ? json_encode($specsGrouped[$prod['id_producto']]) 
                : '{}';
        }
    }
    
    // ═══════════════════════════════════════════
    // 2. FILTROS (mismo conexión, sin overhead extra)
    // ═══════════════════════════════════════════
    $filtros = [];
    $placeholdersExc = implode(',', array_fill(0, count($excluir_filtros), '?'));
    
    if (!empty($categoria) && $categoria !== 'null') {
        $stmtCat = $pdo->prepare("SELECT id_categoria FROM categorias WHERE nombre = ?");
        $stmtCat->execute([$categoria]);
        $cat = $stmtCat->fetch(PDO::FETCH_ASSOC);
        
        if ($cat) {
            $idCat = $cat['id_categoria'];
            
            // Una sola query: atributos top + sus opciones con GROUP_CONCAT
            $sqlFiltros = "SELECT e.nombre_atributo, 
                           GROUP_CONCAT(DISTINCT e.valor_atributo SEPARATOR '||') as opciones,
                           COUNT(*) AS freq
                           FROM especificaciones e
                           INNER JOIN productos p ON e.id_producto = p.id_producto
                           WHERE p.id_categoria = ? AND p.estado = 1
                           AND e.nombre_atributo NOT IN ($placeholdersExc)
                           GROUP BY e.nombre_atributo
                           ORDER BY freq DESC
                           LIMIT " . (int)$max_filtros;
            $stmtF = $pdo->prepare($sqlFiltros);
            $stmtF->execute(array_merge([$idCat], $excluir_filtros));
            $rawFiltros = $stmtF->fetchAll(PDO::FETCH_ASSOC);
        }
    } else {
        $sqlFiltros = "SELECT e.nombre_atributo, 
                       GROUP_CONCAT(DISTINCT e.valor_atributo SEPARATOR '||') as opciones,
                       COUNT(*) AS freq
                       FROM especificaciones e
                       INNER JOIN productos p ON e.id_producto = p.id_producto
                       WHERE p.estado = 1
                       AND e.nombre_atributo NOT IN ($placeholdersExc)
                       GROUP BY e.nombre_atributo
                       ORDER BY freq DESC
                       LIMIT " . (int)$max_filtros;
        $stmtF = $pdo->prepare($sqlFiltros);
        $stmtF->execute($excluir_filtros);
        $rawFiltros = $stmtF->fetchAll(PDO::FETCH_ASSOC);
    }
    
    if (!empty($rawFiltros)) {
        $idFake = 1;
        foreach ($rawFiltros as $attr) {
            $nombreAttr = $attr['nombre_atributo'];
            $label = ucwords(str_replace(['_', '-'], ' ', $nombreAttr));
            $opcionesCrudas = explode('||', $attr['opciones']);
            
            // Strip parenthesis
            $opcionesStripped = array_map(function($v) {
                return trim(preg_replace('/\s*\([^)]*\)/', '', $v));
            }, $opcionesCrudas);
            
            $opcionesLimpio = array_values(array_unique(array_filter($opcionesStripped, function($v) { return trim($v) !== ''; })));
            
            if (count($opcionesLimpio) > 0) {
                $filtros[] = [
                    'id_filtro' => $idFake++,
                    'campo' => $nombreAttr,
                    'label' => $label,
                    'tipo' => 'checkbox',
                    'opciones' => $opcionesLimpio
                ];
            }
        }
    }
    
    // ═══════════════════════════════════════════
    // 3. LISTAS GLOBALES PARA FILTROS (Incluyen productos inactivos)
    // ═══════════════════════════════════════════
    
    // Marcas Disponibles
    $sqlMarcas = "SELECT DISTINCT m.nombre FROM marcas m 
                  INNER JOIN productos p ON m.id_marca = p.id_marca";
    if (!empty($categoria) && $categoria !== 'null') {
        $sqlMarcas .= " INNER JOIN categorias c ON p.id_categoria = c.id_categoria WHERE c.nombre = ?";
        $stmtM = $pdo->prepare($sqlMarcas);
        $stmtM->execute([$categoria]);
    } else {
        $stmtM = $pdo->query($sqlMarcas);
    }
    $marcas_disponibles = $stmtM->fetchAll(PDO::FETCH_COLUMN);

    // Categorías Disponibles
    $sqlCats = "SELECT DISTINCT c.nombre FROM categorias c 
                INNER JOIN productos p ON c.id_categoria = p.id_categoria";
    $stmtC = $pdo->query($sqlCats);
    $categorias_disponibles = $stmtC->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'status' => 'success', 
        'data' => $productos,
        'filtros' => $filtros,
        'marcas_disponibles' => array_values(array_filter($marcas_disponibles)),
        'categorias_disponibles' => array_values(array_filter($categorias_disponibles))
    ]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>