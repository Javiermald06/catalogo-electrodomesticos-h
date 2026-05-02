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
    $ruta_imagen = uniqid('banner_') . '.' . $ext;
    move_uploaded_file($_FILES['imagen']['tmp_name'], '../../assets/img_banners/' . $ruta_imagen);
}

try {
    if (empty($id) || strpos($id, 'temp_') !== false) {
        $stmt = $pdo->prepare("INSERT INTO banners (titulo, ruta_imagen, enlace, estado) VALUES (?, ?, ?, 1)");
        $stmt->execute([$titulo, $ruta_imagen, $enlace]);
    } else {
        $stmt = $pdo->prepare("UPDATE banners SET titulo=?, ruta_imagen=?, enlace=? WHERE id_banner=?");
        $stmt->execute([$titulo, $ruta_imagen, $enlace, (int)$id]);
    }
    echo json_encode(['status' => 'success']);
} catch(PDOException $e) {
    respuesta_error($e, 'Error al guardar el banner.');
}
?>