/* ============================================================
   admin-banners.js � CRUD de Banners, Drag & Drop, Orden
   ============================================================ */

// ====================================================================
// MÓDULO DE BANNERS (Con Drag & Drop y Soporte MP4)
// ====================================================================
function renderBanners() {
    if(!mainContent) return;
    
    const filas = state.banners.map((b, index) => {
        const esVideo = b.ruta_imagen && b.ruta_imagen.toLowerCase().endsWith('.mp4');
        const vistaPrevia = esVideo 
            ? `<video src="../assets/img_banners/${b.ruta_imagen}" style="width: 100%; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);" autoplay loop muted playsinline></video>` 
            : `<img src="../assets/img_banners/${b.ruta_imagen}" style="width: 100%; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);" onerror="this.src='https://via.placeholder.com/800x300?text=Sin+Imagen'">`;

        return `
        <tr data-id="${b.id_banner}" style="${b.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : 'background: white;'} transition: all 0.2s;">
            
            <td style="width: 40px; text-align: center; color: #94a3b8;">
                <div class="drag-handle" style="cursor: grab; padding: 10px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="grip-vertical"></i>
                </div>
            </td>
            
            <td style="width: 200px; pointer-events: none;">
                ${vistaPrevia}
            </td>
            
            <td style="pointer-events: none;">
                <p style="font-weight:600; font-size:14px; margin-bottom:4px;">${b.titulo}</p>
                <span style="font-size:12px; color:#2563eb;"><i data-lucide="link" style="width:12px; height:12px;"></i> ${b.enlace}</span>
            </td>
            
            <td style="text-align:center; pointer-events: none;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${b.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${b.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${b.estado == 1 ? 'Activo' : 'Oculto'}
                </span>
            </td>
            
            <td style="text-align:center;">
                <button onclick="toggleEstadoBanner(${b.id_banner}, ${b.estado})" class="btn-icon" title="${b.estado == 1 ? 'Ocultar' : 'Mostrar'}">
                    <i data-lucide="${b.estado == 1 ? 'eye-off' : 'eye'}"></i>
                </button>
                <button onclick="abrirModalBanner(${b.id_banner})" class="btn-icon" title="Editar">
                    <i data-lucide="edit"></i>
                </button>
            </td>
        </tr>
    `}).join('') || '<tr><td colspan="5" style="text-align:center; padding: 24px; color:#94a3b8;">No hay banners registrados</td></tr>';

    mainContent.innerHTML = `
        <div class="fade-in">
            <div class="flex-between" style="margin-bottom: 24px;">
                <h2 class="section-title" style="margin:0;">
                    <i data-lucide="monitor-play" style="color:#2563eb;"></i> Banners Principales
                </h2>
                <button onclick="abrirModalBanner()" class="btn-primary">
                    <i data-lucide="plus"></i> Nuevo Banner
                </button>
            </div>
            <div class="table-container">
                <table class="table" id="tabla-banners">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Vista Previa</th>
                            <th>Detalles</th>
                            <th style="text-align:center;">Estado</th>
                            <th style="text-align:center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Inicializar SortableJS para reordenar banners
    const el = document.querySelector('#tabla-banners tbody');
    if (el && typeof Sortable !== 'undefined') {
        new Sortable(el, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function() {
                const rows = Array.from(el.querySelectorAll('tr'));
                const nuevoOrdenIds = rows.map(row => row.getAttribute('data-id'));
                
                // Reordenar el estado local
                const bannersReordenados = [];
                nuevoOrdenIds.forEach(id => {
                    const b = state.banners.find(item => item.id_banner == id);
                    if(b) bannersReordenados.push(b);
                });
                
                state.banners = bannersReordenados;
                guardarNuevoOrdenBanners();
                
                // Refrescar para actualizar los índices en los botones de subir/bajar si se desea
                // Pero Sortable ya movió el DOM, así que solo actualizamos los botones
                renderBanners(); 
            }
        });
    }
}

window.moverBanner = function(index, direccion) {
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= state.banners.length) return;

    const temp = state.banners[index];
    state.banners[index] = state.banners[nuevoIndex];
    state.banners[nuevoIndex] = temp;

    renderBanners();
    guardarNuevoOrdenBanners();
};

window.finalizarArrastre = function(e) {
    e.target.style.opacity = '1';
    document.querySelectorAll('#tabla-banners tr').forEach(tr => {
        tr.style.borderTop = "";
    });
};

window.guardarNuevoOrdenBanners = async function() {
    const nuevoOrden = state.banners.map((b, index) => ({
        id_banner: b.id_banner,
        orden: index
    }));

    try {
        await fetch('includes/api/guardar_orden_banners.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoOrden)
        });
        showNotification("Orden actualizado en la tienda");
    } catch (error) {
        showNotification("Error al guardar el orden", true);
    }
};

window.abrirModalBanner = function(id = null) {
    const isEdit = id !== null;
    const banner = isEdit ? state.banners.find(b => b.id_banner == id) : {};
    
    const titulo = `<i data-lucide="image" style="color: #2563eb;"></i> ${isEdit ? 'Editar' : 'Nuevo'} Banner`;
    
    const esVideoInit = banner.ruta_imagen && banner.ruta_imagen.toLowerCase().endsWith('.mp4');
    let previewInitHtml = '';
    
    if(banner.ruta_imagen) {
        if(esVideoInit) {
            previewInitHtml = `<video src="../assets/img_banners/${banner.ruta_imagen}" style="width:100%; height:auto; border-radius:8px; border:1px solid var(--border);" autoplay loop muted playsinline></video>`;
        } else {
            previewInitHtml = `<img src="../assets/img_banners/${banner.ruta_imagen}" style="width:100%; height:auto; border-radius:8px; border:1px solid var(--border);">`;
        }
    }

    const contenido = `
        <form id="form-banner" style="display: flex; flex-direction: column; gap: 16px;">
            <input type="hidden" id="ban-id" value="${banner.id_banner || ''}">
            <input type="hidden" id="ban-img-actual" value="${banner.ruta_imagen || ''}">
            
            <div>
                <label class="form-label">Título (Referencia interna)</label>
                <input type="text" id="ban-titulo" class="form-input" value="${banner.titulo || ''}" placeholder="Ej: Cyber Wow 2026" required>
            </div>
            
            <div>
                <label class="form-label">Enlace al hacer clic</label>
                <input type="text" id="ban-enlace" class="form-input" value="${banner.enlace || '#'}" placeholder="Ej: /categoria.php?id=1">
            </div>
            
            <div>
                <label class="form-label">Imagen o Video (Recomendado: 1920x600px)</label>
                <div id="drop-zone-banner" class="upload-box" onclick="document.getElementById('ban-imagen').click()" style="padding: 30px; text-align: center; cursor:pointer; border: 2px dashed var(--border); border-radius: 12px; background: white; transition: all 0.2s ease;">
                    <i data-lucide="upload-cloud" style="color: #3b82f6; width: 32px; height: 32px; margin-bottom: 8px;"></i>
                    <span style="font-size: 14px; color: #64748b; display:block;">Clic o <strong style="color: #2563eb;">arrastra el archivo</strong> aquí</span>
                </div>
                <input type="file" id="ban-imagen" class="hidden" accept="image/*,video/mp4">
                
                <div id="preview-banner" style="margin-top:12px;">
                    ${previewInitHtml}
                </div>
            </div>
        </form>
    `;
    const footer = `
        <button onclick="closeModal()" class="btn-outline">Cancelar</button>
        <button onclick="guardarBannerBD()" class="btn-primary">Guardar</button>
    `;
    
    openModal(titulo, contenido, footer, 'modal-md');

    const input = document.getElementById('ban-imagen');
    const preview = document.getElementById('preview-banner');
    const dropZone = document.getElementById('drop-zone-banner');

    const manejarArchivo = (file) => {
        if(file) {
            if (file.type.startsWith('video/')) {
                const url = URL.createObjectURL(file);
                preview.innerHTML = `<video src="${url}" style="width:100%; height:auto; border-radius:8px; border:1px solid var(--border);" autoplay loop muted playsinline></video>`;
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:auto; border-radius:8px; border:1px solid var(--border); fade-in;">`;
                }
                reader.readAsDataURL(file);
            }
        }
    };

    input.addEventListener('change', function(e) {
        manejarArchivo(this.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2563eb';
        dropZone.style.background = '#eff6ff';
        dropZone.style.transform = 'scale(1.02)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'white';
        dropZone.style.transform = 'scale(1)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'white';
        dropZone.style.transform = 'scale(1)';

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            input.files = e.dataTransfer.files;
            manejarArchivo(input.files[0]);
        }
    });
};

