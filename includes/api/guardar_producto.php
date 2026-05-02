<?php
// includes/api/guardar_producto.php
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');

// ─── SEGURIDAD: Solo administradores pueden guardar productos ───
verificar_admin();

$id_producto = $_POST['id_producto'] ?? null;
$nombre = trim($_POST['nombre'] ?? '');
$sku = trim($_POST['sku'] ?? '');
$id_categoria = $_POST['id_categoria'] ?? null;
$id_marca = $_POST['id_marca'] ?? null;
$stock = (int)($_POST['stock'] ?? 0);
$precio_regular = (float)($_POST['precio_regular'] ?? 0);
$precio_oferta = (float)($_POST['precio_oferta'] ?? 0);
$especificaciones = $_POST['especificaciones_agrupadas'] ?? '';

// 1. Procesar Orden de Imágenes
$imagenes_finales = [];
$orden_json = $_POST['imagenes_orden'] ?? '[]';
$orden = json_decode($orden_json, true);

$directorioDestino = '../../assets/img_productos/'; 
$nuevas_subidas = [];

// Procesar archivos nuevos con validación de imagen
if (!empty($_FILES['imagenes']['name'][0])) {
    foreach ($_FILES['imagenes']['tmp_name'] as $i => $tmpName) {
        if ($tmpName != "") {
            // ─── SEGURIDAD: Validar que sea una imagen real ───
            $archivo = [
                'name' => $_FILES['imagenes']['name'][$i],
                'tmp_name' => $tmpName,
                'size' => $_FILES['imagenes']['size'][$i],
                'error' => $_FILES['imagenes']['error'][$i]
            ];
            
            $errores = validar_imagen($archivo);
            if (!empty($errores)) {
                // Saltar archivos no válidos silenciosamente
                continue;
            }
            
            // Usar solo extensiones seguras
            $extension = strtolower(pathinfo($_FILES['imagenes']['name'][$i], PATHINFO_EXTENSION));
            $nuevoNombre = uniqid('prod_') . '.' . $extension;
            $rutaFinal = $directorioDestino . $nuevoNombre;
            if (move_uploaded_file($tmpName, $rutaFinal)) {
                $nuevas_subidas[] = $nuevoNombre;
            }
        }
    }
}

// Reconstruir la lista final basada en el orden
$idx_nueva = 0;
foreach ($orden as $item) {
    if (strpos($item, 'blob:') === 0 || strpos($item, 'new_') === 0) {
        // Es una imagen nueva
        if (isset($nuevas_subidas[$idx_nueva])) {
            $imagenes_finales[] = $nuevas_subidas[$idx_nueva];
            $idx_nueva++;
        }
    } else {
        // Es una imagen existente (nombre de archivo) — sanitizar
        $imagenes_finales[] = basename($item);
    }
}

// Si no se envió orden (por seguridad/compatibilidad), usar las subidas
if (empty($imagenes_finales) && !empty($nuevas_subidas)) {
    $imagenes_finales = $nuevas_subidas;
}

// Limitar a 5 imágenes
$imagenes_finales = array_slice($imagenes_finales, 0, 5);


try {
    $pdo->beginTransaction();

    // ==========================================================
    // 2. GUARDAR PRODUCTO (¡Ya no usamos img_principal aquí!)
    // ==========================================================
    if (empty($id_producto) || strpos($id_producto, 'temp_') !== false) {
        $sql = "INSERT INTO productos (sku, nombre, id_categoria, id_marca, precio_regular, precio_oferta, stock, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$sku, $nombre, $id_categoria, $id_marca, $precio_regular, $precio_oferta, $stock]);
        $id_producto_real = $pdo->lastInsertId(); 
    } else {
        $id_producto_real = (int)$id_producto;
        $sql = "UPDATE productos SET sku=?, nombre=?, id_categoria=?, id_marca=?, precio_regular=?, precio_oferta=?, stock=? WHERE id_producto=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$sku, $nombre, $id_categoria, $id_marca, $precio_regular, $precio_oferta, $stock, $id_producto_real]);
        
        $stmtDel = $pdo->prepare("DELETE FROM especificaciones WHERE id_producto = ?");
        $stmtDel->execute([$id_producto_real]);
    }

    // ==========================================================
    // 3. GUARDAR IMÁGENES EN LA TABLA CORRECTA (galeria_imagenes)
    // ==========================================================
    if (!empty($imagenes_finales)) {
        // Borramos las fotos viejas para que no se acumulen basura
        $stmtDelImg = $pdo->prepare("DELETE FROM galeria_imagenes WHERE id_producto = ?");
        $stmtDelImg->execute([$id_producto_real]);

        // Insertamos las nuevas con el ORDEN solicitado
        $sqlImg = "INSERT INTO galeria_imagenes (id_producto, ruta_imagen, img_principal, orden) VALUES (?, ?, ?, ?)";
        $stmtImg = $pdo->prepare($sqlImg);
        
        foreach ($imagenes_finales as $index => $ruta) {
            $esPrincipal = ($index === 0) ? 1 : 0; 
            $stmtImg->execute([$id_producto_real, $ruta, $esPrincipal, $index]);
        }
    }

    // ==========================================================
    // 4. GUARDAR ESPECIFICACIONES
    // ==========================================================
    if (!empty($especificaciones)) {
        $specsArray = explode('||', $especificaciones);
        $sqlSpec = "INSERT INTO especificaciones (id_producto, nombre_atributo, valor_atributo) VALUES (?, ?, ?)";
        $stmtSpec = $pdo->prepare($sqlSpec);
        
        foreach ($specsArray as $spec) {
            $partes = explode(':', $spec);
            if (count($partes) == 2) {
                $stmtSpec->execute([$id_producto_real, trim($partes[0]), trim($partes[1])]);
            }
        }
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'msg' => 'Producto e imágenes guardados correctamente']);

} catch(PDOException $e) {
    $pdo->rollBack();
    respuesta_error($e, 'Error al guardar el producto.');
}
?>