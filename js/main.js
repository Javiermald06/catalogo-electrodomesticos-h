/* ============================================================
   main.js — Lógica principal del catálogo ElectroHogar Tacna
   ============================================================ */

const SECCIONES = [
  { id: 'lavadoras', titulo: 'Lavadoras', icono: '🫧', subtitulo: 'Carga frontal, carga superior y secadoras' },
  { id: 'tvs', titulo: 'Smart TVs', icono: '🖥️', subtitulo: '4K, OLED, QLED y más tecnologías de pantalla' },
  { id: 'bano', titulo: 'Baño', icono: '🚿', subtitulo: 'Calentadores, duchas y accesorios para el baño' },
  { id: 'cocina', titulo: 'Cocina', icono: '🍳', subtitulo: 'Cocinas, hornos, microondas y pequeños electrodomésticos' },
  { id: 'refrigeradoras', titulo: 'Refrigeradoras', icono: '❄️', subtitulo: 'No Frost, Side by Side y Mini refrigeradoras' },
  { id: 'audio', titulo: 'Audio y Sonido', icono: '🔊', subtitulo: 'Soundbars, parlantes, audífonos y sistemas de sonido' },
  { id: 'aspiradoras', titulo: 'Aspiradoras', icono: '🌀', subtitulo: 'Robot aspiradoras, verticales y de arrastre' },
  { id: 'plancha', titulo: 'Planchas', icono: '👔', subtitulo: 'Planchas a vapor, verticales y centros de planchado' },
];

let heroIndex = 0;
let heroInterval;

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


function crearTarjetaProducto(prod) {
  // BEM: Definimos clases para la imagen
  const imgContent = prod.img
    ? `<img class="product-card__img" src="assets/img/${prod.img}" alt="${prod.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='${prod.emoji}'">`
    : prod.emoji;

  // BEM: El badge es un Elemento y el tipo ('new'/'sale') es un Modificador
  const badge = prod.badge 
    ? `<div class="product-card__badge product-card__badge--${prod.badge}">${prod.badgeText}</div>` 
    : '';

  // ✨ MODIFICACIÓN: Lógica para precio normal vs precio en oferta
  let precioHtml = '';
  if (prod.precioAntes) {
    precioHtml = `
      <div class="product-card__price-wrapper" style="display:flex; flex-direction:column; align-items:flex-start;">
        <span class="product-card__price" style="font-size: 18px; color: var(--dark);">S/ ${prod.precio.toLocaleString()} <span style="font-size:12px; color:var(--red); font-weight:bold; margin-left:5px;">Oferta</span></span>
        <span class="product-card__price--old" style="text-decoration: line-through; color: #94a3b8; font-size: 13px;">S/ ${prod.precioAntes.toLocaleString()}</span>
      </div>
    `;
  } else {
    precioHtml = `
      <div class="product-card__price-wrapper">
        <span class="product-card__price">S/ ${prod.precio.toLocaleString()}</span>
      </div>
    `;
  }

  return `
    <article class="product-card" data-id="${prod.id}" onclick="mostrarDetalle('${prod.id}')">
      ${badge}
      <div class="product-card__image-container">${imgContent}</div>
      <div class="product-card__info">
        <span class="product-card__brand">${prod.marca}</span>
        <h3 class="product-card__title">${prod.nombre}</h3>
        ${precioHtml}
        <button class="product-card__btn" onclick="event.stopPropagation(); agregarAlCarrito('${prod.id}', false)">
          🛒 Agregar al carrito
        </button>
      </div>
    </article>`;
}


function renderCarruselOfertas() {
  const container = document.getElementById('ofertas-car');
  if (!container) return;
  const ofertas = getOfertas();
  container.innerHTML = ofertas.map(crearTarjetaProducto).join('');
}

