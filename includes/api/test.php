<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_FILES['archivo_csv'] = [
    'name' => 'productos_csv.csv',
    'type' => 'text/csv',
    'tmp_name' => '../../productos_csv.csv',
    'error' => 0,
    'size' => 50000
];
include 'importar_csv.php';
