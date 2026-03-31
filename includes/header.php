<header>
    <div class="logo-area" onclick="window.location.href='index.php'" style="cursor: pointer;">
        <div class="logo-icon" aria-hidden="true"></div>
        <div class="logo-text">
            <span class="logo-electro">electro</span>
            <span class="logo-hogar">OGAR</span>
        </div>
    </div>
    
    <div class="search-container" style="position: relative; flex-grow: 1; max-width: 500px; margin: 0 20px;">
        <input type="text" id="buscador-principal" class="search-input" placeholder="Buscar por modelo o marca..." autocomplete="off" onkeyup="mostrarSugerencias(this.value)">
        <div id="caja-sugerencias" class="search-suggestions"></div>
    </div>

    <div class="header-actions">
        <button class="cart-btn" aria-label="Ver carrito" onclick="abrirCarrito()">
            🛒 <span class="cart-counter">0</span>
        </button>
        <button class="header-cta">📞 Contactar</button>
    </div>
</header>