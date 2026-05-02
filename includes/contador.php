<?php
// includes/contador.php
require_once 'includes/conexion.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Evitar contar refrescos en la misma sesión
if (!isset($_SESSION['visitado'])) {
    try {
        // 1. Contador total histórico
        $stmt = $pdo->prepare("UPDATE estadisticas SET valor = valor + 1 WHERE clave = 'total_visitas'");
        $stmt->execute();
        
        // 2. Contador diario
        $hoy = date('Y-m-d');
        $stmt = $pdo->prepare("INSERT INTO visitas_diarias (fecha, cantidad) VALUES (?, 1) 
                               ON DUPLICATE KEY UPDATE cantidad = cantidad + 1");
        $stmt->execute([$hoy]);

        $_SESSION['visitado'] = true;
    } catch (PDOException $e) {
        // Silencioso
    }
}
?>
