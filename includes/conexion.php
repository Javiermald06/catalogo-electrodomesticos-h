<?php
// includes/conexion.php
$host = 'sql100.infinityfree.com';
$port = '3306';
$dbname = 'if0_41571758_electroh';
$username = 'if0_41571758';
$password = 'fmBQPLmBO0p';

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
    die(json_encode(['status' => 'error', 'msg' => 'Error de conexión a la nube']));
}