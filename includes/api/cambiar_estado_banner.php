<?php
require_once '../conexion.php';
header('Content-Type: application/json');
$id = $_POST['id'] ?? null; $estado = $_POST['estado'] ?? null;
try {
    $stmt = $pdo->prepare("UPDATE banners SET estado = ? WHERE id_banner = ?");
    $stmt->execute([$estado, $id]);
    echo json_encode(['status' => 'success']);
} catch(PDOException $e) { echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]); }
?>