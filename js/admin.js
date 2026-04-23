/* ============================================================
   admin.js — Motor Lógico 100% Conectado a Backend (MySQL/PHP)
   ============================================================ */

// ================= ESTADO GLOBAL =================
let state = {
    productos: [],
    categorias: [],
    marcas: [],
    banners: [],
    leads: []
};

// Variable temporal para las imágenes del producto en el modal
let imagenesSeleccionadas = [];

const formatearMoneda = (monto) => `S/ ${parseFloat(monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const showNotification = (msg, error = false) => {
    const toast = document.getElementById('toast');
    
    toast.innerHTML = `
        <i data-lucide="${error ? 'alert-circle' : 'check-circle'}" style="color: ${error ? '#ef4444' : '#4ade80'}; width: 20px;"></i>
        <span>${msg}</span>
    `;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
};

// ================= LÓGICA DE MODALES =================
const openModal = (titulo, contenidoHTML, footerHTML, sizeClass = 'modal-md') => {
    document.getElementById('modal-title').innerHTML = titulo;
    document.getElementById('modal-body').innerHTML = contenidoHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML;
    document.getElementById('modal-box').className = `modal-box ${sizeClass} modal-enter`;
    document.getElementById('modal-container').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

const closeModal = () => document.getElementById('modal-container').classList.add('hidden');

// ================= CARGA DE DATOS DESDE PHP =================
async function inicializarAdmin() {
    const noCache = new Date().getTime();
    const headers = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };

    try {
        await Promise.all([
            fetch('includes/api/listar_productos_admin.php?t=' + noCache, { headers })
                .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
                .then(d => { if(d.status === 'success') state.productos = d.data || []; else throw new Error(d.msg); }),
            
            fetch('includes/api/listar_categorias.php?t=' + noCache, { headers })
                .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
                .then(d => { if(d.status === 'success') state.categorias = d.data || []; else throw new Error(d.msg); }),
            
            fetch('includes/api/listar_marcas.php?t=' + noCache, { headers })
                .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
                .then(d => { if(d.status === 'success') state.marcas = d.data || []; else throw new Error(d.msg); }),
            
            fetch('includes/api/listar_banners.php?t=' + noCache, { headers })
                .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
                .then(d => { if(d.status === 'success') state.banners = d.data || []; else throw new Error(d.msg); })
        ]);
    } catch (error) {
        console.error("Error al inicializar el panel:", error);
        showNotification("Error al cargar datos: " + error.message, true);
    }

    const tabActiva = document.querySelector('.nav-btn.active');
    if (tabActiva) {
        const id = tabActiva.id.replace('tab-', '');
        if(id === 'dashboard') renderDashboard();
        else if(id === 'productos') renderProductos();
        else if(id === 'categorias') renderCategorias();
        else if(id === 'banners') renderBanners();
        else if(id === 'leads') renderLeads();
    } else {
        renderDashboard(); 
    }
}

async function refrescarSoloProductos() {
    try {
        const res = await fetch('includes/api/listar_productos_admin.php?t=' + new Date().getTime());
        if(res.ok) {
            const d = await res.json();
            if(d.status === 'success') state.productos = d.data || [];
        }
    } catch(e) {}
    
    const tabActiva = document.querySelector('.nav-btn.active');
    if (tabActiva && tabActiva.id === 'tab-productos') {
        renderProductos();
    }
}

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

// ================= RENDERIZADO DE PANTALLAS =================
const mainContent = document.getElementById('main-content');

function renderDashboard() {
    if(!mainContent) return;
    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Rendimiento General</h2>
            <div class="grid-4">
                <div class="card">
                    <div style="width:40px;height:40px;background:#3B82F6;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
                        <i data-lucide="package"></i>
                    </div>
                    <p style="color:#64748b;font-size:14px;">Productos Totales</p>
                    <p style="font-size:24px;font-weight:bold;">${state.productos.length}</p>
                </div>
                <div class="card">
                    <div style="width:40px;height:40px;background:#10B981;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
                        <i data-lucide="message-circle"></i>
                    </div>
                    <p style="color:#64748b;font-size:14px;">Leads Generados</p>
                    <p style="font-size:24px;font-weight:bold;">${state.leads.length}</p>
                </div>
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

let categoriaSeleccionadaAdmin = null;
let busquedaProductosAdmin = "";

window.abrirCategoriaProductos = function(idCategoria) {
    categoriaSeleccionadaAdmin = idCategoria;
    busquedaProductosAdmin = "";
    renderProductos();
};

window.volverACategoriasProd = function() {
    categoriaSeleccionadaAdmin = null;
    busquedaProductosAdmin = "";
    renderProductos();
};

window.buscarProductosAdmin = function(event) {
    busquedaProductosAdmin = event.target.value.toLowerCase();
    renderProductos();
    
    setTimeout(() => {
        const inputs = document.querySelectorAll('.search-box input');
        if (inputs.length > 0) {
            inputs[0].focus();
            inputs[0].setSelectionRange(inputs[0].value.length, inputs[0].value.length);
        }
    }, 0);
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

    if (busquedaProductosAdmin !== '') {
        tituloTabla = "🔍 Resultados de Búsqueda";
        productosFiltro = state.productos.filter(p => 
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
        productosFiltro = state.productos.filter(p => 
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

    mainContent.innerHTML = `
        <div class="fade-in">
            <div class="flex-between" style="margin-bottom: 24px; gap: 32px;">
                <div style="display: flex; gap: 16px; align-items: center; white-space: nowrap;">
                    <button onclick="volverACategoriasProd()" class="btn-icon" style="background:#e2e8f0; width: 40px; height: 40px; display:flex; justify-content:center; align-items:center; border-radius: 12px;" title="Volver a Carpetas">
                        <i data-lucide="arrow-left" style="color: #475569;"></i>
                    </button>
                    <div>
                        <h2 class="section-title" style="margin:0; font-size: 20px;">${tituloTabla}</h2>
                        <p style="color:#64748b; font-size:13px; margin-top:2px;">${productosFiltro.length} resultados</p>
                    </div>
                </div>
                
                <div style="display:flex; gap:12px; align-items:center; flex-wrap: wrap; justify-content: flex-end;">
                    <div class="search-box" style="position: relative;">
                        <i data-lucide="search" style="position: absolute; left: 12px; top: 11px; color: #94a3b8; width: 18px; height: 18px;"></i>
                        <input type="text" class="form-input" placeholder="Buscar aquí..." oninput="buscarProductosAdmin(event)" value="${busquedaProductosAdmin}" style="padding-left: 38px; width: 220px; padding-top: 10px; padding-bottom: 10px; border-radius: 10px;" autofocus>
                    </div>

                    <button onclick="abrirModalProducto()" class="btn-primary" style="height: fit-content; padding: 10px 16px; border-radius: 10px;">
                        <i data-lucide="plus"></i> Nuevo
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
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
            <div class="grid-2" style="gap: 32px; align-items: start;">
                
                <div class="table-container" style="padding: 20px;">
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <h3 style="font-weight:bold; color:var(--dark); display:flex; align-items:center; gap:8px;">
                            <i data-lucide="layers" style="color:#2563eb;"></i> Categorías
                        </h3>
                        <button onclick="abrirModalAtributo('categoria')" class="btn-primary" style="padding: 8px 16px;">
                            <i data-lucide="plus"></i> Nueva
                        </button>
                    </div>
                    <table class="table">
                        <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                        <tbody>${filasCat}</tbody>
                    </table>
                </div>

                <div class="table-container" style="padding: 20px;">
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <h3 style="font-weight:bold; color:var(--dark); display:flex; align-items:center; gap:8px;">
                            <i data-lucide="tag" style="color:#10b981;"></i> Marcas
                        </h3>
                        <button onclick="abrirModalAtributo('marca')" class="btn-primary" style="padding: 8px 16px; background:#10b981;">
                            <i data-lucide="plus"></i> Nueva
                        </button>
                    </div>
                    <table class="table">
                        <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                        <tbody>${filasMar}</tbody>
                    </table>
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
        <tr draggable="true"
            data-index="${index}"
            ondragstart="iniciarArrastre(event)"
            ondragover="permitirSoltar(event)"
            ondrop="soltarBanner(event)"
            ondragenter="entrarZonaArrastre(event)"
            ondragleave="salirZonaArrastre(event)"
            ondragend="finalizarArrastre(event)"
            style="${b.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : 'background: white;'} cursor: grab; transition: all 0.2s;">
            
            <td style="width: 40px; text-align: center; color: #94a3b8; cursor: grab;">
                <i data-lucide="grip-vertical"></i>
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
}

