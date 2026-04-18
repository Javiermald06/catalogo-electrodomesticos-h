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

const formatearMoneda = (monto) => `S/ ${parseFloat(monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const showNotification = (msg, error = false) => {
    const toast = document.getElementById('toast');
    
    // Recreamos todo el contenido para evitar el conflicto con los SVG de Lucide
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

// ================= CARGA DE DATOS DESDE PHP (Segura) =================

async function inicializarAdmin() {
    const noCache = new Date().getTime();
    const headers = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };

    // Promise.all descarga las 4 cosas AL MISMO TIEMPO (Máxima velocidad)
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

// Nueva función ligera: Solo descarga productos (evita gastar internet en categorías/marcas)
async function refrescarSoloProductos() {
    try {
        const res = await fetch('includes/api/listar_productos_admin.php?t=' + new Date().getTime());
        if(res.ok) {
            const d = await res.json();
            if(d.status === 'success') state.productos = d.data || [];
        }
    } catch(e) {}
    
    // Solo re-dibuja si estamos viendo la tabla de productos
    const tabActiva = document.querySelector('.nav-btn.active');
    if (tabActiva && tabActiva.id === 'tab-productos') {
        renderProductos();
    }
}

const productosProcesando = new Set();

window.toggleEstadoProducto = async function(id, estadoActual) {
    // Bloqueo de spam para evitar múltiples clics
    if (productosProcesando.has(id)) return; 
    productosProcesando.add(id);

    const nuevoEstado = estadoActual == 1 ? 0 : 1; 
    const mensajeInstantaneo = nuevoEstado == 1 ? 'Producto Visible' : 'Producto Oculto';

    // 1. ACTUALIZACIÓN VISUAL Y MENSAJE INSTANTÁNEO
    const index = state.productos.findIndex(p => p.id_producto == id);
    if (index !== -1) {
        state.productos[index].estado = nuevoEstado;
        renderProductos(); 
        showNotification(mensajeInstantaneo); // <--- El mensaje aparece AQUÍ, al instante
    }

    // 2. Sincronización silenciosa con la base de datos
    try {
        const formData = new FormData();
        formData.append('id_producto', id);
        formData.append('estado', nuevoEstado);

        // La petición corre de fondo sin bloquear nada
        await fetch('includes/api/cambiar_estado.php', { method: 'POST', body: formData });
    } catch(e) {
        showNotification("Error de conexión", true);
        // Si falla de verdad, revertimos el cambio visual
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
    
    // 1. FILTRO INTELIGENTE PARA CATEGORÍAS
    let opcionesCategorias = '<option value="">Seleccione...</option>';
    // Mostramos solo las que tienen estado == 1, O la que ya tiene asignada el producto (si estamos editando)
    const categoriasVisibles = state.categorias.filter(c => c.estado == 1 || (isEdit && c.id_categoria == prod.id_categoria));
    
    if (categoriasVisibles.length > 0) {
        opcionesCategorias += categoriasVisibles.map(c => 
            `<option value="${c.id_categoria}" ${prod.id_categoria == c.id_categoria ? 'selected' : ''}>
                ${c.nombre} ${c.estado == 0 ? '(Oculta actualmente)' : ''}
            </option>`
        ).join('');
    }
    
    // 2. FILTRO INTELIGENTE PARA MARCAS
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
                <div><label class="form-label">Nombre del Producto</label><input type="text" id="prod-nombre" class="form-input" value="${prod.nombre || ''}" required></div>
                <div class="grid-2" style="gap: 16px;">
                    <div><label class="form-label">SKU</label><input type="text" id="prod-sku" class="form-input" value="${prod.sku || ''}"></div>
                    <div><label class="form-label">Categoría</label><select id="prod-categoria" class="form-input">${opcionesCategorias}</select></div>
                </div>
                <div class="grid-2" style="gap: 16px;">
                    <div><label class="form-label">Marca</label><select id="prod-marca" class="form-input">${opcionesMarcas}</select></div>
                    <div><label class="form-label">Stock</label><input type="number" id="prod-stock" class="form-input" value="${prod.stock || 0}"></div>
                </div>
                <div class="grid-2" style="gap: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px;">
                    <div><label class="form-label">Precio Reg.</label><input type="number" id="prod-precio-reg" class="form-input" value="${prod.precio_regular || ''}" step="0.01"></div>
                    <div><label class="form-label" style="color: #1d4ed8;">Precio Oferta</label><input type="number" id="prod-precio-ofe" class="form-input" value="${prod.precio_oferta || ''}" step="0.01"></div>
                </div>
                
                <div>
                    <label class="form-label">Imágenes del Producto (Máx. 5)</label>
                    <div id="drop-zone" class="upload-box" onclick="document.getElementById('prod-imagenes').click()" style="padding: 20px; text-align: center; margin-bottom: 8px;">
                        <i data-lucide="upload-cloud" style="color: #3b82f6; width: 32px; height: 32px; margin-bottom: 8px;"></i>
                        <span style="font-size: 14px; color: #64748b;">Clic aquí o arrastra tus imágenes</span>
                    </div>
                    <input type="file" id="prod-imagenes" class="hidden" accept="image/*" multiple onchange="previsualizarImagenes(this)">
                    <div id="preview-imagenes" style="display:flex; gap:8px; flex-wrap:wrap;">
                        ${prod.img_principal ? `<img src="../assets/img_productos/${prod.img_principal.split(',')[0]}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;">` : ''}
                    </div>
                </div>
            </div>
            <div style="background: var(--bg-gray); border: 1px solid var(--border); border-radius: 12px; padding: 24px;">
                <h3 style="font-weight:bold; margin-bottom:8px; font-size:16px;">Filtros / Especificaciones</h3>
                <div id="contenedor-specs" style="display:flex; flex-direction:column; gap:8px; margin-bottom: 16px; max-height: 200px; overflow-y: auto;">${specsInicialesHtml}</div>
                <div style="display:flex; gap:12px; align-items:center; border-top: 1px dashed var(--border); padding-top: 16px;">
                    <input type="text" id="nueva-spec-atr" class="form-input" placeholder="Atributo" style="width:35%;">
                    <input type="text" id="nueva-spec-val" class="form-input" placeholder="Valor" style="width:50%;">
                    <button type="button" class="btn-primary" onclick="agregarSpecUI()"><i data-lucide="plus"></i></button>
                </div>
            </div>
        </form>
    `;
    const footer = `<button onclick="closeModal()" class="btn-outline">Cancelar</button><button onclick="guardarProductoBD()" class="btn-primary">Guardar Producto</button>`;
    
    openModal(titulo, contenido, footer, 'modal-lg');

    // ==========================================
    // LÓGICA DE ARRASTRAR Y SOLTAR (DRAG & DROP)
    // ==========================================
    const dropZone = document.getElementById('drop-zone');
    const inputImagenes = document.getElementById('prod-imagenes');

    // Cuando la imagen está flotando encima de la caja (Efecto visual)
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2563eb';
        dropZone.style.background = '#eff6ff';
    });

    // Cuando la imagen sale de la caja sin soltarla
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'white';
    });

    // Cuando sueltas la imagen dentro de la caja
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'white';

        // Si el usuario soltó archivos válidos
        if (e.dataTransfer.files.length > 0) {
            inputImagenes.files = e.dataTransfer.files; // Transferimos los archivos al input oculto
            previsualizarImagenes(inputImagenes); // Llamamos a tu función para que dibuje las miniaturas
        }
    });
};

