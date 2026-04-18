<?php
// includes/api/importar_csv.php
require_once '../conexion.php';
header('Content-Type: application/json; charset=utf-8');

// Validar que el archivo CSV haya llegado correctamente
if (!isset($_FILES['archivo_csv']) || $_FILES['archivo_csv']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'msg' => 'No se recibió ningún archivo válido.']);
    exit;
}

$archivoTemp = $_FILES['archivo_csv']['tmp_name'];
ini_set('auto_detect_line_endings', TRUE);
set_time_limit(300);

try {
    $pdo->beginTransaction();

    $filasActualizadas = 0;
    $filasInsertadas = 0;
    
    // Arrays para Batch Processing
    $productosBatch = [];
    $skusAInsertar = [];
    $especificacionesCrudas = []; // sku => "spec||spec"

    if (($handle = fopen($archivoTemp, "r")) !== FALSE) {
        $primeraLinea = fgets($handle);
        $opciones = [',', ';', "\t", '|'];
        $delimitador = ',';
        $maxColumnas = 0;
        foreach ($opciones as $op) {
            $columnas = str_getcsv($primeraLinea, $op);
            if (count($columnas) > $maxColumnas) {
                $maxColumnas = count($columnas);
                $delimitador = $op;
            }
        }
        rewind($handle);
        fgetcsv($handle, 0, $delimitador); 

        // 1. Recolectar datos en memoria
        while (($datos = fgetcsv($handle, 0, $delimitador)) !== FALSE) {
            if (count($datos) >= 7) {
                $sku = trim((string)$datos[0]);
                $sku = preg_replace('/^[\xef\xbb\xbf]+/', '', $sku);
                $nombre = trim($datos[1]);
                $id_cat = (int)trim($datos[2]);
                $id_marca = (int)trim($datos[3]);
                $precio_reg = (float)trim($datos[4]);
                $precio_oferta = (float)trim($datos[5]);
                $stock = (int)trim($datos[6]);
                
                $especificaciones = isset($datos[7]) ? trim($datos[7]) : '';

                if(empty($sku) || empty($nombre)) continue;

                $productosBatch[] = [$sku, $nombre, $id_cat, $id_marca, $precio_reg, $precio_oferta, $stock, 1];
                $skusAInsertar[] = $sku;
                
                if (!empty($especificaciones)) {
                    $especificacionesCrudas[$sku] = $especificaciones;
                }
            }
        }
        fclose($handle);
    }
    
    // 2. UPSERT: Insertar si es nuevo, actualizar si el SKU ya existe
    if (!empty($productosBatch)) {
        // Preparar statement individual con ON DUPLICATE KEY UPDATE
        $sqlUpsert = "INSERT INTO productos (sku, nombre, id_categoria, id_marca, precio_regular, precio_oferta, stock, estado) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE 
                        nombre = VALUES(nombre),
                        id_categoria = VALUES(id_categoria),
                        id_marca = VALUES(id_marca),
                        precio_regular = VALUES(precio_regular),
                        precio_oferta = VALUES(precio_oferta),
                        stock = VALUES(stock),
                        estado = VALUES(estado)";
        $stmtUpsert = $pdo->prepare($sqlUpsert);
        
        foreach ($productosBatch as $prod) {
            $stmtUpsert->execute($prod);
            // rowCount() = 1 para INSERT, 2 para UPDATE
            if ($stmtUpsert->rowCount() === 1) {
                $filasInsertadas++;
            } else {
                $filasActualizadas++;
            }
        }
    }

    // 3. Recuperar IDs de los SKUs procesados
    $idMap = [];
    if (!empty($skusAInsertar)) {
        $chunksSkus = array_chunk($skusAInsertar, 200);
        foreach ($chunksSkus as $chunkS) {
            $inQuery = implode(',', array_fill(0, count($chunkS), '?'));
            $stmtIds = $pdo->prepare("SELECT sku, id_producto FROM productos WHERE sku IN ($inQuery)");
            $stmtIds->execute($chunkS);
            while ($row = $stmtIds->fetch(PDO::FETCH_ASSOC)) {
                $idMap[$row['sku']] = $row['id_producto'];
            }
        }
    }

    // 4. LIMPIAR especificaciones antiguas de los productos que vamos a actualizar
    if (!empty($idMap)) {
        $idsProductos = array_values($idMap);
        $chunksIds = array_chunk($idsProductos, 200);
        foreach ($chunksIds as $chunkIds) {
            $inQuery = implode(',', array_fill(0, count($chunkIds), '?'));
            $stmtDel = $pdo->prepare("DELETE FROM especificaciones WHERE id_producto IN ($inQuery)");
            $stmtDel->execute($chunkIds);
        }
    }
    
    // 5. Transformar e insertar Especificaciones nuevas
    $specsTotalesAInsertar = [];
    foreach ($especificacionesCrudas as $sku => $specsRaw) {
        if (isset($idMap[$sku])) {
            $idProdBase = $idMap[$sku];
            $specsRaw = str_replace('||', '|', $specsRaw);
            $specsArray = explode('|', $specsRaw);
            foreach ($specsArray as $spec) {
                $spec = trim($spec);
                if (empty($spec)) continue;
                $partes = explode(':', $spec, 2);
                if (count($partes) === 2) {
                    $specsTotalesAInsertar[] = [$idProdBase, trim($partes[0]), trim($partes[1])];
                }
            }
        }
    }

    // 6. Batch insert de especificaciones limpias
    if (!empty($specsTotalesAInsertar)) {
        $chunks = array_chunk($specsTotalesAInsertar, 300);
        foreach ($chunks as $chunk) {
            $marcadores = [];
            $valores = [];
            foreach ($chunk as $filaSpec) {
                $marcadores[] = "(?, ?, ?)";
                $valores[] = $filaSpec[0];
                $valores[] = $filaSpec[1];
                $valores[] = $filaSpec[2];
            }
            $sqlSpecBatch = "INSERT INTO especificaciones (id_producto, nombre_atributo, valor_atributo) VALUES " . implode(", ", $marcadores);
            $stmtSpecBatch = $pdo->prepare($sqlSpecBatch);
            $stmtSpecBatch->execute($valores);
        }
    }

    $pdo->commit();
    
    $msg = "Importación completada: $filasInsertadas productos nuevos, $filasActualizadas productos actualizados.";
    echo json_encode(['status' => 'success', 'msg' => $msg, 'nuevos' => $filasInsertadas, 'actualizados' => $filasActualizadas]);

} catch (Exception $e) {
    $pdo->rollBack();
    $mensajeError = $e->getMessage();
    if (strpos($mensajeError, 'Data too long for column \'sku\'') !== false) {
        $mensajeError .= " -> Verifique que el archivo CSV no tenga filas rotas.";
    }
    echo json_encode(['status' => 'error', 'msg' => 'Error de proceso BD: ' . $mensajeError]);
}
?>