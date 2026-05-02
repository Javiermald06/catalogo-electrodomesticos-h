/* ============================================================
   catalogo.js — Gestión de Cuadrícula y Vista Detalle (Tipo Efe)
   ============================================================ */
var PRODUCTOS = [];
const urlParams = new URLSearchParams(window.location.search);
const categoriaActiva = urlParams.get('categoria');
const marcaActiva = urlParams.get('marca');
const buscaActiva = urlParams.get('buscar');

// Paginación
let currentPage = 1;
const itemsPerPage = 12;

async function cargarCatalogo() {
    try {
        // 🚀 Una sola petición: productos + filtros juntos
        const catParam = categoriaActiva || '';
        window.fetchCached(`includes/api/listar_productos.php?categoria=${encodeURIComponent(catParam)}`, (result, isCached) => {
        const filtrosJson = { status: 'success', data: result.filtros || [] };

        if (result.status === 'success') {
            // Adaptar datos básicos
            PRODUCTOS = result.data.map(p => {
                const precioReg = parseFloat(p.precio_regular);
                const precioOfe = parseFloat(p.precio_oferta);
                const tieneOferta = precioOfe > 0 && precioOfe < precioReg;
                const pctDescuento = tieneOferta ? Math.round((1 - precioOfe / precioReg) * 100) : 0;
                return {
                    ...p,
                    id: p.id_producto,
                    precio: tieneOferta ? precioOfe : precioReg,
                    precioAntes: tieneOferta ? precioReg : null,
                    enOferta: tieneOferta,
                    descuento: pctDescuento
                };
            });

            // Lógica de filtrado inicial combinada (URL Params)
            let productosFiltrados = [...PRODUCTOS];

            if (categoriaActiva) {
                productosFiltrados = productosFiltrados.filter(p => p.categoria === categoriaActiva);
            }
            if (marcaActiva) {
                productosFiltrados = productosFiltrados.filter(p => p.marca.toLowerCase() === marcaActiva.toLowerCase());
            }
            if (buscaActiva) {
                const q = buscaActiva.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                productosFiltrados = productosFiltrados.filter(p =>
                    p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
                    p.marca.toLowerCase().includes(q) ||
                    p.categoria.toLowerCase().includes(q)
                );
            }

            // 1. Actualización de Identidad de la Página (Título y Breadcrumbs)
            const tituloPrincipal = document.getElementById('catalogo-titulo-principal');
            const breadContainer = document.querySelector('.breadcrumbs');
            
            // Definir texto de la categoría o búsqueda
            let displayTitle = 'Catálogo Completo';
            if (categoriaActiva) displayTitle = categoriaActiva;
            if (buscaActiva) displayTitle = `Búsqueda: "${buscaActiva}"`;
            if (marcaActiva && !categoriaActiva) displayTitle = `Marca: ${marcaActiva}`;

            // Actualizar Título Principal <h1>
            if (tituloPrincipal) {
                tituloPrincipal.innerText = displayTitle;
            }
            document.title = `ElectroHogar - ${displayTitle}`;

            // Actualizar Breadcrumbs dinámicamente
            if (breadContainer) {
                breadContainer.style.display = 'flex';
                breadContainer.style.alignItems = 'center';
                breadContainer.style.gap = '8px';

                let breadHTML = `<a href="index.php" class="bread-link">Inicio</a>`;
                breadHTML += `<i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #64748b;"></i>`;
                
                if (buscaActiva) {
                    breadHTML += `<strong style="color: var(--blue);">Búsqueda</strong>`;
                } else if (categoriaActiva) {
                    breadHTML += `<strong style="color: var(--blue);">${categoriaActiva}</strong>`;
                } else {
                    breadHTML += `<strong style="color: var(--blue);">Catálogo</strong>`;
                }
                
                breadContainer.innerHTML = breadHTML;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }

            // Inicializar motor de filtros laterales (filtros.js)
            if (typeof inicializarFiltrosDinamicos === 'function') {
                const extras = {
                    marcas: result.marcas_disponibles || [],
                    categorias: result.categorias_disponibles || []
                };
                inicializarFiltrosDinamicos(productosFiltrados, categoriaActiva || '', filtrosJson, extras);
            }
            // Dibujar la cuadrícula inicial
            renderProductosGrid(productosFiltrados);
            // ✨ OPTIMIZACIÓN: Ocultar el preloader SOLO DESPUÉS de pintar el catálogo
            const loader = document.getElementById('global-loader');
            if (loader) {
                setTimeout(() => {
                    loader.classList.add('hide');
                    setTimeout(() => loader.style.display = 'none', 400);
                }, 100);
            }
        }
        });
    } catch (e) {
        console.error("Error cargando el catálogo:", e);
    }
}

