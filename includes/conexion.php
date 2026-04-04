<?php
// includes/conexion.php
$host = 'sql110.infinityfree.com';
$port = '3306'; 
$dbname = 'if0_41533960_electrohogar';
$username = 'if0_41533960';
$password = 'Tilin2326'; 

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";
    
    // Cambiamos $conexion por $pdo para que sea compatible con tus APIs
    $pdo = new PDO($dsn, $username, $password);
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
    
} catch(PDOException $e) {
    header('Content-Type: application/json');
    die(json_encode([
        'status' => 'error', 
        'msg' => 'Error de conexión: ' . $e->getMessage()
    ]));
}
?>