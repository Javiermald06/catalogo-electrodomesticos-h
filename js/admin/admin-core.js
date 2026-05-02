/* ============================================================
   admin-core.js - Estado Global, Utilidades, Modales, Navegacion
   ============================================================ */

// ================= ESTADO GLOBAL =================
let state = {
    productos: [],
    categorias: [],
    marcas: [],
    banners: [],
    leads: [],
    stats: {
        visitas_hoy: 0,
        productos: 0,
        productos_ocultos: 0,
        categorias: 0,
        marcas: 0,
        leads: 0,
        grafico_categorias: [],
        visitas_semanales: []
    }
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
    try {
        // Cargar estadísticas
        const resStats = await fetch('includes/api/get_stats.php?t=' + Date.now());
        const dataStats = await resStats.json();
        if(dataStats.status === 'success') {
            state.stats = dataStats.data;
        }

        const apis = [
            { url: 'includes/api/listar_productos_admin.php', key: 'productos' },
            { url: 'includes/api/listar_categorias.php', key: 'categorias' },
            { url: 'includes/api/listar_marcas.php', key: 'marcas' },
            { url: 'includes/api/listar_banners.php', key: 'banners' }
        ];

        apis.forEach(api => {
            fetchCached(api.url, (data) => {
                if (data.status === 'success') {
                    state[api.key] = data.data || [];
                    const savedTab = localStorage.getItem('eh_admin_tab') || 'dashboard';
                    if (savedTab === api.key || savedTab === 'dashboard') {
                        switchTab(savedTab);
                    }
                }
            });
        });

        const savedTab = localStorage.getItem('eh_admin_tab') || 'dashboard';
        switchTab(savedTab);
    } catch(e) {
        console.error("Error al inicializar admin:", e);
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


const mainContent = document.getElementById('main-content');

function renderDashboard() {
    if(!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="fade-in">
            <h2 class="section-title">Resumen de Actividad</h2>
            
            <!-- TARJETAS DE MÉTRICAS -->
            <div class="grid-4" style="margin-bottom: 30px;">
                <div class="card" style="padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 4px solid #3B82F6;">
                    <div style="width:40px;height:40px;background:#eff6ff;color:#3B82F6;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                        <i data-lucide="users" style="width:20px;"></i>
                    </div>
                    <p style="color:#64748b;font-size:13px; font-weight:500; margin: 0;">Visitas de Hoy</p>
                    <p style="font-size:24px;font-weight:bold; margin: 6px 0 0 0; color:#1e293b;">${state.stats.visitas_hoy.toLocaleString()}</p>
                </div>

                <div class="card" onclick="switchTab('productos')" style="padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 4px solid #10B981; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="width:40px;height:40px;background:#ecfdf5;color:#10B981;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                        <i data-lucide="package" style="width:20px;"></i>
                    </div>
                    <p style="color:#64748b;font-size:13px; font-weight:500; margin: 0;">Total Productos</p>
                    <p style="font-size:24px;font-weight:bold; margin: 6px 0 0 0; color:#1e293b;">${state.stats.productos}</p>
                </div>

                <div class="card" onclick="switchTab('productos'); abrirProductosOcultos();" style="padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 4px solid #f43f5e; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="width:40px;height:40px;background:#fff1f2;color:#f43f5e;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                        <i data-lucide="eye-off" style="width:20px;"></i>
                    </div>
                    <p style="color:#64748b;font-size:13px; font-weight:500; margin: 0;">Productos Ocultos</p>
                    <p style="font-size:24px;font-weight:bold; margin: 6px 0 0 0; color:#1e293b;">${state.stats.productos_ocultos}</p>
                </div>

                <div class="card" onclick="switchTab('categorias')" style="padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 4px solid #f59e0b; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="width:40px;height:40px;background:#fffbeb;color:#f59e0b;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                        <i data-lucide="layers" style="width:20px;"></i>
                    </div>
                    <p style="color:#64748b;font-size:13px; font-weight:500; margin: 0;">Categorías</p>
                    <p style="font-size:24px;font-weight:bold; margin: 6px 0 0 0; color:#1e293b;">${state.stats.categorias}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start;">
                <!-- GRÁFICO DE VISITAS -->
                <div class="card" style="padding: 24px;">
                    <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #1e293b; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="trending-up" style="width:18px; color:#10B981;"></i> Tráfico Semanal
                    </h3>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartVisitas"></canvas>
                    </div>
                </div>

                <!-- GRÁFICO DE CATEGORÍAS -->
                <div class="card" style="padding: 24px;">
                    <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #1e293b; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="pie-chart" style="width:18px; color:#3B82F6;"></i> Inventario por Categoría
                    </h3>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartCategorias"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
    initCharts();
}

function initCharts() {
    // 1. Gráfico de Categorías (Doughnut)
    const ctxCat = document.getElementById('chartCategorias');
    if (ctxCat) {
        const labels = state.stats.grafico_categorias.map(i => i.nombre);
        const values = state.stats.grafico_categorias.map(i => i.cantidad);

        new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#3B82F6', '#10B981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16', '#6366f1', '#d946ef'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 10, padding: 10, font: { size: 10 } }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // 2. Gráfico de Visitas (Bar)
    const ctxVis = document.getElementById('chartVisitas');
    if (ctxVis) {
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // Formatear datos de la semana
        const labels = state.stats.visitas_semanales.map(i => {
            const date = new Date(i.fecha + 'T00:00:00');
            return diasSemana[date.getDay()];
        });
        const values = state.stats.visitas_semanales.map(i => i.cantidad);

        new Chart(ctxVis, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Visitas',
                    data: values,
                    backgroundColor: '#10B981',
                    borderRadius: 6,
                    barThickness: 25
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { size: 11 }, color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: '#94a3b8' }
                    }
                }
            }
        });
    }
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
document.addEventListener('DOMContentLoaded', () => {
    inicializarAdmin();
    // Actualizar estadísticas cada 30 segundos automáticamente
    setInterval(async () => {
        try {
            const resStats = await fetch('includes/api/get_stats.php?t=' + Date.now());
            const dataStats = await resStats.json();
            if(dataStats.status === 'success') {
                state.stats = dataStats.data;
                // Si estamos en el dashboard, refrescar la vista para mostrar nuevos números
                const tabActiva = document.querySelector('.nav-btn.active');
                if (tabActiva && tabActiva.id === 'tab-dashboard') {
                    renderDashboard();
                }
            }
        } catch(e) {}
    }, 30000);
});