let dragStartIndex = -1;

window.iniciarArrastre = function(e) {
    dragStartIndex = +e.currentTarget.getAttribute('data-index');
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.3'; }, 0);
};

window.permitirSoltar = function(e) { e.preventDefault(); };

window.entrarZonaArrastre = function(e) {
    e.preventDefault();
    e.currentTarget.style.borderTop = "3px solid #2563eb"; 
};

window.salirZonaArrastre = function(e) {
    e.currentTarget.style.borderTop = ""; 
};

window.soltarBanner = function(e) {
    e.preventDefault();
    const tr = e.currentTarget;
    tr.style.borderTop = "";
    tr.style.opacity = '1';

    const dragEndIndex = +tr.getAttribute('data-index');

    if (dragStartIndex !== dragEndIndex && dragStartIndex !== -1) {
        const bannerMovido = state.banners.splice(dragStartIndex, 1)[0];
        state.banners.splice(dragEndIndex, 0, bannerMovido);
        renderBanners();
        guardarNuevoOrdenBanners();
    }
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

function renderLeads() {
    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Historial de Leads</h2>
            <p>Módulo en construcción...</p>
        </div>
    `;
}

window.switchTab = function(tabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const btnActive = document.getElementById(`tab-${tabId}`);
    if(btnActive) btnActive.classList.add('active');
    
    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'productos') renderProductos();
    if(tabId === 'categorias') renderCategorias();
    if(tabId === 'banners') renderBanners();
    if(tabId === 'leads') renderLeads();

    // ==== LÓGICA RESPONSIVE: Cierra el menú al cambiar de sección ====
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            window.toggleSidebar();
        }
    }
};

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

// ================= INTERFAZ MÓVIL Y MENÚ RESPONSIVE =================
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    let overlay = document.querySelector('.sidebar-overlay');

    // Si el overlay no existe en el HTML, lo creamos al vuelo
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = window.toggleSidebar;
        document.body.appendChild(overlay);
    }

    if (sidebar) sidebar.classList.toggle('active');

    if (sidebar && sidebar.classList.contains('active')) {
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('active'), 10);
    } else {
        overlay.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 300);
    }
};

// ================= INICIADOR =================
document.addEventListener('DOMContentLoaded', inicializarAdmin);