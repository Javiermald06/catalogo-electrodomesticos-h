<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ElectroHogar - Catálogo</title>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="css/catalogo.css">
    <link rel="stylesheet" href="css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
</head>
<body>

    <?php include 'includes/header.php'; ?>

    <div class="breadcrumbs max-w-container">
        <a href="index.php" class="bread-link">Inicio</a> > 
        <a href="index.php" class="bread-link">ElectroHogar</a> > 
        <strong id="categoria-actual-bread">Cargando...</strong>
    </div>

    <main class="catalog-layout max-w-container">
        
        <aside class="filters-sidebar">
            
            <div class="filter-section">
                <div class="filter-header" onclick="toggleAccordion('content-precio', 'icon-precio')">
                    <span class="filter-title">Precio</span>
                    <i data-lucide="chevron-up" class="filter-icon" id="icon-precio"></i>
                </div>
                <div class="filter-content" id="content-precio">
                    <div class="price-inputs" style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <input type="number" id="price-min" class="internal-search" placeholder="Min" style="margin-bottom:0;">
                        <input type="number" id="price-max" class="internal-search" placeholder="Max" style="margin-bottom:0;">
                    </div>
                    <div class="price-actions">
                        <button class="btn-primary btn-sm" id="btn-aplicar-precio" style="width: 100%;">Aplicar Rango</button>
                    </div>
                </div>
            </div>

            <div class="filter-section border-top">
                <div class="filter-header" onclick="toggleAccordion('content-marca', 'icon-marca')">
                    <span class="filter-title">Marca</span>
                    <i data-lucide="chevron-up" class="filter-icon" id="icon-marca"></i>
                </div>
                <div class="filter-content" id="content-marca">
                    <div id="lista-marcas">
                        </div>
                </div>
            </div>

            <div id="filtros-dinamicos-bd"></div>

        </aside>

        <section class="products-area">
            
            <div class="products-toolbar">
                <div class="view-options">
                    <div class="view-btns-group" style="display: flex; gap: 8px; margin-right: 15px;">
                        <button class="view-btn active" id="view-grid" title="Vista Cuadrícula">
                            <i data-lucide="grid" style="width: 20px;"></i>
                        </button>
                        <button class="view-btn" id="view-list" title="Vista Lista">
                            <i data-lucide="list" style="width: 20px;"></i>
                        </button>
                    </div>
                    <span class="text-sm text-muted">Se muestran <strong id="contador-productos">0</strong> productos</span>
                </div>
                <div>
                    <select class="sort-select" id="ordenar-productos">
                        <option value="Relevancia">Relevancia</option>
                        <option value="Menor Precio">Menor Precio</option>
                        <option value="Mayor Precio">Mayor Precio</option>
                    </select>
                </div>
            </div>

            <div class="products-grid" id="catalogo-grid">
                </div>

        </section>
    </main>

    <div id="vista-detalle" style="display: none;"></div>

    <?php include 'includes/footer.php'; ?>

    <script src="js/filtros.js"></script>
    <script src="js/catalogo.js"></script>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>