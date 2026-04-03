<?php
// includes/api/guardar_producto.php
require_once '../conexion.php';
header('Content-Type: application/json');

$id_producto = $_POST['id_producto'] ?? null;
$nombre = $_POST['nombre'] ?? '';
$sku = $_POST['sku'] ?? '';
$id_categoria = $_POST['id_categoria'] ?? null;
$id_marca = $_POST['id_marca'] ?? null;
$stock = $_POST['stock'] ?? 0;
$precio_regular = $_POST['precio_regular'] ?? 0;
$precio_oferta = $_POST['precio_oferta'] ?? 0;
$especificaciones = $_POST['especificaciones_agrupadas'] ?? '';

$imagenesSubidas = [];
$directorioDestino = '../../assets/img_productos/'; 

// 1. Subida de Imágenes
if (!empty($_FILES['imagenes']['name'][0])) {
    $limite = count($_FILES['imagenes']['name']);
    if ($limite > 5) $limite = 5;

    for ($i = 0; $i < $limite; $i++) {
        $nombreArchivoTemp = $_FILES['imagenes']['tmp_name'][$i];
        
        if ($nombreArchivoTemp != "") {
            $extension = pathinfo($_FILES['imagenes']['name'][$i], PATHINFO_EXTENSION);
            $nuevoNombre = uniqid('prod_') . '.' . $extension;
            $rutaFinal = $directorioDestino . $nuevoNombre;

            if (move_uploaded_file($nombreArchivoTemp, $rutaFinal)) {
                $imagenesSubidas[] = $nuevoNombre;
            }
        }
    }
}

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
        $id_producto_real = $id_producto;
        $sql = "UPDATE productos SET sku=?, nombre=?, id_categoria=?, id_marca=?, precio_regular=?, precio_oferta=?, stock=? WHERE id_producto=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$sku, $nombre, $id_categoria, $id_marca, $precio_regular, $precio_oferta, $stock, $id_producto_real]);
        
        $stmtDel = $pdo->prepare("DELETE FROM especificaciones WHERE id_producto = ?");
        $stmtDel->execute([$id_producto_real]);
    }

    // ==========================================================
    // 3. GUARDAR IMÁGENES EN LA TABLA CORRECTA (galeria_imagenes)
    // ==========================================================
    if (!empty($imagenesSubidas)) {
        // Borramos las fotos viejas para que no se acumulen basura
        $stmtDelImg = $pdo->prepare("DELETE FROM galeria_imagenes WHERE id_producto = ?");
        $stmtDelImg->execute([$id_producto_real]);

        // Insertamos las nuevas en tu tabla relacional
        $sqlImg = "INSERT INTO galeria_imagenes (id_producto, ruta_imagen, img_principal) VALUES (?, ?, ?)";
        $stmtImg = $pdo->prepare($sqlImg);
        
        foreach ($imagenesSubidas as $index => $ruta) {
            $esPrincipal = ($index === 0) ? 1 : 0; 
            $stmtImg->execute([$id_producto_real, $ruta, $esPrincipal]);
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
    // Este es el mensaje que te salía en rojo. ¡Ahora ya no saldrá!
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>