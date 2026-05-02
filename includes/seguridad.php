<?php
// includes/seguridad.php
// ============================================================
// BARREL FILE — Importa todos los módulos de seguridad
// Cualquier archivo que haga require('seguridad.php') obtiene
// todas las funciones automáticamente (retrocompatible).
// ============================================================

require_once __DIR__ . '/seguridad/sesion.php';
require_once __DIR__ . '/seguridad/csrf.php';
require_once __DIR__ . '/seguridad/validacion.php';
require_once __DIR__ . '/seguridad/rate_limit.php';
require_once __DIR__ . '/seguridad/headers.php';
