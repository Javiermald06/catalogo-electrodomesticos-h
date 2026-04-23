<?php
// includes/conexion.php
$host = 'electro-hogar-proyecto-practica-electrohogar13-8038.b.aivencloud.com';
$port = '26873'; 
$dbname = 'defaultdb';
$username = 'avnadmin';
$password = 'AVNS_Fwf7wKQJzyI6s9iq2cp'; 

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";
    
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