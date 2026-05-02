<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description"
    content="Catálogo de electrodomésticos en Tacna. Las mejores marcas en línea blanca, TVs y tecnología para el hogar.">
  <title>ElectroHogar Tacna — Catálogo</title>
  <link rel="icon" type="image/png" href="assets/img/logo_electrohogar.png">
  <!-- Preconnect: elimina latencia DNS/TLS de CDNs externos -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://unpkg.com">
  <link
    href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
</head>

<body>

  <?php include 'includes/header.php'; ?>

  <!-- GLOBAL PRELOADER (Aparece solo como bienvenida al sitio web) -->
  <div id="global-loader" class="global-loader">
    <div class="loader-pulse"></div>
    <div
      style="margin-top: 20px; font-family: 'Rajdhani', sans-serif; font-weight: 700; color: var(--clr-primary); font-size: 20px; letter-spacing: 2px;">
      ELECTROHOGAR</div>
  </div>

  <main>
    <section class="hero-slider" id="main-slider" aria-label="Destacados">
      <!-- El JS inyectará los .slide exactamente aquí -->
      <div class="slider-wrapper" id="banner-wrapper"></div>

      <!-- Controles estilo Glassmorphism -->
      <button class="slider-control prev" aria-label="Anterior slide" onclick="moveHeroSlide(-1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button class="slider-control next" aria-label="Siguiente slide" onclick="moveHeroSlide(1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div class="slider-dots" id="banner-dots" aria-hidden="true"></div>
    </section>
    <!---->
    <nav class="cat-nav" id="categorias" aria-label="Categorías de productos">
      <a href="#lavadoras" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg
            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z">
            </path>
            <polyline points="3.29 7 12 12 20.71 7"></polyline>
            <line x1="12" y1="22" x2="12" y2="12"></line>
          </svg></span> Lavadoras</a>
      <a href="#tvs" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg></span> Smart TVs</a>
      <a href="#bano" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v2"></path>
            <path d="M14 2v2"></path>
            <path d="M14 10v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9h10Z"></path>
            <path d="M4 10h12"></path>
          </svg></span> Baño</a>
      <a href="#cocina" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg
            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z">
            </path>
            <line x1="6" y1="17" x2="18" y2="17"></line>
          </svg></span> Cocina</a>
      <a href="#refrigeradoras" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg
            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z"></path>
            <path d="M5 10h14"></path>
            <path d="M8 19v-2"></path>
            <path d="M8 6v-1"></path>
          </svg></span> Refri</a>
      <a href="#audio" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg></span> Audio</a>
      <a href="#aspiradoras" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg
            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg></span> Aspiradoras</a>
      <a href="#plancha" class="cat-link"><span class="cat-ico" aria-hidden="true"><svg
            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5"></path>
            <path d="m5 12 7-7 7 7"></path>
          </svg></span> Planchas</a>
    </nav>

    <section class="carousel-section" id="ofertas" aria-labelledby="titulo-ofertas">
      <div class="section-header">
        <h2 id="titulo-ofertas" class="section-title"> Ofertas <span>del Día</span></h2>
        <a href="#" class="see-all">Ver todas →</a>
      </div>
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" data-target="ofertas-car"
          aria-label="Desplazar ofertas a la izquierda">‹</button>
        <div class="products-grid recommended-swipe-mobile" id="ofertas-car"></div>
        <button class="carousel-btn next" data-target="ofertas-car"
          aria-label="Desplazar ofertas a la derecha">›</button>
      </div>
      <button class="btn-ver-mas-mobile" onclick="window.location.href='catalogo.php'">Ver más Ofertas del Día</button>
    </section>

    <aside id="promo-container" style="padding: 30px 0;" aria-label="Promoción especial">
      <div class="promo-banner">
        <div class="promo-text">
          <span class="promo-tag">Oferta especial · Solo esta semana</span>
          <h3 class="promo-title">Hasta 30% OFF<br>en Toda la Tienda</h3>
          <p class="promo-sub">Envío gratis en compras mayores a S/ 500 en Tacna</p>
        </div>
        <button class="promo-cta">Aprovechar Oferta →</button>
      </div>
    </aside>

    <div id="sections-container"></div>

    <section id="resultados-busqueda" style="display: none; padding: 40px; background: var(--gray); min-height: 50vh;"
      aria-live="polite"></section>

    <article id="vista-detalle" style="display: none;" aria-live="assertive"></article>
  </main>

  <?php include 'includes/footer.php'; ?>

  <script src="js/components.js" defer></script>
  <script src="js/slider.js" defer></script>
  <script src="js/main.js" defer></script>
  <script src="js/ui-interactions.js" defer></script>
</body>

</html>