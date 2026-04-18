/* ============================================================
   main.js — Lógica principal del catálogo ElectroHogar Tacna
   (Conectado a la API PHP y MySQL)
   ============================================================ */

// Variables globales (compartidas con buscador.js)
window.PRODUCTOS = window.PRODUCTOS || [];
window.SECCIONES_DINAMICAS = window.SECCIONES_DINAMICAS || [];
let homeRendered = false;
let heroIndex = 0;
let heroInterval;

// ================= HERO SLIDER (CON SOPORTE TÁCTIL) =================
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const wrapper = document.querySelector('.slider-wrapper');
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

  // Detección táctil y Mouse (Swipe / Drag)
  let touchStartX = 0;
  let touchEndX = 0;
  let isDraggingHero = false;

  if(wrapper) {
      // Touch
      wrapper.addEventListener('touchstart', e => {
          touchStartX = e.changedTouches[0].screenX;
      }, {passive:true});
      wrapper.addEventListener('touchend', e => {
          touchEndX = e.changedTouches[0].screenX;
          if (touchEndX < touchStartX - 40) moveHeroSlide(1);
          if (touchEndX > touchStartX + 40) moveHeroSlide(-1);
      }, {passive:true});

      // Mouse
      wrapper.style.cursor = 'grab';
      
      wrapper.addEventListener('dragstart', e => e.preventDefault());

      wrapper.addEventListener('mousedown', e => {
          isDraggingHero = true;
          wrapper.style.cursor = 'grabbing';
          touchStartX = e.clientX;
          document.body.style.userSelect = 'none';
      });

      window.addEventListener('mouseup', e => {
          if (!isDraggingHero) return;
          isDraggingHero = false;
          wrapper.style.cursor = 'grab';
          document.body.style.userSelect = '';
          touchEndX = e.clientX;
          
          if (touchEndX < touchStartX - 40) moveHeroSlide(1);
          if (touchEndX > touchStartX + 40) moveHeroSlide(-1);
      });

      // Bloquear click en enlaces (banners) si el usuario hizo swipe
      wrapper.addEventListener('click', e => {
          if (Math.abs(touchEndX - touchStartX) > 40) {
              e.preventDefault();
              e.stopPropagation();
          }
      }, true);
  }
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
    ? `<img class="product-card__img" src="assets/img_productos/${prod.img}" alt="${prod.nombre}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML=generarPlaceholderSVG('${prod.marca}')">`
    : generarPlaceholderSVG(prod.marca);

  const badge = prod.badge 
    ? `<div class="product-card__badge product-card__badge--${prod.badge}">${prod.badgeText}</div>` 
    : '';

  let precioHtml = '';
  if (prod.precioAntes) {
    precioHtml = `
      <div class="product-card__price-wrapper" style="display:flex; flex-direction:column; align-items:flex-start;">
        <span class="product-card__price" style="font-size: 18px; color: var(--red);">S/ ${prod.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })} <span class="product-card__discount-tag">${prod.badgeText}</span></span>
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
    
    const container = document.getElementById('sections-container');
    if (!container) return;

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
    
    // Insert Before the actual sections
    container.insertAdjacentHTML('beforebegin', html);
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
      <a href="catalogo.php?categoria=${sec.titulo}" class="tarjeta-ver-mas product-card" style="display:flex; align-items:center; justify-content:center; text-decoration:none;">
        <div class="contenido-ver-mas" style="text-align:center; color:var(--clr-primary); font-weight:600; padding:20px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:10px;"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg><br>
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
        <!-- En móviles esto será un carrusel deslizable con clase recommended-swipe-mobile -->
        <div class="products-grid cat-products-wrapper recommended-swipe-mobile">
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
  const catNav = document.getElementById('categorias');

  let activeSections = new Set();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeSections.add(entry.target.id);
      } else {
        activeSections.delete(entry.target.id);
      }
    });

    if (activeSections.size > 0) {
      let closestSection = null;
      let minDistance = Infinity;

      // Encontrar la sección visible que está más arriba en la pantalla principal
      activeSections.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) {
          const rect = sec.getBoundingClientRect();
          if (Math.abs(rect.top) < minDistance) {
            closestSection = id;
            minDistance = Math.abs(rect.top);
          }
        }
      });
      
      if (!closestSection) closestSection = Array.from(activeSections)[0];

      // Actualizar DOM dinámicamente para asegurar que NINGÚN otro elemento tenga active
      document.querySelectorAll('.cat-link').forEach(link => {
        if (link.getAttribute('href') === '#' + closestSection) {
          if (!link.classList.contains('active')) {
            link.classList.add('active');
            link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        } else {
          link.classList.remove('active');
        }
      });
    } else {
      // Si no hay secciones en pantalla
      document.querySelectorAll('.cat-link').forEach(link => {
        link.classList.remove('active');
      });
    }
  }, { rootMargin: '-10% 0px -50% 0px', threshold: 0.1 });
  
  document.querySelectorAll('.cat-section').forEach(el => observer.observe(el));
}

function initHeaderScrollLogic() {
  const header = document.querySelector('.main-header');
  const catNav = document.getElementById('categorias');
  if (!header) return;

  let lastScrollY = window.scrollY;
  
  // En móviles, el scroll down esconde el header
  window.addEventListener('scroll', () => {
    const isMobile = window.innerWidth <= 768;
    const currentScrollY = window.scrollY;
    
    // Si bajamos, ocultamos el header. Si subimos, lo mostramos.
    if (isMobile && currentScrollY > 100) {
      if (currentScrollY > lastScrollY) {
        // Bajando
        header.classList.add('header-hidden');
        if(catNav) catNav.classList.add('header-hidden');
      } else {
        // Subiendo
        header.classList.remove('header-hidden');
        if(catNav) catNav.classList.remove('header-hidden');
      }
    } else {
      // Hasta arriba
      header.classList.remove('header-hidden');
      if(catNav) catNav.classList.remove('header-hidden');
    }
    
    lastScrollY = currentScrollY;
    
    // Mostrar u ocultar la barra categórica pegadiza.
    if (catNav) {
       // La mostramos solo si hemos pasado la sección de carrusel de ofertas/explorar categorías
       const firstSection = document.getElementById('sections-container');
       if (firstSection && currentScrollY >= (firstSection.offsetTop - 200)) {
           catNav.classList.add('cat-nav-visible');
       } else {
           catNav.classList.remove('cat-nav-visible');
       }
    }
  }, { passive: true });
}

// ================= DRAG TO SCROLL (DESKTOP) =================
function makeDragScrollable(selector) {
  const sliders = document.querySelectorAll(selector);
  sliders.forEach(slider => {
    let isDown = false;
    let startX;
    let startXGlobal;
    let scrollLeft;
    let isDragging = false;

    slider.style.cursor = 'grab';

    // Evitar nativo drag de imágenes que confunde al navegador y evita nuestro drag
    slider.addEventListener('dragstart', (e) => {
      // Solo permitimos drag en caso de que sea indispensable, sino se bloquea para favorecer el swipe
      e.preventDefault();
    });

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      isDragging = false;
      slider.style.cursor = 'grabbing';
      
      // Bloquear selección de texto para que no se sombree de azul
      document.body.style.userSelect = 'none';
      slider.style.userSelect = 'none';

      // Desactivar temporalmente el scroll-snap para que el arrastre sea fluido
      slider.style.scrollSnapType = 'none';
      startX = e.pageX - slider.offsetLeft;
      startXGlobal = startX; // Ancla para saber cuántos pixeles se movió en total
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      if (!isDown) return; // Only process if mouse was down
      isDown = false;
      slider.style.cursor = 'grab';
      slider.style.scrollSnapType = '';
      document.body.style.userSelect = '';
      slider.style.userSelect = '';
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
      slider.style.scrollSnapType = '';
      document.body.style.userSelect = '';
      slider.style.userSelect = '';
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      
      // Si se movió más de 5 pixeles desde el inicio, declaramos que está arrastrando (para bloquear clics)
      if (Math.abs(x - startXGlobal) > 5) isDragging = true; 
      
      const walk = (x - startX) * 1.5; // Multiplicador para mayor velocidad de arrastre
      let newScrollLeft = scrollLeft - walk;
      
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

      // Romper el "efecto resorte" o tensión invisible cuando se jala de más en los bordes
      if (newScrollLeft <= 0) {
        newScrollLeft = 0;
        startX = x;
        scrollLeft = 0;
      } else if (newScrollLeft >= maxScrollLeft) {
        newScrollLeft = maxScrollLeft;
        startX = x;
        scrollLeft = maxScrollLeft;
      }
      
      slider.scrollLeft = newScrollLeft;
    });

    // Usar fase de captura (true) para interceptar clics antes que lleguen a hijos (tarjetas, botones, links)
    slider.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
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

    // ✨ FAILSAFE: Quitar el loader si ya renderizamos
    const loader = document.getElementById('global-loader');
    if(loader) loader.classList.add('hide');
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

        const loader = document.getElementById('global-loader');
        if(loader) loader.classList.add('hide');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Los banners son independientes del buscador por ahora
    await cargarBannersPublicos();

    // Intentar inicializar si los datos ya llegaron antes que el script
    initHomeSiReady();

    // ✨ OPTIMIZACIÓN: Ocultar preloader (Failsafe final)
    const loader = document.getElementById('global-loader');
    if(loader) {
        setTimeout(() => {
            if (!loader.classList.contains('hide')) {
                loader.classList.add('hide');
                setTimeout(() => loader.style.display = 'none', 400); 
            }
        }, 2000); // 2 segundos máximo de espera
    }
});
