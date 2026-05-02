/* ============================================================
   admin-productos.js - CRUD de Productos, Imagenes, Specs
   ============================================================ */

const productosProcesando = new Set();

window.toggleEstadoProducto = async function(id, estadoActual) {
    if (productosProcesando.has(id)) return; 
    productosProcesando.add(id);

    const nuevoEstado = estadoActual == 1 ? 0 : 1; 
    const mensajeInstantaneo = nuevoEstado == 1 ? 'Producto Visible' : 'Producto Oculto';

    const index = state.productos.findIndex(p => p.id_producto == id);
    if (index !== -1) {
        state.productos[index].estado = nuevoEstado;
        renderProductos(); 
        showNotification(mensajeInstantaneo); 
    }

    try {
        const formData = new FormData();
        formData.append('id_producto', id);
        formData.append('estado', nuevoEstado);
        await fetch('includes/api/cambiar_estado.php', { method: 'POST', body: formData });
    } catch(e) {
        showNotification("Error de conexión", true);
        if (index !== -1) { state.productos[index].estado = estadoActual; renderProductos(); }
    } finally {
        productosProcesando.delete(id);
    }
};

// ================= MODAL PRODUCTOS Y GUARDADO =================
window.abrirModalProducto = function(idProducto = null) {
    const isEdit = idProducto !== null;
    const prod = isEdit ? state.productos.find(p => p.id_producto == idProducto) : {};
    
    if (!isEdit && typeof categoriaSeleccionadaAdmin !== 'undefined' && categoriaSeleccionadaAdmin !== null && categoriaSeleccionadaAdmin !== 'all') {
        prod.id_categoria = categoriaSeleccionadaAdmin;
    }
    
    let opcionesCategorias = '<option value="">Seleccione...</option>';
    const categoriasVisibles = state.categorias.filter(c => c.estado == 1 || (isEdit && c.id_categoria == prod.id_categoria));
    
    if (categoriasVisibles.length > 0) {
        opcionesCategorias += categoriasVisibles.map(c => 
            `<option value="${c.id_categoria}" ${prod.id_categoria == c.id_categoria ? 'selected' : ''}>
                ${c.nombre} ${c.estado == 0 ? '(Oculta actualmente)' : ''}
            </option>`
        ).join('');
    }
    
    let opcionesMarcas = '<option value="">Seleccione...</option>';
    const marcasVisibles = state.marcas.filter(m => m.estado == 1 || (isEdit && m.id_marca == prod.id_marca));
    
    if (marcasVisibles.length > 0) {
        opcionesMarcas += marcasVisibles.map(m => 
            `<option value="${m.id_marca}" ${prod.id_marca == m.id_marca ? 'selected' : ''}>
                ${m.nombre} ${m.estado == 0 ? '(Oculta actualmente)' : ''}
            </option>`
        ).join('');
    }

    let specsInicialesHtml = '';
    if (prod.especificaciones_agrupadas) {
        const specs = prod.especificaciones_agrupadas.split('||');
        specsInicialesHtml = specs.map(s => {
            const partes = s.split(':');
            if (partes.length >= 2) return crearFilaSpecHTML(partes[0], partes[1]);
            return '';
        }).join('');
    }

    const titulo = `<i data-lucide="package" style="color: #2563eb;"></i> ${isEdit ? 'Editar' : 'Registrar Nuevo'} Producto`;
    
    const contenido = `
        <form id="form-producto" class="grid-2" style="gap: 32px; align-items: start;">
            <input type="hidden" id="prod-id" value="${prod.id_producto || ''}">
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                    <label class="form-label">Nombre del Producto</label>
                    <input type="text" id="prod-nombre" class="form-input" value="${prod.nombre || ''}" required>
                </div>
                
                <div class="grid-2" style="gap: 16px;">
                    <div>
                        <label class="form-label">SKU</label>
                        <input type="text" id="prod-sku" class="form-input" value="${prod.sku || ''}">
                    </div>
                    <div>
                        <label class="form-label">Categoría</label>
                        <select id="prod-categoria" class="form-input">${opcionesCategorias}</select>
                    </div>
                </div>
                
                <div class="grid-2" style="gap: 16px;">
                    <div>
                        <label class="form-label">Marca</label>
                        <select id="prod-marca" class="form-input">${opcionesMarcas}</select>
                    </div>
                    <div>
                        <label class="form-label">Stock</label>
                        <input type="number" id="prod-stock" class="form-input" value="${prod.stock || 0}">
                    </div>
                </div>
                
                <div class="grid-2" style="gap: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px;">
                    <div>
                        <label class="form-label">Precio Reg.</label>
                        <input type="number" id="prod-precio-reg" class="form-input" value="${prod.precio_regular || ''}" step="0.01">
                    </div>
                    <div>
                        <label class="form-label" style="color: #1d4ed8;">Precio Oferta</label>
                        <input type="number" id="prod-precio-ofe" class="form-input" value="${prod.precio_oferta || ''}" step="0.01">
                    </div>
                </div>
                
                <div>
                    <label class="form-label">Imágenes del Producto (Máx. 5)</label>
                    <div id="drop-zone" class="upload-box" onclick="document.getElementById('prod-imagenes').click()" style="padding: 20px; text-align: center; margin-bottom: 8px;">
                        <i data-lucide="upload-cloud" style="color: #3b82f6; width: 32px; height: 32px; margin-bottom: 8px;"></i>
                        <span style="font-size: 14px; color: #64748b;">Clic aquí o arrastra tus imágenes</span>
                    </div>
                    <input type="file" id="prod-imagenes" class="hidden" accept="image/*" multiple onchange="previsualizarImagenes(this)">
                    <p style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">* Arrastra las imágenes para cambiar el orden. La primera será la principal.</p>
                    <div id="preview-imagenes" style="display:flex; gap:8px; flex-wrap:nowrap; min-height: 70px; padding: 4px; overflow-x: auto;">
                    </div>
                </div>
            </div>
            
            <div style="background: var(--bg-gray); border: 1px solid var(--border); border-radius: 12px; padding: 24px;">
                <h3 style="font-weight:bold; margin-bottom:8px; font-size:16px;">Filtros / Especificaciones</h3>
                <div id="contenedor-specs" style="display:flex; flex-direction:column; gap:8px; margin-bottom: 16px; max-height: 450px; overflow-y: auto;">
                    ${specsInicialesHtml}
                </div>
                <div style="display:flex; gap:12px; align-items:center; border-top: 1px dashed var(--border); padding-top: 16px;">
                    <input type="text" id="nueva-spec-atr" class="form-input" placeholder="Atributo" style="width:35%;">
                    <input type="text" id="nueva-spec-val" class="form-input" placeholder="Valor" style="width:50%;">
                    <button type="button" class="btn-primary" onclick="agregarSpecUI()"><i data-lucide="plus"></i></button>
                </div>
            </div>
        </form>
    `;
    const footer = `
        <button onclick="closeModal()" class="btn-outline">Cancelar</button>
        <button onclick="guardarProductoBD()" class="btn-primary">Guardar Producto</button>
    `;
    
    openModal(titulo, contenido, footer, 'modal-lg');

    // Inicializar array de imágenes
    imagenesSeleccionadas = [];
    if (isEdit) {
        if (prod.imagenes_galeria) {
            imagenesSeleccionadas = prod.imagenes_galeria.split(',').filter(img => img.trim() !== '');
        } else if (prod.img_principal) {
            imagenesSeleccionadas = [prod.img_principal];
        }
    }
    renderizarPrevisualizacion();

    const dropZone = document.getElementById('drop-zone');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2563eb';
        dropZone.style.background = '#eff6ff';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'white';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'white';

        if (e.dataTransfer.files.length > 0) {
            procesarNuevasImagenes(e.dataTransfer.files);
        }
    });
};

