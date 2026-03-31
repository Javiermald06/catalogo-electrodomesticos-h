/* ============================================================
   catalogo.js — Gestión de Cuadrícula y Vista Detalle (Tipo Efe)
   ============================================================ */
let PRODUCTOS = [];
const urlParams = new URLSearchParams(window.location.search);
const categoriaActiva = urlParams.get('categoria');

async function cargarCatalogo() {
    try {
        const response = await fetch('includes/api/listar_productos.php');
        const result = await response.json();

        if (result.status === 'success') {
            // Adaptar datos básicos
            PRODUCTOS = result.data.map(p => ({
                ...p,
                id: p.id_producto,
                // Precio lógico: Oferta si existe, sino Regular
                precio: parseFloat(p.precio_oferta) > 0 ? parseFloat(p.precio_oferta) : parseFloat(p.precio_regular),
                precioAntes: parseFloat(p.precio_oferta) > 0 ? parseFloat(p.precio_regular) : null
            }));

            // Filtrar por categoría de la URL
            const productosFiltrados = PRODUCTOS.filter(p => p.categoria === categoriaActiva);

            // Actualizar Breadcrumbs dinámicamente
            document.title = `ElectroHogar - ${categoriaActiva || 'Catálogo'}`;
            const breadSub = document.getElementById('categoria-actual-bread');
            if (breadSub) breadSub.innerText = categoriaActiva || "Todos";

            // Inicializar motor de filtros laterales (filtros.js)
            if (typeof inicializarFiltrosDinamicos === 'function') {
                inicializarFiltrosDinamicos(productosFiltrados);
            }
            
            // Dibujar la cuadrícula inicial
            renderProductosGrid(productosFiltrados);
        }
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
        return;
    }

    // Dibujar tarjetas. Fíjate en el onclick para abrir el detalle.
    grid.innerHTML = datos.map(p => `
        <div class="product-card-efe" onclick="window.location.href='producto.php?id=${p.id_producto}'">
            <div class="product-card-efe__image">
                <img src="assets/img/${p.img_principal || 'placeholder.png'}" alt="${p.nombre}" onerror="this.src='assets/img/placeholder.png'">
            </div>
            <div class="product-card-efe__info">
                <span class="product-card-efe__brand">${p.marca.toUpperCase()}</span>
                <h3 class="product-card-efe__title">${p.nombre}</h3>
                <div class="product-card-efe__price">
                    S/ ${parseFloat(p.precio).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <button class="product-card-efe__btn" onclick="event.stopPropagation(); agregarAlCarrito('${p.id}')">
                    <i data-lucide="shopping-cart" class="icon-sm"></i> Cotizar por WhatsApp
                </button>
            </div>
        </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function cambiarQtyDetail(n) {
    const input = document.getElementById('qty-detail');
    if(!input) return;
    let val = parseInt(input.value) + n;
    if(val >= 1) input.value = val;
}

function cotizarActualPorWhatsApp(id) {
    const input = document.getElementById('qty-detail');
    const cant = input ? input.value : 1;
    // Llamar a tu función global de carrito pasándole cantidad
    if(typeof agregarAlCarrito === 'function') agregarAlCarrito(id, true, cant);
}

function configurarBotonesVista() {
    const btnGrid = document.getElementById('view-grid');
    const btnList = document.getElementById('view-list');
    const gridContainer = document.getElementById('catalogo-grid');

    if (btnGrid && btnList && gridContainer) {
        // Al hacer clic en Cuadrícula
        btnGrid.addEventListener('click', () => {
            btnGrid.classList.add('active');
            btnList.classList.remove('active');
            gridContainer.classList.remove('list-view'); // Quita el modo lista
        });

        // Al hacer clic en Lista
        btnList.addEventListener('click', () => {
            btnList.classList.add('active');
            btnGrid.classList.remove('active');
            gridContainer.classList.add('list-view'); // Aplica el modo lista
        });
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo(); // Tu función principal
    configurarBotonesVista(); // Activamos los botones
});