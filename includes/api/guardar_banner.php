<?php
// includes/api/guardar_banner.php
require_once '../conexion.php';
require_once '../seguridad.php';
header('Content-Type: application/json');

// ─── SEGURIDAD: Solo administradores ───
verificar_admin();

$id = $_POST['id_banner'] ?? null;
$titulo = trim($_POST['titulo'] ?? '');
$enlace = trim($_POST['enlace'] ?? '#');
$ruta_imagen = $_POST['imagen_actual'] ?? '';
$ruta_imagen_mobile = $_POST['imagen_mobile_actual'] ?? '';

if (empty($titulo)) { echo json_encode(['status' => 'error', 'msg' => 'El título es obligatorio']); exit; }

// Si subieron una imagen nueva — con validación
if (!empty($_FILES['imagen']['name'])) {
    // ─── SEGURIDAD: Validar que sea una imagen real ───
    $errores = validar_imagen($_FILES['imagen']);
    if (!empty($errores)) {
        echo json_encode(['status' => 'error', 'msg' => implode(' ', $errores)]);
        exit;
    }
    
    $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
    $nuevo_nombre = uniqid('banner_') . '.' . $ext;
    $directorio = '../../assets/img_banners/';
    
    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $directorio . $nuevo_nombre)) {
        // Borrar imagen anterior si existe y no es la misma
        if (!empty($ruta_imagen) && file_exists($directorio . $ruta_imagen)) {
            unlink($directorio . $ruta_imagen);
        }
        $ruta_imagen = $nuevo_nombre;
    }
}

// Si subieron una imagen móvil nueva
if (!empty($_FILES['imagen_mobile']['name'])) {
    $errores = validar_imagen($_FILES['imagen_mobile']);
    if (!empty($errores)) {
        echo json_encode(['status' => 'error', 'msg' => 'Móvil: ' . implode(' ', $errores)]);
        exit;
    }
    
    $ext = strtolower(pathinfo($_FILES['imagen_mobile']['name'], PATHINFO_EXTENSION));
    $nuevo_nombre = uniqid('banner_mob_') . '.' . $ext;
    $directorio = '../../assets/img_banners/';
    
    if (move_uploaded_file($_FILES['imagen_mobile']['tmp_name'], $directorio . $nuevo_nombre)) {
        if (!empty($ruta_imagen_mobile) && file_exists($directorio . $ruta_imagen_mobile)) {
            unlink($directorio . $ruta_imagen_mobile);
        }
        $ruta_imagen_mobile = $nuevo_nombre;
    }
}

try {
    if (empty($id) || strpos($id, 'temp_') !== false) {
        $stmt = $pdo->prepare("INSERT INTO banners (titulo, ruta_imagen, ruta_imagen_mobile, enlace, estado) VALUES (?, ?, ?, ?, 1)");
        $stmt->execute([$titulo, $ruta_imagen, $ruta_imagen_mobile, $enlace]);
    } else {
        $stmt = $pdo->prepare("UPDATE banners SET titulo=?, ruta_imagen=?, ruta_imagen_mobile=?, enlace=? WHERE id_banner=?");
        $stmt->execute([$titulo, $ruta_imagen, $ruta_imagen_mobile, $enlace, (int)$id]);
    }
    echo json_encode(['status' => 'success']);
} catch(PDOException $e) {
    respuesta_error($e, 'Error al guardar el banner.');
}
?>