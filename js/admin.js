/* ============================================================
   admin.js — Motor Lógico Completo y Modales Dinámicos
   ============================================================ */

// ================= DATOS SIMULADOS =================
let productosDB = [
    { id: 1, sku: 'QN55Q6FA', nombre: 'TV Samsung 55" QLED 4K', categoria: 'Televisores', marca: 'Samsung', regular: 2299, oferta: 1499, stock: 15, estado: 1 },
    { id: 2, sku: 'WT16BVTB', nombre: 'Lavadora LG 16KG', categoria: 'Lavadoras', marca: 'LG', regular: 2015, oferta: 1399, stock: 8, estado: 1 },
    { id: 3, sku: 'HYSA102K', nombre: 'Lavadora Hyundai 10KG', categoria: 'Lavadoras', marca: 'Hyundai', regular: 799, oferta: 599, stock: 0, estado: 0 }
];
let categoriasDB = [{ id: 1, nombre: 'Televisores', total_productos: 45, estado: 1 }, { id: 2, nombre: 'Lavadoras', total_productos: 32, estado: 1 }];
let marcasDB = [{ id: 1, nombre: 'Samsung', total_productos: 60 }, { id: 2, nombre: 'LG', total_productos: 45 }];
let bannersDB = [{ id: 1, nombre: 'Cyber Days Mayo', imagen: 'cyber_banner.jpg', orden: 1, estado: 1 }, { id: 2, nombre: 'Oferta Televisores', imagen: 'tv_promo.webp', orden: 2, estado: 1 }];
let leadsDB = [
    { id: 'L-1042', cliente: 'Carlos Mendoza', telefono: '987654321', fecha: '13 Mar 2026', detalles: [{ prod: 'TV Samsung', cant: 1, precio: 1499 }, { prod: 'Soporte', cant: 1, precio: 150 }] },
    { id: 'L-1041', cliente: 'Ana Lucía Torres', telefono: '912345678', fecha: '12 Mar 2026', detalles: [{ prod: 'Lavadora LG', cant: 1, precio: 1399 }] }
];
let visitasData = [{ dia: 'Lun', visitas: 120 }, { dia: 'Mar', visitas: 250 }, { dia: 'Mié', visitas: 180 }, { dia: 'Jue', visitas: 300 }, { dia: 'Vie', visitas: 450 }, { dia: 'Sáb', visitas: 520 }, { dia: 'Dom', visitas: 380 }];

const formatearMoneda = (monto) => `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const showNotification = (msg) => {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
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
    lucide.createIcons();
};

const closeModal = () => document.getElementById('modal-container').classList.add('hidden');
const handleSave = (msg) => { closeModal(); showNotification(msg); };

// ================= PLANTILLAS EXACTAS DE LOS MODALES =================

function abrirModalProducto() {
    const titulo = `<i data-lucide="package" style="color: #2563eb;"></i> Registrar Nuevo Producto`;
    const contenido = `
        <div class="grid-2" style="gap: 32px; align-items: start;">
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div><label class="form-label">Nombre del Producto</label><input type="text" class="form-input" placeholder="Ej: TV Samsung 55..."></div>
                <div class="grid-2" style="gap: 16px;">
                    <div><label class="form-label">SKU (Código único)</label><input type="text" class="form-input" placeholder="Ej: QN55Q6F..." style="font-family: monospace;"></div>
                    <div><label class="form-label">Categoría</label><select class="form-input" style="cursor:pointer;"><option>Televisores</option><option>Lavadoras</option></select></div>
                </div>
                <div class="grid-2" style="gap: 16px;">
                    <div><label class="form-label">Marca</label><select class="form-input" style="cursor:pointer;"><option>Samsung</option><option>LG</option></select></div>
                    <div>
                        <label class="form-label">Stock</label>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="number" class="form-input" value="0">
                            <span style="color:#64748b; font-size:14px; font-weight:500;">un.</span>
                        </div>
                    </div>
                </div>
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label class="form-label" style="color: #475569; font-weight:normal;">Precio Regular (Sin dcto)</label>
                        <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                            <span style="color:#64748b;">S/</span><input type="number" class="form-input" placeholder="0.00" style="background:white;">
                        </div>
                    </div>
                    <div>
                        <label class="form-label" style="color: #1d4ed8; font-weight:bold;">Precio Oferta (Venta final)</label>
                        <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                            <span style="color:#1d4ed8; font-weight:bold;">S/</span><input type="number" class="form-input" placeholder="0.00" style="background:white; font-weight:bold; border-color:#bfdbfe;">
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <div>
                    <label class="form-label">Imagen del Producto</label>
                    <div class="upload-box" style="padding: 40px 16px;">
                        <i data-lucide="cloud-upload" style="color: #2563eb; width: 28px; height: 28px; margin-bottom: 12px;"></i>
                        <span style="color: #64748b; font-weight: 500;">Subir imagen principal</span>
                        <span style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Tabla: galeria_imagenes</span>
                    </div>
                </div>
                <div style="background: var(--bg-gray); border: 1px solid var(--border); border-radius: 12px; padding: 24px;">
                    <h3 style="font-weight:bold; color:var(--dark); margin-bottom:8px; font-size:16px;">Filtros / Especificaciones</h3>
                    <p style="font-size:13px; color:#64748b; margin-bottom:20px; line-height:1.4;">Añade características aquí para generar los filtros automáticamente.</p>
                    
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <div style="display:flex; gap:12px; align-items:center;">
                            <input type="text" class="form-input" value="Pulgadas" style="font-weight:bold; width:35%;">
                            <input type="text" class="form-input" value="55" style="width:50%;">
                            <button class="btn-icon"><i data-lucide="flag" style="width:18px;"></i></button>
                        </div>
                        <div style="display:flex; gap:12px; align-items:center;">
                            <input type="text" class="form-input" value="Resolución" style="font-weight:bold; width:35%;">
                            <input type="text" class="form-input" value="4K UHD" style="width:50%;">
                            <button class="btn-icon"><i data-lucide="flag" style="width:18px;"></i></button>
                        </div>
                        <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                            <input type="text" class="form-input" placeholder="Atributo (Ej: Color)" style="width:35%;">
                            <input type="text" class="form-input" placeholder="Valor (Ej: Gris)" style="width:50%;">
                            <button class="btn-primary" style="padding: 10px; border-radius: 8px;"><i data-lucide="plus" style="width:18px; margin:0;"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    const footer = `
        <button onclick="closeModal()" class="btn-outline">Cancelar</button>
        <button onclick="handleSave('Producto guardado exitosamente')" class="btn-primary">Guardar en MySQL</button>
    `;
    openModal(titulo, contenido, footer, 'modal-lg');
}

