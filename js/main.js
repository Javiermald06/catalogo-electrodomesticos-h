/* ============================================================
   main.js — Lógica principal del catálogo ElectroHogar Tacna
   Depende de: data/productos.js (debe cargarse antes)
   ============================================================ */

/* ──────────────────────────────────────────────────────────
   1. CONFIGURACIÓN DE SECCIONES
   Define el orden, id, icono y subtítulo de cada categoría.
   Para agregar una nueva categoría: añade un objeto aquí
   y agrega los productos correspondientes en productos.js
   ────────────────────────────────────────────────────────── */
const SECCIONES = [
  { id: 'lavadoras',      titulo: 'Lavadoras',       icono: '🫧', subtitulo: 'Carga frontal, carga superior y secadoras' },
  { id: 'tvs',            titulo: 'Smart TVs',        icono: '🖥️', subtitulo: '4K, OLED, QLED y más tecnologías de pantalla' },
  { id: 'bano',           titulo: 'Baño',             icono: '🚿', subtitulo: 'Calentadores, duchas y accesorios para el baño' },
  { id: 'cocina',         titulo: 'Cocina',           icono: '🍳', subtitulo: 'Cocinas, hornos, microondas y pequeños electrodomésticos' },
  { id: 'refrigeradoras', titulo: 'Refrigeradoras',   icono: '❄️', subtitulo: 'No Frost, Side by Side y Mini refrigeradoras' },
  { id: 'audio',          titulo: 'Audio y Sonido',   icono: '🔊', subtitulo: 'Soundbars, parlantes, audífonos y sistemas de sonido' },
  { id: 'aspiradoras',    titulo: 'Aspiradoras',      icono: '🌀', subtitulo: 'Robot aspiradoras, verticales y de arrastre' },
  { id: 'plancha',        titulo: 'Planchas',         icono: '👔', subtitulo: 'Planchas a vapor, verticales y centros de planchado' },
];

/* ──────────────────────────────────────────────────────────
   2. GENERACIÓN DE HTML PARA TARJETA DE PRODUCTO
   ────────────────────────────────────────────────────────── */
function crearTarjetaProducto(prod) {
  // Imagen: usa <img> si hay ruta, si no muestra emoji
  const imgContent = prod.img
    ? `<img src="assets/img/${prod.img}" alt="${prod.nombre}" loading="lazy"
            onerror="this.parentElement.innerHTML='${prod.emoji}'">`
    : prod.emoji;

  // Badge (etiqueta)
  const badge = prod.badge
    ? `<div class="product-badge ${prod.badge}">${prod.badgeText}</div>`
    : '';

  // Precio anterior tachado
  const precioAntes = prod.precioAntes
    ? `<span class="product-price-old">S/ ${prod.precioAntes.toLocaleString()}</span>`
    : '';

  return `
    <div class="product-card" data-id="${prod.id}">
      ${badge}
      <div class="product-img">${imgContent}</div>
      <div class="product-info">
        <div class="product-brand">${prod.marca}</div>
        <div class="product-name">${prod.nombre}</div>
        <div>
          <span class="product-price">S/ ${prod.precio.toLocaleString()}</span>
          ${precioAntes}
        </div>
        <button class="product-btn" onclick="consultarPrecio('${prod.id}')">
          Consultar precio
        </button>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────────────────
   3. RENDERIZAR CARRUSEL DE OFERTAS
   ────────────────────────────────────────────────────────── */
function renderCarruselOfertas() {
  const container = document.getElementById('ofertas-car');
  if (!container) return;

  const ofertas = getOfertas();
  container.innerHTML = ofertas.map(crearTarjetaProducto).join('');
}

/* ──────────────────────────────────────────────────────────
   4. RENDERIZAR SECCIONES DE CATEGORÍAS
   ────────────────────────────────────────────────────────── */
function renderSecciones() {
  const container = document.getElementById('sections-container');
  if (!container) return;

  container.innerHTML = SECCIONES.map(sec => {
    const productos = getByCategoria(sec.id);
    if (!productos.length) return '';

    const tarjetas = productos.map(crearTarjetaProducto).join('');

    return `
      <section class="cat-section" id="${sec.id}">
        <div class="cat-section-header">
          <div class="cat-section-icon">${sec.icono}</div>
          <div>
            <div class="cat-section-title">${sec.titulo}</div>
            <div class="cat-section-subtitle">${sec.subtitulo}</div>
          </div>
        </div>
        <div class="products-grid">
          ${tarjetas}
        </div>
      </section>`;
  }).join('');
}

/* ──────────────────────────────────────────────────────────
   5. CARRUSEL: BOTONES PREV / NEXT
   ────────────────────────────────────────────────────────── */
function initCarouselButtons() {
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const carousel = document.getElementById(targetId);
      if (!carousel) return;
      const dir = btn.classList.contains('next') ? 1 : -1;
      carousel.scrollBy({ left: dir * 260, behavior: 'smooth' });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   6. ACTIVE LINK EN CAT-NAV AL HACER SCROLL
   ────────────────────────────────────────────────────────── */
function initScrollSpy() {
  const catLinks = document.querySelectorAll('.cat-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        catLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[id]').forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────
   7. ACCIÓN: CONSULTAR PRECIO
   Puedes reemplazar este alert por un modal, WhatsApp link, etc.
   ────────────────────────────────────────────────────────── */
function consultarPrecio(productoId) {
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!prod) return;

  // Opción A: Abrir WhatsApp con mensaje prearmado
  const mensaje = encodeURIComponent(
    `Hola, me interesa el producto: *${prod.nombre}* (${prod.marca}) — S/ ${prod.precio.toLocaleString()}. ¿Está disponible?`
  );
  const whatsapp = `https://wa.me/51XXXXXXXXX?text=${mensaje}`; // ← Reemplaza con tu número

  window.open(whatsapp, '_blank');

  // Opción B (comentada): Solo un alert de prueba
  // alert(`Producto: ${prod.nombre}\nPrecio: S/ ${prod.precio}`);
}

/* ──────────────────────────────────────────────────────────
   8. INICIALIZACIÓN
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderCarruselOfertas();
  renderSecciones();
  initCarouselButtons();
  initScrollSpy();
});
