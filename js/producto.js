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

    // 1. Armamos las especificaciones
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

    // 2. BUSCAMOS PRODUCTOS SIMILARES (Misma categoría, distinto ID)
    const similares = TODOS_LOS_PRODUCTOS
        .filter(p => p.categoria === prod.categoria && p.id_producto !== prod.id_producto)
        .slice(0, 5);

    let htmlSimilares = '';
    if (similares.length > 0) {
        // Reutilizamos la estructura HTML de tus tarjetas (crearTarjetaProducto)
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

    // 3. Inyectamos TODO el HTML (Detalle + Specs + Similares)
    const html = `
        <div class="detail-back-bar" onclick="window.location.href='catalogo.php?categoria=${prod.categoria}'" style="margin-top: 20px;">
            <i data-lucide="chevron-left"></i> Volver a ${prod.categoria}
        </div>
        
        <div class="detail-top-section">
            <div class="detail-gallery-wrapper">
                <div class="detail-main-img-container">
                    <img src="assets/img_productos/${prod.img_principal || 'placeholder.png'}" class="detail-main-img" onerror="this.src='assets/img/placeholder.png'">
                </div>
            </div>
            
            <div class="detail-purchase-panel">
                <span class="detail-brand-tag">${prod.marca}</span>
                <h1 class="detail-title">${prod.nombre}</h1>
                <p class="detail-sku">SKU: EH-${prod.id_producto}</p>
                
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

// Conexión con el carrito global en main.js
function agregarAlCarritoDesdeDetalle(id) {
    const input = document.getElementById('qty-detail');
    let cantidadAAgregar = input ? parseInt(input.value) : 1;
    
    // Asumiendo que tu archivo principal tiene una función global para manejar el carrito:
    if(typeof agregarAlCarritoExt === 'function'){
        agregarAlCarritoExt(id, cantidadAAgregar);
    } else {
        alert("Agregado al carrito temporalmente (Falta vincular con main.js)");
    }
}