function renderSecciones() {
  const container = document.getElementById('sections-container');
  if (!container) return;

  container.innerHTML = SECCIONES.map(sec => {
    const productos = getByCategoria(sec.id);
    if (!productos.length) return '';
    
    // 1. Dibujamos las tarjetas reales que vienen de tu base de datos
    const tarjetas = productos.map(crearTarjetaProducto).join('');
    
    // 2. ✨ MODIFICACIÓN: Creamos la tarjeta visual de "Ver más"
    // Le puse el nombre de la categoría dinámica (ej. "Ver todo en Smart TVs")
    const tarjetaVerMas = `
      <a href="catalogo.html" class="tarjeta-ver-mas">
        <div class="contenido-ver-mas">
          <span style="font-size: 36px; margin-bottom: 8px;">➔</span>
          <span>Ver todo en<br>${sec.titulo}</span>
        </div>
      </a>
    `;

    // 3. Juntamos los productos + la tarjeta extra dentro del grid
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

function consultarPrecio(productoId) {
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!prod) return;
  const mensaje = encodeURIComponent(`Hola, me interesa el producto: *${prod.nombre}* (${prod.marca}) — S/ ${prod.precio.toLocaleString()}. ¿Está disponible?`);
  const whatsapp = `https://wa.me/51989919237?text=${mensaje}`; 
  window.open(whatsapp, '_blank');
}

/* ──────────────────────────────────────────────────────────
   SPA: MOSTRAR Y CERRAR DETALLE DE PRODUCTO
   ────────────────────────────────────────────────────────── */
function mostrarDetalle(productoId) {
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!prod) return;

  // Ocultamos todo
  document.getElementById('main-slider').style.display = 'none';
  document.getElementById('categorias').style.display = 'none';
  document.getElementById('ofertas').style.display = 'none';
  document.getElementById('promo-container').style.display = 'none';
  document.getElementById('sections-container').style.display = 'none';
  document.getElementById('resultados-busqueda').style.display = 'none'; 

  const imgContent = prod.img ? `<img src="assets/img/${prod.img}" alt="${prod.nombre}">` : `<div style="font-size: 100px;">${prod.emoji}</div>`;
  const precioAntes = prod.precioAntes ? `<span class="detail-old-price" style="text-decoration: line-through; color: #94a3b8; font-size: 16px;">Antes: S/ ${prod.precioAntes.toLocaleString()}</span>` : '';
  const badge = prod.badge ? `<div class="product-badge ${prod.badge}" style="position: relative; top: 0; left: 0; display:inline-block; margin-left:10px;">${prod.badgeText}</div>` : '';
  
  // ✨ MODIFICACIÓN: Generar la tabla de especificaciones
  let tablaEspecificaciones = '';
  if (prod.especificaciones && typeof prod.especificaciones === 'object' && !Array.isArray(prod.especificaciones)) {
    tablaEspecificaciones = '<table class="tabla-specs" style="width: 100%; border-collapse: collapse; margin-top: 20px;"><tbody>';
    for (const [clave, valor] of Object.entries(prod.especificaciones)) {
      tablaEspecificaciones += `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid var(--border); font-weight: 600; color: var(--dark); width: 40%; background: #f8fafc;">${clave}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid var(--border); color: var(--text);">${valor}</td>
        </tr>
      `;
    }
    tablaEspecificaciones += '</tbody></table>';
  } else if (Array.isArray(prod.especificaciones)) {
    // Por si acaso quedó algún array viejo
    tablaEspecificaciones = '<ul class="detail-features">' + prod.especificaciones.map(detalle => `<li>${detalle}</li>`).join('') + '</ul>';
  } else {
    tablaEspecificaciones = `<p>📌 <strong>Marca:</strong> ${prod.marca}</p>`;
  }

  const detalleHtml = `
    <div class="product-detail-container">
      <div class="detail-back-bar" onclick="cerrarDetalle()">❮ Volver al catálogo principal</div>
      <div class="detail-content-wrapper">
        <div class="product-gallery">${imgContent}</div>
        <div class="product-info-detail">
          <span class="detail-category">${prod.categoria} / ${prod.marca}</span>
          <h1 class="detail-title">${prod.nombre}</h1>
          
          <div class="detail-price-box">
            ${precioAntes}
            <h2 class="detail-current-price">S/ ${prod.precio.toLocaleString()} ${badge}</h2>
          </div>

          <div class="quantity-selector">
            <span style="font-size: 14px; font-weight: 600; color: var(--text);">Cantidad:</span>
            <button class="qty-btn" onclick="cambiarCantidad(-1)">-</button>
            <input type="number" id="prod-cantidad" class="qty-input" value="1" min="1" readonly>
            <button class="qty-btn" onclick="cambiarCantidad(1)">+</button>
          </div>

          <div class="especificaciones-container">
             <h3 style="margin-top: 20px; color: var(--blue);">Especificaciones Técnicas</h3>
             ${tablaEspecificaciones}
          </div>
          
          <div class="detail-action-btns" style="margin-top: 20px;">
            <button onclick="agregarAlCarrito('${prod.id}', true)" class="btn-primary" style="width: 100%;">
              🛒 Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const vistaDetalle = document.getElementById('vista-detalle');
  if (vistaDetalle) {
    vistaDetalle.innerHTML = detalleHtml;
    vistaDetalle.style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function cerrarDetalle() {
  document.getElementById('vista-detalle').style.display = 'none';

  const buscador = document.getElementById('buscador');
  // Si hay algo escrito en el buscador, regresamos a la pantalla de resultados
  if (buscador && buscador.value.trim() !== '') {
    document.getElementById('resultados-busqueda').style.display = 'block';
  } else {
    // Si no, regresamos al catálogo principal
    document.getElementById('main-slider').style.display = 'block';
    document.getElementById('categorias').style.display = 'flex';
    document.getElementById('ofertas').style.display = 'block';
    document.getElementById('promo-container').style.display = 'block';
    document.getElementById('sections-container').style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();        
  renderCarruselOfertas(); 
  renderSecciones();       
  initCarouselButtons();   
  initScrollSpy();         
});

/* ──────────────────────────────────────────────────────────
   11. SPA: BUSCADOR EN TIEMPO REAL
   ────────────────────────────────────────────────────────── */
function buscarProducto(termino) {
  const texto = termino.toLowerCase().trim();
  const vistaResultados = document.getElementById('resultados-busqueda');
  
  if (texto === '') {
    // Si borran el texto, cerramos la búsqueda y volveamos al catálogo
    vistaResultados.style.display = 'none';
    document.getElementById('main-slider').style.display = 'block';
    document.getElementById('categorias').style.display = 'flex';
    document.getElementById('ofertas').style.display = 'block';
    document.getElementById('promo-container').style.display = 'block';
    document.getElementById('sections-container').style.display = 'block';
    return;
  }

  // Ocultamos el catálogo principal
  document.getElementById('main-slider').style.display = 'none';
  document.getElementById('categorias').style.display = 'none';
  document.getElementById('ofertas').style.display = 'none';
  document.getElementById('promo-container').style.display = 'none';
  document.getElementById('sections-container').style.display = 'none';
  document.getElementById('vista-detalle').style.display = 'none'; // Por si había un producto abierto

  // Filtramos la base de datos
  const resultados = PRODUCTOS.filter(p => 
    p.nombre.toLowerCase().includes(texto) || 
    p.marca.toLowerCase().includes(texto) ||
    p.categoria.toLowerCase().includes(texto)
  );

  // Dibujamos los resultados
  let html = `<h2 class="resultados-header">Resultados para: <span>"${termino}"</span></h2>`;
  
  if (resultados.length > 0) {
    html += `<div class="products-grid">` + resultados.map(crearTarjetaProducto).join('') + `</div>`;
  } else {
    html += `<p style="text-align:center; margin-top: 50px; font-size: 18px;">No se encontraron productos para esta búsqueda 😢</p>`;
  }

  vistaResultados.innerHTML = html;
  vistaResultados.style.display = 'block';
}

/* ──────────────────────────────────────────────────────────
   LÓGICA DE CANTIDAD Y CARRITO
   ────────────────────────────────────────────────────────── */
function cambiarCantidad(cambio) {
  const input = document.getElementById('prod-cantidad');
  if(!input) return;
  let actual = parseInt(input.value);
  let nuevo = actual + cambio;
  
  // Evitamos que bajen de 1 producto
  if(nuevo >= 1) {
    input.value = nuevo;
  }
}

// Memoria del carrito de compras
let carrito = [];

function comprarProductoDetalle(productoId) {
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!prod) return;
  
  const input = document.getElementById('prod-cantidad');
  const cantidad = input ? parseInt(input.value) : 1;
  const precioTotal = (prod.precio * cantidad).toLocaleString();
  
  const mensaje = encodeURIComponent(`Hola, me interesa comprar:\n*${cantidad}x ${prod.nombre}* (${prod.marca})\n💰 *Total Aprox: S/ ${precioTotal}*\n\n¿Tienen stock disponible?`);
  
  const whatsappUrl = `https://wa.me/51989919237?text=${mensaje}`;
  window.open(whatsappUrl, '_blank');
}


function agregarAlCarrito(productoId, desdeDetalle = false) {
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!prod) return;

  // Si estamos en la ventana de detalle, leemos el input. Si es desde el catálogo, suma 1.
  let cantidadAAgregar = 1;
  if (desdeDetalle) {
    const input = document.getElementById('prod-cantidad');
    cantidadAAgregar = input ? parseInt(input.value) : 1;
  }

  // Buscamos si el producto ya está en el carrito para no duplicarlo, solo sumar la cantidad
  const itemExistente = carrito.find(item => item.id === productoId);
  if (itemExistente) {
    itemExistente.cantidad += cantidadAAgregar;
  } else {
    carrito.push({ ...prod, cantidad: cantidadAAgregar });
  }

  actualizarContadorCarrito();
  
  alert(`¡Agregaste ${cantidadAAgregar}x ${prod.nombre} al carrito! 🛒`);
}

