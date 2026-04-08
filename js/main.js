/* ============================================================
   main.js — Lógica principal del catálogo ElectroHogar Tacna
   (Conectado a la API PHP y MySQL)
   ============================================================ */

let SECCIONES_DINAMICAS = []; 
let heroIndex = 0;
let heroInterval;

// ================= HERO SLIDER =================
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (slides.length === 0) return;

  window.showHeroSlide = function(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    heroIndex = (n + slides.length) % slides.length;
    slides[heroIndex].classList.add('active');
    if(dots[heroIndex]) dots[heroIndex].classList.add('active');
  };

  window.moveHeroSlide = function(n) {
    showHeroSlide(heroIndex + n);
    resetHeroInterval(); 
  };

  window.setHeroSlide = function(n) {
    showHeroSlide(n);
    resetHeroInterval();
  };

  function resetHeroInterval() {
    clearInterval(heroInterval);
    heroInterval = setInterval(() => moveHeroSlide(1), 5000); 
  }
  resetHeroInterval();
}

// ================= BANNERS DINÁMICOS =================
async function cargarBannersPublicos() {
  try {
      const response = await fetch('includes/api/listar_banners.php');
      const result = await response.json();
      
      if (result.status === 'success' && result.data.length > 0) {
          const activos = result.data.filter(b => b.estado == 1);
          const wrapper = document.querySelector('.slider-wrapper');
          const dots = document.querySelector('.slider-dots');
          
          if (activos.length > 0) {
              wrapper.innerHTML = activos.map((b, i) => `
                  <div class="slide ${i === 0 ? 'active' : ''}" style="width: 100%; height: 100%; padding: 0;">
                      
                      ${b.enlace !== '#' ? `<a href="${b.enlace}" style="display:block; width:100%; height:100%;">` : ''}
                      
                      <img src="assets/img_banners/${b.ruta_imagen}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" alt="${b.titulo}" onerror="this.src='https://via.placeholder.com/1920x600?text=Sin+Imagen'">
                      
                      ${b.enlace !== '#' ? `</a>` : ''}
                      
                  </div>
              `).join('');
              
              dots.innerHTML = activos.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="setHeroSlide(${i})"></span>`).join('');
          }
      }
  } catch (e) {
      console.error("Error cargando banners:", e);
  }
}

// ================= RENDERIZADO DE PRODUCTOS =================
function crearTarjetaProducto(prod) {
  const imgContent = prod.img
    ? `<img class="product-card__img" src="assets/img_productos/${prod.img}" alt="${prod.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='${prod.emoji}'">`
    : `<div style="font-size: 60px;">${prod.emoji}</div>`;

  const badge = prod.badge 
    ? `<div class="product-card__badge product-card__badge--${prod.badge}">${prod.badgeText}</div>` 
    : '';

  let precioHtml = '';
  if (prod.precioAntes) {
    precioHtml = `
      <div class="product-card__price-wrapper" style="display:flex; flex-direction:column; align-items:flex-start;">
        <span class="product-card__price" style="font-size: 18px; color: var(--dark);">S/ ${prod.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })} <span style="font-size:12px; color:var(--red); font-weight:bold; margin-left:5px;">Oferta</span></span>
        <span class="product-card__price--old" style="text-decoration: line-through; color: #94a3b8; font-size: 13px;">S/ ${prod.precioAntes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>
    `;
  } else {
    precioHtml = `
      <div class="product-card__price-wrapper">
        <span class="product-card__price">S/ ${prod.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>
    `;
  }

  // ¡AQUÍ ESTÁ LA CORRECCIÓN! 
  // Devolvemos un String (texto) de HTML puro para que tu .map().join('') funcione perfecto.
  return `
    <article class="product-card" data-id="${prod.id}" onclick="window.location.href='producto.php?id=${prod.id}'">
      ${badge}
      
      <div class="product-card__img-container">
        ${imgContent}
      </div>
      
      <div class="product-card__content">
        <span class="product-card__brand">${prod.marca}</span>
        <h3 class="product-card__title">${prod.nombre}</h3>
        ${precioHtml}
        
        <button class="product-card__btn" onclick="event.stopPropagation(); agregarAlCarrito('${prod.id}')">
          🛒 Agregar al carrito
        </button>
      </div>
      
    </article>`;
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
    
    nav.innerHTML = SECCIONES_DINAMICAS.map(sec => `
        <a href="#${sec.id}" class="cat-link">
            <span class="cat-ico" aria-hidden="true">${sec.icono}</span> ${sec.titulo}
        </a>
    `).join('');
}

function renderSecciones() {
  const container = document.getElementById('sections-container');
  if (!container) return;

  container.innerHTML = SECCIONES_DINAMICAS.map(sec => {
    const productosDeCategoria = PRODUCTOS.filter(p => p.categoria_real === sec.titulo);
    if (productosDeCategoria.length === 0) return '';

    const productosLimitados = productosDeCategoria.slice(0, 4);
    const tarjetas = productosLimitados.map(crearTarjetaProducto).join('');
    
    const tarjetaVerMas = `
      <a href="catalogo.php?categoria=${sec.titulo}" class="tarjeta-ver-mas">
        <div class="contenido-ver-mas">
            <span>Ver todo en<br>${sec.titulo}</span>
        </div>
      </a>
    `;

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
          ${tarjetaVerMas}
        </div>
      </section>`;
  }).join('');
}

// ================= INTERFAZ Y EVENTOS =================
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

// ================= CONEXIÓN CON PHP Y MYSQL (INICIALIZACIÓN) =================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. CARGAMOS LOS BANNERS PRIMERO
    await cargarBannersPublicos();
    
    // 2. LUEGO CARGAMOS LOS PRODUCTOS
    try {
        const response = await fetch('includes/api/listar_productos.php');
        const result = await response.json();

        if(result.status === 'success') {
            PRODUCTOS = result.data.map(p => {
                const precioReg = parseFloat(p.precio_regular);
                const precioOfe = parseFloat(p.precio_oferta);
                const tieneOferta = precioOfe > 0 && precioOfe < precioReg;

                return {
                    id: p.id_producto,
                    nombre: p.nombre,
                    marca: p.marca || 'Genérico',
                    categoria_real: p.categoria,
                    precio: tieneOferta ? precioOfe : precioReg,
                    precioAntes: tieneOferta ? precioReg : null,
                    img: p.img_principal || null,
                    emoji: '📦',
                    badge: tieneOferta ? 'sale' : '',
                    badgeText: tieneOferta ? 'Oferta' : '',
                    enOferta: tieneOferta
                };
            });

            const categoriasUnicas = [...new Set(PRODUCTOS.map(p => p.categoria_real))];
            const iconMap = { 'Lavadoras': '🫧', 'Smart TVs': '🖥️', 'Baño': '🚿', 'Cocina': '🍳', 'Refrigeradoras': '❄️', 'Audio': '🔊', 'Aspiradoras': '🌀', 'Planchas': '👔' };

            SECCIONES_DINAMICAS = categoriasUnicas.map(catNombre => ({
                id: catNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
                titulo: catNombre,
                icono: iconMap[catNombre] || '✨',
                subtitulo: `Explora nuestro catálogo de ${catNombre}`
            }));

            renderMenuCategorias(); 
            renderSecciones();      
            initHeroSlider();        // <- ¡Inicia el carrusel después de inyectar el HTML de banners!
            renderCarruselOfertas(); 
            initCarouselButtons();   
            initScrollSpy();  
        } else {
            console.error("Error del servidor PHP:", result.msg);
        }
    } catch (error) {
        console.error("Error conectando a la base de datos:", error);
    } finally {
        // ✨ OPTIMIZACIÓN: Ocultar el preloader SOLO DESPUÉS de que el DOM esté poblado
        const loader = document.getElementById('global-loader');
        if(loader) {
            // Un micro-retraso visual para que la pintura del navegador (paint) finalice
            setTimeout(() => {
                loader.classList.add('hide');
                setTimeout(() => loader.style.display = 'none', 400); // Limpieza
            }, 150);
        }
    }
});