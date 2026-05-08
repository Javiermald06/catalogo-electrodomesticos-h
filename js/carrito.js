/* ============================================================
   carrito.js — Lógica Global y Persistente del Carrito
   ============================================================ */

// 1. Cargamos el carrito desde la memoria del navegador (o creamos uno vacío)
let carrito = JSON.parse(localStorage.getItem('carrito_electrohogar') || '[]');
let sesionUsuario = null;

document.addEventListener('DOMContentLoaded', () => {
    inyectarHTMLCarrito();
    actualizarContadorCarrito();
    verificarSesion();
});

// Escuchar cuando los datos del buscador estén listos para auto-parchar el carrito
window.addEventListener('datosBuscadorListos', () => {
    if (carrito.length > 0) {
        renderizarCarrito();
    }
});

// 2. Función que dibuja el panel lateral del carrito en cualquier página
function inyectarHTMLCarrito() {
    if (document.getElementById('cart-overlay')) return; 

    const html = `
        <div class="cart-overlay" id="cart-overlay" onclick="cerrarCarrito()"></div>
        <div class="cart-sidebar" id="cart-sidebar">
            <div class="cart-header">
                <h2>Tu Carrito</h2>
                <button class="close-cart" onclick="cerrarCarrito()">×</button>
            </div>
            <div class="cart-items" id="cart-items"></div>
            <div class="cart-footer">
                <div id="user-info-cart" style="display:none; padding:10px; background:var(--gray); border-radius:8px; margin-bottom:10px; font-size:13px; color:var(--clr-dark);">
                    👤 <span id="user-name-display"></span> 
                    <button onclick="cerrarSesion()" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:12px; margin-left:10px; text-decoration:underline;">Cerrar Sesión</button>
                </div>
                <div class="cart-total"><span>Total:</span> <span id="cart-total-price">S/ 0.00</span></div>
                <button class="btn-whatsapp-large" id="btn-finalizar-pedido" style="width:100%; margin-top:15px; display:flex; align-items:center; justify-content:center; gap:10px;" onclick="iniciarFlujoValidacion()">
                    <i data-lucide="message-circle"></i> Pedir por WhatsApp
                </button>
            </div>
        </div>

    `;
    document.body.insertAdjacentHTML('beforeend', html);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function guardarCarrito() {
    localStorage.setItem('carrito_electrohogar', JSON.stringify(carrito));
    actualizarContadorCarrito();
    if(document.getElementById('cart-sidebar').classList.contains('open')) {
        renderizarCarrito();
    }
}

function actualizarContadorCarrito() {
    const counters = document.querySelectorAll('.cart-counter');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    counters.forEach(c => c.innerText = totalItems);
}

// 3. Agregar al carrito inteligente (Busca los datos sin importar en qué página estés)
async function agregarAlCarrito(id, cantidad = 1) {
    let prod = null;

    // A. Busca en las listas globales si existen
    if (window.PRODUCTOS) prod = window.PRODUCTOS.find(p => p.id == id || p.id_producto == id);
    if (!prod && window.TODOS_LOS_PRODUCTOS) prod = window.TODOS_LOS_PRODUCTOS.find(p => p.id == id || p.id_producto == id);

    // B. Si no lo encuentra, lo busca en la base de datos de forma segura
    if (!prod) {
        try {
            const res = await fetch('includes/api/listar_productos.php');
            const data = await res.json();
            if (data.status === 'success') prod = data.data.find(p => p.id_producto == id);
        } catch (e) { console.error("Error buscando producto", e); }
    }

    if (!prod) { alert("Error: Producto no encontrado."); return; }

    // Calcular el precio correcto
    const precioReg = parseFloat(prod.precio_regular || prod.precio);
    const precioOfe = parseFloat(prod.precio_oferta);
    const precioFinal = precioOfe > 0 ? precioOfe : precioReg;

    const itemExistente = carrito.find(item => item.id == id);
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: id,
            nombre: prod.nombre,
            precio: precioFinal,
            precioRegular: precioReg,
            enOferta: precioOfe > 0 && precioOfe < precioReg,
            img: prod.img_principal || prod.img || 'placeholder.png',
            cantidad: cantidad
        });
    }

    guardarCarrito();
    abrirCarrito(); // Abre el panel automáticamente
}

// 4. Funciones visuales del panel
function abrirCarrito() {
    renderizarCarrito();
    // Doble requestAnimationFrame asegura que el navegador termine de crear los nodos DOM
    // antes de exigirle a la Tarjeta Gráfica que anime la ventana a 60fps.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.getElementById('cart-overlay').classList.add('open');
            document.getElementById('cart-sidebar').classList.add('open');
        });
    });
}

function cerrarCarrito() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-sidebar').classList.remove('open');
}

function renderizarCarrito() {
    const container = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('cart-total-price');
    
    if (carrito.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#94a3b8; margin-top:40px;">Tu carrito está vacío 🛒</div>';
        totalPriceEl.innerText = 'S/ 0.00';
        return;
    }

    let html = '';
    let total = 0;

    carrito.forEach((item, index) => {
        // Autoparche más agresivo: Buscamos en todas las fuentes posibles (Buscador global o Main)
        const globalProds = window.ALL_PRODUCTS || window.PRODUCTOS || [];
        if (globalProds.length > 0) {
            const prodRef = globalProds.find(p => (p.id || p.id_producto) == item.id);
            if (prodRef) {
                // Sincronizamos usando las llaves que usa buscador.js y listar_productos.php
                const pReg = parseFloat(prodRef.precio_regular || prodRef.precioRegular || prodRef.precioAntes || 0);
                const pOfe = parseFloat(prodRef.precio_oferta || prodRef.precio || 0);
                const isOff = prodRef.enOferta !== undefined ? prodRef.enOferta : (pOfe > 0 && pReg > pOfe);
                
                if (isOff && pReg > 0) {
                    item.enOferta = true;
                    item.precioRegular = pReg;
                    item.precio = pOfe;
                } else if (pReg > 0) {
                    item.enOferta = false;
                    item.precioRegular = pReg;
                    item.precio = pReg;
                }
            }
        }

        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `
        <div class="cart-item">
            <div class="cart-item-img"><img src="assets/img_productos/${item.img}" style="width:100%; height:100%; object-fit:contain;"></div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.nombre}</div>
                <div class="cart-item-price">
                    <span class="cart-item-price-current ${item.enOferta ? 'cart-item-price-offer' : ''}">
                        S/ ${item.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                    ${item.enOferta ? `<span class="cart-item-price-old">S/ ${item.precioRegular.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>` : ''}
                </div>
                <div class="cart-item-qty-controls">
                    <button class="cart-qty-btn" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
                    <span class="cart-qty-number">${item.cantidad}</span>
                    <button class="cart-qty-btn" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="eliminarDelCarrito(${index})">
                    <i data-lucide="trash-2" style="width:14px; height:14px;"></i> Eliminar
                </button>
            </div>
        </div>`;
    });

    container.innerHTML = html;
    totalPriceEl.innerText = `S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function cambiarCantidadCarrito(index, cambio) {
    if (carrito[index]) {
        let nuevaCantidad = carrito[index].cantidad + cambio;
        
        if (nuevaCantidad >= 1) {
            carrito[index].cantidad = nuevaCantidad;
            guardarCarrito();
        }
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
}

