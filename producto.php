<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cargando Producto... | ElectroHogar</title>
    <link rel="icon" type="image/png" href="assets/img/logo_electrohogar.png">
    <!-- Preconnect: elimina latencia DNS/TLS -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://unpkg.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/catalogo.css">
    <link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* Estilos de Emergencia - Prioridad Máxima */
        @media (max-width: 900px) {
            .quantity-selector-efe {
                width: 140px !important;
                height: 50px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 10px !important;
                background: #fff !important;
                border: 2px solid #e2e8f0 !important;
                border-radius: 12px !important;
                padding: 0 8px !important;
            }

            .qty-btn-efe {
                width: 40px !important;
                height: 40px !important;
                background: #f1f5f9 !important; /* ✨ Gris claro premium */
                color: var(--clr-primary) !important; /* ✨ Símbolo en azul */
                border: 1px solid #e2e8f0 !important;
                border-radius: 10px !important;
                font-size: 22px !important;
                font-weight: 700 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex-shrink: 0 !important;
                padding: 0 !important;
                line-height: 1 !important;
                cursor: pointer !important;
            }

            .qty-input-efe {
                width: 30px !important;
                font-size: 18px !important;
                font-weight: 800 !important;
                text-align: center !important;
                border: none !important;
                background: transparent !important;
                color: var(--clr-dark) !important;
                flex: 1 !important;
            }

            .detail-actions-box {
                gap: 12px !important;
                padding: 15px !important;
            }

            .btn-efe-primary {
                height: 50px !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 10px !important;
                padding: 0 15px !important;
            }

            .detail-gallery-wrapper {
                display: block !important;
                width: 100% !important;
                margin-top: 20px !important;
            }

            .mobile-slide img {
                max-height: 350px !important;
                width: auto !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                display: block !important;
            }
        }
    </style>
</head>

<body>

    <?php include 'includes/header.php'; ?>

    <main style="padding-top: 80px; min-height: 70vh;" id="main-producto">
        <div id="contenedor-detalle" class="max-w-container">
            <div class="product-detail-container" style="display:flex; gap: 40px; margin-top: 40px; width: 100%;">
                <div class="skeleton-img" style="flex: 1.2; height: 500px; border-radius: 16px;"></div>
                <div style="flex: 1; display:flex; flex-direction:column; gap: 20px;">
                    <div class="skeleton-text" style="width: 30%; height: 20px;"></div>
                    <div class="skeleton-text" style="width: 80%; height: 40px;"></div>
                    <div class="skeleton-text" style="width: 40%; height: 30px;"></div>
                    <div class="skeleton-box" style="width: 100%; height: 120px;"></div>
                    <div class="skeleton-btn" style="width: 100%; height: 50px; margin-top: 20px;"></div>
                </div>
            </div>
        </div>
    </main>

    <?php include 'includes/footer.php'; ?>

    <script src="js/components.js" defer></script>
    <script src="js/producto.js" defer></script>
</body>

</html>