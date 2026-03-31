/* ============================================================
   main.js — Lógica principal del catálogo ElectroHogar Tacna
   (Conectado a la API PHP y MySQL)
   ============================================================ */

let SECCIONES_DINAMICAS = []; 
let heroIndex = 0;
let heroInterval;
let carrito = []; 

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

// ================= RENDERIZADO DE PRODUCTOS =================
function crearTarjetaProducto(prod) {
  const imgContent = prod.img
    ? `<img class="product-card__img" src="assets/img/${prod.img}" alt="${prod.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='${prod.emoji}'">`
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

  // AQUÍ ESTÁ LA CORRECCIÓN CRÍTICA: Redirige a producto.php
  return `
    <article class="product-card" data-id="${prod.id}" onclick="window.location.href='producto.php?id=${prod.id}'">
      ${badge}
      <div class="product-card__image-container">${imgContent}</div>
      <div class="product-card__info">
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


// ================= CARRITO DE COMPRAS =================
function agregarAlCarrito(productoId) {
  const prod = PRODUCTOS.find(p => p.id == productoId);
  if (!prod) return;

  const itemExistente = carrito.find(item => item.id == productoId);
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }

  actualizarContadorCarrito();
  alert(`¡Agregaste 1x ${prod.nombre} al carrito! 🛒`);
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
    totalPriceEl.innerText = 'S/ 0.00';
    return;
  }

  let html = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const imgContent = item.img ? `<img class="product-card__img" src="assets/img/${item.img}" alt="${item.nombre}">` : `<div style="font-size:30px;">${item.emoji}</div>`;

    html += `
      <div class="cart-item">
        <div class="cart-item-img">${imgContent}</div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.nombre}</div>
          <div class="cart-item-price">S/ ${item.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
          
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
  totalPriceEl.innerText = `S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
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
    mensaje += `🔹 ${item.cantidad}x *${item.nombre}* (S/ ${subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })})\n`;
  });

  mensaje += `\n💰 *Total Estimado: S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}*\n\n¿Podrían confirmarme el stock y los métodos de pago?`;

  const whatsappUrl = `https://wa.me/51989919237?text=${encodeURIComponent(mensaje)}`;
  window.open(whatsappUrl, '_blank');
}

// ================= BUSCADOR PREDICTIVO =================
function mostrarSugerencias(texto) {
  const caja = document.getElementById('caja-sugerencias');
  if (!caja) return; 

  const termino = texto.toLowerCase().trim();

  if (termino.length === 0) {
    caja.classList.remove('active');
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
      html += `<div class="sugerencia-item" onclick="seleccionarSugerencia('${prod.id}')">🔍 ${prod.nombre}</div>`;
    });
    caja.innerHTML = html;
    caja.classList.add('active');
  } else {
    caja.innerHTML = `<div class="sugerencia-item" style="color: #94a3b8; cursor: default;">No se encontraron resultados para "${texto}"</div>`;
    caja.classList.add('active');
  }
}

// Lógica mejorada: Te lleva a la página individual en vez de romper el Index
function seleccionarSugerencia(productoId) {
  window.location.href = `producto.php?id=${productoId}`;
}

document.addEventListener('click', function(event) {
  const caja = document.getElementById('caja-sugerencias');
  const input = document.getElementById('buscador-principal'); 
  if (caja && input && event.target !== input && event.target !== caja) {
    caja.classList.remove('active');
  }
});


// ================= CONEXIÓN CON PHP Y MYSQL (INICIALIZACIÓN) =================
document.addEventListener('DOMContentLoaded', async () => {
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
            initHeroSlider();        
            renderCarruselOfertas(); 
            initCarouselButtons();   
            initScrollSpy();  
        } else {
            console.error("Error del servidor PHP:", result.msg);
        }
    } catch (error) {
        console.error("Error conectando a la base de datos:", error);
    }
});