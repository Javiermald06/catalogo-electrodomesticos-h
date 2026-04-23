<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cargando Producto... | ElectroHogar</title>
    <link rel="icon" type="image/png" href="assets\img\Logo_electrohogar.png">
    <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/catalogo.css">
    <link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>

<body>

    <?php include 'includes/header.php'; ?>

    <main style="padding-top: 80px; min-height: 70vh;" id="main-producto">
        <div id="contenedor-detalle" class="max-w-container">
            <p style="text-align: center; padding: 50px;">Cargando información del producto...</p>
        </div>
    </main>

    <?php include 'includes/footer.php'; ?>

    <script src="js/components.js"></script>
    <script src="js/producto.js"></script>
</body>

</html>