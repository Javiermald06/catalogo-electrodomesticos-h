/* ============================================================
   filtros.js — Motor Integral de Filtros Funcional
   ============================================================ */

let PRODUCTOS_CATALOGO = []; // Copia local para filtrar sin volver a la BD
let filtrosEstado = {
    marcas: [],
    especificaciones: {}, 
    minPrice: 0,
    maxPrice: Infinity
};

function inicializarFiltrosDinamicos(productos) {
    PRODUCTOS_CATALOGO = productos; // Guardamos la data original de la categoría

    // 1. GENERAR FILTRO DE MARCAS AUTOMÁTICO
    const marcas = [...new Set(productos.map(p => p.marca))];
    const listaMarcas = document.getElementById('lista-marcas');
    if (listaMarcas) {
        listaMarcas.innerHTML = marcas.map(m => `
            <label class="filter-option">
                <input type="checkbox" class="hidden-check brand-filter" value="${m}" onchange="actualizarEstadoFiltrosSpec()">
                <span class="custom-radio"></span>
                <span class="option-text">${m}</span>
            </label>
        `).join('');
    }

    // 2. CONFIGURAR BOTÓN APLICAR PRECIO (SOLUCIÓN)
    const btnPrecio = document.getElementById('btn-aplicar-precio');
    if (btnPrecio) {
        btnPrecio.onclick = (e) => {
            e.preventDefault();
            // Leemos los inputs Min/Max reales
            const minInput = document.getElementById('price-min');
            const maxInput = document.getElementById('price-max');
            filtrosEstado.minPrice = parseFloat(minInput.value) || 0;
            filtrosEstado.maxPrice = parseFloat(maxInput.value) || Infinity;
            aplicarFiltrosFinales();
        };
    }

    // 3. GENERAR FILTROS DE ESPECIFICACIONES (El código inteligente que ya teníamos)
    const contenedorFiltrosSpecs = document.getElementById('filtros-dinamicos-bd');
    if (!contenedorFiltrosSpecs) return;
    contenedorFiltrosSpecs.innerHTML = ''; 

    const mapaAtributos = {}; 
    productos.forEach(p => {
        if (p.especificaciones_agrupadas) {
            p.especificaciones_agrupadas.split('||').forEach(specStr => {
                const parts = specStr.split(':'); 
                if (parts.length < 2) return; 
                
                const nombreAtr = parts[0].trim();
                const valorAtr = parts[1].trim();

                if (!mapaAtributos[nombreAtr]) mapaAtributos[nombreAtr] = new Set();
                mapaAtributos[nombreAtr].add(valorAtr);
            });
        }
    });

    let htmlAtributos = '';
    Object.keys(mapaAtributos).forEach(nombreAtr => {
        const valoresUnicos = Array.from(mapaAtributos[nombreAtr]);
        if (valoresUnicos.length === 0) return;
        const idLimpio = nombreAtr.toLowerCase().replace(/\s+/g, '-');
        htmlAtributos += `
            <div class="filter-section border-top">
                <div class="filter-header" onclick="toggleAccordion('content-${idLimpio}', 'icon-${idLimpio}')">
                    <span class="filter-title">${nombreAtr}</span>
                    <i data-lucide="chevron-up" class="filter-icon" id="icon-${idLimpio}"></i>
                </div>
                <div class="filter-content" id="content-${idLimpio}">
                    ${valoresUnicos.map(valor => `
                        <label class="filter-option">
                            <input type="checkbox" class="hidden-check spec-filter" 
                                   data-atributo="${nombreAtr}" value="${valor}" 
                                   onchange="actualizarEstadoFiltrosSpec()">
                            <span class="custom-radio"></span>
                            <span class="option-text">${valor}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
    contenedorFiltrosSpecs.innerHTML = htmlAtributos;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Recopila el estado de marcas y specs marcadas
function actualizarEstadoFiltrosSpec() {
    // Marcas
    const checksMarcas = document.querySelectorAll('.brand-filter:checked');
    filtrosEstado.marcas = Array.from(checksMarcas).map(cb => cb.value);

    // Specs
    filtrosEstado.especificaciones = {};
    const checksSpecs = document.querySelectorAll('.spec-filter:checked');
    checksSpecs.forEach(cb => {
        const atr = cb.dataset.atributo;
        if (!filtrosEstado.especificaciones[atr]) filtrosEstado.especificaciones[atr] = [];
        filtrosEstado.especificaciones[atr].push(cb.value);
    });

    aplicarFiltrosFinales();
}

// Aplica la lógica matemática de filtrado
function aplicarFiltrosFinales() {
    let resultados = [...PRODUCTOS_CATALOGO]; 

    // A. Filtrar por Rango de Precio Funcional
    resultados = resultados.filter(p => p.precio >= filtrosEstado.minPrice && p.precio <= filtrosEstado.maxPrice);

    // B. Filtrar por Marcas
    if (filtrosEstado.marcas.length > 0) {
        resultados = resultados.filter(p => filtrosEstado.marcas.includes(p.marca));
    }

    // C. Filtrar por Specs (Lógica AND entre grupos)
    const nombresAtributosFiltro = Object.keys(filtrosEstado.especificaciones);
    if (nombresAtributosFiltro.length > 0) {
        resultados = resultados.filter(prod => {
            return nombresAtributosFiltro.every(nombreAtr => {
                const valoresSeleccionados = filtrosEstado.especificaciones[nombreAtr];
                return valoresSeleccionados.some(valorFiltro => 
                    prod.especificaciones_agrupadas && prod.especificaciones_agrupadas.includes(`${nombreAtr}:${valorFiltro}`)
                );
            });
        });
    }

    // D. Ordenamiento (Leer del select)
    const selectOrden = document.querySelector('.sort-select');
    const orden = selectOrden ? selectOrden.value : 'Relevancia';
    if (orden === 'Menor Precio') resultados.sort((a, b) => a.precio - b.precio);
    if (orden === 'Mayor Precio') resultados.sort((a, b) => b.precio - a.precio);

    // Redibujar el grid en catalogo.js
    if (typeof renderProductosGrid === 'function') renderProductosGrid(resultados);
}