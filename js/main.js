/* ============================================================
   main.js — Lógica principal del catálogo ElectroHogar Tacna
   Depende de: data/productos.js (debe cargarse antes)
   ============================================================ */

/* ──────────────────────────────────────────────────────────
   1. CONFIGURACIÓN DE SECCIONES
   Define el orden, id, icono y subtítulo de cada categoría.
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
   2. LÓGICA DEL HERO SLIDER (CARRUSEL PRINCIPAL)
   ────────────────────────────────────────────────────────── */
let heroIndex = 0;
let heroInterval;

function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  
  if (slides.length === 0) return;

  // Función global para mostrar el slide específico
  window.showHeroSlide = function(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    heroIndex = (n + slides.length) % slides.length;
    
    slides[heroIndex].classList.add('active');
    if(dots[heroIndex]) dots[heroIndex].classList.add('active');
  };

  // Función global para mover adelante/atrás
  window.moveHeroSlide = function(n) {
    showHeroSlide(heroIndex + n);
    resetHeroInterval(); // Reiniciar contador al hacer click manual
  };

  // Función global para los puntos indicadores
  window.setHeroSlide = function(n) {
    showHeroSlide(n);
    resetHeroInterval();
  };

  // Autoplay
  function resetHeroInterval() {
    clearInterval(heroInterval);
    heroInterval = setInterval(() => moveHeroSlide(1), 5000); // Cambia cada 5 segundos
  }

  resetHeroInterval();
}

/* ──────────────────────────────────────────────────────────
   3. GENERACIÓN DE HTML PARA TARJETA DE PRODUCTO
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
   4. RENDERIZAR CARRUSEL DE OFERTAS
   ────────────────────────────────────────────────────────── */
function renderCarruselOfertas() {
  const container = document.getElementById('ofertas-car');
  if (!container) return;

  const ofertas = getOfertas();
  container.innerHTML = ofertas.map(crearTarjetaProducto).join('');
}

/* ──────────────────────────────────────────────────────────
   5. RENDERIZAR SECCIONES DE CATEGORÍAS
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
   6. CARRUSEL PRODUCTOS: BOTONES PREV / NEXT
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
   7. ACTIVE LINK EN CAT-NAV AL HACER SCROLL
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
   8. ACCIÓN: CONSULTAR PRECIO (WHATSAPP)
   ────────────────────────────────────────────────────────── */
function consultarPrecio(productoId) {
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!prod) return;

  // Abrir WhatsApp con mensaje prearmado
  const mensaje = encodeURIComponent(
    `Hola, me interesa el producto: *${prod.nombre}* (${prod.marca}) — S/ ${prod.precio.toLocaleString()}. ¿Está disponible?`
  );
  
  // RECUERDA: Reemplazar XXXXXXXXX por tu número real de Tacna/Perú
  const whatsapp = `https://wa.me/51XXXXXXXXX?text=${mensaje}`; 

  window.open(whatsapp, '_blank');
}

/* ──────────────────────────────────────────────────────────
   9. INICIALIZACIÓN GENERAL
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();        // Inicia el nuevo carrusel principal
  renderCarruselOfertas(); // Renderiza las ofertas del día
  renderSecciones();       // Renderiza las categorías y productos
  initCarouselButtons();   // Activa botones del carrusel de productos
  initScrollSpy();         // Activa el resaltado de navegación
});