// === RENDERIZADO DE LA CUADRÍCULA ===
function renderProductosGrid(datos) {
    const grid = document.getElementById('catalogo-grid');
    if (!grid) return;

    // Actualizar contador visual
    const contador = document.getElementById('contador-productos');
    if (contador) contador.innerText = datos.length;

    if (datos.length === 0) {
        grid.innerHTML = '<p class="empty-catalog-msg">No se encontraron productos con estos filtros.</p>';
        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Paginación: Obtener solo los productos de la página actual
    const starIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = starIndex + itemsPerPage;
    const productosPagina = datos.slice(starIndex, endIndex);

    // Dibujar tarjetas. Fíjate en el onclick para abrir el detalle.
    grid.innerHTML = productosPagina.map(p => {
        return window.createProductCardHTML(p);
    }).join('');

    renderPagination(datos.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('pagination-container');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(1)" title="Primera página">
            <i data-lucide="chevrons-left"></i>
        </button>
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})" title="Anterior">
            <i data-lucide="chevron-left"></i>
        </button>
    `;

    // Generar números de página
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    html += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})" title="Siguiente">
            <i data-lucide="chevron-right"></i>
        </button>
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${totalPages})" title="Última página">
            <i data-lucide="chevrons-right"></i>
        </button>
    `;

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.changePage = function (page) {
    const totalItems = (typeof PRODUCTOS_CATALOGO !== 'undefined' && PRODUCTOS_CATALOGO.length > 0) ? PRODUCTOS_CATALOGO.length : PRODUCTOS.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Si tenemos filtros activos, repintar con los productos filtrados
    if (typeof aplicarFiltrosFinales === 'function') {
        aplicarFiltrosFinales(false); // No resetear página
    } else {
        renderProductosGrid(PRODUCTOS);
    }
};

function cambiarQtyDetail(n) {
    const input = document.getElementById('qty-detail');
    if (!input) return;
    let val = parseInt(input.value) + n;
    if (val >= 1) input.value = val;
}

function cotizarActualPorWhatsApp(id) {
    const input = document.getElementById('qty-detail');
    const cant = input ? parseInt(input.value) : 1;
    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(id, cant);
    }
}

function configurarBotonesVista() {
    const btnGrid = document.getElementById('view-grid');
    const btnList = document.getElementById('view-list');
    const gridContainer = document.getElementById('catalogo-grid');

    if (btnGrid && btnList && gridContainer) {
        btnGrid.addEventListener('click', () => {
            btnGrid.classList.add('active');
            btnList.classList.remove('active');
            gridContainer.classList.remove('list-view');
        });

        btnList.addEventListener('click', () => {
            btnList.classList.add('active');
            btnGrid.classList.remove('active');
            gridContainer.classList.add('list-view');
        });
    }
}

// === MODAL DE ORDENAR (MOBILE) ===
function configurarSortModal() {
    const sortModal = document.getElementById('sort-modal');
    if (!sortModal) return;

    const options = sortModal.querySelectorAll('.sort-option');
    const selectDesktop = document.getElementById('ordenar-productos');

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            // Quitar active de todos
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            // Sincronizar con el select oculto de desktop
            const value = opt.dataset.value;
            if (selectDesktop) {
                selectDesktop.value = value;
            }

            // Cerrar modal
            sortModal.classList.remove('active');

            // Aplicar filtros con nuevo orden
            if (typeof aplicarFiltrosFinales === 'function') {
                aplicarFiltrosFinales();
            }
        });
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo(); // Tu función principal
    configurarBotonesVista(); // Activamos los botones
    configurarSortModal(); // Modal de ordenar mobile
});