/* ============================================================
   filtros.js — Motor Profesional (JSON + BD)
   ============================================================ */

let PRODUCTOS_CATALOGO = []; 
let filtrosEstado = { marcas: [], categorias: [], especificaciones: {}, minPrice: 0, maxPrice: Infinity };

// ===================================
// MOTOR DE UI (ACORDEONES PLAZA VEA)
// ===================================
window.toggleAccordion = function(contentId, iconId) {
    const content = document.getElementById(contentId);
    const iconContainer = document.getElementById(iconId);
    if (!content || !iconContainer) return;
    const header = iconContainer.closest('.filter-header');

    const isHidden = content.style.display === 'none' || content.classList.contains('hidden');

    if (isHidden) {
        content.style.display = 'block';
        content.classList.remove('hidden');
        if (header) header.classList.add('open');
        // Swap to minus icon
        iconContainer.outerHTML = `<i data-lucide="minus" class="filter-icon" id="${iconId}"></i>`;
    } else {
        content.style.display = 'none';
        content.classList.add('hidden');
        if (header) header.classList.remove('open');
        // Swap to plus icon
        iconContainer.outerHTML = `<i data-lucide="plus" class="filter-icon" id="${iconId}"></i>`;
    }
    lucide.createIcons();
};

function inicializarFiltrosDinamicos(productos, nombreCategoria, filtrosJson, extras = {}) {
    PRODUCTOS_CATALOGO = productos;

    // 1. FILTRO DE MARCAS AUTOMÁTICO
    const marcas = (extras.marcas && extras.marcas.length > 0) 
                   ? extras.marcas 
                   : [...new Set(productos.map(p => p.marca))];
    const listaMarcas = document.getElementById('lista-marcas');
    if (listaMarcas) {
        // Obtener marca activa de la URL (si existe)
        const urlParamsF = new URLSearchParams(window.location.search);
        const marcaURL = urlParamsF.get('marca');

        listaMarcas.innerHTML = marcas.map(m => `
            <label class="filter-option">
                <input type="checkbox" class="hidden-check brand-filter" value="${m}" 
                       ${(marcaURL && marcaURL.toLowerCase() === m.toLowerCase()) ? 'checked' : ''} 
                       onchange="actualizarEstadoFiltrosSpec()">
                <span class="custom-radio"></span>
                <span class="option-text">${m}</span>
            </label>
        `).join('');
        
        if (marcaURL) {
            filtrosEstado.marcas = [marcas.find(m => m.toLowerCase() === marcaURL.toLowerCase())].filter(Boolean);
        }
    }

    // 1.1 FILTRO DE CATEGORÍAS (Solo si no hay categoría activa)
    const seccionCat = document.getElementById('seccion-filtro-categoria');
    const listaCategorias = document.getElementById('lista-categorias');
    
    if (seccionCat && listaCategorias) {
        if (!nombreCategoria || nombreCategoria === '') {
            seccionCat.style.display = 'block';
            const categorias = (extras.categorias && extras.categorias.length > 0) 
                               ? extras.categorias 
                               : [...new Set(productos.map(p => p.categoria))];
            listaCategorias.innerHTML = categorias.map(cat => `
                <label class="filter-option">
                    <input type="checkbox" class="hidden-check category-filter" value="${cat}" 
                           onchange="actualizarEstadoFiltrosSpec()">
                    <span class="custom-radio"></span>
                    <span class="option-text">${cat}</span>
                </label>
            `).join('');
        } else {
            seccionCat.style.display = 'none';
        }
    }

    // 2. BOTÓN DE PRECIO
    const btnPrecio = document.getElementById('btn-aplicar-precio');
    if (btnPrecio) {
        btnPrecio.onclick = (e) => {
            e.preventDefault();
            filtrosEstado.minPrice = parseFloat(document.getElementById('price-min').value) || 0;
            filtrosEstado.maxPrice = parseFloat(document.getElementById('price-max').value) || Infinity;
            aplicarFiltrosFinales();
        };
    }

    // 3. RENDERIZAR FILTROS DINÁMICOS (Solo si HAY una categoría activa)
    const contenedor = document.getElementById('filtros-dinamicos-bd');
    if (!contenedor) return;

    if (!nombreCategoria || nombreCategoria === '') {
        contenedor.innerHTML = '';
        contenedor.style.display = 'none';
        return;
    }

    contenedor.style.display = 'block';
    if (filtrosJson && filtrosJson.status === 'success' && filtrosJson.data.length > 0) {
        let htmlAtributos = '';
        filtrosJson.data.forEach(filtro => {
            const idLimpio = filtro.campo.toLowerCase().replace(/\s+/g, '-');
            htmlAtributos += `
                <div class="filter-section border-top">
                    <div class="filter-header" onclick="toggleAccordion('content-${idLimpio}', 'icon-${idLimpio}')">
                        <span class="filter-title">${filtro.label}</span>
                        <i data-lucide="plus" class="filter-icon" id="icon-${idLimpio}"></i>
                    </div>
                    <div class="filter-content" id="content-${idLimpio}" style="display:none;">
                        ${filtro.opciones.map(valor => {
                            const count = productos.filter(p => {
                                if(!p.atributos) return false;
                                const attrObj = typeof p.atributos === 'string' ? JSON.parse(p.atributos) : p.atributos;
                                const rawVal = attrObj[filtro.campo];
                                if (!rawVal) return false;
                                const cleanVal = rawVal.toString().replace(/\s*\([^)]*\)/g, "").trim();
                                return cleanVal === valor;
                            }).length;

                            return `
                            <label class="filter-option">
                                <input type="checkbox" class="hidden-check spec-filter" 
                                       data-atributo="${filtro.campo}" value="${valor}" 
                                       onchange="actualizarEstadoFiltrosSpec()">
                                <span class="custom-radio"></span>
                                <span class="option-text">${valor} <span class="count" style="color:#94a3b8; font-size:12px;">(${count})</span></span>
                            </label>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
        contenedor.innerHTML = htmlAtributos;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function actualizarEstadoFiltrosSpec() {
    // Marcas
    const checksMarcas = document.querySelectorAll('.brand-filter:checked');
    filtrosEstado.marcas = Array.from(checksMarcas).map(cb => cb.value);

    // Categorías (Multiple)
    const checksCats = document.querySelectorAll('.category-filter:checked');
    filtrosEstado.categorias = Array.from(checksCats).map(cb => cb.value);

    filtrosEstado.especificaciones = {};
    const checksSpecs = document.querySelectorAll('.spec-filter:checked');
    checksSpecs.forEach(cb => {
        const atr = cb.dataset.atributo;
        if (!filtrosEstado.especificaciones[atr]) filtrosEstado.especificaciones[atr] = [];
        filtrosEstado.especificaciones[atr].push(cb.value);
    });
    aplicarFiltrosFinales();
}

function aplicarFiltrosFinales(resetPage = true) {
    if (resetPage && typeof currentPage !== 'undefined') {
        currentPage = 1;
    }
    let resultados = [...PRODUCTOS_CATALOGO];

    // Precio
    resultados = resultados.filter(p => p.precio >= filtrosEstado.minPrice && p.precio <= filtrosEstado.maxPrice);

    // Marca
    if (filtrosEstado.marcas.length > 0) {
        resultados = resultados.filter(p => filtrosEstado.marcas.includes(p.marca));
    }

    // Categoría (Filtro en lugar de redirección)
    if (filtrosEstado.categorias.length > 0) {
        resultados = resultados.filter(p => filtrosEstado.categorias.includes(p.categoria));
    }

    // Atributos específicos (incluye rangos)
    const atributosFiltro = Object.keys(filtrosEstado.especificaciones);
    if (atributosFiltro.length > 0) {
        resultados = resultados.filter(prod => {
            const attrObj = prod.atributos ? (typeof prod.atributos === 'string' ? JSON.parse(prod.atributos) : prod.atributos) : {};
            return atributosFiltro.every(campo => {
                const seleccionados = filtrosEstado.especificaciones[campo];
                if (!seleccionados || seleccionados.length === 0) return true;
                const valorProdRaw = attrObj[campo];
                if (valorProdRaw === undefined) return false;
                
                // Limpiar parentesis para comparar exactamente con el filtro
                const valorProd = valorProdRaw.toString().replace(/\s*\([^)]*\)/g, "").trim();

                // Probar cada opción seleccionada
                return seleccionados.some(sel => {
                    if (sel.includes('-')) {
                        // Rango numérico
                        const [min, max] = sel.split('-').map(Number);
                        const num = parseFloat(valorProd);
                        return !isNaN(num) && num >= min && num < max;
                    } else {
                        // Comparación directa (incluye colores separados)
                        return valorProd === sel;
                    }
                });
            });
        });
    }

    // Ordenar
    const selectOrden = document.querySelector('.sort-select');
    const orden = selectOrden ? selectOrden.value : 'Relevancia';
    if (orden === 'Menor Precio') resultados.sort((a, b) => a.precio - b.precio);
    if (orden === 'Mayor Precio') resultados.sort((a, b) => b.precio - a.precio);

    if (typeof renderProductosGrid === 'function') renderProductosGrid(resultados);
}