function actualizarContadorCarrito() {
  const counter = document.querySelector('.cart-counter');
  if (!counter) return;
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  counter.innerText = totalItems;
}

function abrirCarrito() {
  renderizarCarrito();
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-sidebar').classList.add('open');
}

function cerrarCarrito() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-sidebar').classList.remove('open');
}

function renderizarCarrito() {
  const container = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('cart-total-price');
  
  if (carrito.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#94a3b8; margin-top:40px; font-size: 16px;">Tu carrito está vacío 🛒<br>¡Agrega algo increíble!</div>';
    totalPriceEl.innerText = 'S/ 0';
    return;
  }

  let html = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const imgContent = item.img ? `<img class="product-card__img" src="assets/img/${item.img}" alt="${item.nombre}">` : item.emoji;

    html += `
      <div class="cart-item">
        <div class="cart-item-img">${imgContent}</div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.nombre}</div>
          <div class="cart-item-price">S/ ${item.precio.toLocaleString()}</div>
          
          <div class="cart-item-qty-controls">
            <button class="cart-qty-btn" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
            <span class="cart-qty-number">${item.cantidad}</span>
            <button class="cart-qty-btn" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
          </div>

          <button class="cart-item-remove" onclick="eliminarDelCarrito(${index})">Eliminar</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  totalPriceEl.innerText = `S/ ${total.toLocaleString()}`;
}

function cambiarCantidadCarrito(index, cambio) {
  if (carrito[index]) {
    let nuevaCantidad = carrito[index].cantidad + cambio;
    if (nuevaCantidad >= 1) {
      carrito[index].cantidad = nuevaCantidad;
    } else {
      carrito.splice(index, 1);
    }
    actualizarContadorCarrito();
    renderizarCarrito();
  }
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarContadorCarrito();
  renderizarCarrito();
}

function enviarPedidoCarrito() {
  if (carrito.length === 0) return;

  let total = 0;
  let mensaje = "Hola ElectroHogar, me gustaría realizar el siguiente pedido:\n\n";

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    mensaje += `🔹 ${item.cantidad}x *${item.nombre}* (S/ ${subtotal.toLocaleString()})\n`;
  });

  mensaje += `\n💰 *Total Estimado: S/ ${total.toLocaleString()}*\n\n¿Podrían confirmarme el stock y los métodos de pago para Tacna?`;

  const whatsappUrl = `https://wa.me/51989919237?text=${encodeURIComponent(mensaje)}`;
  window.open(whatsappUrl, '_blank');
}

