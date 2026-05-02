/* ============================================================
   admin-productos-ui.js - Vista de tabla de productos y CSV
   ============================================================ */

let categoriaSeleccionadaAdmin = null;
let busquedaProductosAdmin = "";
let filtroEstadoAdmin = null; // null = todos, 0 = ocultos, 1 = activos

window.abrirCategoriaProductos = function(idCategoria) {
    categoriaSeleccionadaAdmin = idCategoria;
    busquedaProductosAdmin = "";
    filtroEstadoAdmin = null;
    renderProductos();
};

window.abrirProductosOcultos = function() {
    categoriaSeleccionadaAdmin = 'all';
    busquedaProductosAdmin = "";
    filtroEstadoAdmin = 0;
    renderProductos();
};

window.volverACategoriasProd = function() {
    categoriaSeleccionadaAdmin = null;
    busquedaProductosAdmin = "";
    filtroEstadoAdmin = null;
    renderProductos();
};

window.buscarProductosAdmin = function(event) {
    const input = event.target;
    busquedaProductosAdmin = input.value.toLowerCase();
    filtroEstadoAdmin = null;
    
    // Si ya estamos en la vista de tabla, renderProductos solo actualizará el tbody
    // Si no, forzará el cambio de vista.
    renderProductos();
    
    // Asegurar que el foco se mantenga (especialmente importante en móvil)
    if (document.activeElement !== input) {
        input.focus();
        const len = input.value.length;
        input.setSelectionRange(len, len);
    }
};