function abrirModalBanner() {
    const titulo = `<i data-lucide="monitor-play" style="color: #2563eb;"></i> Nuevo Banner`;
    const contenido = `
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div><label class="form-label">Título interno</label><input type="text" class="form-input" placeholder="Ej: Campaña Día de la Madre"></div>
            <div>
                <label class="form-label">Imagen (1920x600px)</label>
                <div class="upload-box" style="padding: 40px 20px;">
                    <i data-lucide="cloud-upload" style="color: #2563eb; width: 28px; height: 28px; margin-bottom: 12px;"></i>
                    <span style="color: #64748b; font-weight: 500;">Seleccionar archivo .jpg / .webp</span>
                </div>
            </div>
            <div><label class="form-label">Orden de aparición</label><input type="number" class="form-input" value="1"></div>
        </div>
    `;
    const footer = `<button onclick="closeModal()" class="btn-outline">Cancelar</button><button onclick="handleSave('Banner publicado')" class="btn-primary">Publicar</button>`;
    openModal(titulo, contenido, footer, 'modal-md');
}

function verDetalleLead(id) {
    const lead = leadsDB.find(l => l.id === id);
    const total = lead.detalles.reduce((acc, curr) => acc + (curr.cant * curr.precio), 0);
    let itemsHtml = lead.detalles.map(d => `<li style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px;"><span>${d.cant}x ${d.prod}</span><span style="font-weight:bold;">${formatearMoneda(d.precio * d.cant)}</span></li>`).join('');
    
    const titulo = `<i data-lucide="message-circle" style="color: #10b981;"></i> Consulta de WhatsApp`;
    const contenido = `
        <div style="background:#eff6ff; padding:16px; border-radius:12px; color:#1e40af; font-size:14px; margin-bottom:20px;">Interés del cliente: <strong>${lead.cliente}</strong></div>
        <ul style="border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:16px 0; margin-bottom:16px;">${itemsHtml}</ul>
        <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold;"><span>Total:</span><span style="color:#2563eb;">${formatearMoneda(total)}</span></div>
    `;
    const footer = `<button onclick="closeModal()" class="btn-dark" style="width:100%;">Cerrar</button>`;
    openModal(titulo, contenido, footer, 'modal-md');
}

// ================= CRUD Y VISTAS =================
const toggleEstado = (id, db, renderFn) => { const item = db.find(i => i.id === id); if(item) { item.estado = item.estado === 1 ? 0 : 1; renderFn(); } };
const eliminarItem = (id, dbArray, renderFn) => { if(confirm('¿Seguro que deseas eliminar?')) { dbArray.splice(dbArray.findIndex(i => i.id === id), 1); renderFn(); showNotification('Eliminado'); } };

const mainContent = document.getElementById('main-content');

