<?php
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');
$categoria = $_GET['categoria'] ?? '';
$max_filtros = 10; // número máximo de atributos a mostrar

// Atributos que NO deben aparecer como filtros
$excluir_filtros = ['Modelo', 'Incluye', 'Profundidad','Garantía', 'Seguridad'];

try {
    $topAtributos = [];
    if (!empty($categoria) && $categoria !== 'null') {
        // Obtener ID de la categoría
        $stmtCat = $pdo->prepare("SELECT id_categoria FROM categorias WHERE nombre = ?");
        $stmtCat->execute([$categoria]);
        $cat = $stmtCat->fetch(PDO::FETCH_ASSOC);
        
        if (!$cat) { 
            echo json_encode(['status' => 'success', 'data' => []]); 
            exit; 
        }
        $idCat = $cat['id_categoria'];

        // 1️⃣ Obtener los atributos más frecuentes en esta categoría (solo activos)
        $placeholders = implode(',', array_fill(0, count($excluir_filtros), '?'));
        $sqlTop = "SELECT e.nombre_atributo, COUNT(*) AS freq
                   FROM especificaciones e
                   INNER JOIN productos p ON e.id_producto = p.id_producto
                   WHERE p.id_categoria = ? AND p.estado = 1
                   AND e.nombre_atributo NOT IN ($placeholders)
                   GROUP BY e.nombre_atributo
                   ORDER BY freq DESC
                   LIMIT " . (int)$max_filtros;
        $stmtTop = $pdo->prepare($sqlTop);
        $stmtTop->execute(array_merge([$idCat], $excluir_filtros));
        $topAtributos = $stmtTop->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // Para todo el catálogo global
        $placeholders = implode(',', array_fill(0, count($excluir_filtros), '?'));
        $sqlTop = "SELECT e.nombre_atributo, COUNT(*) AS freq
                   FROM especificaciones e
                   INNER JOIN productos p ON e.id_producto = p.id_producto
                   WHERE p.estado = 1
                   AND e.nombre_atributo NOT IN ($placeholders)
                   GROUP BY e.nombre_atributo
                   ORDER BY freq DESC
                   LIMIT " . (int)$max_filtros;
        $stmtTop = $pdo->prepare($sqlTop);
        $stmtTop->execute($excluir_filtros);
        $topAtributos = $stmtTop->fetchAll(PDO::FETCH_ASSOC);
    }

    $filtros = [];
    $idFake = 1;
    foreach ($topAtributos as $attr) {
        $nombreAttr = $attr['nombre_atributo'];
        $label = ucwords(str_replace(['_', '-'], ' ', $nombreAttr));
        
        // 2. Traer las opciones únicas para este atributo
        if (isset($idCat)) {
            $sqlOpciones = "SELECT DISTINCT e.valor_atributo
                            FROM especificaciones e
                            INNER JOIN productos p ON e.id_producto = p.id_producto
                            WHERE p.id_categoria = ? AND p.estado = 1 AND e.nombre_atributo = ?";
            $stmtOpt = $pdo->prepare($sqlOpciones);
            $stmtOpt->execute([$idCat, $nombreAttr]);
        } else {
            $sqlOpciones = "SELECT DISTINCT e.valor_atributo
                            FROM especificaciones e
                            INNER JOIN productos p ON e.id_producto = p.id_producto
                            WHERE p.estado = 1 AND e.nombre_atributo = ?";
            $stmtOpt = $pdo->prepare($sqlOpciones);
            $stmtOpt->execute([$nombreAttr]);
        }
        
        $opcionesCrudas = $stmtOpt->fetchAll(PDO::FETCH_COLUMN);
        
        // Strip parenthesis for the filter options, and get unique non-empty values
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

    echo json_encode(['status' => 'success', 'data' => $filtros]);
} catch (Exception $e) {
    respuesta_error($e, 'Error al cargar los filtros.');
}
?>