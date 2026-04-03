<?php
// includes/api/listar_categorias.php
require_once '../conexion.php'; 
header('Content-Type: application/json');

try {
    $sql = "SELECT id_categoria, nombre FROM categorias WHERE estado = 1";
    $stmt = $pdo->query($sql);
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC); 
    
    echo json_encode(["status" => "success", "data" => $categorias]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "msg" => $e->getMessage()]);
}
?>