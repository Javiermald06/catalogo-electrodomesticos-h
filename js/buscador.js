/* ============================================================
   buscador.js — Lógica de Búsqueda Global (ElectroHogar)
   ============================================================ */

var PRODUCTOS = [];
var SECCIONES_DINAMICAS = [];
var MARCAS_DINAMICAS = []; // Lista completa de marcas (incluye inactivas)
let selectedSuggestionIndex = -1;

// 1. CARGA DE DATOS GLOBAL (Para que las sugerencias funcionen en cualquier página)
async function inicializarDatosBuscador() {
    try {
        const response = await fetch('includes/api/listar_productos.php');
        const result = await response.json();

        if (result.status === 'success') {
            PRODUCTOS = result.data.map(p => {
                const precioReg = parseFloat(p.precio_regular);
                const precioOfe = parseFloat(p.precio_oferta);
                const tieneOferta = precioOfe > 0 && precioOfe < precioReg;
                const pctDescuento = tieneOferta ? Math.round((1 - precioOfe / precioReg) * 100) : 0;

                return {
                    id: p.id_producto,
                    nombre: p.nombre,
                    marca: p.marca || 'Genérico',
                    categoria_real: p.categoria,
                    precio: tieneOferta ? precioOfe : precioReg,
                    precioAntes: tieneOferta ? precioReg : null,
                    img: p.img_principal || null,
                    enOferta: tieneOferta,
                    descuento: pctDescuento
                };
            });

            // Generar categorías únicas para el buscador
            const categoriasUnicas = [...new Set(PRODUCTOS.map(p => p.categoria_real))];
            const iconMap = { 'Lavadoras': '🫧', 'Smart TVs': '🖥️', 'Baño': '🚿', 'Cocina': '🍳', 'Refrigeradoras': '❄️', 'Audio': '🔊', 'Aspiradoras': '🌀', 'Planchas': '👔' };

            SECCIONES_DINAMICAS = categoriasUnicas.map(catNombre => ({
                id: catNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
                titulo: catNombre,
                icono: iconMap[catNombre] || '✨'
            }));

            // Usar listas globales de la API si están disponibles (incluyen inacitvos)
            if (result.marcas_disponibles) {
                MARCAS_DINAMICAS = result.marcas_disponibles;
            } else {
                MARCAS_DINAMICAS = [...new Set(PRODUCTOS.map(p => p.marca))];
            }

            if (result.categorias_disponibles) {
                // Actualizar SECCIONES_DINAMICAS para incluir categorías sin productos activos
                const catsExtra = result.categorias_disponibles.filter(c => !categoriasUnicas.includes(c));
                catsExtra.forEach(catNombre => {
                    SECCIONES_DINAMICAS.push({
                        id: catNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
                        titulo: catNombre,
                        icono: iconMap[catNombre] || '✨'
                    });
                });
            }

            // Guardar para acceso inmediato (evitar race conditions)
            window.PRODUCTOS_STORAGE = PRODUCTOS;
            window.SECCIONES_STORAGE = SECCIONES_DINAMICAS;
            window.MARCAS_STORAGE = MARCAS_DINAMICAS;

            // Notificar a main.js si está presente que los datos están listos
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('datosBuscadorListos', { detail: { productos: PRODUCTOS, secciones: SECCIONES_DINAMICAS } }));
            }
        }
    } catch (e) {
        console.error("Error cargando datos del buscador:", e);
    }
}

// Inicializar al cargar el script
document.addEventListener('DOMContentLoaded', () => {
    inicializarDatosBuscador();
    initKeyEventsBuscador();
});

