/* ============================================================
   admin-categorias.js - CRUD de Categorías y Marcas
   Con editor de imagen circular para categorías
   ============================================================ */

// Variable temporal para la imagen de categoría seleccionada
let _catImagenFile = null;
let _catImagenScale = 1.0;
let _catImagenPosX = 50;
let _catImagenPosY = 50;
let _catImagenExistente = null; // ruta de imagen ya guardada en BD
let _catDragging = false;
let _catDragStart = { x: 0, y: 0 };

function renderCategorias() {
    if(!mainContent) return;
    
    const filasCat = state.categorias.map(c => {
        const imgHtml = c.imagen 
            ? `<img src="../assets/img_categorias/${c.imagen}" class="cat-table-thumb" alt="${c.nombre}" onerror="this.style.display='none'">`
            : `<span style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#f1f5f9;text-align:center;line-height:36px;color:#94a3b8;font-size:14px;vertical-align:middle;">—</span>`;
        
        return `
        <tr style="${c.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''}">
            <td style="font-weight:600;">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${imgHtml}
                    ${c.nombre}
                </div>
            </td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${c.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${c.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${c.estado == 1 ? 'Activa' : 'Oculta'}
                </span>
            </td>
            <td style="text-align:center;">
                <button onclick="toggleEstadoAtributo('categoria', ${c.id_categoria}, ${c.estado})" class="btn-icon" title="${c.estado == 1 ? 'Ocultar' : 'Mostrar'}">
                    <i data-lucide="${c.estado == 1 ? 'eye-off' : 'eye'}"></i>
                </button>
                <button onclick="abrirModalAtributo('categoria', ${c.id_categoria}, '${c.nombre}')" class="btn-icon" title="Editar">
                    <i data-lucide="edit"></i>
                </button>
            </td>
        </tr>
    `}).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No hay categorías</td></tr>';

    const filasMar = state.marcas.map(m => `
        <tr style="${m.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''}">
            <td style="font-weight:600;">${m.nombre}</td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${m.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${m.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${m.estado == 1 ? 'Activa' : 'Oculta'}
                </span>
            </td>
            <td style="text-align:center;">
                <button onclick="toggleEstadoAtributo('marca', ${m.id_marca}, ${m.estado})" class="btn-icon" title="${m.estado == 1 ? 'Ocultar' : 'Mostrar'}">
                    <i data-lucide="${m.estado == 1 ? 'eye-off' : 'eye'}"></i>
                </button>
                <button onclick="abrirModalAtributo('marca', ${m.id_marca}, '${m.nombre}')" class="btn-icon" title="Editar">
                    <i data-lucide="edit"></i>
                </button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No hay marcas</td></tr>';

    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Categorías y Marcas</h2>
            <br>
            
            <div class="grid-admin-cats">
                <!-- SECCIÓN CATEGORÍAS -->
                <div class="accordion-section always-open-desktop" id="acc-categorias">
                    <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                        <h3 style="display:flex; align-items:center; gap:10px;">
                            <i data-lucide="layers" style="color:#2563eb; width:18px;"></i> Categorías (${state.categorias.length})
                        </h3>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <button onclick="event.stopPropagation(); abrirModalAtributo('categoria')" class="btn-primary" style="padding: 6px 12px; font-size:12px;">
                                <i data-lucide="plus" style="width:14px;"></i> Nueva
                            </button>
                            <i data-lucide="chevron-down" class="accordion-icon"></i>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="table-container" style="border:none;">
                            <table class="table">
                                <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                                <tbody>${filasCat}</tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN MARCAS -->
                <div class="accordion-section always-open-desktop" id="acc-marcas">
                    <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                        <h3 style="display:flex; align-items:center; gap:10px;">
                            <i data-lucide="tag" style="color:#10b981; width:18px;"></i> Marcas (${state.marcas.length})
                        </h3>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <button onclick="event.stopPropagation(); abrirModalAtributo('marca')" class="btn-primary" style="padding: 6px 12px; font-size:12px; background:#10b981; border-color:#10b981;">
                                <i data-lucide="plus" style="width:14px;"></i> Nueva
                            </button>
                            <i data-lucide="chevron-down" class="accordion-icon"></i>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="table-container" style="border:none;">
                            <table class="table">
                                <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                                <tbody>${filasMar}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.abrirModalAtributo = function(tipo, id = null, nombreActual = '') {
    const isEdit = id !== null;
    const tituloTexto = tipo === 'categoria' ? 'Categoría' : 'Marca';
    const color = tipo === 'categoria' ? '#2563eb' : '#10b981';
    
    // Reset estado de imagen
    _catImagenFile = null;
    _catImagenScale = 1.0;
    _catImagenPosX = 50;
    _catImagenPosY = 50;
    _catImagenExistente = null;

    // Si estamos editando una categoría, cargar datos de imagen existente
    if (tipo === 'categoria' && isEdit) {
        const cat = state.categorias.find(c => c.id_categoria == id);
        if (cat) {
            _catImagenExistente = cat.imagen || null;
            _catImagenScale = parseFloat(cat.img_scale) || 1.0;
            _catImagenPosX = parseFloat(cat.img_pos_x) || 50;
            _catImagenPosY = parseFloat(cat.img_pos_y) || 50;
        }
    }
    
    const titulo = `<i data-lucide="${tipo === 'categoria' ? 'layers' : 'tag'}" style="color: ${color};"></i> ${isEdit ? 'Editar' : 'Nueva'} ${tituloTexto}`;
    
    // Contenido de la imagen (solo para categorías)
    let imagenEditorHtml = '';
    if (tipo === 'categoria') {
        imagenEditorHtml = `
            <div class="cat-img-editor" id="cat-img-editor">
                <div class="cat-img-editor-label">Imagen de la categoría (se verá en los círculos del inicio)</div>
                
                <!-- Preview circular -->
                <div class="cat-img-circle-preview" id="cat-circle-preview">
                    ${_catImagenExistente 
                        ? `<img src="../assets/img_categorias/${_catImagenExistente}" id="cat-preview-img" style="transform:scale(${_catImagenScale});object-position:${_catImagenPosX}% ${_catImagenPosY}%;">`
                        : `<div class="placeholder-text"><i data-lucide="image" style="width:24px;height:24px;"></i><span>Sin imagen</span></div>`
                    }
                </div>
                
                <!-- Controles de zoom (ocultos si no hay imagen) -->
                <div class="cat-img-controls" id="cat-img-controls" style="display:${_catImagenExistente ? 'flex' : 'none'};">
                    <label>Zoom:</label>
                    <input type="range" class="cat-img-zoom-slider" id="cat-zoom-slider" min="1" max="3" step="0.05" value="${_catImagenScale}">
                    <span id="cat-zoom-value" style="font-size:12px;color:#64748b;min-width:35px;">${Math.round(_catImagenScale * 100)}%</span>
                </div>

                <p id="cat-drag-hint" style="font-size:11px;color:#94a3b8;text-align:center;display:${_catImagenExistente ? 'block' : 'none'};">Arrastra la imagen dentro del círculo para reposicionar</p>
                
                <!-- Drop zone / cambiar imagen -->
                <div class="cat-img-actions" id="cat-img-actions">
                    <div class="cat-img-dropzone" id="cat-img-dropzone" onclick="document.getElementById('cat-img-input').click()">
                        <i data-lucide="upload-cloud" style="color:#3b82f6;width:20px;height:20px;margin-bottom:4px;"></i>
                        <span style="font-size:13px;color:#64748b;">${_catImagenExistente ? 'Cambiar imagen' : 'Arrastra o haz clic para subir'}</span>
                    </div>
                    <input type="file" id="cat-img-input" accept="image/*" style="display:none;" onchange="catImagenSeleccionada(this)">
                    ${_catImagenExistente ? `<button type="button" class="cat-img-btn-remove" onclick="catEliminarImagen()">Quitar</button>` : ''}
                </div>
            </div>
        `;
    }

    const contenido = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <input type="hidden" id="attr-tipo" value="${tipo}">
            <input type="hidden" id="attr-id" value="${id || ''}">
            <div>
                <label class="form-label">Nombre de la ${tituloTexto}</label>
                <input type="text" id="attr-nombre" class="form-input" value="${nombreActual}" placeholder="Ej: Samsung, Lavadoras..." required>
            </div>
            ${imagenEditorHtml}
        </div>
    `;
    const footer = `
        <button onclick="closeModal()" class="btn-outline">Cancelar</button>
        <button onclick="guardarAtributoBD()" class="btn-primary" style="${tipo==='marca'?'background:#10b981; border-color:#10b981;':''}">Guardar</button>
    `;
    
    openModal(titulo, contenido, footer, 'modal-md');

    // Inicializar eventos del editor de imagen
    if (tipo === 'categoria') {
        setTimeout(() => initCatImageEditor(), 100);
    }
};

// ================= EDITOR DE IMAGEN CIRCULAR =================
function initCatImageEditor() {
    const dropzone = document.getElementById('cat-img-dropzone');
    const zoomSlider = document.getElementById('cat-zoom-slider');
    const preview = document.getElementById('cat-circle-preview');

    if (!dropzone) return;

    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleCatImageFile(e.dataTransfer.files[0]);
        }
    });

    // Zoom slider
    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            _catImagenScale = parseFloat(e.target.value);
            document.getElementById('cat-zoom-value').textContent = Math.round(_catImagenScale * 100) + '%';
            updateCatPreview();
        });
    }

    // Drag to reposition en el círculo
    if (preview) {
        initCatDragReposition(preview);
    }
}