// ================= PREVISUALIZACIÓN DE IMÁGENES =================
window.previsualizarImagenes = function(input) {
    const previewContainer = document.getElementById('preview-imagenes');
    previewContainer.innerHTML = ''; 
    
    if (input.files.length > 5) {
        showNotification('Solo puedes subir un máximo de 5 imágenes', true);
        const dt = new DataTransfer();
        for(let i=0; i<5; i++) dt.items.add(input.files[i]);
        input.files = dt.files; 
    }

    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style = "width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;";
            previewContainer.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
};

function crearFilaSpecHTML(atr, val) {
    const idFila = 'spec-' + Math.random().toString(36).substr(2, 9);
    return `<div id="${idFila}" class="spec-item" style="display:flex; gap:12px; align-items:center;"><input type="text" class="form-input spec-atr" value="${atr}" style="font-weight:bold; width:35%;"><input type="text" class="form-input spec-val" value="${val}" style="width:50%;"><button type="button" class="btn-icon danger" onclick="document.getElementById('${idFila}').remove()"><i data-lucide="trash-2"></i></button></div>`;
}

window.agregarSpecUI = function() {
    const atrInput = document.getElementById('nueva-spec-atr');
    const valInput = document.getElementById('nueva-spec-val');
    if(!atrInput.value || !valInput.value) return showNotification('Ingresa Atributo y Valor', true);
    document.getElementById('contenedor-specs').insertAdjacentHTML('beforeend', crearFilaSpecHTML(atrInput.value.trim(), valInput.value.trim()));
    if (typeof lucide !== 'undefined') lucide.createIcons();
    atrInput.value = ''; valInput.value = '';
};

