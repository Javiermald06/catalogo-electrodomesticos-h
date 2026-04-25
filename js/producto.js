/* ============================================================
   producto.js — Lógica para la página individual del producto
   ============================================================ */

const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('id');
var TODOS_LOS_PRODUCTOS = []; // Guardamos todos para los recomendados

function generarPlaceholderSVG_Local(marca) {
    const inicial = (marca || 'E').charAt(0).toUpperCase();
    return `<svg viewBox="0 0 200 200" style="width:80%; height:80%; max-width:140px;" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="16" fill="#f1f5f9"/>
    <text x="50%" y="55%" text-anchor="middle" font-family="system-ui" font-weight="900" font-size="60" fill="#cbd5e1">${inicial}</text>
  </svg>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!productoId) {
        document.getElementById('contenedor-detalle').innerHTML = '<h2 style="text-align:center; padding: 50px;">Producto no especificado.</h2>';
        return;
    }

    try {
        const response = await fetch('includes/api/listar_productos.php');
        const result = await response.json();

        if (result.status === 'success') {
            TODOS_LOS_PRODUCTOS = result.data;
            const prod = TODOS_LOS_PRODUCTOS.find(p => p.id_producto == productoId);

            if (prod) {
                renderizarProductoCompleto(prod);
            } else {
                document.getElementById('contenedor-detalle').innerHTML = '<h2 style="text-align:center; padding: 50px;">Producto no encontrado.</h2>';
            }
        }
    } catch (e) {
        console.error("Error cargando el producto:", e);
    } finally {
        // ✨ OPTIMIZACIÓN: Ocultar preloader cuando terminen de cargar todos los detalles
        const loader = document.getElementById('global-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hide');
                setTimeout(() => loader.style.display = 'none', 400);
            }, 100);
        }
    }
});

function renderizarProductoCompleto(prod) {
    const precioReg = parseFloat(prod.precio_regular);
    const precioOfe = parseFloat(prod.precio_oferta);
    const precioFinal = precioOfe > 0 ? precioOfe : precioReg;
    const precioAnterior = precioOfe > 0 ? precioReg : null;

    document.title = `${prod.nombre} | ElectroHogar`;

    // 1. Armamos las especificaciones originales
    let arraySpecs = [];
    arraySpecs.push({ nombre: 'Marca', valor: prod.marca || 'Genérico' });

    if (prod.atributos) {
        const attrObj = typeof prod.atributos === 'string' ? JSON.parse(prod.atributos) : prod.atributos;
        Object.entries(attrObj).forEach(([nombre, valor]) => {
            arraySpecs.push({ nombre: nombre, valor: valor || '-' });
        });
    }

    let filasSpecs = arraySpecs.map((spec, index) => `
        <tr class="spec-row ${index > 4 ? 'spec-hidden' : ''}" ${index > 4 ? 'style="display:none;"' : ''}>
            <td class="spec-name">${spec.nombre}</td>
            <td class="spec-value">${spec.valor}</td>
        </tr>
    `).join('');

    if (arraySpecs.length > 5) {
        filasSpecs += `
            <tr id="btn-ver-mas-specs">
                <td colspan="2" style="text-align:center; color: var(--clr-primary); font-weight: 600; cursor:pointer; padding: 15px;" onclick="toggleSpecs()">
                    Ver más características <i data-lucide="chevron-down" style="width:16px; height:16px; vertical-align:middle;"></i>
                </td>
            </tr>
        `;
    }

    // 2. BUSCAMOS PRODUCTOS SIMILARES (Máximo 4)
    const similares = TODOS_LOS_PRODUCTOS
        .filter(p => p.categoria === prod.categoria && p.id_producto !== prod.id_producto)
        .slice(0, 4);

    let htmlSimilares = '';
    if (similares.length > 0) {
        const tarjetas = similares.map(p => {
            return window.createProductCardHTML(p);
        }).join('');

        htmlSimilares = `
            <div class="recommended-section" style="margin: 60px auto 40px; padding: 40px 15px; border-top: 1px solid #f1f5f9; max-width: 1400px;">
                <h3 class="recommended-title" style="text-align:center; font-size: 24px; font-weight:800; color:var(--clr-dark); margin-bottom: 30px;">También te podría interesar</h3>
                <div class="products-grid recommended-swipe-mobile">
                    ${tarjetas}
                </div>
            </div>
        `;
    }

    // 3. PREPARAMOS LA GALERÍA Y FAVORITOS
    const principal = prod.img_principal || 'placeholder.png';
    let galeriaArr = prod.galeria ? prod.galeria.split(',').map(img => img.trim()).filter(img => img !== '') : [];
    // Aseguramos que la principal sea la primera y el resto sigan sin duplicarse
    let imagenes = [principal, ...galeriaArr.filter(img => img !== principal)].slice(0, 5);

    const esFav = typeof window.esFavorito === 'function' ? window.esFavorito(prod.id_producto) : false;

    // GALERÍA DESKTOP CLÁSICA
    const galeriaDesktop = `
        <div class="gallery-desktop" style="display:flex; gap:12px; height: 500px;">
            <div class="gallery-thumbnails" style="display:flex; flex-direction:column; gap:8px; width: 70px; flex-shrink: 0;">
                ${imagenes.map((img, i) => `
                    <div class="thumbnail ${i === 0 ? 'active' : ''}" 
                         style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; padding: 4px; background: #fff;"
                         onclick="cambiarImagenPrincipal(this, '${img}')">
                        <img src="assets/img_productos/${img}" style="width:100%; height:100%; object-fit:contain;" onerror="this.src='https://via.placeholder.com/80?text=📦'">
                    </div>
                `).join('')}
            </div>
            <div class="detail-main-img-container" style="flex:1; background:#fff; border: 1px solid #f1f5f9; border-radius:12px; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="assets/img_productos/${imagenes[0]}" id="imagen-principal-detalle" class="detail-main-img" style="max-height:100%; max-width:100%; object-fit:contain; cursor:zoom-in;" onclick="abrirZoomImagen(this.src)">
                <div class="zoom-icon" style="position:absolute; bottom:15px; right:15px; background:rgba(0,0,0,0.05); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#64748b; cursor:pointer;" onclick="abrirZoomImagen(document.getElementById('imagen-principal-detalle').src)">
                    <i data-lucide="zoom-in"></i>
                </div>
            </div>
        </div>
    `;

    // GALERÍA MOBILE CARRUSEL (Plaza Vea Style)
    const galeriaMobile = `
        <div class="gallery-mobile">
            <div class="mobile-carousel" style="display:flex; overflow-x:auto; scroll-snap-type: x mandatory; margin: 0 -20px; padding: 0 20px;" onscroll="handleMobileGalleryScroll(this, ${imagenes.length})">
                ${imagenes.map(img => `
                    <img src="assets/img_productos/${img}" style="width:100%; flex-shrink:0; scroll-snap-align:center; object-fit:contain; object-position:center; height:350px;" onerror="this.src='https://via.placeholder.com/500?text=📦'">
                `).join('')}
            </div>
            <div class="mobile-carousel-dots" style="display:flex; justify-content:center; gap:8px; margin-top:15px;" id="mobile-dots-${prod.id_producto}">
                ${imagenes.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" style="width:8px; height:8px; border-radius:50%; background:${i === 0 ? 'var(--clr-primary)' : '#cbd5e1'};"></div>`).join('')}
            </div>
        </div>
    `;

    // ================= LÓGICA DE RUTA DINÁMICA (BREADCRUMBS) =================
    const urlAnterior = document.referrer.toLowerCase();
    const vieneDeInicio = urlAnterior.includes('index.php') || urlAnterior.endsWith('/') || urlAnterior === '';

    let rutaHTML = '';
    if (vieneDeInicio) {
        rutaHTML = `
            <div class="breadcrumb-efe">
                <a href="index.php">Inicio</a>
                <i data-lucide="chevron-right"></i>
                <span class="current" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prod.nombre}</span>
            </div>
        `;
    } else {
        rutaHTML = `
            <div class="breadcrumb-efe">
                <a href="index.php">Inicio</a>
                <i data-lucide="chevron-right"></i>
                <a href="catalogo.php?categoria=${encodeURIComponent(prod.categoria)}">${prod.categoria}</a>
                <i data-lucide="chevron-right"></i>
                <span class="current" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prod.nombre}</span>
            </div>
        `;
    }

    // 4. INYECTAMOS EL HTML
    const html = `
        ${rutaHTML}
        
        <div class="detail-top-section">
            <div class="detail-gallery-wrapper">
                ${galeriaDesktop}
                ${galeriaMobile}
            </div>
            
            <div class="detail-purchase-panel">
                <span class="detail-brand-tag">${prod.marca}</span>
                <h1 class="detail-title">${prod.nombre}</h1>
                <p class="detail-sku">SKU: ${prod.sku || prod.id_producto}</p>
                
                <div class="detail-price-box" style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
                    ${precioAnterior ? `<span class="detail-old-price" style="text-decoration: line-through; color: #94a3b8; font-size: 18px; margin-bottom: 5px; display: block;">S/ ${precioAnterior.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>` : ''}
                    <h2 class="detail-current-price" style="font-size: 46px; font-weight: 800; color: #E8232A; margin: 0; line-height: 1; font-family: 'Rajdhani', sans-serif;">
                        S/ ${precioFinal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </h2>
                </div>
                
                <div class="detail-actions-box">
                    <div class="quantity-selector-efe">
                        <button class="qty-btn-efe" onclick="cambiarQtyDetail(-1)">-</button>
                        <input type="number" id="qty-detail" value="1" readonly class="qty-input-efe">
                        <button class="qty-btn-efe" onclick="cambiarQtyDetail(1)">+</button>
                    </div>
                    <button class="btn-efe-primary" onclick="agregarAlCarritoDesdeDetalle('${prod.id_producto}')">
                        <i data-lucide="shopping-cart"></i> AGREGAR AL CARRITO
                    </button>
                </div>
            </div>
        </div>

        <div class="detail-specs-section">
            <div class="specs-header-efe"><h3>FICHA TÉCNICA</h3></div>
            <div class="specs-table-wrapper">
                <table class="specs-table-efe">
                    <tbody>${filasSpecs}</tbody>
                </table>
            </div>
        </div>

        ${htmlSimilares}
    `;

    document.getElementById('contenedor-detalle').innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function cambiarQtyDetail(n) {
    const input = document.getElementById('qty-detail');
    if (!input) return;
    let val = parseInt(input.value) + n;
    if (val >= 1) input.value = val;
}

function agregarAlCarritoDesdeDetalle(id) {
    const input = document.getElementById('qty-detail');
    let cantidad = input ? parseInt(input.value) : 1;
    // Llamamos directamente a la nueva función global
    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(id, cantidad);
    }
}

// ================= FUNCIONES NUEVAS: GALERÍA MÓVIL Y SPECS =================
window.handleMobileGalleryScroll = function (container, totalImages) {
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    const currentIndex = Math.round(scrollLeft / width);

    // Actualizar dots
    const dotsContainer = container.nextElementSibling;
    if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.style.background = 'var(--clr-primary)';
            } else {
                dot.style.background = '#cbd5e1';
            }
        });
    }
};

window.toggleSpecs = function () {
    const hiddenSpecs = document.querySelectorAll('.spec-hidden');
    const rowBtn = document.getElementById('btn-ver-mas-specs');
    if (!rowBtn) return;

    // Obtener el elemento interno donde está el texto (el td)
    const btnCell = rowBtn.querySelector('td');
    const isExpanded = rowBtn.getAttribute('data-expanded') === 'true';

    hiddenSpecs.forEach(row => {
        row.style.display = isExpanded ? 'none' : 'table-row';
    });

    if (isExpanded) {
        rowBtn.setAttribute('data-expanded', 'false');
        btnCell.innerHTML = `Ver más características <i data-lucide="chevron-down" style="width:16px; height:16px; vertical-align:middle;"></i>`;
    } else {
        rowBtn.setAttribute('data-expanded', 'true');
        btnCell.innerHTML = `Ver menos características <i data-lucide="chevron-up" style="width:16px; height:16px; vertical-align:middle;"></i>`;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ================= FUNCIONES NUEVAS: GALERÍA DESKTOP, ZOOM Y FAVORITOS =================

window.cambiarImagenPrincipal = function (elementoMiniatura, nombreImagen) {
    document.querySelectorAll('.thumbnail').forEach(el => el.classList.remove('active'));
    elementoMiniatura.classList.add('active');
    document.getElementById('imagen-principal-detalle').src = `assets/img_productos/${nombreImagen}`;
};

let currentZoom = 1;
const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

window.abrirZoomImagen = function (src) {
    let modal = document.getElementById('zoom-modal-overlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'zoom-modal-overlay';
        modal.className = 'zoom-modal';
        modal.innerHTML = `
            <button class="zoom-close" onclick="cerrarZoomImagen()">×</button>
            <div class="zoom-container">
                <img id="zoom-img-target" src="">
            </div>
            <div class="zoom-controls">
                <button class="zoom-btn" onclick="zoomIn()"><i data-lucide="plus"></i></button>
                <button class="zoom-btn" onclick="zoomOut()"><i data-lucide="minus"></i></button>
            </div>
        `;
        document.body.appendChild(modal);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    const img = document.getElementById('zoom-img-target');
    img.src = src;

    currentZoom = 1;
    updateZoom();

    modal.classList.add('active');
};

window.zoomIn = function () {
    if (currentZoom < MAX_ZOOM) {
        currentZoom += 0.5;
        updateZoom();
    }
};

window.zoomOut = function () {
    if (currentZoom > MIN_ZOOM) {
        currentZoom -= 0.5;
        updateZoom();
    }
};

function updateZoom() {
    const img = document.getElementById('zoom-img-target');
    if (img) {
        img.style.transform = `scale(${currentZoom})`;
    }
}

window.cerrarZoomImagen = function () {
    const modal = document.getElementById('zoom-modal-overlay');
    if (modal) modal.classList.remove('active');
};

window.esFavorito = function (id) {
    let favs = JSON.parse(localStorage.getItem('favoritos_electrohogar') || '[]');
    return favs.includes(id.toString());
};

window.toggleFavorito = function (id) {
    let favs = JSON.parse(localStorage.getItem('favoritos_electrohogar') || '[]');
    const strId = id.toString();
    const index = favs.indexOf(strId);
    const btn = document.getElementById(`btn-fav-${id}`);

    if (index > -1) {
        favs.splice(index, 1);
        if (btn) { btn.classList.remove('active'); btn.innerHTML = '<i data-lucide="heart"></i>'; }
    } else {
        favs.push(strId);
        if (btn) { btn.classList.add('active'); btn.innerHTML = '<i data-lucide="heart" fill="currentColor"></i>'; }
    }
    localStorage.setItem('favoritos_electrohogar', JSON.stringify(favs));
    if (typeof lucide !== 'undefined') lucide.createIcons();
};