function initCatDragReposition(preview) {
    let startX, startY, startPosX, startPosY;

    const onMouseDown = (e) => {
        const img = preview.querySelector('img');
        if (!img) return;
        e.preventDefault();
        _catDragging = true;
        const rect = preview.getBoundingClientRect();
        startX = (e.clientX || e.touches[0].clientX);
        startY = (e.clientY || e.touches[0].clientY);
        startPosX = _catImagenPosX;
        startPosY = _catImagenPosY;
        preview.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
        if (!_catDragging) return;
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        // Convertir movimiento de píxeles a porcentaje (invertido porque object-position es opuesto al drag)
        const sensitivity = 0.5;
        _catImagenPosX = Math.max(0, Math.min(100, startPosX - dx * sensitivity));
        _catImagenPosY = Math.max(0, Math.min(100, startPosY - dy * sensitivity));
        
        updateCatPreview();
    };

    const onMouseUp = () => {
        _catDragging = false;
        preview.style.cursor = 'grab';
    };

    // Mouse events
    preview.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Touch events
    preview.addEventListener('touchstart', onMouseDown, { passive: false });
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);
}

function updateCatPreview() {
    const img = document.getElementById('cat-preview-img');
    if (!img) return;
    img.style.transform = `scale(${_catImagenScale})`;
    img.style.objectPosition = `${_catImagenPosX}% ${_catImagenPosY}%`;
}