// ================= CAMBIO A FORMDATA (BLINDADO) =================
const comprimirImagenWebP = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000; // Ancho máximo
                let width = img.width;
                let height = img.height;

                // Achicamos si es muy grande
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertimos a WebP al 80% de calidad directamente en el navegador
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
    // 1. Recolección rápida de especificaciones
    let specs = [];
    document.querySelectorAll('.spec-item').forEach(item => {
        const atr = item.querySelector('.spec-atr').value.trim().replace(/:|\|\|/g, '');
        const val = item.querySelector('.spec-val').value.trim().replace(/:|\|\|/g, '');
        if(atr && val) specs.push(`${atr}:${val}`);
    });

    // 2. Recolección de variables principales
    const idProducto = document.getElementById('prod-id').value;
    const nombre = document.getElementById('prod-nombre').value.trim();
    const sku = document.getElementById('prod-sku').value.trim();
    const id_categoria = document.getElementById('prod-categoria').value;
    const id_marca = document.getElementById('prod-marca').value;
    const stock = document.getElementById('prod-stock').value || 0;
    const precio_regular = document.getElementById('prod-precio-reg').value || 0;
    const precio_oferta = document.getElementById('prod-precio-ofe').value || 0;

    // Validación de seguridad
    if(!nombre || !id_categoria || !id_marca) {
        return showNotification("Nombre, Categoría y Marca son obligatorios", true);
    }

    // =======================================================
    // ACTUALIZACIÓN OPTIMISTA (Instantánea para el usuario)
    // =======================================================
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
        productoTemporal.img_principal = state.productos[index].img_principal;
        productoTemporal.estado = state.productos[index].estado;
        state.productos[index] = { ...state.productos[index], ...productoTemporal };
    } else {
        state.productos.unshift(productoTemporal);
    }

    // Cerramos la ventana y mostramos el éxito de inmediato
    closeModal();
    renderProductos();
    showNotification("Producto Guardado Correctamente");

    // =======================================================
    // PROCESAMIENTO DE FONDO (Envío real a PHP)
    // =======================================================
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
            
            const inputImagenes = document.getElementById('prod-imagenes');
            
            // Verificamos que existan archivos y que la función de comprimir no se haya borrado
            if (inputImagenes && inputImagenes.files.length > 0) {
                if (typeof comprimirImagenWebP === 'function') {
                    const archivosComprimidos = await Promise.all(
                        Array.from(inputImagenes.files).map(file => comprimirImagenWebP(file))
                    );
                    archivosComprimidos.forEach(blob => formData.append('imagenes[]', blob));
                } else {
                    // Si la función se borró por accidente, enviamos las imágenes normales
                    Array.from(inputImagenes.files).forEach(file => formData.append('imagenes[]', file));
                }
            }

            const res = await fetch('includes/api/guardar_producto.php', { method: 'POST', body: formData });
            
            // 🛑 DETECTOR: Leemos el texto crudo de PHP antes de convertirlo a JSON
            const textoPHP = await res.text();
            
            let result;
            try {
                result = JSON.parse(textoPHP);
            } catch (err) {
                console.error("❌ PHP DEVOLVIÓ ESTE ERROR:", textoPHP);
                showNotification("Error en el servidor. Presiona F12 y mira la Consola", true);
                await refrescarSoloProductos(); 
                return;
            }
            
            if(result.status !== 'success') {
                console.error("❌ Error de BD:", result.msg);
                showNotification(result.msg, true); // Muestra el error exacto en la ventanita roja
            }
            
            await refrescarSoloProductos(); 
        } catch (e) {
            console.error("❌ Error de JavaScript o Red:", e);
            showNotification("Error de código. Presiona F12", true);
            await refrescarSoloProductos(); 
        }
    })();
};

// ================= RENDERIZADO DE PANTALLAS (Esto faltaba) =================
const mainContent = document.getElementById('main-content');

