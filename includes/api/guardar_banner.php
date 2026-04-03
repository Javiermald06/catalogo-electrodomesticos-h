<?php
require_once '../conexion.php';
header('Content-Type: application/json');

$id = $_POST['id_banner'] ?? null;
$titulo = trim($_POST['titulo'] ?? '');
$enlace = trim($_POST['enlace'] ?? '#');
$ruta_imagen = $_POST['imagen_actual'] ?? '';

if (empty($titulo)) { echo json_encode(['status' => 'error', 'msg' => 'El título es obligatorio']); exit; }

// Si subieron una imagen nueva
if (!empty($_FILES['imagen']['name'])) {
    $ext = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
    $ruta_imagen = uniqid('banner_') . '.' . $ext;
    move_uploaded_file($_FILES['imagen']['tmp_name'], '../../assets/img_banners/' . $ruta_imagen);
}

try {
    if (empty($id) || strpos($id, 'temp_') !== false) {
        $stmt = $pdo->prepare("INSERT INTO banners (titulo, ruta_imagen, enlace, estado) VALUES (?, ?, ?, 1)");
        $stmt->execute([$titulo, $ruta_imagen, $enlace]);
    } else {
        $stmt = $pdo->prepare("UPDATE banners SET titulo=?, ruta_imagen=?, enlace=? WHERE id_banner=?");
        $stmt->execute([$titulo, $ruta_imagen, $enlace, $id]);
    }
    echo json_encode(['status' => 'success']);
} catch(PDOException $e) { echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]); }
?>