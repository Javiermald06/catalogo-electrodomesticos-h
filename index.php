<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Catálogo de electrodomésticos en Tacna. Las mejores marcas en línea blanca, TVs y tecnología para el hogar.">
  <title>ElectroHogar Tacna — Catálogo</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
  </head>
<body>

  <?php include 'includes/header.php'; ?>

  <main>
    <section class="hero-slider" id="main-slider" aria-label="Destacados">
      <div class="slider-wrapper" id="banner-wrapper"></div>

      <button class="slider-control prev" aria-label="Anterior slide" onclick="moveHeroSlide(-1)">❮</button>
      <button class="slider-control next" aria-label="Siguiente slide" onclick="moveHeroSlide(1)">❯</button>

      <div class="slider-dots" id="banner-dots" aria-hidden="true"></div>
    </section>

    <nav class="cat-nav" id="categorias" aria-label="Categorías de productos">
      <a href="#lavadoras"    class="cat-link"><span class="cat-ico" aria-hidden="true">🫧</span> Lavadoras</a>
      <a href="#tvs"          class="cat-link"><span class="cat-ico" aria-hidden="true">🖥️</span> Smart TVs</a>
      <a href="#bano"         class="cat-link"><span class="cat-ico" aria-hidden="true">🚿</span> Baño</a>
      <a href="#cocina"       class="cat-link"><span class="cat-ico" aria-hidden="true">🍳</span> Cocina</a>
      <a href="#refrigeradoras" class="cat-link"><span class="cat-ico" aria-hidden="true">❄️</span> Refrigeradoras</a>
      <a href="#audio"        class="cat-link"><span class="cat-ico" aria-hidden="true">🔊</span> Audio</a>
      <a href="#aspiradoras"  class="cat-link"><span class="cat-ico" aria-hidden="true">🌀</span> Aspiradoras</a>
      <a href="#plancha"      class="cat-link"><span class="cat-ico" aria-hidden="true">👔</span> Planchas</a>
    </nav>

    <section class="carousel-section" id="ofertas" aria-labelledby="titulo-ofertas">
      <div class="section-header">
        <h2 id="titulo-ofertas" class="section-title"> Ofertas <span>del Día</span></h2>
        <a href="#" class="see-all">Ver todas →</a>
      </div>
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" data-target="ofertas-car" aria-label="Desplazar ofertas a la izquierda">‹</button>
        <div class="carousel" id="ofertas-car"></div>
        <button class="carousel-btn next" data-target="ofertas-car" aria-label="Desplazar ofertas a la derecha">›</button>
      </div>
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

    <section id="resultados-busqueda" style="display: none; padding: 40px; background: var(--gray); min-height: 50vh;" aria-live="polite"></section>

    <article id="vista-detalle" style="display: none;" aria-live="assertive"></article>
  </main>

  <?php include 'includes/footer.php'; ?>

  <script src="data/productos.js"></script>
  <script src="js/main.js"></script>
</body>
</html>