function renderDashboard() {
    if(!mainContent) return;
    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Rendimiento General</h2>
            <div class="grid-4">
                <div class="card"><div style="width:40px;height:40px;background:#3B82F6;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><i data-lucide="package"></i></div><p style="color:#64748b;font-size:14px;">Productos Totales</p><p style="font-size:24px;font-weight:bold;">${state.productos.length}</p></div>
                <div class="card"><div style="width:40px;height:40px;background:#10B981;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><i data-lucide="message-circle"></i></div><p style="color:#64748b;font-size:14px;">Leads Generados</p><p style="font-size:24px;font-weight:bold;">${state.leads.length}</p></div>
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

    // Detectar si estamos en el "modo carpetas" o "modo lista"
    const isVistaCarpetas = categoriaSeleccionadaAdmin === null && busquedaProductosAdmin === '';

    if (isVistaCarpetas) {
        // Ordenar categorías alfabéticamente
        const categoriasOrdenadas = [...state.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre));

        const cuadrosCat = categoriasOrdenadas.map(cat => {
            const countProd = state.productos.filter(p => p.id_categoria == cat.id_categoria).length;
            
            // Estilos dinámicos según el estado de la categoría
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

    // --- 2. MODO: VISTA DE TABLA (FILTRADA) ---
    
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
            htmlPrecio = `<div style="color:#2563eb; font-weight:bold; font-size:15px;">${formatearMoneda(p.precio_regular)}</div>`;
        }

        return `
        <tr style="${opacidad}">
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="../assets/img_productos/${imagenPrimera}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/40'">
                    <div><p style="font-weight:600;font-size:14px;">${p.nombre}</p><p style="font-size:12px;color:#94a3b8;">SKU: ${p.sku}</p></div>
                </div>
            </td>
            <td>${htmlPrecio}</td>
            <td style="text-align:center;"><span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${p.stock>0?'#dcfce7':'#fee2e2'};color:${p.stock>0?'#16a34a':'#dc2626'};">${p.stock}</span></td>
            
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${p.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${p.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${p.estado == 1 ? 'Activo' : 'Oculto'}
                </span>
            </td>
            
            <td style="text-align:center;">
                <button onclick="toggleEstadoProducto(${p.id_producto}, ${p.estado})" class="btn-icon" title="${p.estado == 1 ? 'Ocultar en tienda' : 'Mostrar en tienda'}">
                    <i data-lucide="${p.estado == 1 ? 'eye-off' : 'eye'}"></i>
                </button>
                <button onclick="abrirModalProducto(${p.id_producto})" class="btn-icon" title="Editar"><i data-lucide="edit"></i></button>
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
                    <tbody>${filas || '<tr><td colspan="5" style="text-align:center; padding: 48px; color:#94a3b8; font-size: 15px;"><i data-lucide="folder-search" style="width: 48px; height: 48px; display:block; margin: 0 auto 12px auto; color:#cbd5e1; stroke-width:1.5;"></i>No se encontraron productos aquí.</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCategorias() {
    if(!mainContent) return;
    
    // 1. Generar filas de Categorías
    const filasCat = state.categorias.map(c => `
        <tr style="${c.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''}">
            <td style="font-weight:600;">${c.nombre}</td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${c.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${c.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${c.estado == 1 ? 'Activa' : 'Oculta'}
                </span>
            </td>
            <td style="text-align:center;">
                <button onclick="toggleEstadoAtributo('categoria', ${c.id_categoria}, ${c.estado})" class="btn-icon" title="${c.estado == 1 ? 'Ocultar' : 'Mostrar'}"><i data-lucide="${c.estado == 1 ? 'eye-off' : 'eye'}"></i></button>
                <button onclick="abrirModalAtributo('categoria', ${c.id_categoria}, '${c.nombre}')" class="btn-icon" title="Editar"><i data-lucide="edit"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No hay categorías</td></tr>';

    // 2. Generar filas de Marcas
    const filasMar = state.marcas.map(m => `
        <tr style="${m.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''}">
            <td style="font-weight:600;">${m.nombre}</td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${m.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${m.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${m.estado == 1 ? 'Activa' : 'Oculta'}
                </span>
            </td>
            <td style="text-align:center;">
                <button onclick="toggleEstadoAtributo('marca', ${m.id_marca}, ${m.estado})" class="btn-icon" title="${m.estado == 1 ? 'Ocultar' : 'Mostrar'}"><i data-lucide="${m.estado == 1 ? 'eye-off' : 'eye'}"></i></button>
                <button onclick="abrirModalAtributo('marca', ${m.id_marca}, '${m.nombre}')" class="btn-icon" title="Editar"><i data-lucide="edit"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No hay marcas</td></tr>';

    // 3. Dibujar la pantalla dividida (Grid)
    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Categorías y Marcas</h2>
            <div class="grid-2" style="gap: 32px; align-items: start;">
                
                <div class="table-container" style="padding: 20px;">
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <h3 style="font-weight:bold; color:var(--dark); display:flex; align-items:center; gap:8px;"><i data-lucide="layers" style="color:#2563eb;"></i> Categorías</h3>
                        <button onclick="abrirModalAtributo('categoria')" class="btn-primary" style="padding: 8px 16px;"><i data-lucide="plus"></i> Nueva</button>
                    </div>
                    <table class="table">
                        <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                        <tbody>${filasCat}</tbody>
                    </table>
                </div>

                <div class="table-container" style="padding: 20px;">
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <h3 style="font-weight:bold; color:var(--dark); display:flex; align-items:center; gap:8px;"><i data-lucide="tag" style="color:#10b981;"></i> Marcas</h3>
                        <button onclick="abrirModalAtributo('marca')" class="btn-primary" style="padding: 8px 16px; background:#10b981;"><i data-lucide="plus"></i> Nueva</button>
                    </div>
                    <table class="table">
                        <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                        <tbody>${filasMar}</tbody>
                    </table>
                </div>

            </div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ====================================================================
// MÓDULO DE CATEGORÍAS Y MARCAS
// ====================================================================

function renderCategorias() {
    if(!mainContent) return;
    
    // 1. Generar filas de Categorías
    const filasCat = state.categorias.map(c => `
        <tr style="${c.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''}">
            <td style="font-weight:600;">${c.nombre}</td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${c.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${c.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${c.estado == 1 ? 'Activa' : 'Oculta'}
                </span>
            </td>
            <td style="text-align:center;">
                <button onclick="toggleEstadoAtributo('categoria', ${c.id_categoria}, ${c.estado})" class="btn-icon" title="${c.estado == 1 ? 'Ocultar' : 'Mostrar'}"><i data-lucide="${c.estado == 1 ? 'eye-off' : 'eye'}"></i></button>
                <button onclick="abrirModalAtributo('categoria', ${c.id_categoria}, '${c.nombre}')" class="btn-icon" title="Editar"><i data-lucide="edit"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No hay categorías</td></tr>';

    // 2. Generar filas de Marcas
    const filasMar = state.marcas.map(m => `
        <tr style="${m.estado == 0 ? 'opacity: 0.6; background: #f8fafc;' : ''}">
            <td style="font-weight:600;">${m.nombre}</td>
            <td style="text-align:center;">
                <span style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:bold;background:${m.estado == 1 ? '#dcfce7' : '#f1f5f9'};color:${m.estado == 1 ? '#16a34a' : '#64748b'};">
                    ${m.estado == 1 ? 'Activa' : 'Oculta'}
                </span>
            </td>
            <td style="text-align:center;">
                <button onclick="toggleEstadoAtributo('marca', ${m.id_marca}, ${m.estado})" class="btn-icon" title="${m.estado == 1 ? 'Ocultar' : 'Mostrar'}"><i data-lucide="${m.estado == 1 ? 'eye-off' : 'eye'}"></i></button>
                <button onclick="abrirModalAtributo('marca', ${m.id_marca}, '${m.nombre}')" class="btn-icon" title="Editar"><i data-lucide="edit"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No hay marcas</td></tr>';

    // 3. Dibujar la pantalla dividida (Grid)
    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Categorías y Marcas</h2>
            <div class="grid-2" style="gap: 32px; align-items: start;">
                
                <div class="table-container" style="padding: 20px;">
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <h3 style="font-weight:bold; color:var(--dark); display:flex; align-items:center; gap:8px;"><i data-lucide="layers" style="color:#2563eb;"></i> Categorías</h3>
                        <button onclick="abrirModalAtributo('categoria')" class="btn-primary" style="padding: 8px 16px;"><i data-lucide="plus"></i> Nueva</button>
                    </div>
                    <table class="table">
                        <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                        <tbody>${filasCat}</tbody>
                    </table>
                </div>

                <div class="table-container" style="padding: 20px;">
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <h3 style="font-weight:bold; color:var(--dark); display:flex; align-items:center; gap:8px;"><i data-lucide="tag" style="color:#10b981;"></i> Marcas</h3>
                        <button onclick="abrirModalAtributo('marca')" class="btn-primary" style="padding: 8px 16px; background:#10b981;"><i data-lucide="plus"></i> Nueva</button>
                    </div>
                    <table class="table">
                        <thead><tr><th>Nombre</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                        <tbody>${filasMar}</tbody>
                    </table>
                </div>

            </div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ================= MODAL DE CATEGORÍAS/MARCAS =================
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

// ================= GUARDADO OPTIMISTA =================
window.guardarAtributoBD = function() {
    const tipo = document.getElementById('attr-tipo').value;
    const id = document.getElementById('attr-id').value;
    const nombre = document.getElementById('attr-nombre').value.trim();

    if(!nombre) return showNotification("El nombre es obligatorio", true);

    // Actualización visual rápida
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

    // Procesamiento en background
    (async () => {
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('nombre', nombre);
            formData.append('tipo', tipo);

            await fetch('includes/api/guardar_cat_mar.php', { method: 'POST', body: formData });
            
            // Refrescar silenciosamente para obtener los IDs reales
            const urlCat = 'includes/api/listar_categorias.php?t=' + Date.now();
            const urlMar = 'includes/api/listar_marcas.php?t=' + Date.now();
            
            if(tipo === 'categoria') {
                const r = await fetch(urlCat); const d = await r.json(); state.categorias = d.data || [];
            } else {
                const r = await fetch(urlMar); const d = await r.json(); state.marcas = d.data || [];
            }
            // Solo redibujar si el usuario sigue en esa pestaña
            if(document.getElementById('tab-categorias').classList.contains('active')) renderCategorias();
            
        } catch (e) { showNotification("Error de red", true); }
    })();
};

// ================= CAMBIAR ESTADO OPTIMISTA =================
window.toggleEstadoAtributo = async function(tipo, id, estadoActual) {
    const nuevoEstado = estadoActual == 1 ? 0 : 1; 
    const lista = tipo === 'categoria' ? state.categorias : state.marcas;
    const campoId = tipo === 'categoria' ? 'id_categoria' : 'id_marca';

    // Actualización visual
    const index = lista.findIndex(item => item[campoId] == id);
    if (index !== -1) {
        lista[index].estado = nuevoEstado;
        renderCategorias(); 
        showNotification(nuevoEstado == 1 ? 'Activado Correctamente' : 'Ocultado Correctamente');
    }

    // Backend
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
// MÓDULO DE BANNERS
// ====================================================================

// ====================================================================
// MÓDULO DE BANNERS (Con Drag & Drop de Ordenamiento)
// ====================================================================

function renderBanners() {
    if(!mainContent) return;
    
    // Le agregamos el atributo draggable="true" a la fila y los eventos de arrastre
    const filas = state.banners.map((b, index) => `
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
                <img src="../assets/img_banners/${b.ruta_imagen}" style="width: 100%; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);" onerror="this.src='https://via.placeholder.com/800x300?text=Sin+Imagen'">
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
                <button onclick="toggleEstadoBanner(${b.id_banner}, ${b.estado})" class="btn-icon" title="${b.estado == 1 ? 'Ocultar' : 'Mostrar'}"><i data-lucide="${b.estado == 1 ? 'eye-off' : 'eye'}"></i></button>
                <button onclick="abrirModalBanner(${b.id_banner})" class="btn-icon" title="Editar"><i data-lucide="edit"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center; padding: 24px; color:#94a3b8;">No hay banners registrados</td></tr>';

    mainContent.innerHTML = `
        <div class="fade-in">
            <div class="flex-between" style="margin-bottom: 24px;">
                <h2 class="section-title" style="margin:0;"><i data-lucide="monitor-play" style="color:#2563eb;"></i> Banners Principales</h2>
                <button onclick="abrirModalBanner()" class="btn-primary"><i data-lucide="plus"></i> Nuevo Banner</button>
            </div>
            <div class="table-container">
                <table class="table" id="tabla-banners">
                    <thead><tr><th></th><th>Vista Previa</th><th>Detalles</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acciones</th></tr></thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ================= LÓGICA DE DRAG & DROP =================
let dragStartIndex = -1;

window.iniciarArrastre = function(e) {
    dragStartIndex = +e.currentTarget.getAttribute('data-index');
    e.dataTransfer.effectAllowed = 'move';
    // Efecto visual de transparencia al arrastrar
    setTimeout(() => { e.target.style.opacity = '0.3'; }, 0);
};

window.permitirSoltar = function(e) {
    e.preventDefault(); // Indispensable para que el navegador permita soltar
};

window.entrarZonaArrastre = function(e) {
    e.preventDefault();
    const tr = e.currentTarget;
    // Dibuja una línea azul indicando dónde caerá
    tr.style.borderTop = "3px solid #2563eb"; 
};

window.salirZonaArrastre = function(e) {
    const tr = e.currentTarget;
    tr.style.borderTop = ""; // Quita la línea al salir
};

window.soltarBanner = function(e) {
    e.preventDefault();
    const tr = e.currentTarget;
    tr.style.borderTop = "";
    tr.style.opacity = '1';

    const dragEndIndex = +tr.getAttribute('data-index');

    // Si lo movió a una posición distinta
    if (dragStartIndex !== dragEndIndex && dragStartIndex !== -1) {
        // Sacamos el banner de su posición original y lo metemos en la nueva
        const bannerMovido = state.banners.splice(dragStartIndex, 1)[0];
        state.banners.splice(dragEndIndex, 0, bannerMovido);

        renderBanners(); // Redibujamos la tabla instantáneamente
        guardarNuevoOrdenBanners(); // Enviamos la orden de guardado al servidor
    }
};

window.finalizarArrastre = function(e) {
    // 1. Le devuelve el color sólido a la fila que estabas moviendo
    e.target.style.opacity = '1';
    
    // 2. Limpia cualquier línea azul que se haya quedado "pegada" por error
    document.querySelectorAll('#tabla-banners tr').forEach(tr => {
        tr.style.borderTop = "";
    });
};

window.guardarNuevoOrdenBanners = async function() {
    // Creamos un array pequeño solo con los IDs y su nuevo orden
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
    const contenido = `
        <form id="form-banner" style="display: flex; flex-direction: column; gap: 16px;">
            <input type="hidden" id="ban-id" value="${banner.id_banner || ''}">
            <input type="hidden" id="ban-img-actual" value="${banner.ruta_imagen || ''}">
            
            <div><label class="form-label">Título (Referencia interna)</label><input type="text" id="ban-titulo" class="form-input" value="${banner.titulo || ''}" placeholder="Ej: Cyber Wow 2026" required></div>
            <div><label class="form-label">Enlace al hacer clic</label><input type="text" id="ban-enlace" class="form-input" value="${banner.enlace || '#'}" placeholder="Ej: /categoria.php?id=1"></div>
            
            <div>
                <label class="form-label">Imagen del Banner (Recomendado: 1920x600px)</label>
                <div id="drop-zone-banner" class="upload-box" onclick="document.getElementById('ban-imagen').click()" style="padding: 30px; text-align: center; cursor:pointer; border: 2px dashed var(--border); border-radius: 12px; background: white; transition: all 0.2s ease;">
                    <i data-lucide="upload-cloud" style="color: #3b82f6; width: 32px; height: 32px; margin-bottom: 8px;"></i>
                    <span style="font-size: 14px; color: #64748b; display:block;">Clic o <strong style="color: #2563eb;">arrastra la imagen</strong> aquí</span>
                </div>
                <input type="file" id="ban-imagen" class="hidden" accept="image/*">
                
                <div id="preview-banner" style="margin-top:12px;">
                    ${banner.ruta_imagen ? `<img src="../assets/img_banners/${banner.ruta_imagen}" style="width:100%; height:auto; border-radius:8px; border:1px solid var(--border);">` : ''}
                </div>
            </div>
        </form>
    `;
    const footer = `<button onclick="closeModal()" class="btn-outline">Cancelar</button><button onclick="guardarBannerBD()" class="btn-primary">Guardar</button>`;
    
    openModal(titulo, contenido, footer, 'modal-md');

    // ==========================================
    // LÓGICA DE ARRASTRAR Y SOLTAR (DRAG & DROP)
    // ==========================================
    const input = document.getElementById('ban-imagen');
    const preview = document.getElementById('preview-banner');
    const dropZone = document.getElementById('drop-zone-banner');

    // Función reutilizable para leer y mostrar la imagen
    const manejarArchivo = (file) => {
        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:auto; border-radius:8px; border:1px solid var(--border); fade-in;">`;
            }
            reader.readAsDataURL(file);
        }
    };

    // 1. Clic normal (ya existía)
    input.addEventListener('change', function(e) {
        manejarArchivo(this.files[0]);
    });

    // 2. Arrancamos con los eventos de arrastre
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Evita que el navegador abra la imagen
        dropZone.style.borderColor = '#2563eb'; // Cambiamos a azul
        dropZone.style.background = '#eff6ff'; // Fondo azul claro
        dropZone.style.transform = 'scale(1.02)'; // Pequeño zoom
    });

    // Cuando sales de la zona sin soltar
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)'; // Reseteamos bordes
        dropZone.style.background = 'white'; // Reseteamos fondo
        dropZone.style.transform = 'scale(1)';
    });

    // ¡EL MOMENTO CLAVE: SOLTAR LA IMAGEN!
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        // Reseteamos estilos visuales
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'white';
        dropZone.style.transform = 'scale(1)';

        // Verificamos que soltaron archivos válidos
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // MÁGICA: Transferimos el archivo arrastrado al input oculto
            input.files = e.dataTransfer.files;
            
            // Mostramos la previsualización al instante
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
                
                // Las medidas exactas que quieres obligar a tener
                const targetWidth = 1920;
                const targetHeight = 600;

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                
                // Dibuja TODA la imagen original obligándola a entrar en 1920x600
                // ctx.drawImage(imagen, x, y, ancho_destino, alto_destino)
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Convertimos el resultado a WebP al 80% de calidad
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
    if(!id && (!fileInput.files || fileInput.files.length === 0)) return showNotification("Debes subir una imagen", true);

    // Actualización Optimista
    const bannerTemp = {
        id_banner: id || 'temp_' + Date.now(), 
        titulo: titulo, enlace: enlace, estado: 1, 
        ruta_imagen: imagenActual || 'cargando.jpg'
    };

    const index = state.banners.findIndex(b => b.id_banner == id);
    if (index !== -1) { bannerTemp.estado = state.banners[index].estado; state.banners[index] = bannerTemp; } 
    else { state.banners.unshift(bannerTemp); }

    closeModal(); renderBanners(); showNotification("Banner Guardado");

    // Envío de fondo
    (async () => {
        try {
            const formData = new FormData();
            
            // Empaquetamos los datos como siempre
            formData.append('id_banner', id); 
            formData.append('titulo', titulo); 
            formData.append('enlace', enlace); 
            formData.append('imagen_actual', imagenActual);
            
            const fileInput = document.getElementById('ban-imagen');
            
            // ¡MAGIA AQUÍ! Si subieron una foto nueva, la re-encuadramos antes de subirla
            if (fileInput && fileInput.files.length > 0) {
                if (typeof procesarImagenBannerEfe === 'function') {
                    // Usamos el nuevo motor de re-encuadre de EFE
                    const archivoProcesado = await procesarImagenBannerEfe(fileInput.files[0]);
                    formData.append('imagen', archivoProcesado);
                } else {
                    // Fallback de seguridad si algo falla
                    formData.append('imagen', fileInput.files[0]);
                }
            }

            // Enviamos la foto que YA ESTÁ PERFECTAMENTE MEDIDA EN 1920x600 y WebP
            const res = await fetch('includes/api/guardar_banner.php', { method: 'POST', body: formData });
            const result = await res.json();
            
            if(result.status !== 'success') {
                console.error("Error del servidor: ", result.msg);
                showNotification("Error interno al guardar banner", true);
            }
            
            // Recarga silenciosa
            const r = await fetch('includes/api/listar_banners.php?t=' + Date.now());
            const d = await r.json(); state.banners = d.data || [];
            if(document.getElementById('tab-banners').classList.contains('active')) renderBanners();
            
        } catch (e) {
            console.error("Error en segundo plano:", e);
            showNotification("Error de red al guardar banner", true);
        }
    })();
};

