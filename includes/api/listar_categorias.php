<?php
// includes/api/listar_categorias.php
require_once '../conexion.php'; 
require_once '../seguridad.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT id_categoria, nombre, estado FROM categorias";
    $stmt = $pdo->query($sql);
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC); 
    
    echo json_encode(["status" => "success", "data" => $categorias]);
} catch (PDOException $e) {
    respuesta_error($e, 'Error al cargar las categorías.');
}
?>