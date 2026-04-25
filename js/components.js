/**
 * ElectroHogar — Shared UI Components
 * Este archivo centraliza el renderizado de componentes comunes para asegurar
 * consistencia visual absoluta en toda la plataforma.
 * 
 * Basado en el diseño exacto solicitado por el usuario (Precio rojo, tags rojos, etc).
 */

window.createProductCardHTML = function(p) {
    // Normalización de datos (Soporte para diferentes formatos de API)
    const id = p.id || p.id_producto;
    const nombre = p.nombre || 'Producto';
    const marca = (p.marca || 'GENERIC').toUpperCase();
    const precio = parseFloat(p.precio || p.precio_oferta || 0);
    const precioAnterior = p.precio_antes ? parseFloat(p.precio_antes) : (p.precio_regular ? parseFloat(p.precio_regular) : (p.precioAntes ? parseFloat(p.precioAntes) : null));
    const imagen = p.img_principal || p.img || p.imagen || 'placeholder.png';

    let badgeTopHtml = '';
    let precioHtml = '';

    // Lógica de Descuento
    if (precioAnterior && precioAnterior > precio) {
        const pct = Math.round((1 - precio / precioAnterior) * 100);
        
        // Badge superior izquierda (Rojo con sombra)
        badgeTopHtml = `<div class="product-card__badge">-${pct}%</div>`;
        
        // Precio + Tag de descuento + Precio anterior tachado
        precioHtml = `
            <div class="product-card__price-wrapper">
                <div class="product-card__price-row">
                    <span class="product-card__price">S/ ${precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    <span class="product-card__discount-tag">-${pct}%</span>
                </div>
                <span class="product-card__price--old">S/ ${precioAnterior.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
        `;
    } else {
        precioHtml = `
            <div class="product-card__price-wrapper">
                <span class="product-card__price">S/ ${precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
        `;
    }

    const placeholder = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f1f5f9%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EElectroHogar%3C%2Ftext%3E%3C%2Fsvg%3E';
    const imgContent = `<img src="assets/img_productos/${imagen}" alt="${nombre}" loading="lazy" onerror="this.src='${placeholder}'">`;

    return `
        <article class="product-card" data-id="${id}" onclick="window.location.href='producto.php?id=${id}'">
            ${badgeTopHtml}
            <div class="product-card__img-container">
                ${imgContent}
            </div>
            <div class="product-card__content">
                <span class="product-card__brand">${marca}</span>
                <h3 class="product-card__title" title="${nombre}">${nombre}</h3>
                
                <div class="product-card__price-section">
                    ${precioHtml}
                </div>

                <div class="product-card__actions">
                    <button class="product-card__btn" onclick="event.stopPropagation(); typeof agregarAlCarrito === 'function' ? agregarAlCarrito('${id}') : console.log('Link Cart')">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </article>
    `;
};

// Lógica de Auto-scroll para categorías activas (Mobile)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const activeLink = document.querySelector('.cat-link.active');
        const catNav = document.querySelector('.cat-nav');
        
        if (activeLink && catNav) {
            const navWidth = catNav.offsetWidth;
            const linkOffset = activeLink.offsetLeft;
            const linkWidth = activeLink.offsetWidth;
            
            // Centrar el link activo en la barra de navegación
            const scrollPos = linkOffset - (navWidth / 2) + (linkWidth / 2);
            
            catNav.scrollTo({
                left: scrollPos,
                behavior: 'smooth'
            });
        }
    }, 300); // Pequeño delay para asegurar que el DOM esté listo
});
