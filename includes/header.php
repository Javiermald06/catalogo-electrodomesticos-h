<script src="https://unpkg.com/lucide@latest"></script>
<header class="main-header">

    <!-- Logo (Restaurado a su versión original) -->
    <div class="logo-area" onclick="window.location.href='index.php'" style="cursor: pointer;">
        <div class="logo-icon" aria-hidden="true"></div>
        <div class="logo-text">
            <span class="logo-electro">electro</span>
            <span class="logo-hogar">OGAR</span>
        </div>
    </div>
    
    <!-- Buscador Minimalista -->
    <div class="search-container" id="search-container-main">
        <input type="text" id="buscador-principal" class="search-input" placeholder="Buscar por modelo, marca o categoría..." autocomplete="off" onkeyup="mostrarSugerencias(this.value)">
        
        <button class="search-btn-trigger" aria-label="Ejecutar búsqueda" onclick="ejecutarBusqueda(document.getElementById('buscador-principal').value)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>

        <!-- Contenedor del JS intacto -->
        <div id="caja-sugerencias" class="search-suggestions"></div>
    </div>

    <!-- Acciones -->
    <div class="header-actions">
        <!-- Botón Lupa Exclusivo Móvil -->
        <button class="mobile-search-btn" aria-label="Buscar" onclick="document.getElementById('search-container-main').classList.toggle('active')">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
        <button class="btn-contact header-cta">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Contactar
        </button>
        <button class="cart-btn" aria-label="Ver carrito" onclick="abrirCarrito()">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span class="cart-counter">0</span>
        </button>
    </div>
</header>
<script src='js/buscador.js'></script>