// ================= LÓGICA DE IMÁGENES (NUEVA GALERÍA) =================
window.previsualizarImagenes = function(input) {
    if (input.files.length > 0) {
        procesarNuevasImagenes(input.files);
        input.value = ""; 
    }
};

function procesarNuevasImagenes(files) {
    const totalActual = imagenesSeleccionadas.length;
    const faltantes = 5 - totalActual;

    if (faltantes <= 0) {
        showNotification('Ya has alcanzado el máximo de 5 imágenes', true);
        return;
    }

    const archivosAProcesar = Array.from(files).slice(0, faltantes);
    if (files.length > faltantes) {
        showNotification(`Solo se agregaron ${faltantes} imágenes (máximo 5 en total)`, true);
    }

    archivosAProcesar.forEach(file => {
        file.tempUrl = URL.createObjectURL(file);
        imagenesSeleccionadas.push(file);
    });

    renderizarPrevisualizacion();
}

window.eliminarImagenModal = function(index) {
    const img = imagenesSeleccionadas[index];
    if (img instanceof File) {
        URL.revokeObjectURL(img.tempUrl);
    }
    imagenesSeleccionadas.splice(index, 1);
    renderizarPrevisualizacion();
};

function renderizarPrevisualizacion() {
    const container = document.getElementById('preview-imagenes');
    if (!container) return;
    container.innerHTML = '';

    imagenesSeleccionadas.forEach((img, index) => {
        const isFile = img instanceof File;
        const src = isFile ? img.tempUrl : `../assets/img_productos/${img}`;
        
        const div = document.createElement('div');
        div.className = 'img-preview-item';
        div.draggable = true;
        div.dataset.index = index;
        div.style = `
            position: relative;
            width: 70px;
            height: 70px;
            border-radius: 10px;
            border: 2px solid ${index === 0 ? '#2563eb' : '#e2e8f0'};
            flex-shrink: 0;
            overflow: hidden;
            background: #f1f5f9;
            cursor: grab;
            transition: transform 0.2s;
        `;

        if (index === 0) {
            div.innerHTML += `<span style="position:absolute; top:2px; left:2px; background:#2563eb; color:white; font-size:8px; padding:2px 4px; border-radius:4px; z-index:5;">Principal</span>`;
        }

        div.innerHTML += `
            <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
            <button type="button" onclick="eliminarImagenModal(${index})" style="position:absolute; top:2px; right:2px; background:rgba(239, 68, 68, 0.9); color:white; border:none; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; z-index:10;">&times;</button>
        `;

        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragend', handleDragEnd);

        container.appendChild(div);
    });
}

