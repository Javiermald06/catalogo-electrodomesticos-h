<?php
// includes/api/listar_marcas.php
require_once '../conexion.php'; 
require_once '../seguridad.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT id_marca, nombre, estado FROM marcas";
    $stmt = $pdo->query($sql);
    $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC); 
    
    echo json_encode(["status" => "success", "data" => $marcas]);
} catch (PDOException $e) {
    respuesta_error($e, 'Error al cargar las marcas.');
}
?>