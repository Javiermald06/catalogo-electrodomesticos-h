<script src="js/carrito.js"></script>

<footer>
    <div class="footer-top">
        <div class="footer-brand">
            <div class="logo-area">
                <div class="logo-icon" aria-hidden="true"></div>
                <div class="logo-text">
                    <span class="logo-electro">electro</span>
                    <span class="logo-hogar">OGAR</span>
                </div>
            </div>
            <p class="footer-desc">Tu tienda de electrodomésticos de confianza en Tacna, Perú. Calidad, garantía y el mejor servicio técnico post-venta.</p>
        </div>
        
        <nav class="footer-col" aria-label="Categorías pie de página">
            <h4>Categorías</h4>
            <ul>
                <li><a href="catalogo.php?categoria=Lavadoras">Lavadoras</a></li>
                <li><a href="catalogo.php?categoria=Smart TVs">Smart TVs</a></li>
                <li><a href="catalogo.php?categoria=Baño">Baño</a></li>
                <li><a href="catalogo.php?categoria=Cocina">Cocina</a></li>
                <li><a href="catalogo.php?categoria=Refrigeradoras">Refrigeradoras</a></li>
            </ul>
        </nav>
        
        <nav class="footer-col" aria-label="Información legal">
            <h4>Información</h4>
            <ul>
                <li><a href="#">Sobre Nosotros</a></li>
                <li><a href="#">Garantías</a></li>
                <li><a href="#">Servicio Técnico</a></li>
                <li><a href="#">Financiamiento</a></li>
                <li><a href="#">Términos y Condiciones</a></li>
            </ul>
        </nav>
        
        <address class="footer-col">
            <h4>Contacto</h4>
            <ul>
                <li>📍 Tacna, Perú</li>
                <li>📞 <a href="tel:052123456" style="color: inherit; text-decoration: none;">(052) 123-456</a></li>
                <li>📱 WhatsApp</li>
                <li>✉️ <a href="mailto:ventas@electrohogar.pe" style="color: inherit; text-decoration: none;">ventas@electrohogar.pe</a></li>
                <li>🕐 Lun–Sab: 9am – 7pm</li>
            </ul>
        </address>
    </div>
    
    <div class="footer-bottom">
        <small>© 2026 ElectroHogar Tacna. Todos los derechos reservados.</small>
    </div>
</footer>

<div class="cart-overlay" id="cart-overlay" onclick="cerrarCarrito()"></div>
<aside class="cart-sidebar" id="cart-sidebar" aria-label="Tu carrito de compras">
    <div class="cart-header">
        <h2>Tu Carrito</h2>
        <button class="close-cart" onclick="cerrarCarrito()" aria-label="Cerrar carrito">✕</button>
    </div>
    
    <div class="cart-items" id="cart-items">
    </div>
    
    <div class="cart-footer">
        <div class="cart-total">
            <span>Total Estimado:</span>
            <span id="cart-total-price">S/ 0</span>
        </div>
        <button class="btn-buy-now" style="width: 100%; margin-top: 15px; padding: 16px;" onclick="enviarPedidoCarrito()">
            📱 Enviar Pedido por WhatsApp
        </button>
    </div>
</aside>