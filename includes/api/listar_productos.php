<?php
// includes/api/listar_productos.php
// API combinada: Productos + Filtros en una sola conexión
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');

$categoria = $_GET['categoria'] ?? '';
$max_filtros = 10;
$excluir_filtros = ['Modelo', 'Incluye', 'Profundidad', 'Garantía'];

try {
    // ═══════════════════════════════════════════
    // 1. PRODUCTOS Y CATEGORÍAS/MARCAS (Optimizado)
    // ═══════════════════════════════════════════
    $sql = "SELECT 
            p.*, 
            m.nombre as marca, 
            c.nombre as categoria,
            gi_main.ruta_imagen as img_principal
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN galeria_imagenes gi_main ON gi_main.id_producto = p.id_producto AND gi_main.img_principal = 1
        WHERE p.estado = 1";
    
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $marcas_disponibles = [];
    $categorias_disponibles = [];
    $filtros = [];

    if (count($productos) > 0) {
        $ids = array_column($productos, 'id_producto');
        $placeholders = str_repeat('?,', count($ids) - 1) . '?';
        
        // ═══════════════════════════════════════════
        // 1a. ESPECIFICACIONES (Para filtros y atributos)
        // ═══════════════════════════════════════════
        $sqlSpecs = "SELECT id_producto, nombre_atributo, valor_atributo FROM especificaciones WHERE id_producto IN ($placeholders)";
        $stmtSpecs = $pdo->prepare($sqlSpecs);
        $stmtSpecs->execute($ids);
        $specsArr = $stmtSpecs->fetchAll(PDO::FETCH_ASSOC);
        
        $specsGrouped = [];
        $freq_filtros = [];
        $opciones_filtros = [];

        foreach ($specsArr as $spec) {
            $id = $spec['id_producto'];
            $attr = $spec['nombre_atributo'];
            $val = $spec['valor_atributo'];
            
            $specsGrouped[$id][$attr] = $val;
            
            // Lógica para contar frecuencias de filtros (reemplaza la consulta lenta de base de datos)
            if (in_array($attr, $excluir_filtros)) continue;
            
            // Guardamos para los filtros (solo lo contamos para la categoría actual si hay un filtro de categoría)
            if (!isset($opciones_filtros[$id])) {
                $opciones_filtros[$id] = [];
            }
            $opciones_filtros[$id][$attr] = $val;
        }
        
        // ═══════════════════════════════════════════
        // 1b. GALERÍA COMPLETA (Solo lo agrupamos en PHP, no subconsultas)
        // ═══════════════════════════════════════════
        $sqlGal = "SELECT id_producto, ruta_imagen FROM galeria_imagenes WHERE id_producto IN ($placeholders) ORDER BY img_principal DESC, orden ASC";
        $stmtGal = $pdo->prepare($sqlGal);
        $stmtGal->execute($ids);
        $galArr = $stmtGal->fetchAll(PDO::FETCH_ASSOC);
        
        $galGrouped = [];
        foreach($galArr as $g) {
            $galGrouped[$g['id_producto']][] = $g['ruta_imagen'];
        }

        // ═══════════════════════════════════════════
        // ENSAMBLAR DATOS
        // ═══════════════════════════════════════════
        foreach ($productos as &$prod) {
            $id = $prod['id_producto'];
            
            // Construir JSON de atributos
            $prod['atributos'] = isset($specsGrouped[$id]) ? json_encode($specsGrouped[$id]) : '{}';
            
            // Galería como cadena separada por comas
            $prod['galeria'] = isset($galGrouped[$id]) ? implode(',', $galGrouped[$id]) : '';
            
            // Poblamos las marcas y categorías globalmente (reemplaza Query 3 y 4)
            if (!empty($categoria) && $categoria !== 'null') {
                if (strcasecmp($prod['categoria'], $categoria) === 0) {
                    $marcas_disponibles[$prod['marca']] = 1;
                    
                    // Contar filtros solo para productos de esta categoría
                    if (isset($opciones_filtros[$id])) {
                        foreach ($opciones_filtros[$id] as $attr => $val) {
                            if (!isset($freq_filtros[$attr])) $freq_filtros[$attr] = ['count' => 0, 'opciones' => []];
                            $freq_filtros[$attr]['count']++;
                            $freq_filtros[$attr]['opciones'][] = $val;
                        }
                    }
                }
            } else {
                $marcas_disponibles[$prod['marca']] = 1;
                
                // Contar filtros de todos los productos
                if (isset($opciones_filtros[$id])) {
                    foreach ($opciones_filtros[$id] as $attr => $val) {
                        if (!isset($freq_filtros[$attr])) $freq_filtros[$attr] = ['count' => 0, 'opciones' => []];
                        $freq_filtros[$attr]['count']++;
                        $freq_filtros[$attr]['opciones'][] = $val;
                    }
                }
            }
            $categorias_disponibles[$prod['categoria']] = 1;
        }
        
        // ═══════════════════════════════════════════
        // DAR FORMATO FINAL A LOS FILTROS
        // ═══════════════════════════════════════════
        uasort($freq_filtros, function($a, $b) {
            return $b['count'] <=> $a['count'];
        });
        
        $filtros_top = array_slice($freq_filtros, 0, $max_filtros, true);
        
        $idFake = 1;
        foreach ($filtros_top as $nombreAttr => $data) {
            $label = ucwords(str_replace(['_', '-'], ' ', $nombreAttr));
            
            // Limpiar paréntesis y remover duplicados
            $opcionesStripped = array_map(function($v) {
                return trim(preg_replace('/\s*\([^)]*\)/', '', $v));
            }, $data['opciones']);
            
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
    } else {
        // En caso que no haya productos, de todas formas traemos categorías (Query de emergencia fallback)
        $sqlCats = "SELECT DISTINCT nombre FROM categorias";
        $stmtC = $pdo->query($sqlCats);
        $catList = $stmtC->fetchAll(PDO::FETCH_COLUMN);
        foreach($catList as $c) $categorias_disponibles[$c] = 1;
    }

    echo json_encode([
        'status' => 'success', 
        'data' => $productos,
        'filtros' => $filtros,
        'marcas_disponibles' => array_keys($marcas_disponibles),
        'categorias_disponibles' => array_keys($categorias_disponibles)
    ]);
} catch(PDOException $e) {
    respuesta_error($e, 'Error al cargar los productos.');
}
?>