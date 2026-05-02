/* ============================================================
   whatsapp-checkout.js - Sesin de usuario y envo por WhatsApp
   ============================================================ */

async function verificarSesion() {
    const token = localStorage.getItem('electrohogar_token');
    if (!token) return;

    try {
        const res = await fetch('includes/api/validar_sesion.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (data.status === 'success') {
            sesionUsuario = data.user;
            mostrarUsuarioEnCarrito();
        } else {
            localStorage.removeItem('electrohogar_token');
        }
    } catch (e) {
        console.error("Error validando sesin", e);
    }
}

function mostrarUsuarioEnCarrito() {
    const container = document.getElementById('user-info-cart');
    if (container && sesionUsuario) {
        container.style.display = 'block';
        document.getElementById('user-name-display').innerText = `Hola, ${sesionUsuario.nombre}`;
    }
}

function cerrarSesion() {
    localStorage.removeItem('electrohogar_token');
    sesionUsuario = null;
    document.getElementById('user-info-cart').style.display = 'none';
}

async function iniciarFlujoValidacion() {
    if (carrito.length === 0) return;
    
    // VALIDACIÓN DE PRECIOS EN TIEMPO REAL
    const btn = document.getElementById('btn-finalizar-pedido');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Verificando precios...';
    btn.disabled = true;

    try {
        const res = await fetch('includes/api/listar_productos.php');
        const data = await res.json();
        
        if (data.status === 'success') {
            const dbProductos = data.data;
            let preciosCambiaron = false;

            carrito.forEach(item => {
                const prodFresco = dbProductos.find(p => p.id_producto == item.id);
                if (prodFresco) {
                    const pReg = parseFloat(prodFresco.precio_regular);
                    const pOfe = parseFloat(prodFresco.precio_oferta);
                    const precioActual = pOfe > 0 ? pOfe : pReg;
                    
                    if (item.precio !== precioActual) {
                        item.precio = precioActual;
                        preciosCambiaron = true;
                    }
                }
            });

            if (preciosCambiaron) {
                guardarCarrito();
                alert('Algunos precios se han actualizado a su valor más reciente. Revisa el carrito antes de enviar tu pedido.');
                btn.innerHTML = originalText;
                btn.disabled = false;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return; 
            }
        }
    } catch (e) {
        console.error("Error verificando precios finales", e);
    }
    
    btn.innerHTML = originalText;
    btn.disabled = false;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const itemsParaEnviar = [...carrito];
    enviarWhatsAppFinal(itemsParaEnviar);
    
    carrito = [];
    guardarCarrito();
    cerrarCarrito();
}

function enviarWhatsAppFinal(items) {
    let total = 0;
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    let mensaje = "Hola ElectroHogar. Aqu estǭ mi pedido:\n\n";

    items.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        // Construimos el link del producto (asumiendo que catalogo.php puede mostrar detalle por ID)
        const productLink = `${baseUrl}/catalogo.php?id=${item.id}`;
        mensaje += `${item.cantidad}x *${item.nombre}*\nY"- ${productLink}\nY' Subtotal: S/ ${subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}\n\n`;
    });

    mensaje += `*Total: S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}*`;
    
    const waUrl = `https://wa.me/51989919237?text=${encodeURIComponent(mensaje)}`;
    
    // Usamos location.href para evitar bloqueos de popup en mviles tras validacin async
    window.location.href = waUrl;
}