window.toggleEstadoBanner = async function(id, estadoActual) {
    if (productosProcesando.has(id)) return; productosProcesando.add(id);
    const nuevoEstado = estadoActual == 1 ? 0 : 1; 

    const index = state.banners.findIndex(b => b.id_banner == id);
    if (index !== -1) { state.banners[index].estado = nuevoEstado; renderBanners(); showNotification(nuevoEstado == 1 ? 'Banner Visible' : 'Banner Oculto'); }

    try {
        const formData = new FormData(); formData.append('id', id); formData.append('estado', nuevoEstado);
        await fetch('includes/api/cambiar_estado_banner.php', { method: 'POST', body: formData });
    } catch(e) { if (index !== -1) { state.banners[index].estado = estadoActual; renderBanners(); } }
    finally { productosProcesando.delete(id); }
};

function renderLeads() { mainContent.innerHTML = `<div class="fade-in"><h2 class="section-title">Historial de Leads</h2><p>Módulo en construcción...</p></div>`; }

window.switchTab = function(tabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const btnActive = document.getElementById(`tab-${tabId}`);
    if(btnActive) btnActive.classList.add('active');
    
    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'productos') renderProductos();
    if(tabId === 'categorias') renderCategorias();
    if(tabId === 'banners') renderBanners();
    if(tabId === 'leads') renderLeads();
};

