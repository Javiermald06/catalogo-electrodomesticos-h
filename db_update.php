<?php
require_once 'includes/conexion.php';

try {
    $res = $pdo->query("SHOW COLUMNS FROM galeria_imagenes LIKE 'orden'");
    if (!$res->fetch()) {
        $pdo->exec("ALTER TABLE galeria_imagenes ADD COLUMN orden INT DEFAULT 0");
        echo "Columna 'orden' agregada.\n";
    } else {
        echo "La columna 'orden' ya existe.\n";
    }
    
    // 2. Inicializar el orden para los productos existentes
    $sqlFix = "UPDATE galeria_imagenes SET orden = id_galeria";
    $pdo->exec($sqlFix);
    echo "Orden inicializado.\n";

} catch (PDOException $e) {
    die("Error actualizando DB: " . $e->getMessage());
}
?>
