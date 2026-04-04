<?php
// includes/api/listar_categorias.php
require_once '../conexion.php'; 
header('Content-Type: application/json');

try {
    // AHORA TRAEMOS TODO: ID, nombre y estado. Y sin el WHERE.
    $sql = "SELECT id_categoria, nombre, estado FROM categorias";
    $stmt = $pdo->query($sql);
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC); 
    
    echo json_encode(["status" => "success", "data" => $categorias]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "msg" => $e->getMessage()]);
}
?>