/* ──────────────────────────────────────────────────────────
   Lógica del Buscador Predictivo (Solo texto)
   ────────────────────────────────────────────────────────── */
function mostrarSugerencias(texto) {
  const caja = document.getElementById('caja-sugerencias');
  // Evitar error si la caja no existe en el HTML aún
  if (!caja) return; 

  const termino = texto.toLowerCase().trim();

  if (termino.length === 0) {
    caja.classList.remove('active');
    // Si borran la búsqueda, regresamos a la vista principal
    document.getElementById('resultados-busqueda').style.display = 'none';
    document.getElementById('main-slider').style.display = 'block';
    document.getElementById('categorias').style.display = 'flex';
    document.getElementById('ofertas').style.display = 'block';
    document.getElementById('promo-container').style.display = 'block';
    document.getElementById('sections-container').style.display = 'block';
    return;
  }

  const coincidencias = PRODUCTOS.filter(p => 
    p.nombre.toLowerCase().includes(termino) || 
    p.marca.toLowerCase().includes(termino)
  );

  if (coincidencias.length > 0) {
    let html = '';
    const maxSugerencias = coincidencias.slice(0, 6);
    
    maxSugerencias.forEach(prod => {
      // Pasamos el ID del producto en lugar del nombre para evitar problemas con comillas
      html += `<div class="sugerencia-item" onclick="seleccionarSugerencia('${prod.id}')">🔍 ${prod.nombre}</div>`;
    });
    
    caja.innerHTML = html;
    caja.classList.add('active');
  } else {
    caja.innerHTML = `<div class="sugerencia-item" style="color: #94a3b8; cursor: default;">No se encontraron resultados para "${texto}"</div>`;
    caja.classList.add('active');
  }
}

