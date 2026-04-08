/* ============================================================
   producto.js — Lógica para la página individual del producto
   ============================================================ */

const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('id');
let TODOS_LOS_PRODUCTOS = []; // Guardamos todos para los recomendados

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
    }
});

function renderizarProductoCompleto(prod) {
    const precioReg = parseFloat(prod.precio_regular);
    const precioOfe = parseFloat(prod.precio_oferta);
    const precioFinal = precioOfe > 0 ? precioOfe : precioReg;
    const precioAnterior = precioOfe > 0 ? precioReg : null;

    document.title = `${prod.nombre} | ElectroHogar`;

    // 1. Armamos las especificaciones originales
    let filasSpecs = `
        <tr class="spec-row">
            <td class="spec-name">Marca</td>
            <td class="spec-value">${prod.marca || 'Genérico'}</td>
        </tr>
    `;
    if (prod.especificaciones_agrupadas) {
        prod.especificaciones_agrupadas.split('||').forEach(s => {
            const [nombre, valor] = s.split(':');
            filasSpecs += `
                <tr class="spec-row">
                    <td class="spec-name">${nombre}</td>
                    <td class="spec-value">${valor || '-'}</td>
                </tr>
            `;
        });
    }

    // 2. BUSCAMOS PRODUCTOS SIMILARES (Misma categoría, distinto ID) - INTANCTO
    const similares = TODOS_LOS_PRODUCTOS
        .filter(p => p.categoria === prod.categoria && p.id_producto !== prod.id_producto)
        .slice(0, 5);

    let htmlSimilares = '';
    if (similares.length > 0) {
        const tarjetas = similares.map(p => {
            const pFinal = parseFloat(p.precio_oferta) > 0 ? parseFloat(p.precio_oferta) : parseFloat(p.precio_regular);
            return `
            <article class="product-card" style="cursor: pointer;" onclick="window.location.href='producto.php?id=${p.id_producto}'">
                <div class="product-card__image-container">
                    <img class="product-card__img" src="assets/img_productos/${p.img_principal || 'placeholder.png'}" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'font-size:60px;\\'>📦</div>';">
                </div>
                <div class="product-card__info">
                    <span class="product-card__brand">${p.marca}</span>
                    <h3 class="product-card__title">${p.nombre}</h3>
                    <div class="product-card__price-wrapper">
                        <span class="product-card__price">S/ ${pFinal.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </article>
            `;
        }).join('');

        htmlSimilares = `
            <div class="recommended-section">
                <h3 class="recommended-title">También te podría interesar</h3>
                <div class="products-grid">
                    ${tarjetas}
                </div>
            </div>
        `;
    }

    // 3. PREPARAMOS LA GALERÍA Y FAVORITOS (Nuevas funciones)
    let imagenes = prod.galeria ? prod.galeria.split(',') : [prod.img_principal || 'placeholder.png'];
    imagenes = imagenes.filter(img => img.trim() !== '').slice(0, 5); // Máximo 5 imágenes
    if(imagenes.length === 0) imagenes = ['placeholder.png'];

    let thumbsHtml = imagenes.map((img, idx) => `
        <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="cambiarImagenPrincipal(this, '${img}')">
            <img src="assets/img_productos/${img}" onerror="this.src='https://via.placeholder.com/80?text=📦'">
        </div>
    `).join('');
    
    const esFav = typeof window.esFavorito === 'function' ? window.esFavorito(prod.id_producto) : false;

    // ================= LÓGICA DE RUTA DINÁMICA (BREADCRUMBS) =================
    // Revisamos de dónde viene el usuario
    const urlAnterior = document.referrer.toLowerCase();
    const vieneDeInicio = urlAnterior.includes('index.php') || urlAnterior.endsWith('/') || urlAnterior === '';
    
    let rutaHTML = '';
    if (vieneDeInicio) {
        // Si viene del Inicio, saltamos la categoría
        rutaHTML = `
            <div class="breadcrumb-efe">
                <a href="index.php">Inicio</a>
                <i data-lucide="chevron-right"></i>
                <span class="current">${prod.nombre}</span>
            </div>
        `;
    } else {
        // Si viene del Catálogo u otra página, mostramos la ruta completa
        rutaHTML = `
            <div class="breadcrumb-efe">
                <a href="index.php">Inicio</a>
                <i data-lucide="chevron-right"></i>
                <a href="catalogo.php?categoria=${encodeURIComponent(prod.categoria)}">${prod.categoria}</a>
                <i data-lucide="chevron-right"></i>
                <span class="current">${prod.nombre}</span>
            </div>
        `;
    }

    // 4. INYECTAMOS EL HTML (Respetando tu estructura base y añadiendo las mejoras)
    const html = `
        ${rutaHTML}
        
        <div class="detail-top-section">
            <div class="detail-gallery-wrapper">
                <div class="gallery-thumbnails">
                    ${thumbsHtml}
                </div>
                <div class="detail-main-img-container">
                    <img src="assets/img_productos/${imagenes[0]}" id="imagen-principal-detalle" class="detail-main-img" onclick="abrirZoomImagen(this.src)" onerror="this.src='https://via.placeholder.com/500?text=📦'">
                    <button class="zoom-btn" onclick="abrirZoomImagen(document.getElementById('imagen-principal-detalle').src)"><i data-lucide="zoom-in"></i></button>
                </div>
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
                        <i data-lucide="shopping-cart"></i> AGREGAR AL CARRITO
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

// ================= FUNCIONES NUEVAS: GALERÍA, ZOOM Y FAVORITOS =================

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