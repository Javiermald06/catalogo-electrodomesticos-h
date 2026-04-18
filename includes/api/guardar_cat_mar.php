<?php
require_once '../conexion.php';
header('Content-Type: application/json');

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

    // Insertar o actualizar
    if (empty($id) || strpos($id, 'temp_') === 0) {
        $stmt = $pdo->prepare("INSERT INTO $tabla (nombre, estado) VALUES (:nombre, 1)");
        $stmt->execute([':nombre' => $nombre]);
        $id = $pdo->lastInsertId();
    } else {
        $stmt = $pdo->prepare("UPDATE $tabla SET nombre = :nombre WHERE $campoCmp = :id");
        $stmt->execute([':nombre' => $nombre, ':id' => $id]);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Guardado correctamente',
        'id' => $id
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
