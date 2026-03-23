/* ============================================================
   catalogo.js — Lógica de la Tienda Pública
   ============================================================ */

const formatearMoneda = (monto) => `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

// ================= LÓGICA DE LOS ACORDEONES =================
function toggleAccordion(contentId, iconId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(180deg)';
    }
}

// ================= BASE DE DATOS SIMULADA =================
const marcasDB = [
    { nombre: 'Electrolux', cantidad: 19 },
    { nombre: 'LG', cantidad: 45 },
    { nombre: 'Samsung', cantidad: 60 },
    { nombre: 'Hyundai', cantidad: 8 },
    { nombre: 'Indurama', cantidad: 24 }
];

const productosCat = [
    { id: 1, marca: 'Electrolux', nombre: 'Lavadora Inverter Electrolux 18KG Blanca', regular: 1649.00, oferta: 1099.00, dcto: 33, img: 'https://electrohogar.com.pe/wp-content/uploads/2023/10/L18IX-min.png' },
    { id: 2, marca: 'LG', nombre: 'Lavadora LG 16KG TurboDrum WT16BVTB Negro...', regular: 2015.00, oferta: 1399.00, dcto: 31, img: 'https://www.lg.com/pe/images/lavadoras/md07519195/gallery/D-01.jpg' },
    { id: 3, marca: 'Hyundai', nombre: 'Lavadora Hyundai 10KG HYSA102K Gris/Blanco', regular: 799.00, oferta: 599.00, dcto: 25, img: 'https://imagedelivery.net/4fYuQyy-r8_ixFjtRoCYnw/4c81f3b0-bd56-4b8c-8515-564d7df6cf00/public' },
    { id: 4, marca: 'Samsung', nombre: 'Lavadora Samsung 19KG AI Wash EcoBubble...', regular: 1999.00, oferta: 1649.00, dcto: 18, img: 'https://images.samsung.com/is/image/samsung/p6pim/pe/wa19cg6745bveo/gallery/pe-top-load-washer-wa19cg6745bveo-wa19cg6745bveo-537443194?$650_519_PNG$' },
    { id: 5, marca: 'Samsung', nombre: 'Lavadora de Carga Superior EcoBubble 13KG', regular: 1399.00, oferta: 1149.00, dcto: 18, img: 'https://images.samsung.com/is/image/samsung/p6pim/pe/wa13cg5441bweo/gallery/pe-top-load-washer-wa13cg5441bweo-wa13cg5441bweo-536069906?$650_519_PNG$' }
];

// ================= RENDERIZADO =================
function renderFiltroMarcas() {
    const contenedor = document.getElementById('lista-marcas');
    contenedor.innerHTML = marcasDB.map(marca => `
        <label class="filter-option">
            <input type="checkbox" class="hidden-check">
            <span class="custom-radio"></span>
            <span class="option-text">${marca.nombre} <span class="count">(${marca.cantidad})</span></span>
        </label>
    `).join('');
}

function renderProductos() {
    const grid = document.getElementById('catalogo-grid');
    grid.innerHTML = productosCat.map(p => `
        <div class="product-card">
            <div class="discount-badge">-${p.dcto}%</div>
            <img src="${p.img}" alt="${p.nombre}" class="product-img" onerror="this.src='https://via.placeholder.com/200?text=Lavadora'">
            
            <p class="product-brand">${p.marca}</p>
            <h3 class="product-name">${p.nombre}</h3>
            
            <p class="product-seller">Por Electrohogar</p>
            <div class="price-offer">${formatearMoneda(p.oferta)} <span>oferta</span></div>
            <div class="price-regular">${formatearMoneda(p.regular)}</div>
            
            <div class="card-actions">
                <button class="btn-primary" onclick="alert('Redirigiendo a WhatsApp con el pedido del producto...')">Agregar al carrito</button>
                <button class="btn-fav" aria-label="Agregar a favoritos"><i data-lucide="heart" style="width: 20px;"></i></button>
            </div>
        </div>
    `).join('');
}

// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', () => {
    renderFiltroMarcas();
    renderProductos();
    // Renderiza los iconos de Lucide inyectados
    lucide.createIcons();
});