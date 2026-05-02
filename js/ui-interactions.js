/* ============================================================
   ui-interactions.js � Carruseles, ScrollSpy, Header, Drag-scroll
   ============================================================ */

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
  if (!catNav) return;

  // 1. INTERCEPTOR DE CLICS PARA SCROLL SUAVE (Evita saltos "en seco")
  document.querySelectorAll('.cat-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          
          // Desplazamiento suave a la sección
          const headerOffset = 130; // Altura del header + cat-nav
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Marcar como activo inmediatamente al hacer clic
          document.querySelectorAll('.cat-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });

  // 2. SCROLL SPY CON INTERSECTION OBSERVER (Actualiza mientras el usuario navega)
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

      // Encontrar la sección más cercana a la parte superior de la ventana
      activeSections.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) {
          const rect = sec.getBoundingClientRect();
          const dist = Math.abs(rect.top - 140);
          if (dist < minDistance) {
            closestSection = id;
            minDistance = dist;
          }
        }
      });

      if (closestSection) {
        document.querySelectorAll('.cat-link').forEach(link => {
          if (link.getAttribute('href') === '#' + closestSection) {
            if (!link.classList.contains('active')) {
              link.classList.add('active');
              // Auto-centrar la categoría en la barra horizontal de forma manual (evita saltos de ventana)
              const navWidth = catNav.offsetWidth;
              const linkOffset = link.offsetLeft;
              const linkWidth = link.offsetWidth;
              catNav.scrollTo({
                left: linkOffset - (navWidth / 2) + (linkWidth / 2),
                behavior: 'smooth'
              });
            }
          } else {
            link.classList.remove('active');
          }
        });
      }
    }
  }, { 
    rootMargin: '-150px 0px -40% 0px', // Ajustado para el área visible real
    threshold: [0, 0.1, 0.5] 
  });

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
        if (catNav) catNav.classList.add('header-hidden');
      } else {
        // Subiendo
        header.classList.remove('header-hidden');
        if (catNav) catNav.classList.remove('header-hidden');
      }
    } else {
      // Hasta arriba
      header.classList.remove('header-hidden');
      if (catNav) catNav.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;

    // Mostrar u ocultar la barra categórica pegadiza.
    if (catNav) {
      // La mostramos en cuanto la sección "Explora" comience a salir por arriba
      const exploraSec = document.querySelector('.circular-categories-section');
      const triggerPos = exploraSec ? (exploraSec.offsetTop - 60) : 500;
      
      if (currentScrollY >= triggerPos) {
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