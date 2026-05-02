/* ============================================================
   admin-categorias.js - CRUD de Categorías y Marcas
   ============================================================ */

function renderCategorias() {
    if(!mainContent) return;
    
    const filasCat = state.categorias.map(c => `
        <tr style="${c.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''}">
            <td style="font-weight:600;">${c.nombre}</td>
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
    `).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No hay categorías</td></tr>';

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
    
    const titulo = `<i data-lucide="${tipo === 'categoria' ? 'layers' : 'tag'}" style="color: ${color};"></i> ${isEdit ? 'Editar' : 'Nueva'} ${tituloTexto}`;
    
    const contenido = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <input type="hidden" id="attr-tipo" value="${tipo}">
            <input type="hidden" id="attr-id" value="${id || ''}">
            <div>
                <label class="form-label">Nombre de la ${tituloTexto}</label>
                <input type="text" id="attr-nombre" class="form-input" value="${nombreActual}" placeholder="Ej: Samsung, Lavadoras..." required>
            </div>
        </div>
    `;
    const footer = `
        <button onclick="closeModal()" class="btn-outline">Cancelar</button>
        <button onclick="guardarAtributoBD()" class="btn-primary" style="${tipo==='marca'?'background:#10b981; border-color:#10b981;':''}">Guardar</button>
    `;
    
    openModal(titulo, contenido, footer, 'modal-md');
};

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