<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ElectroHogar Tacna — Catálogo</title>
    <link rel="icon" type="image/png" href="assets/img/Logo_electrohogar.png">
    <!-- Preconnect: elimina latencia DNS/TLS -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://unpkg.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/catalogo.css">
    <link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
</head>

<body>

    <?php include 'includes/header.php'; ?>

    <div class="breadcrumbs max-w-container">
        <a href="index.php" class="bread-link">Inicio</a> >
        <strong id="categoria-actual-bread">Cargando...</strong>
    </div>

    <main class="catalog-layout max-w-container">

        <div class="sidebar-overlay" onclick="document.querySelector('.filters-sidebar').classList.remove('active'); this.classList.remove('active')"></div>
        <aside class="filters-sidebar">
            <h3 style="margin-bottom: 20px; font-weight: 500; color: #1e293b; font-size: 20px;">Filtrar por:</h3>
            <button class="btn-close-sidebar"
                onclick="document.querySelector('.filters-sidebar').classList.remove('active'); document.querySelector('.sidebar-overlay').classList.remove('active')"
                aria-label="Cerrar filtros">
                <i data-lucide="x"></i>
            </button>
            <div class="filter-section">
                <div class="filter-header open" onclick="toggleAccordion('content-precio', 'icon-precio')">
                    <span class="filter-title">Precio</span>
                    <i data-lucide="minus" class="filter-icon" id="icon-precio"></i>
                </div>
                <div class="filter-content" id="content-precio">
                    <div class="price-inputs" style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <input type="number" id="price-min" class="internal-search" placeholder="Min"
                            style="margin-bottom:0;">
                        <input type="number" id="price-max" class="internal-search" placeholder="Max"
                            style="margin-bottom:0;">
                    </div>
                    <div class="price-actions">
                        <button class="btn-primary btn-sm" id="btn-aplicar-precio" style="width: 100%;">Aplicar
                            Rango</button>
                    </div>
                </div>
            </div>
            <div class="filter-section border-top" id="seccion-filtro-marca">
                <div class="filter-header open" onclick="toggleAccordion('content-marca', 'icon-marca')">
                    <span class="filter-title">Marca</span>
                    <i data-lucide="minus" class="filter-icon" id="icon-marca"></i>
                </div>
                <div class="filter-content" id="content-marca">
                    <div id="lista-marcas"></div>
                </div>
            </div>

            <div class="filter-section border-top" id="seccion-filtro-categoria" style="display:none;">
                <div class="filter-header open" onclick="toggleAccordion('content-categoria', 'icon-categoria')">
                    <span class="filter-title">Categoría</span>
                    <i data-lucide="minus" class="filter-icon" id="icon-categoria"></i>
                </div>
                <div class="filter-content" id="content-categoria">
                    <div id="lista-categorias"></div>
                </div>
            </div>

            <div id="filtros-dinamicos-bd"></div>

        </aside>

        <section class="products-area">

            <h1 id="catalogo-titulo-principal" class="page-title" style="margin-top: 0; margin-bottom: 25px; font-size: 38px; font-weight: 800; color: #1e293b; line-height: 1;">Cargando...</h1>

            <div class="products-toolbar">
                <div class="view-options">
                    <!-- Botón Filtrar (Móvil + Desktop) -->
                    <button class="btn-mobile-filter"
                        onclick="document.querySelector('.filters-sidebar').classList.add('active'); document.querySelector('.sidebar-overlay').classList.add('active')"
                        aria-label="Abrir filtros">
                        <i data-lucide="sliders-horizontal" style="width:16px;height:16px;"></i> Filtrar
                    </button>

                    <!-- Botón Ordenar (Móvil: abre modal) -->
                    <button class="btn-mobile-sort"
                        onclick="document.getElementById('sort-modal').classList.add('active')" aria-label="Ordenar">
                        <i data-lucide="arrow-up-down" style="width:16px;height:16px;"></i> Ordenar
                    </button>

                    <!-- Botones Vista Grid/Lista (Solo Desktop) -->
                    <div class="view-btns-group">
                        <button class="view-btn active" id="view-grid" title="Vista Cuadrícula">
                            <i data-lucide="grid" style="width: 20px;"></i>
                        </button>
                        <button class="view-btn" id="view-list" title="Vista Lista">
                            <i data-lucide="list" style="width: 20px;"></i>
                        </button>
                    </div>
                    <span class="text-sm text-muted count-desktop-only">Se muestran <strong
                            id="contador-productos">0</strong> productos</span>
                </div>
                <!-- Selector Orden (Solo Desktop) -->
                <div class="actions-right desktop-sort-section">
                    <select class="sort-select" id="ordenar-productos"
                        onchange="if(typeof aplicarFiltrosFinales==='function') aplicarFiltrosFinales()">
                        <option value="Relevancia">Relevancia</option>
                        <option value="Menor Precio">Menor Precio</option>
                        <option value="Mayor Precio">Mayor Precio</option>
                    </select>
                </div>
            </div>

            <!-- MODAL ORDENAR (Estilo Bottom Sheet - Solo Móvil) -->
            <div class="sort-modal-overlay" id="sort-modal" onclick="this.classList.remove('active')">
                <div class="sort-modal-sheet" onclick="event.stopPropagation()">
                    <div class="sort-modal-header">
                        <span>Ordenar por</span>
                        <button onclick="document.getElementById('sort-modal').classList.remove('active')"
                            class="sort-modal-close">&times;</button>
                    </div>
                    <div class="sort-modal-options">
                        <label class="sort-option active" data-value="Relevancia">
                            <span>Relevancia</span>
                            <i data-lucide="check" class="sort-check" style="width:18px;height:18px;"></i>
                        </label>
                        <label class="sort-option" data-value="Menor Precio">
                            <span>Menor Precio</span>
                            <i data-lucide="check" class="sort-check" style="width:18px;height:18px;"></i>
                        </label>
                        <label class="sort-option" data-value="Mayor Precio">
                            <span>Mayor Precio</span>
                            <i data-lucide="check" class="sort-check" style="width:18px;height:18px;"></i>
                        </label>
                    </div>
                </div>
            </div>

            <div class="products-grid" id="catalogo-grid">
                <!-- SKELETON LOADER -->
                <?php for($i=0; $i<8; $i++): ?>
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-text" style="width: 80%; margin-top: 15px;"></div>
                    <div class="skeleton-text" style="width: 60%;"></div>
                    <div class="skeleton-text" style="width: 40%; height: 20px; margin-top: 10px;"></div>
                    <div class="skeleton-btn"></div>
                </div>
                <?php endfor; ?>
            </div>

            <!-- Contenedor de Paginación Moderna -->
            <div id="pagination-container" class="pagination-wrapper"></div>

        </section>
    </main>

    <div id="vista-detalle" style="display: none;"></div>

    <?php include 'includes/footer.php'; ?>

    <script src="js/filtros.js" defer></script>
    <script src="js/components.js" defer></script>
    <script src="js/catalogo.js" defer></script>
    <script>
        lucide.createIcons();
    </script>
</body>

</html>