window.catImagenSeleccionada = function(input) {
    if (input.files.length > 0) {
        handleCatImageFile(input.files[0]);
        input.value = '';
    }
};

function handleCatImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Solo se permiten archivos de imagen', true);
        return;
    }

    _catImagenFile = file;
    _catImagenScale = 1.0;
    _catImagenPosX = 50;
    _catImagenPosY = 50;

    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('cat-circle-preview');
        preview.innerHTML = `<img src="${e.target.result}" id="cat-preview-img" style="transform:scale(1);object-position:50% 50%;">`;

        // Mostrar controles
        document.getElementById('cat-img-controls').style.display = 'flex';
        document.getElementById('cat-drag-hint').style.display = 'block';
        document.getElementById('cat-zoom-slider').value = 1;
        document.getElementById('cat-zoom-value').textContent = '100%';

        // Actualizar dropzone text
        const dropzone = document.getElementById('cat-img-dropzone');
        dropzone.querySelector('span').textContent = 'Cambiar imagen';

        // Agregar botón de quitar si no existe
        const actions = document.getElementById('cat-img-actions');
        if (!actions.querySelector('.cat-img-btn-remove')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cat-img-btn-remove';
            btn.textContent = 'Quitar';
            btn.onclick = catEliminarImagen;
            actions.appendChild(btn);
        }

        // Re-inicializar drag
        initCatDragReposition(preview);
    };
    reader.readAsDataURL(file);
}

