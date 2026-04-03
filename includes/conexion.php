<?php
// includes/conexion.php
$host = 'electro-hogar-proyecto-practica-electrohogar13-8038.b.aivencloud.com';
$port = '26873';
$dbname = 'defaultdb';
$username = 'avnadmin';
$password = 'AVNS_Fwf7wKQJzyI6s9iq2cp';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ];
    $pdo = new PDO($dsn, $username, $password, $options);
} catch(PDOException $e) {
    header('Content-Type: application/json');
   // die(json_encode(['status' => 'error', 'msg' => 'Error de conexión a la nube']));
}