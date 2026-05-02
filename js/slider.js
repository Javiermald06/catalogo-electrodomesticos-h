/* ============================================================
   slider.js � Hero Slider con soporte t�ctil y drag
   ============================================================ */

let heroIndex = 0;
let heroInterval;
let heroSliderListenersAdded = false;

// ================= HERO SLIDER (CON SOPORTE TÁCTIL) =================
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const wrapper = document.querySelector('.slider-wrapper');

  if (slides.length === 0) return;

  // Definir funciones en window para que los controles (prev/next/dots) funcionen siempre con las slides actuales
  window.showHeroSlide = function (n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    heroIndex = (n + slides.length) % slides.length;
    if (slides[heroIndex]) slides[heroIndex].classList.add('active');
    if (dots[heroIndex]) dots[heroIndex].classList.add('active');
  };

  window.moveHeroSlide = function (n) {
    showHeroSlide(heroIndex + n);
    resetHeroInterval();
  };

  window.setHeroSlide = function (n) {
    showHeroSlide(n);
    resetHeroInterval();
  };

  function resetHeroInterval() {
    clearInterval(heroInterval);
    // Solo iniciar intervalo si hay más de una diapositiva
    if (slides.length > 1) {
      heroInterval = setInterval(() => moveHeroSlide(1), 5000);
    }
  }

  // Siempre reiniciar el intervalo al inicializar (para banners dinámicos)
  resetHeroInterval();

  // Si ya agregamos los listeners de swipe/drag al wrapper, no lo hacemos de nuevo
  if (heroSliderListenersAdded) return;

  // Detección táctil y Mouse (Swipe / Drag)
  let touchStartX = 0;
  let touchEndX = 0;
  let isDraggingHero = false;

  if (wrapper) {
    // Touch
    wrapper.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 40) moveHeroSlide(1);
      if (touchEndX > touchStartX + 40) moveHeroSlide(-1);
    }, { passive: true });

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

    heroSliderListenersAdded = true;
  }
}