const procesarImagenBannerEfe = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const targetWidth = 1920;
                const targetHeight = 600;

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                canvas.toBlob((blob) => {
                    const nuevoArchivo = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });
                    resolve(nuevoArchivo);
                }, 'image/webp', 0.8);
            };
        };
    });
};

window.guardarBannerBD = function() {
    const id = document.getElementById('ban-id').value;
    const titulo = document.getElementById('ban-titulo').value.trim();
    const enlace = document.getElementById('ban-enlace').value.trim();
    const imagenActual = document.getElementById('ban-img-actual').value;
    const fileInput = document.getElementById('ban-imagen');

    if(!titulo) return showNotification("El título es obligatorio", true);
    if(!id && (!fileInput.files || fileInput.files.length === 0)) return showNotification("Debes subir una imagen o video", true);

    const bannerTemp = {
        id_banner: id || 'temp_' + Date.now(), 
        titulo: titulo,
        enlace: enlace,
        estado: 1, 
        ruta_imagen: imagenActual || 'cargando.jpg'
    };

    const index = state.banners.findIndex(b => b.id_banner == id);
    if (index !== -1) {
        bannerTemp.estado = state.banners[index].estado;
        state.banners[index] = bannerTemp;
    } else {
        state.banners.unshift(bannerTemp);
    }

    closeModal();
    renderBanners();
    showNotification("Banner Guardado");

    (async () => {
        try {
            const formData = new FormData();
            formData.append('id_banner', id); 
            formData.append('titulo', titulo); 
            formData.append('enlace', enlace); 
            formData.append('imagen_actual', imagenActual);
            
            if (fileInput && fileInput.files.length > 0) {
                const archivoSubido = fileInput.files[0];
                
                if (archivoSubido.type.startsWith('video/')) {
                    formData.append('imagen', archivoSubido);
                } else if (typeof procesarImagenBannerEfe === 'function') {
                    const archivoProcesado = await procesarImagenBannerEfe(archivoSubido);
                    formData.append('imagen', archivoProcesado);
                } else {
                    formData.append('imagen', archivoSubido);
                }
            }

            const res = await fetch('includes/api/guardar_banner.php', { method: 'POST', body: formData });
            const result = await res.json();
            
            if(result.status !== 'success') {
                showNotification("Error interno al guardar banner", true);
            }
            
            const r = await fetch('includes/api/listar_banners.php?t=' + Date.now());
            const d = await r.json();
            state.banners = d.data || [];
            if(document.getElementById('tab-banners').classList.contains('active')) renderBanners();
            
        } catch (e) {
            showNotification("Error de red al guardar banner", true);
        }
    })();
};

window.toggleEstadoBanner = async function(id, estadoActual) {
    if (productosProcesando.has(id)) return;
    productosProcesando.add(id);
    const nuevoEstado = estadoActual == 1 ? 0 : 1; 

    const index = state.banners.findIndex(b => b.id_banner == id);
    if (index !== -1) {
        state.banners[index].estado = nuevoEstado;
        renderBanners();
        showNotification(nuevoEstado == 1 ? 'Banner Visible' : 'Banner Oculto');
    }

    try {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('estado', nuevoEstado);
        await fetch('includes/api/cambiar_estado_banner.php', { method: 'POST', body: formData });
    } catch(e) {
        if (index !== -1) {
            state.banners[index].estado = estadoActual;
            renderBanners();
        }
    } finally {
        productosProcesando.delete(id);
    }
};