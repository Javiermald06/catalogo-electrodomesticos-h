/* ============================================================
   admin-core.js - Estado Global, Utilidades, Modales, Navegacion
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
    // Usamos fetchCached para velocidad instantánea
    const apis = [
        { url: 'includes/api/listar_productos_admin.php', key: 'productos' },
        { url: 'includes/api/listar_categorias.php', key: 'categorias' },
        { url: 'includes/api/listar_marcas.php', key: 'marcas' },
        { url: 'includes/api/listar_banners.php', key: 'banners' }
    ];

    let apisCargadas = 0;

    apis.forEach(api => {
        fetchCached(api.url, (data) => {
            if (data.status === 'success') {
                state[api.key] = data.data || [];
                
                // Si estamos en la pestaña correspondiente, re-renderizamos
                const savedTab = localStorage.getItem('eh_admin_tab') || 'dashboard';
                if (savedTab === api.key || savedTab === 'dashboard') {
                    switchTab(savedTab);
                }
            }
        });
    });

    // Carga inicial (la primera vez que entra o si no hay caché)
    const savedTab = localStorage.getItem('eh_admin_tab') || 'dashboard';
    switchTab(savedTab);
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


const mainContent = document.getElementById('main-content');

function renderDashboard() {
    if(!mainContent) return;
    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Rendimiento General</h2>
            <div class="grid-4">
                <div class="card" style="padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="width:32px;height:32px;background:#3B82F6;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
                        <i data-lucide="package" style="width:16px;"></i>
                    </div>
                    <p style="color:#64748b;font-size:12px; margin: 0;">Productos</p>
                    <p style="font-size:20px;font-weight:bold; margin: 4px 0 0 0;">${state.productos.length}</p>
                </div>
                <div class="card" style="padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="width:32px;height:32px;background:#10B981;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
                        <i data-lucide="message-circle" style="width:16px;"></i>
                    </div>
                    <p style="color:#64748b;font-size:12px; margin: 0;">Leads</p>
                    <p style="font-size:20px;font-weight:bold; margin: 4px 0 0 0;">${state.leads.length}</p>
                </div>
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}


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
    
    // Guardar en localStorage
    localStorage.setItem('eh_admin_tab', tabId);
    
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