window.catEliminarImagen = function() {
    _catImagenFile = null;
    _catImagenExistente = null;
    _catImagenScale = 1.0;
    _catImagenPosX = 50;
    _catImagenPosY = 50;

    const preview = document.getElementById('cat-circle-preview');
    if (preview) {
        preview.innerHTML = `<div class="placeholder-text"><i data-lucide="image" style="width:24px;height:24px;"></i><span>Sin imagen</span></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    document.getElementById('cat-img-controls').style.display = 'none';
    document.getElementById('cat-drag-hint').style.display = 'none';

    // Actualizar dropzone
    const dropzone = document.getElementById('cat-img-dropzone');
    if (dropzone) dropzone.querySelector('span').textContent = 'Arrastra o haz clic para subir';

    // Quitar botón remove
    const removeBtn = document.querySelector('.cat-img-btn-remove');
    if (removeBtn) removeBtn.remove();
};

// ================= GUARDAR CATEGORÍA/MARCA =================
window.guardarAtributoBD = function() {
    const tipo = document.getElementById('attr-tipo').value;
    const id = document.getElementById('attr-id').value;
    const nombre = document.getElementById('attr-nombre').value.trim();

    if(!nombre) return showNotification("El nombre es obligatorio", true);

    const lista = tipo === 'categoria' ? state.categorias : state.marcas;
    const campoId = tipo === 'categoria' ? 'id_categoria' : 'id_marca';
    
    if (id) {
        const index = lista.findIndex(item => item[campoId] == id);
        if (index !== -1) lista[index].nombre = nombre;
    } else {
        const nuevoItem = { nombre: nombre, estado: 1 };
        nuevoItem[campoId] = 'temp_' + Date.now();
        lista.push(nuevoItem);
    }

    closeModal();
    renderCategorias();
    showNotification("Guardado Correctamente");

    (async () => {
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('nombre', nombre);
            formData.append('tipo', tipo);

            // Si es categoría, enviar datos de imagen
            if (tipo === 'categoria') {
                formData.append('img_scale', _catImagenScale);
                formData.append('img_pos_x', _catImagenPosX);
                formData.append('img_pos_y', _catImagenPosY);

                if (_catImagenFile) {
                    // Comprimir a WebP si la función existe
                    if (typeof comprimirImagenWebP === 'function') {
                        const comprimida = await comprimirImagenWebP(_catImagenFile);
                        formData.append('imagen', comprimida);
                    } else {
                        formData.append('imagen', _catImagenFile);
                    }
                }
            }

            await fetch('includes/api/guardar_cat_mar.php', { method: 'POST', body: formData });
            
            const urlCat = 'includes/api/listar_categorias.php?t=' + Date.now();
            const urlMar = 'includes/api/listar_marcas.php?t=' + Date.now();
            
            if(tipo === 'categoria') {
                const r = await fetch(urlCat); const d = await r.json(); state.categorias = d.data || [];
            } else {
                const r = await fetch(urlMar); const d = await r.json(); state.marcas = d.data || [];
            }
            if(document.getElementById('tab-categorias').classList.contains('active')) renderCategorias();
            
        } catch (e) { showNotification("Error de red", true); }
    })();
};

window.toggleEstadoAtributo = async function(tipo, id, estadoActual) {
    const nuevoEstado = estadoActual == 1 ? 0 : 1; 
    const lista = tipo === 'categoria' ? state.categorias : state.marcas;
    const campoId = tipo === 'categoria' ? 'id_categoria' : 'id_marca';

    const index = lista.findIndex(item => item[campoId] == id);
    if (index !== -1) {
        lista[index].estado = nuevoEstado;
        renderCategorias(); 
        showNotification(nuevoEstado == 1 ? 'Activado Correctamente' : 'Ocultado Correctamente');
    }

    try {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('estado', nuevoEstado);
        formData.append('tipo', tipo);
        await fetch('includes/api/cambiar_estado_cat_mar.php', { method: 'POST', body: formData });
    } catch(e) {
        showNotification("Error de conexión", true);
        if (index !== -1) { lista[index].estado = estadoActual; renderCategorias(); }
    }
};