// ================= CARGA MASIVA CSV =================
window.subirProductosCSV = async function(event) {
    const fileInput = event.target;
    if (!fileInput.files.length) return;

    // ----- INDICADOR VISUAL DE CARGA -----
    const dropZone = document.getElementById('csv-drop-zone');
    if (dropZone) {
        dropZone.innerHTML = '<i data-lucide="loader"></i> Procesando archivo...';
        dropZone.style.pointerEvents = 'none'; // Evitar doble clic
        dropZone.style.opacity = '0.6';
        dropZone.style.background = '#f8fafc';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    // -------------------------------------

    const formData = new FormData();
    formData.append('archivo_csv', fileInput.files[0]);

    showNotification('Importando CSV... Por favor, no cierres la ventana.', false);

    try {
        const response = await fetch('includes/api/importar_csv.php', {
            method: 'POST',
            body: formData
        });
        
        // Convertimos el texto crudo primero por si PHP devuelve algún error extraño
        const textoPHP = await response.text();
        const result = JSON.parse(textoPHP);

        if (result.status === 'success') {
            showNotification(result.msg);
            await refrescarSoloProductos(); // Recarga la tabla para mostrar los nuevos
        } else {
            showNotification('Error: ' + result.msg, true);
        }
    } catch (error) {
        console.error(error);
        showNotification('Error de conexión o formato al subir el CSV', true);
    } finally {
        fileInput.value = ''; // Limpia el input
        
        // ----- RESTAURAR BOTÓN A SU ESTADO ORIGINAL -----
        if (dropZone) {
            dropZone.innerHTML = '<i data-lucide="upload-cloud"></i> Arrastra tu CSV o haz clic';
            dropZone.style.pointerEvents = 'auto';
            dropZone.style.opacity = '1';
            dropZone.style.background = 'white';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        // ------------------------------------------------
    }
};

// ================= INICIADOR =================
document.addEventListener('DOMContentLoaded', inicializarAdmin);