function initKeyEventsBuscador() {
    const input = document.getElementById('buscador-principal');
    const caja = document.getElementById('caja-sugerencias');
    if (!input || !caja) return;

    input.addEventListener('keydown', (e) => {
        const items = caja.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
            actualizarSeleccionTeclado(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
            actualizarSeleccionTeclado(items);
        } else if (e.key === 'Enter') {
            if (selectedSuggestionIndex > -1 && items[selectedSuggestionIndex]) {
                items[selectedSuggestionIndex].click();
            } else {
                ejecutarBusqueda(input.value);
            }
            caja.classList.remove('active');
        } else if (e.key === 'Escape') {
            caja.classList.remove('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !caja.contains(e.target)) {
            caja.classList.remove('active');
        }
    });
}

function actualizarSeleccionTeclado(items) {
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Algoritmo de Distancia de Levenshtein para búsqueda difusa
function calcularDistancia(a, b) {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) { tmp[i] = [i]; }
    for (let j = 0; j <= b.length; j++) { tmp[0][j] = j; }
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[a.length][b.length];
}

window.mostrarSugerencias = function(query) {
    const caja = document.getElementById('caja-sugerencias');
    if (!caja) return;

    if (!query || query.trim().length === 0) {
        caja.classList.remove('active');
        caja.innerHTML = '';
        return;
    }

    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    const cumpleFiltro = (texto) => {
        if (!texto) return false;
        const textoNorm = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const palabrasIgnorar = ['con', 'de', 'del', 'la', 'el', 'en', 'para', 'por', 'y', 'a'];

        if (textoNorm.startsWith(q)) return true;
        const palabrasTexto = textoNorm.split(/\s+/);
        const matchPalabra = palabrasTexto.some(palabra => {
            if (palabrasIgnorar.includes(palabra) && q.length < 3) return false;
            return palabra.startsWith(q);
        });
        if (matchPalabra) return true;

        if (q.length >= 3) {
            return palabrasTexto.some(palabra => {
                if (palabrasIgnorar.includes(palabra)) return false;
                const dist = calcularDistancia(q, palabra.substring(0, q.length));
                const maxError = q.length <= 5 ? 1 : 2;
                return dist <= maxError;
            });
        }
        return false;
    };

    const sugerenciasCat = SECCIONES_DINAMICAS.filter(s => cumpleFiltro(s.titulo)).slice(0, 4);
    const sugerenciasMarcas = MARCAS_DINAMICAS.filter(m => cumpleFiltro(m)).slice(0, 4);
    const sugerenciasProds = PRODUCTOS.filter(p => cumpleFiltro(p.nombre)).slice(0, 6);

    renderSugerencias(sugerenciasCat, sugerenciasMarcas, sugerenciasProds);
};

function renderSugerencias(cats, marcas, prods) {
    const caja = document.getElementById('caja-sugerencias');
    if (cats.length === 0 && marcas.length === 0 && prods.length === 0) {
        caja.innerHTML = `
            <div style="padding:40px 20px; text-align:center; color:#94a3b8; width: 100%;">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:10px; opacity:0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <div style="font-size:14px;">No encontramos resultados para tu búsqueda</div>
            </div>
        `;
        caja.classList.add('active');
        return;
    }

    let html = `
        <div class="suggestions-text-col">
            ${cats.length > 0 ? `
                <div class="suggestion-group">
                    <div class="suggestion-group-title">Categorías</div>
                    ${cats.map(c => `
                        <div class="suggestion-item" onclick="seleccionarSugerencia('${c.titulo}', 'categoria')">
                            <span class="suggestion-content"><span class="suggestion-text">${c.titulo}</span></span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${marcas.length > 0 ? `
                <div class="suggestion-group">
                    <div class="suggestion-group-title">Marcas</div>
                    ${marcas.map(m => `
                        <div class="suggestion-item" onclick="seleccionarSugerencia('${m}', 'marca')">
                            <span class="suggestion-content"><span class="suggestion-text">${m}</span></span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        <div class="suggestions-products-col">
            ${prods.length > 0 ? `
                <div class="suggestion-group">
                    <div class="suggestion-group-title">Productos</div>
                    ${prods.map(p => {
                        const imgPath = p.img ? `assets/img_productos/${p.img}` : 'assets/img/placeholder.png';
                        return `
                            <div class="suggestion-item suggestion-item--product" onclick="seleccionarSugerencia('${p.id}', 'producto')">
                                <img src="${imgPath}" class="suggestion-thumb" alt="${p.nombre}" onerror="this.src='assets/img/placeholder.png'">
                                <div class="suggestion-content">
                                    <span class="suggestion-brand">${p.marca}</span>
                                    <span class="suggestion-text">${p.nombre}</span>
                                </div>
                                <div class="suggestion-price-box">
                                    <span class="suggestion-price">S/ ${p.precio.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div style="flex:1; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:13px; padding:40px 20px; text-align:center;">
                    <div>Encuentra lo que buscas escribiendo...</div>
                </div>
            `}
        </div>
    `;

    caja.innerHTML = html;
    caja.classList.add('active');
    selectedSuggestionIndex = -1;
}

window.seleccionarSugerencia = function(valor, tipo) {
    if (tipo === 'producto') {
        window.location.href = `producto.php?id=${valor}`;
    } else if (tipo === 'categoria') {
        window.location.href = `catalogo.php?categoria=${encodeURIComponent(valor)}`;
    } else if (tipo === 'marca') {
        window.location.href = `catalogo.php?marca=${encodeURIComponent(valor)}`;
    } else {
        const input = document.getElementById('buscador-principal');
        if (input) input.value = valor;
        ejecutarBusqueda(valor);
    }
};

window.ejecutarBusqueda = function(query) {
    if (!query || query.trim() === '') return;
    const rawQuery = query.trim();
    const q = rawQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const catMatch = SECCIONES_DINAMICAS.find(cat => {
        const catNorm = cat.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return catNorm === q || catNorm.startsWith(q) && q.length > 3;
    });

    if (catMatch) {
        window.location.href = `catalogo.php?categoria=${encodeURIComponent(catMatch.titulo)}`;
        return;
    }

    const marcas = [...new Set(PRODUCTOS.map(p => (p.marca || "")))];
    const marcaMatch = marcas.find(m => {
        const mNorm = m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return mNorm === q || mNorm.startsWith(q) && q.length > 3;
    });

    if (marcaMatch) {
        window.location.href = `catalogo.php?marca=${encodeURIComponent(marcaMatch)}`;
        return;
    }

    window.location.href = `catalogo.php?buscar=${encodeURIComponent(rawQuery)}`;
};
