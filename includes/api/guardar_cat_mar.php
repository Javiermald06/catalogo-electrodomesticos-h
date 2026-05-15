<?php
// includes/api/guardar_cat_mar.php
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');

// ─── SEGURIDAD: Solo administradores ───
verificar_admin();

try {
    $id = isset($_POST['id']) ? trim($_POST['id']) : '';
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : '';

    if (empty($nombre) || empty($tipo)) {
        throw new Exception("Faltan datos obligatorios");
    }

    if ($tipo !== 'categoria' && $tipo !== 'marca') {
        throw new Exception("Tipo inválido");
    }

    $tabla = $tipo === 'categoria' ? 'categorias' : 'marcas';
    $campoCmp = $tipo === 'categoria' ? 'id_categoria' : 'id_marca';

    // ─── Procesamiento de imagen (solo para categorías) ───
    $nombreImagen = null;
    $imgScale = isset($_POST['img_scale']) ? floatval($_POST['img_scale']) : 1.0;
    $imgPosX = isset($_POST['img_pos_x']) ? floatval($_POST['img_pos_x']) : 50;
    $imgPosY = isset($_POST['img_pos_y']) ? floatval($_POST['img_pos_y']) : 50;

    if ($tipo === 'categoria' && isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $dirDestino = '../../assets/img_categorias/';
        if (!is_dir($dirDestino)) {
            mkdir($dirDestino, 0755, true);
        }

        // Generar nombre único
        $ext = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $nombreImagen = 'cat_' . time() . '_' . rand(1000, 9999) . '.' . $ext;

        // Si estamos editando, eliminar la imagen anterior
        if (!empty($id) && strpos($id, 'temp_') !== 0) {
            $stmtOld = $pdo->prepare("SELECT imagen FROM categorias WHERE id_categoria = :id");
            $stmtOld->execute([':id' => (int)$id]);
            $oldImg = $stmtOld->fetchColumn();
            if ($oldImg && file_exists($dirDestino . $oldImg)) {
                unlink($dirDestino . $oldImg);
            }
        }

        move_uploaded_file($_FILES['imagen']['tmp_name'], $dirDestino . $nombreImagen);
    }

    // Insertar o actualizar
    if (empty($id) || strpos($id, 'temp_') === 0) {
        if ($tipo === 'categoria') {
            $stmt = $pdo->prepare("INSERT INTO categorias (nombre, estado, imagen, img_scale, img_pos_x, img_pos_y) VALUES (:nombre, 1, :imagen, :img_scale, :img_pos_x, :img_pos_y)");
            $stmt->execute([
                ':nombre' => $nombre,
                ':imagen' => $nombreImagen,
                ':img_scale' => $imgScale,
                ':img_pos_x' => $imgPosX,
                ':img_pos_y' => $imgPosY
            ]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO $tabla (nombre, estado) VALUES (:nombre, 1)");
            $stmt->execute([':nombre' => $nombre]);
        }
        $id = $pdo->lastInsertId();
    } else {
        if ($tipo === 'categoria') {
            if ($nombreImagen) {
                $stmt = $pdo->prepare("UPDATE categorias SET nombre = :nombre, imagen = :imagen, img_scale = :img_scale, img_pos_x = :img_pos_x, img_pos_y = :img_pos_y WHERE id_categoria = :id");
                $stmt->execute([
                    ':nombre' => $nombre,
                    ':imagen' => $nombreImagen,
                    ':img_scale' => $imgScale,
                    ':img_pos_x' => $imgPosX,
                    ':img_pos_y' => $imgPosY,
                    ':id' => (int)$id
                ]);
            } else {
                // Solo actualizar escala/posición si no hay nueva imagen pero se ajustó
                $stmt = $pdo->prepare("UPDATE categorias SET nombre = :nombre, img_scale = :img_scale, img_pos_x = :img_pos_x, img_pos_y = :img_pos_y WHERE id_categoria = :id");
                $stmt->execute([
                    ':nombre' => $nombre,
                    ':img_scale' => $imgScale,
                    ':img_pos_x' => $imgPosX,
                    ':img_pos_y' => $imgPosY,
                    ':id' => (int)$id
                ]);
            }
        } else {
            $stmt = $pdo->prepare("UPDATE $tabla SET nombre = :nombre WHERE $campoCmp = :id");
            $stmt->execute([':nombre' => $nombre, ':id' => (int)$id]);
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Guardado correctamente',
        'id' => $id
    ]);

} catch (Exception $e) {
    respuesta_error($e, 'Error al guardar.');
}
?>
