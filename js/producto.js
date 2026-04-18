/* ============================================================
   producto.js — Lógica para la página individual del producto
   ============================================================ */

const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('id');
var TODOS_LOS_PRODUCTOS = []; // Guardamos todos para los recomendados

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

    // 2. BUSCAMOS PRODUCTOS SIMILARES (Misma categoría, distinto ID)
    const similares = TODOS_LOS_PRODUCTOS
        .filter(p => p.categoria === prod.categoria && p.id_producto !== prod.id_producto)
        .slice(0, 8); // Aumentamos a 8 para el swipe

    let htmlSimilares = '';
    if (similares.length > 0) {
        const tarjetas = similares.map(p => {
            const pFinal = parseFloat(p.precio_oferta) > 0 ? parseFloat(p.precio_oferta) : parseFloat(p.precio_regular);
            return `
            <article class="product-card product-card-efe" style="cursor: pointer; min-width: 160px; max-width: 180px; flex-shrink: 0; scroll-snap-align: start;" onclick="window.location.href='producto.php?id=${p.id_producto}'">
                <div class="product-card-efe__image">
                    <img src="assets/img_productos/${p.img_principal || 'placeholder.png'}" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'font-size:60px; text-align:center;\\'>📦</div>';">
                </div>
                <div class="product-card-efe__info" style="padding: 10px;">
                    <span class="product-card__brand">${p.marca}</span>
                    <h3 class="product-card-efe__title" style="font-size:13px; height:38px;">${p.nombre}</h3>
                    <div class="product-card-efe__price" style="font-size:16px; margin: 5px 0;">S/ ${pFinal.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
                </div>
            </article>
            `;
        }).join('');

        htmlSimilares = `
            <div class="recommended-section" style="margin-top: 40px;">
                <h3 class="recommended-title" style="text-align:center; font-size: 22px; font-weight:700; margin-bottom: 20px;">También te podría interesar</h3>
                <div class="products-grid recommended-swipe-mobile" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 15px; padding-bottom: 15px;">
                    ${tarjetas}
                </div>
            </div>
        `;
    }

    // 3. PREPARAMOS LA GALERÍA Y FAVORITOS
    let imagenes = prod.galeria ? prod.galeria.split(',') : [prod.img_principal || 'placeholder.png'];
    imagenes = imagenes.filter(img => img.trim() !== '').slice(0, 5);
    if(imagenes.length === 0) imagenes = ['placeholder.png'];

    const esFav = typeof window.esFavorito === 'function' ? window.esFavorito(prod.id_producto) : false;

    // GALERÍA DESKTOP CLÁSICA
    const galeriaDesktop = `
        <div class="gallery-desktop" style="display:flex; gap:20px; width:100%;">
            <div class="gallery-thumbnails">
                ${imagenes.map((img, idx) => `
                    <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="cambiarImagenPrincipal(this, '${img}')">
                        <img src="assets/img_productos/${img}" onerror="this.src='https://via.placeholder.com/80?text=📦'">
                    </div>
                `).join('')}
            </div>
            <div class="detail-main-img-container" style="flex:1;">
                <img src="assets/img_productos/${imagenes[0]}" id="imagen-principal-detalle" class="detail-main-img" onclick="abrirZoomImagen(this.src)" onerror="this.src='https://via.placeholder.com/500?text=📦'">
                <button class="zoom-btn" onclick="abrirZoomImagen(document.getElementById('imagen-principal-detalle').src)"><i data-lucide="zoom-in"></i></button>
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
                ${imagenes.map((_, i) => `<div class="dot ${i===0?'active':''}" style="width:8px; height:8px; border-radius:50%; background:${i===0?'var(--clr-primary)':'#cbd5e1'};"></div>`).join('')}
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
                
                <div class="detail-price-box">
                    ${precioAnterior ? `<span class="detail-old-price">S/ ${precioAnterior.toLocaleString('es-PE', {minimumFractionDigits:2})}</span>` : ''}
                    <h2 class="detail-current-price ${precioAnterior ? 'detail-current-price--oferta' : ''}">
                        S/ ${precioFinal.toLocaleString('es-PE', {minimumFractionDigits:2})}
                    </h2>
                </div>
                
                <div class="detail-actions-box">
                    <div class="quantity-selector-efe">
                        <button class="qty-btn-efe" onclick="cambiarQtyDetail(-1)">-</button>
                        <input type="number" id="qty-detail" value="1" readonly class="qty-input-efe">
                        <button class="qty-btn-efe" onclick="cambiarQtyDetail(1)">+</button>
                    </div>
                    <button class="btn-efe-primary" onclick="agregarAlCarritoDesdeDetalle('${prod.id_producto}')">
                        <i data-lucide="shopping-cart"></i> AGREGAR
                    </button>
                    <button class="btn-favorite ${esFav ? 'active' : ''}" id="btn-fav-${prod.id_producto}" onclick="toggleFavorito('${prod.id_producto}')">
                        <i data-lucide="heart" ${esFav ? 'fill="currentColor"' : ''}></i>
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
    if(typeof agregarAlCarrito === 'function'){
        agregarAlCarrito(id, cantidad);
    }
}

// ================= FUNCIONES NUEVAS: GALERÍA MÓVIL Y SPECS =================
window.handleMobileGalleryScroll = function(container, totalImages) {
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    const currentIndex = Math.round(scrollLeft / width);
    
    // Actualizar dots
    const dotsContainer = container.nextElementSibling;
    if(dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if(index === currentIndex) {
                dot.style.background = 'var(--clr-primary)';
            } else {
                dot.style.background = '#cbd5e1';
            }
        });
    }
};

window.toggleSpecs = function() {
    const hiddenSpecs = document.querySelectorAll('.spec-hidden');
    const btnVerMas = document.getElementById('btn-ver-mas-specs');
    
    hiddenSpecs.forEach(row => {
        row.style.display = 'table-row';
    });
    
    if (btnVerMas) {
        btnVerMas.style.display = 'none';
    }
};

// ================= FUNCIONES NUEVAS: GALERÍA DESKTOP, ZOOM Y FAVORITOS =================

window.cambiarImagenPrincipal = function(elementoMiniaura, nombreImagen) {
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
    elementoMiniaura.classList.add('active');
    document.getElementById('imagen-principal-detalle').src = `assets/img_productos/${nombreImagen}`;
};

window.abrirZoomImagen = function(src) {
    let modal = document.getElementById('zoom-modal-overlay');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'zoom-modal-overlay';
        modal.className = 'zoom-modal';
        // HTML simple: solo botón de cerrar e imagen
        modal.innerHTML = `
            <button class="zoom-close" onclick="cerrarZoomImagen()">×</button>
            <img id="zoom-img-target" src="">
        `;
        document.body.appendChild(modal);
    }
    const img = document.getElementById('zoom-img-target');
    img.src = src;
    
    // ✨ Limpieza: Nos aseguramos de quitar cualquier rastro de la lupa antigua
    img.style.transform = 'none';
    img.style.cursor = 'default';
    
    modal.classList.add('active');
};

window.cerrarZoomImagen = function() {
    const modal = document.getElementById('zoom-modal-overlay');
    if(modal) modal.classList.remove('active');
};

window.esFavorito = function(id) {
    let favs = JSON.parse(localStorage.getItem('favoritos_electrohogar') || '[]');
    return favs.includes(id.toString());
};

window.toggleFavorito = function(id) {
    let favs = JSON.parse(localStorage.getItem('favoritos_electrohogar') || '[]');
    const strId = id.toString();
    const index = favs.indexOf(strId);
    const btn = document.getElementById(`btn-fav-${id}`);

    if(index > -1) {
        favs.splice(index, 1);
        if(btn) { btn.classList.remove('active'); btn.innerHTML = '<i data-lucide="heart"></i>'; }
    } else {
        favs.push(strId);
        if(btn) { btn.classList.add('active'); btn.innerHTML = '<i data-lucide="heart" fill="currentColor"></i>'; }
    }
    localStorage.setItem('favoritos_electrohogar', JSON.stringify(favs));
    if (typeof lucide !== 'undefined') lucide.createIcons();
};