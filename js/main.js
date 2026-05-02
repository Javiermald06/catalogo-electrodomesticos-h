/* ============================================================
   main.js — Renderizado de productos y categorías (index)
   ============================================================ */

// Variables globales (compartidas con buscador.js)
window.PRODUCTOS = window.PRODUCTOS || [];
window.SECCIONES_DINAMICAS = window.SECCIONES_DINAMICAS || [];
let homeRendered = false;


// ================= SEGURIDAD: Escape XSS =================
function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ================= BANNERS DINÁMICOS =================
async function cargarBannersPublicos() {
  try {
    window.fetchCached('includes/api/listar_banners.php', (result, isCached) => {
      if (result.status === 'success' && result.data.length > 0) {
      const activos = result.data.filter(b => b.estado == 1);
      const wrapper = document.querySelector('.slider-wrapper');
      const dots = document.querySelector('.slider-dots');

      if (activos.length > 0) {
        wrapper.innerHTML = activos.map((b, i) => `
                  <div class="slide ${i === 0 ? 'active' : ''}" style="width: 100%; height: 100%; padding: 0;">
                      
                      ${b.enlace !== '#' ? `<a href="${escapeHtml(b.enlace)}" style="display:block; width:100%; height:100%;">` : ''}
                      
                      <img src="assets/img_banners/${escapeHtml(b.ruta_imagen)}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" alt="${escapeHtml(b.titulo)}" loading="lazy" onerror="this.src='https://via.placeholder.com/1920x600?text=Sin+Imagen'">
                      
                      ${b.enlace !== '#' ? `</a>` : ''}
                      
                  </div>
              `).join('');

        dots.innerHTML = activos.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="setHeroSlide(${i})"></span>`).join('');

        // Intentar inicializar el slider ahora que los elementos están en el DOM
        initHeroSlider();
      }
      }
    });
  } catch (e) {
    console.error("Error cargando banners:", e);
  }
}

// ================= RENDERIZADO DE PRODUCTOS =================
function crearTarjetaProducto(prod) {
  return window.createProductCardHTML(prod);
}

// Placeholder profesional cuando no hay imagen del producto
function generarPlaceholderSVG(marca) {
  const inicial = (marca || 'E').charAt(0).toUpperCase();
  return `<svg viewBox="0 0 200 200" style="width:80%; height:80%; max-width:140px;" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="16" fill="#f1f5f9"/>
    <rect x="60" y="40" width="80" height="95" rx="8" fill="#e2e8f0"/>
    <rect x="70" y="50" width="60" height="10" rx="3" fill="#cbd5e1"/>
    <rect x="70" y="68" width="40" height="6" rx="3" fill="#cbd5e1"/>
    <circle cx="100" cy="100" r="18" fill="#cbd5e1"/>
    <text x="100" y="107" text-anchor="middle" font-family="Outfit,sans-serif" font-size="20" font-weight="700" fill="#94a3b8">${inicial}</text>
    <text x="100" y="165" text-anchor="middle" font-family="Outfit,sans-serif" font-size="13" fill="#94a3b8">Sin imagen</text>
  </svg>`;
}

function renderCarruselOfertas() {
  const container = document.getElementById('ofertas-car');
  if (!container) return;
  const ofertas = PRODUCTOS.filter(p => p.enOferta);
  container.innerHTML = ofertas.map(crearTarjetaProducto).join('');
}

// ================= RENDERIZADO DINÁMICO DE CATEGORÍAS =================
function renderMenuCategorias() {
  const nav = document.getElementById('categorias');
  if (!nav) return;

  // Generar menú flotante/fijo (sticky cat-nav)
  nav.innerHTML = SECCIONES_DINAMICAS.map(sec => `
        <a href="#${sec.id}" class="cat-link">
            <span class="cat-ico" aria-hidden="true">${sec.icono}</span> ${sec.titulo}
        </a>
    `).join('');
}

function renderExploraCategorias() {
  // Evitar duplicados (Failsafe)
  if (document.querySelector('.circular-categories-section')) return;

  const ofertas = document.getElementById('ofertas');
  if (!ofertas) return;

  const navItems = SECCIONES_DINAMICAS.map(sec => `
        <a href="#${sec.id}" class="circular-cat-item">
            <div class="circular-cat-img-wrapper">
                <div class="circular-cat-img">${sec.icono}</div>
            </div>
            <span class="circular-cat-title">${sec.titulo}</span>
        </a>
    `).join('');

  const html = `
      <section class="carousel-section circular-categories-section">
        <h2 class="section-title" style="padding: 0 16px; margin-bottom: 20px;">Explora nuevas categorías</h2>
        <div class="circular-categories-wrapper">
          ${navItems}
        </div>
      </section>
    `;

  // Insertar ENCIMA de las Ofertas del Día
  ofertas.insertAdjacentHTML('beforebegin', html);
}

function renderSecciones() {
  const container = document.getElementById('sections-container');
  if (!container) return;

  container.innerHTML = SECCIONES_DINAMICAS.map(sec => {
    const productosDeCategoria = PRODUCTOS.filter(p => p.categoria_real === sec.titulo);
    if (productosDeCategoria.length === 0) return '';

    const productosLimitados = productosDeCategoria.slice(0, 4);
    const tarjetas = productosLimitados.map(crearTarjetaProducto).join('');

    return `
      <section class="cat-section" id="${sec.id}">
        <div class="cat-section-header">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div class="cat-section-icon">${sec.icono}</div>
            <div>
              <div class="cat-section-title">${sec.titulo}</div>
              <div class="cat-section-subtitle">${sec.subtitulo || ''}</div>
            </div>
          </div>
          <a href="catalogo.php?categoria=${sec.titulo}" class="cat-see-all-link">
            Ver todo →
          </a>
        </div>
        <!-- En móviles esto será un carrusel deslizable con clase recommended-swipe-mobile -->
        <div class="products-grid cat-products-wrapper recommended-swipe-mobile">
          ${tarjetas}
        </div>
      </section>`;
  }).join('');

  // ✨ RE-INICIALIZAR ICONOS LUCIDE después de inyectar HTML dinámico
  if (typeof lucide !== 'undefined') lucide.createIcons();
}



// ================= CONEXIÓN CON PHP Y MYSQL (INICIALIZACIÓN) =================
// Escuchar cuando el buscador global tenga los datos listos para renderizar la Home
window.addEventListener('datosBuscadorListos', (e) => {
  if (homeRendered) return; // Evitar doble renderizado
  homeRendered = true;

  PRODUCTOS = e.detail.productos;
  SECCIONES_DINAMICAS = e.detail.secciones;

  renderMenuCategorias();
  renderExploraCategorias();
  renderSecciones();
  initHeroSlider();
  renderCarruselOfertas();
  initCarouselButtons();
  initScrollSpy();
  initHeaderScrollLogic();

  // Activar Drag to Scroll en PC
  makeDragScrollable('.circular-categories-wrapper');
  makeDragScrollable('.cat-nav');
  makeDragScrollable('.carousel');
  makeDragScrollable('.recommended-swipe-mobile');

  // ✨ FAILSAFE: Quitar el loader si ya renderizamos
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.add('hide');
});

function initHomeSiReady() {
  if (homeRendered) return; // Ya se renderizó por evento
  if (window.PRODUCTOS_STORAGE && window.SECCIONES_STORAGE) {
    homeRendered = true;
    PRODUCTOS = window.PRODUCTOS_STORAGE;
    SECCIONES_DINAMICAS = window.SECCIONES_STORAGE;

    renderMenuCategorias();
    renderExploraCategorias();
    renderSecciones();
    initHeroSlider();
    renderCarruselOfertas();
    initCarouselButtons();
    initScrollSpy();
    initHeaderScrollLogic();

    makeDragScrollable('.circular-categories-wrapper');
    makeDragScrollable('.cat-nav');
    makeDragScrollable('.carousel');
    makeDragScrollable('.recommended-swipe-mobile');

    const loader = document.getElementById('global-loader');
    if (loader) loader.classList.add('hide');
  }
}

// Lógica de cierre de buscador movida a buscador.js para soporte global

document.addEventListener('DOMContentLoaded', async () => {

  // Los banners son independientes del buscador por ahora
  await cargarBannersPublicos();

  // Intentar inicializar si los datos ya llegaron antes que el script
  initHomeSiReady();

  // ✨ OPTIMIZACIÓN: Ocultar preloader (Failsafe final)
  const loader = document.getElementById('global-loader');
  if (loader) {
    setTimeout(() => {
      if (!loader.classList.contains('hide')) {
        loader.classList.add('hide');
        setTimeout(() => loader.style.display = 'none', 400);
      }
    }, 2000); // 2 segundos máximo de espera
  }
});