// Variables para el reordenamiento
let draggedItemIndex = null;

function handleDragStart(e) {
    draggedItemIndex = this.dataset.index;
    this.style.opacity = '0.5';
    this.style.transform = 'scale(0.9)';
}

function handleDragOver(e) {
    e.preventDefault();
    this.style.transform = 'scale(1.05)';
}

function handleDrop(e) {
    e.preventDefault();
    const targetIndex = this.dataset.index;
    if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
        const movedItem = imagenesSeleccionadas.splice(draggedItemIndex, 1)[0];
        imagenesSeleccionadas.splice(targetIndex, 0, movedItem);
        renderizarPrevisualizacion();
    }
}

function handleDragEnd() {
    this.style.opacity = '1';
    this.style.transform = 'scale(1)';
    document.querySelectorAll('.img-preview-item').forEach(el => el.style.transform = 'scale(1)');
}

function crearFilaSpecHTML(atr, val) {
    const idFila = 'spec-' + Math.random().toString(36).substr(2, 9);
    return `
        <div id="${idFila}" class="spec-item" style="display:flex; gap:12px; align-items:center;">
            <input type="text" class="form-input spec-atr" value="${atr}" style="font-weight:bold; width:35%;">
            <input type="text" class="form-input spec-val" value="${val}" style="width:50%;">
            <button type="button" class="btn-icon danger" onclick="document.getElementById('${idFila}').remove()">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `;
}

window.agregarSpecUI = function() {
    const atrInput = document.getElementById('nueva-spec-atr');
    const valInput = document.getElementById('nueva-spec-val');
    if(!atrInput.value || !valInput.value) return showNotification('Ingresa Atributo y Valor', true);
    
    document.getElementById('contenedor-specs').insertAdjacentHTML('beforeend', crearFilaSpecHTML(atrInput.value.trim(), valInput.value.trim()));
    if (typeof lucide !== 'undefined') lucide.createIcons();
    atrInput.value = ''; valInput.value = '';
};

// ================= COMPRESIÓN Y GUARDADO DE PRODUCTOS =================
const comprimirImagenWebP = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000; 
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

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

