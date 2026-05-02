<?php
// includes/seguridad/validacion.php
// ============================================================
// MÓDULO: Validación de Archivos y Sanitización de Datos
// ============================================================

require_once __DIR__ . '/../config.php';

/**
 * Valida que un archivo subido sea una imagen legítima.
 * Verifica: error de subida, tamaño, extensión y MIME type real.
 * 
 * @param array $archivo — El array de $_FILES (un solo archivo)
 * @return array — Array vacío si es válido, o lista de errores
 */
function validar_imagen($archivo) {
    $errores = [];
    
    if ($archivo['error'] !== UPLOAD_ERR_OK) {
        $errores[] = 'Error en la subida del archivo.';
        return $errores;
    }

    if ($archivo['size'] > MAX_IMAGE_SIZE) {
        $errores[] = 'La imagen excede el tamaño máximo permitido (5 MB).';
    }

    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    $extensiones_permitidas = unserialize(ALLOWED_IMAGE_EXTENSIONS);
    if (!in_array($extension, $extensiones_permitidas)) {
        $errores[] = 'Tipo de archivo no permitido. Use: ' . implode(', ', $extensiones_permitidas);
    }

    // Verificar MIME type real (no confiar solo en la extensión)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_real = finfo_file($finfo, $archivo['tmp_name']);
    finfo_close($finfo);
    
    $tipos_permitidos = unserialize(ALLOWED_IMAGE_TYPES);
    if (!in_array($mime_real, $tipos_permitidos)) {
        $errores[] = 'El contenido del archivo no corresponde a una imagen válida.';
    }

    return $errores;
}

/**
 * Respuesta de error segura para producción.
 * En modo debug muestra el error real; en producción muestra un mensaje genérico.
 */
function respuesta_error($exception, $mensaje_publico = 'Error interno del servidor.') {
    header('Content-Type: application/json');
    
    if (APP_DEBUG) {
        echo json_encode(['status' => 'error', 'msg' => $exception->getMessage()]);
    } else {
        error_log('[ElectroHogar Error] ' . $exception->getMessage());
        echo json_encode(['status' => 'error', 'msg' => $mensaje_publico]);
    }
    exit;
}

/**
 * Sanitiza texto para prevenir XSS al mostrarlo en HTML.
 */
function sanitizar($texto) {
    return htmlspecialchars($texto, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