function seleccionarSugerencia(productoId) {
  const input = document.getElementById('buscador-principal');
  const caja = document.getElementById('caja-sugerencias');
  
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if(!prod) return;

  // 1. Ponemos el nombre en el input
  input.value = prod.nombre;
  
  // 2. Escondemos la caja de sugerencias
  caja.classList.remove('active');
  
  // 3. Ocultamos el catálogo principal
  document.getElementById('main-slider').style.display = 'none';
  document.getElementById('categorias').style.display = 'none';
  document.getElementById('ofertas').style.display = 'none';
  document.getElementById('promo-container').style.display = 'none';
  document.getElementById('sections-container').style.display = 'none';
  
  // 4. Mostramos el resultado en la vista de resultados usando crearTarjetaProducto
  const vistaResultados = document.getElementById('resultados-busqueda');
  let html = `<h2 class="resultados-header">Resultados para: <span>"${prod.nombre}"</span></h2>`;
  html += `<div class="products-grid">` + crearTarjetaProducto(prod) + `</div>`;
  
  vistaResultados.innerHTML = html;
  vistaResultados.style.display = 'block';
}

document.addEventListener('click', function(event) {
  const caja = document.getElementById('caja-sugerencias');
  const input = document.getElementById('buscador-principal'); // Asegúrate que el ID del input sea este
  if (caja && input && event.target !== input && event.target !== caja) {
    caja.classList.remove('active');
  }
});