window.guardarProductoBD = function() {
    let specs = [];
    document.querySelectorAll('.spec-item').forEach(item => {
        const atr = item.querySelector('.spec-atr').value.trim().replace(/:|\|\|/g, '');
        const val = item.querySelector('.spec-val').value.trim().replace(/:|\|\|/g, '');
        if(atr && val) specs.push(`${atr}:${val}`);
    });

    const idProducto = document.getElementById('prod-id').value;
    const nombre = document.getElementById('prod-nombre').value.trim();
    const sku = document.getElementById('prod-sku').value.trim();
    const id_categoria = document.getElementById('prod-categoria').value;
    const id_marca = document.getElementById('prod-marca').value;
    const stock = document.getElementById('prod-stock').value || 0;
    const precio_regular = document.getElementById('prod-precio-reg').value || 0;
    const precio_oferta = document.getElementById('prod-precio-ofe').value || 0;

    if(!nombre || !id_categoria || !id_marca) {
        return showNotification("Nombre, Categoría y Marca son obligatorios", true);
    }

    const productoTemporal = {
        id_producto: idProducto || 'temp_' + Date.now(), 
        nombre: nombre,
        sku: sku,
        id_categoria: id_categoria,
        id_marca: id_marca,
        stock: stock,
        precio_regular: precio_regular,
        precio_oferta: precio_oferta,
        estado: 1
    };

    const index = state.productos.findIndex(p => p.id_producto == idProducto);
    if (index !== -1) {
        productoTemporal.estado = state.productos[index].estado;
        productoTemporal.imagenes_galeria = imagenesSeleccionadas.map(img => {
            return (img instanceof File) ? 'subiendo...' : img;
        }).join(',');
        productoTemporal.img_principal = (imagenesSeleccionadas.length > 0) ? 
            (imagenesSeleccionadas[0] instanceof File ? 'subiendo...' : imagenesSeleccionadas[0]) : null;

        state.productos[index] = { ...state.productos[index], ...productoTemporal };
    } else {
        state.productos.unshift(productoTemporal);
    }

    closeModal();
    renderProductos();
    showNotification("Producto Guardado Correctamente");

    (async () => {
        try {
            const formData = new FormData();
            
            formData.append('id_producto', idProducto);
            formData.append('nombre', nombre);
            formData.append('sku', sku);
            formData.append('id_categoria', id_categoria);
            formData.append('id_marca', id_marca);
            formData.append('stock', stock);
            formData.append('precio_regular', precio_regular);
            formData.append('precio_oferta', precio_oferta);
            formData.append('especificaciones_agrupadas', specs.join('||'));
            
            const imagenes_orden = [];
            const archivos_para_subir = [];

            for (let i = 0; i < imagenesSeleccionadas.length; i++) {
                const item = imagenesSeleccionadas[i];
                if (item instanceof File) {
                    const tempId = `new_${i}`;
                    imagenes_orden.push(tempId);
                    archivos_para_subir.push(item);
                } else {
                    imagenes_orden.push(item);
                }
            }

            formData.append('imagenes_orden', JSON.stringify(imagenes_orden));

            if (archivos_para_subir.length > 0) {
                if (typeof comprimirImagenWebP === 'function') {
                    const archivosComprimidos = await Promise.all(
                        archivos_para_subir.map(file => comprimirImagenWebP(file))
                    );
                    archivosComprimidos.forEach(blob => formData.append('imagenes[]', blob));
                } else {
                    archivos_para_subir.forEach(file => formData.append('imagenes[]', file));
                }
            }

            const res = await fetch('includes/api/guardar_producto.php', { method: 'POST', body: formData });
            const textoPHP = await res.text();
            
            let result;
            try {
                result = JSON.parse(textoPHP);
            } catch (err) {
                showNotification("Error en el servidor. Presiona F12 y mira la Consola", true);
                await refrescarSoloProductos(); 
                return;
            }
            
            if(result.status !== 'success') {
                showNotification(result.msg, true); 
            }
            
            await refrescarSoloProductos(); 
        } catch (e) {
            showNotification("Error de red o conexión", true);
            await refrescarSoloProductos(); 
        }
    })();
};
