<?php
// includes/conexion.php
$host = 'sql110.infinityfree.com';
$port = '3306'; // Puerto por defecto de InfinityFree
$dbname = 'if0_41533960_electrohogar';
$username = 'if0_41533960';
$password = 'Tilin2326'; 

try {
    // Agregamos port=$port a la cadena DSN
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";
    $conexion = new PDO($dsn, $username, $password);
    
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Esto asegura que los datos salgan como arreglos asociativos
    $conexion->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
    
} catch(PDOException $e) {
    header('Content-Type: application/json');
    die(json_encode([
        'status' => 'error', 
        'msg' => 'Error de conexión: ' . $e->getMessage()
    ]));
}
?>