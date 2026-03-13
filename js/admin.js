/* ============================================================
   admin.js — Lógica del Panel de Administración
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Actualizar KPI de total de productos
  document.getElementById('kpi-total').innerText = PRODUCTOS.length;

  // 2. Dibujar la tabla leyendo la base de datos
  renderizarTablaAdmin(PRODUCTOS);
});

function renderizarTablaAdmin(lista) {
  const tbody = document.getElementById('admin-table-body');
  let html = '';

  lista.forEach(prod => {
    html += `
      <tr>
        <td style="color: #94a3b8; font-size: 13px;">${prod.id}</td>
        <td style="font-weight: 500;">${prod.nombre}</td>
        <td><span class="admin-badge">${prod.marca}</span></td>
        <td style="text-transform: capitalize;">${prod.categoria}</td>
        <td style="font-weight: 700; color: var(--red);">S/ ${prod.precio.toLocaleString()}</td>
        <td>
          <div class="admin-actions">
            <button title="Editar">✏️</button>
            <button title="Ocultar">👁️‍🗨️</button>
            <button title="Eliminar" style="color: var(--red);">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Buscador interno del admin
function filtrarTablaAdmin(texto) {
  const termino = texto.toLowerCase().trim();
  const filtrados = PRODUCTOS.filter(p => 
    p.nombre.toLowerCase().includes(termino) || 
    p.marca.toLowerCase().includes(termino) ||
    p.id.toLowerCase().includes(termino)
  );
  renderizarTablaAdmin(filtrados);
}