const renderDashboard = () => {
    const max = Math.max(...visitasData.map(d => d.visitas));
    const barras = visitasData.map(d => `<div style="display:flex;flex-direction:column;align-items:center;width:100%;"><div style="font-size:12px;color:#64748b;margin-bottom:8px;">${d.visitas}</div><div style="width:100%;max-width:40px;background:#dbeafe;border-radius:4px 4px 0 0;height:${(d.visitas/max)*100}%;transition:0.3s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#dbeafe'"></div><span style="font-size:12px;color:#64748b;margin-top:8px;">${d.dia}</span></div>`).join('');
    mainContent.innerHTML = `<div class="fade-in"><h2 class="section-title">Rendimiento</h2><div class="grid-4"><div class="card"><div style="width:40px;height:40px;background:#3B82F6;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><i data-lucide="activity"></i></div><p style="color:#64748b;font-size:14px;">Visitas</p><p style="font-size:24px;font-weight:bold;">12,450</p></div><div class="card"><div style="width:40px;height:40px;background:#10B981;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><i data-lucide="message-circle"></i></div><p style="color:#64748b;font-size:14px;">Leads</p><p style="font-size:24px;font-weight:bold;">145</p></div><div class="card"><div style="width:40px;height:40px;background:#8B5CF6;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><i data-lucide="package"></i></div><p style="color:#64748b;font-size:14px;">Productos</p><p style="font-size:24px;font-weight:bold;">${productosDB.length}</p></div><div class="card"><div style="width:40px;height:40px;background:#a855f7;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><i data-lucide="layers"></i></div><p style="color:#64748b;font-size:14px;">Estructura</p><p style="font-size:24px;font-weight:bold;">${categoriasDB.length} / ${marcasDB.length}</p></div></div><div class="card"><h3 style="font-weight:bold;margin-bottom:24px;">Tráfico semanal</h3><div style="height:200px;display:flex;align-items:flex-end;gap:16px;">${barras}</div></div></div>`;
    lucide.createIcons();
};

const renderProductos = () => {
    const filas = productosDB.map(p => `<tr><td><p style="font-weight:600;">${p.nombre}</p><p style="font-size:12px;color:#94a3b8;">SKU: ${p.sku}</p></td><td><div style="color:#2563eb;font-weight:bold;">${formatearMoneda(p.oferta)}</div><div style="font-size:12px;text-decoration:line-through;color:#94a3b8;">${formatearMoneda(p.regular)}</div></td><td style="text-align:center;">${p.stock}</td><td><button onclick="toggleEstado(${p.id}, productosDB, renderProductos)" class="${p.estado ? 'badge-visible' : 'badge-oculto'}">${p.estado ? 'Visible':'Oculto'}</button></td><td style="text-align:center;"><button onclick="abrirModalProducto()" class="btn-icon"><i data-lucide="edit" style="width:18px;"></i></button><button onclick="eliminarItem(${p.id}, productosDB, renderProductos)" class="btn-icon danger"><i data-lucide="trash-2" style="width:18px;"></i></button></td></tr>`).join('');
    mainContent.innerHTML = `<div class="fade-in"><div class="flex-between"><h2 class="section-title" style="margin:0;">Catálogo</h2><button onclick="abrirModalProducto()" class="btn-primary"><i data-lucide="plus"></i> Nuevo Producto</button></div><div class="table-container"><table class="table"><thead><tr><th>Producto</th><th>Precios</th><th style="text-align:center;">Stock</th><th>Estado</th><th style="text-align:center;">Acciones</th></tr></thead><tbody>${filas}</tbody></table></div></div>`;
    lucide.createIcons();
};

