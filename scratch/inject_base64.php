<?php
$imgData = base64_encode(file_get_contents('assets/img/logo_electrohogar.png'));
$base64 = 'data:image/png;base64,' . $imgData;

// Actualizar admin.css
$adminCss = file_get_contents('css/admin.css');
$adminCss = preg_replace('/background-image: url\(\'\.\.\/assets\/img\/logo_electrohogar\.png\'\);/', "background-image: url('$base64');", $adminCss);
file_put_contents('css/admin.css', $adminCss);

// Actualizar login.css
$loginCss = file_get_contents('css/login.css');
$loginCss = preg_replace('/background-image: url\(\'\.\.\/assets\/img\/logo_electrohogar\.png\'\);/', "background-image: url('$base64');", $loginCss);
file_put_contents('css/login.css', $loginCss);

echo "Base64 inyectado correctamente.";
