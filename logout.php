<?php
// logout.php
// ============================================================
// Cierre de Sesión Seguro — ElectroHogar
// ============================================================

require_once 'includes/seguridad.php';

// Ejecutar destrucción de sesión
cerrar_sesion();

// Redirigir al login con un parámetro de éxito
header("Location: login.html?logout=success");
exit();