function renderProductos() {
    if(!mainContent) return;

    const isVistaCarpetas = categoriaSeleccionadaAdmin === null && busquedaProductosAdmin === '';

    if (isVistaCarpetas) {
        const categoriasOrdenadas = [...state.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre));

        const cuadrosCat = categoriasOrdenadas.map(cat => {
            const countProd = state.productos.filter(p => p.id_categoria == cat.id_categoria).length;
            const esActiva = cat.estado == 1;
            const opacidad = esActiva ? '1' : '0.6';
            const bgCard = esActiva ? 'white' : '#f8fafc';
            const borderCard = esActiva ? '1px solid #e2e8f0' : '1px dashed #cbd5e1';
            const bgIcon = esActiva ? '#eff6ff' : '#f1f5f9';
            const colorIcon = esActiva ? '#3b82f6' : '#94a3b8';
            const hoverBorder = esActiva ? '#cbd5e1' : '#94a3b8';
            const badgeInactivo = esActiva ? '' : `<span style="position: absolute; top: 12px; right: 12px; font-size: 10px; background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INACTIVA</span>`;

            return `
                <div class="card fade-in" onclick="abrirCategoriaProductos(${cat.id_categoria})" style="position: relative; opacity: ${opacidad}; background: ${bgCard}; cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; transition: all 0.2s; border: ${borderCard}; border-radius: 16px; padding: 24px;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 25px -5px rgba(0, 0, 0, 0.1)'; this.style.borderColor='${hoverBorder}'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'; this.style.border='${borderCard}'">
                    ${badgeInactivo}
                    <div style="width:64px; height:64px; background:${bgIcon}; color:${colorIcon}; border-radius:20px; display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="${esActiva ? 'package' : 'package-x'}" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div>
                        <h3 style="font-weight:bold; color:var(--dark); font-size: 16px; margin: 0; line-height: 1.2;">${cat.nombre}</h3>
                        <p style="color:#64748b; font-size:13px; margin: 4px 0 0 0;">${countProd} productos</p>
                    </div>
                </div>
            `;
        }).join('');

        const sinCatCount = state.productos.filter(p => !p.id_categoria || p.id_categoria == 0).length;
        const cuadroSinCat = sinCatCount > 0 ? `
            <div class="card fade-in" onclick="abrirCategoriaProductos(0)" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; transition: all 0.2s; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 24px; background: #f8fafc;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 25px -5px rgba(0, 0, 0, 0.1)'; this.style.borderColor='#94a3b8'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'; this.style.borderColor='#cbd5e1'">
                <div style="width:64px; height:64px; background:#e2e8f0; color:#64748b; border-radius:20px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="help-circle" style="width: 32px; height: 32px;"></i>
                </div>
                <div>
                    <h3 style="font-weight:bold; color:var(--dark); font-size: 16px; margin: 0; line-height: 1.2;">Sin Categoría</h3>
                    <p style="color:#64748b; font-size:13px; margin: 4px 0 0 0;">${sinCatCount} productos</p>
                </div>
            </div>` : '';
                
        const totalProductosCount = state.productos.length;
        const cuadroTodos = `
            <div class="card fade-in" onclick="abrirCategoriaProductos('all')" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; transition: all 0.2s; border: 1px solid #10b981; border-radius: 16px; padding: 24px; background: #f0fdf4;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 25px -5px rgba(16, 185, 129, 0.2)'; this.style.borderColor='#059669'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'; this.style.borderColor='#10b981'">
                <div style="width:64px; height:64px; background:#d1fae5; color:#059669; border-radius:20px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="layers" style="width: 32px; height: 32px;"></i>
                </div>
                <div>
                    <h3 style="font-weight:bold; color:#065f46; font-size: 16px; margin: 0; line-height: 1.2;">Catálogo Completo</h3>
                    <p style="color:#047857; font-size:13px; margin: 4px 0 0 0;">${totalProductosCount} en total</p>
                </div>
            </div>`;

        mainContent.innerHTML = `
            <div class="fade-in">
                <div class="flex-between" style="margin-bottom: 24px;">
                    <div>
                        <h2 class="section-title" style="margin:0;">Catálogo de Productos</h2>
                        <p style="color:#64748b; font-size:14px; margin-top:4px;">Selecciona una categoría para ver y editar sus productos.</p>
                    </div>
                    
                    <div style="display:flex; gap:12px; align-items:center; flex-wrap: wrap; justify-content: flex-end;">
                        <div class="search-box" style="position: relative;">
                            <i data-lucide="search" style="position: absolute; left: 12px; top: 11px; color: #94a3b8; width: 18px; height: 18px;"></i>
                            <input type="text" class="form-input" placeholder="Buscar producto o SKU..." oninput="buscarProductosAdmin(event)" value="${busquedaProductosAdmin}" style="padding-left: 38px; width: 220px; padding-top: 10px; padding-bottom: 10px; border-radius: 10px;" autofocus>
                        </div>

                        <input type="file" id="input-csv" accept=".csv" style="display: none;" onchange="subirProductosCSV(event)">
                        <div id="csv-drop-zone" 
                             onclick="document.getElementById('input-csv').click()"
                             ondragover="event.preventDefault(); this.style.borderColor='#3b82f6'; this.style.background='#eff6ff'; this.style.color='#3b82f6';"
                             ondragleave="event.preventDefault(); this.style.borderColor='#cbd5e1'; this.style.background='white'; this.style.color='#475569';"
                             ondrop="event.preventDefault(); this.style.borderColor='#cbd5e1'; this.style.background='white'; this.style.color='#475569'; if(event.dataTransfer.files.length > 0) { const dt = new DataTransfer(); dt.items.add(event.dataTransfer.files[0]); document.getElementById('input-csv').files = dt.files; subirProductosCSV({target: document.getElementById('input-csv')}); }"
                             style="border: 2px dashed #cbd5e1; background: white; padding: 8px 16px; border-radius: 10px; cursor: pointer; color: #475569; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.2s;"
                             title="Arrastra tu archivo CSV aquí">
                            <i data-lucide="upload-cloud"></i> Importar CSV
                        </div>
                        
                        <button onclick="abrirModalProducto()" class="btn-primary" style="height: fit-content; padding: 10px 16px; border-radius: 10px;">
                            <i data-lucide="plus"></i> Nuevo
                        </button>
                    </div>
                </div>
                <div class="grid-4" style="gap: 20px;">
                    ${cuadroTodos}
                    ${cuadrosCat}
                    ${cuadroSinCat}
                </div>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let productosFiltro = state.productos;
    let tituloTabla = "Todos los productos";

    if (filtroEstadoAdmin !== null) {
        productosFiltro = state.productos.filter(p => p.estado == filtroEstadoAdmin);
        tituloTabla = filtroEstadoAdmin == 0 ? "Productos Ocultos" : "Productos Activos";
    }

    if (busquedaProductosAdmin !== '') {
        tituloTabla = "🔍 Resultados de Búsqueda";
        productosFiltro = productosFiltro.filter(p => 
            p.nombre.toLowerCase().includes(busquedaProductosAdmin) || 
            (p.sku && p.sku.toLowerCase().includes(busquedaProductosAdmin))
        );
        if (categoriaSeleccionadaAdmin !== null && categoriaSeleccionadaAdmin !== 'all') {
            const cat = state.categorias.find(c => c.id_categoria == categoriaSeleccionadaAdmin);
            const badge = (cat && cat.estado == 0) ? `<span style="font-size: 11px; background: #fee2e2; color: #ef4444; padding: 4px 8px; border-radius: 6px; font-weight: bold; margin-left: 8px; vertical-align: middle;">CATEGORÍA INACTIVA</span>` : '';
            tituloTabla = `🔍 Buscar en: ${cat ? cat.nombre : 'Sin categorizar'} ${badge}`;
            productosFiltro = productosFiltro.filter(p => p.id_categoria == categoriaSeleccionadaAdmin);
        }
    } else if (categoriaSeleccionadaAdmin !== null && categoriaSeleccionadaAdmin !== 'all') {
        const cat = state.categorias.find(c => c.id_categoria == categoriaSeleccionadaAdmin);
        const badge = (cat && cat.estado == 0) ? `<span style="font-size: 11px; background: #fee2e2; color: #ef4444; padding: 4px 8px; border-radius: 6px; font-weight: bold; margin-left: 8px; vertical-align: middle;">CATEGORÍA INACTIVA</span>` : '';
        tituloTabla = (cat ? cat.nombre : "Sin categorizar") + badge;
        productosFiltro = productosFiltro.filter(p => 
            p.id_categoria == categoriaSeleccionadaAdmin || 
            (categoriaSeleccionadaAdmin == 0 && (!p.id_categoria || p.id_categoria == 0))
        );
    }

    const filas = productosFiltro.map(p => {
        const imagenPrimera = p.img_principal ? p.img_principal.split(',')[0] : 'placeholder.png';
        const opacidad = p.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''; 
        
        let htmlPrecio = '';
        if (parseFloat(p.precio_oferta) > 0) {
            htmlPrecio = `
                <div style="color:#94a3b8; text-decoration:line-through; font-size:12px;">${formatearMoneda(p.precio_regular)}</div>
                <div style="color:#E8232A; font-weight:bold; font-size:15px;">${formatearMoneda(p.precio_oferta)}</div>
            `;
        } else {
            htmlPrecio = `
                <div style="color:#2563eb; font-weight:bold; font-size:15px;">${formatearMoneda(p.precio_regular)}</div>
            `;
        }

        return `
        <tr style="${opacidad}">
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="../assets/img_productos/${imagenPrimera}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/40'">
                    <div>
                        <p style="font-weight:600;font-size:14px;">${p.nombre}</p>
                        <p style="font-size:12px;color:#94a3b8;">SKU: ${p.sku}</p>
                    </div>
                </div>
            </td>
            <td>${htmlPrecio}</td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${p.stock>0?'#dcfce7':'#fee2e2'};color:${p.stock>0?'#16a34a':'#dc2626'};">
                    ${p.stock}
                </span>
            </td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${p.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${p.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${p.estado == 1 ? 'Activo' : 'Oculto'}
                </span>
            </td>
            <td style="text-align:center;">
                <button onclick="toggleEstadoProducto(${p.id_producto}, ${p.estado})" class="btn-icon" title="${p.estado == 1 ? 'Ocultar en tienda' : 'Mostrar en tienda'}">
                    <i data-lucide="${p.estado == 1 ? 'eye-off' : 'eye'}"></i>
                </button>
                <button onclick="abrirModalProducto(${p.id_producto})" class="btn-icon" title="Editar">
                    <i data-lucide="edit"></i>
                </button>
            </td>
        </tr>
    `}).join('');

    // Intentar actualizar solo el tbody si ya estamos en la vista de productos
    const existingTable = document.getElementById('tabla-productos-admin');
    if (existingTable) {
        const tbody = existingTable.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = filas || '<tr><td colspan="5" style="text-align:center; padding: 48px; color:#94a3b8; font-size: 15px;"><i data-lucide="folder-search" style="width: 48px; height: 48px; display:block; margin: 0 auto 12px auto; color:#cbd5e1; stroke-width:1.5;"></i>No se encontraron productos aquí.</td></tr>';
            const countLabel = document.getElementById('productos-count-label');
            if(countLabel) countLabel.textContent = `${productosFiltro.length} resultados`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
    }

    mainContent.innerHTML = `
        <div class="fade-in">
            <div class="flex-between" style="margin-bottom: 24px; gap: 32px;">
                <div style="display: flex; gap: 16px; align-items: center; white-space: nowrap;">
                    <button onclick="volverACategoriasProd()" class="btn-icon" style="background:#e2e8f0; width: 40px; height: 40px; display:flex; justify-content:center; align-items:center; border-radius: 12px;" title="Volver a Carpetas">
                        <i data-lucide="arrow-left" style="color: #475569;"></i>
                    </button>
                    <div>
                        <h2 class="section-title" style="margin:0; font-size: 20px;">${tituloTabla}</h2>
                        <p id="productos-count-label" style="color:#64748b; font-size:13px; margin-top:2px;">${productosFiltro.length} resultados</p>
                    </div>
                </div>
                
                <div style="display:flex; gap:12px; align-items:center; flex-wrap: wrap; justify-content: flex-end;">
                    <div class="search-box" style="position: relative;">
                        <i data-lucide="search" style="position: absolute; left: 12px; top: 11px; color: #94a3b8; width: 18px; height: 18px;"></i>
                        <input type="text" class="form-input" placeholder="Buscar aquí..." oninput="buscarProductosAdmin(event)" value="${busquedaProductosAdmin}" style="padding-left: 38px; width: 220px; padding-top: 10px; padding-bottom: 10px; border-radius: 10px;">
                    </div>

                    <button onclick="abrirModalProducto()" class="btn-primary" style="height: fit-content; padding: 10px 16px; border-radius: 10px;">
                        <i data-lucide="plus"></i> Nuevo
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table" id="tabla-productos-admin">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th style="text-align:center;">Stock</th>
                            <th style="text-align:center;">Estado</th>
                            <th style="text-align:center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas || '<tr><td colspan="5" style="text-align:center; padding: 48px; color:#94a3b8; font-size: 15px;"><i data-lucide="folder-search" style="width: 48px; height: 48px; display:block; margin: 0 auto 12px auto; color:#cbd5e1; stroke-width:1.5;"></i>No se encontraron productos aquí.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}


window.subirProductosCSV = async function(event) {
    const fileInput = event.target;
    if (!fileInput.files.length) return;

    const dropZone = document.getElementById('csv-drop-zone');
    if (dropZone) {
        dropZone.innerHTML = '<i data-lucide="loader"></i> Procesando archivo...';
        dropZone.style.pointerEvents = 'none';
        dropZone.style.opacity = '0.6';
        dropZone.style.background = '#f8fafc';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const formData = new FormData();
    formData.append('archivo_csv', fileInput.files[0]);

    showNotification('Importando CSV... Por favor, no cierres la ventana.', false);

    try {
        const response = await fetch('includes/api/importar_csv.php', {
            method: 'POST',
            body: formData
        });
        
        const textoPHP = await response.text();
        const result = JSON.parse(textoPHP);

        if (result.status === 'success') {
            showNotification(result.msg);
            await refrescarSoloProductos();
        } else {
            showNotification('Error: ' + result.msg, true);
        }
    } catch (error) {
        showNotification('Error de conexión o formato al subir el CSV', true);
    } finally {
        fileInput.value = ''; 
        
        if (dropZone) {
            dropZone.innerHTML = '<i data-lucide="upload-cloud"></i> Arrastra tu CSV o haz clic';
            dropZone.style.pointerEvents = 'auto';
            dropZone.style.opacity = '1';
            dropZone.style.background = 'white';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
};