const renderCategorias = () => {
    const tCat = categoriasDB.map(c => `<tr><td style="font-weight:600;">${c.nombre}</td><td><button onclick="toggleEstado(${c.id}, categoriasDB, renderCategorias)" class="${c.estado ? 'badge-visible' : 'badge-oculto'}">${c.estado ? 'Activa':'Oculta'}</button></td><td style="text-align:right;"><button onclick="eliminarItem(${c.id}, categoriasDB, renderCategorias)" class="btn-icon danger"><i data-lucide="trash-2" style="width:16px;"></i></button></td></tr>`).join('');
    const tMar = marcasDB.map(m => `<tr><td style="font-weight:600;">${m.nombre}</td><td style="font-size:13px;color:#64748b;">${m.total_productos} prods</td><td style="text-align:right;"><button onclick="eliminarItem(${m.id}, marcasDB, renderCategorias)" class="btn-icon danger"><i data-lucide="trash-2" style="width:16px;"></i></button></td></tr>`).join('');
    mainContent.innerHTML = `<div class="fade-in"><div class="flex-between"><h2 class="section-title" style="margin:0;">Tienda</h2><div style="display:flex; gap:8px;"><button onclick="openModal('Nueva Marca', '<label class=\\'form-label\\'>Marca</label><input type=\\'text\\' class=\\'form-input\\'>', '<button onclick=\\'closeModal()\\' class=\\'btn-outline\\'>Cancelar</button><button onclick=\\'handleSave(\\'Guardado\\')\\' class=\\'btn-primary\\'>Guardar</button>')" class="btn-outline">+ Marca</button><button onclick="openModal('Nueva Categoría', '<label class=\\'form-label\\'>Categoría</label><input type=\\'text\\' class=\\'form-input\\'>', '<button onclick=\\'closeModal()\\' class=\\'btn-outline\\'>Cancelar</button><button onclick=\\'handleSave(\\'Guardado\\')\\' class=\\'btn-primary\\'>Guardar</button>')" class="btn-primary">+ Categoría</button></div></div><div class="grid-2"><div class="table-container"><div class="card-header"><i data-lucide="layers"></i> Categorías</div><table class="table"><tbody>${tCat}</tbody></table></div><div class="table-container"><div class="card-header"><i data-lucide="tags"></i> Marcas</div><table class="table"><tbody>${tMar}</tbody></table></div></div></div>`;
    lucide.createIcons();
};

const renderBanners = () => {
    const cards = bannersDB.map(b => `<div style="background:white;border:1px solid var(--border);border-radius:12px;padding:16px;"><div style="background:#f1f5f9;height:140px;border-radius:8px;border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#94a3b8;margin-bottom:16px;"><i data-lucide="image"></i><span style="font-size:12px;margin-top:8px;">${b.imagen}</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><div><p style="font-weight:bold;font-size:14px;">${b.nombre}</p><p style="font-size:12px;color:#64748b;">Orden: ${b.orden}</p></div><div style="display:flex;gap:4px;"><button onclick="toggleEstado(${b.id}, bannersDB, renderBanners)" class="${b.estado ? 'badge-visible' : 'badge-oculto'}">${b.estado ? 'Visible':'Oculto'}</button><button onclick="eliminarItem(${b.id}, bannersDB, renderBanners)" class="btn-icon danger"><i data-lucide="trash-2"></i></button></div></div></div>`).join('');
    mainContent.innerHTML = `<div class="fade-in"><div class="flex-between"><h2 class="section-title" style="margin:0;">Banners</h2><button onclick="abrirModalBanner()" class="btn-primary"><i data-lucide="plus"></i> Subir Banner</button></div><div class="grid-2">${cards}</div></div>`;
    lucide.createIcons();
};

const renderLeads = () => {
    const filas = leadsDB.map(l => `<tr><td style="font-family:monospace;font-size:13px;color:#64748b;">${l.id}</td><td><p style="font-weight:bold;">${l.cliente}</p><p style="font-size:12px;color:#16a34a;"><i data-lucide="phone" style="width:12px;display:inline-block;"></i> ${l.telefono}</p></td><td style="font-size:13px;color:#475569;">${l.fecha}</td><td style="text-align:center;"><button onclick="verDetalleLead('${l.id}')" style="background:#eff6ff;color:#1d4ed8;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;"><i data-lucide="eye" style="width:14px;vertical-align:middle;"></i> Ver Interés</button></td></tr>`).join('');
    mainContent.innerHTML = `<div class="fade-in"><h2 class="section-title" style="margin-bottom:24px;">Leads WhatsApp</h2><div class="table-container"><table class="table"><thead><tr><th>ID</th><th>Cliente</th><th>Fecha</th><th style="text-align:center;">Acciones</th></tr></thead><tbody>${filas}</tbody></table></div></div>`;
    lucide.createIcons();
};

const switchTab = (tabId) => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'productos') renderProductos();
    if(tabId === 'categorias') renderCategorias();
    if(tabId === 'banners') renderBanners();
    if(tabId === 'leads') renderLeads();
};

document.addEventListener('DOMContentLoaded', () => { renderDashboard(); });


// Función para cargar productos desde la API PHP
async function cargarProductos() {
    const response = await fetch('includes/api/listar_productos.php');
    const result = await response.json();

    if(result.status === 'success') {
        const tabla = document.getElementById('tabla-productos-body');
        tabla.innerHTML = ''; // Limpiar tabla
        
        result.data.forEach(prod => {
            tabla.innerHTML += `
                <tr>
                    <td>${prod.sku}</td>
                    <td>${prod.nombre}</td>
                    <td>${prod.categoria}</td>
                    <td>S/ ${prod.precio_regular}</td>
                    <td>${prod.stock}</td>
                    <td>
                        <button onclick="editar(${prod.id_producto})">Edit</button>
                    </td>
                </tr>
            `;
        });
    }
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);