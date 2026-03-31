/* ============================================================
   productos.js — Ahora funciona como memoria temporal de la BD
   ============================================================ */
let PRODUCTOS = []; // Inicia vacío, se llenará con PHP

function getByCategoria(cat) { 
    // Compara ignorando mayúsculas/minúsculas para evitar errores
    return PRODUCTOS.filter(p => p.categoria && p.categoria.toLowerCase() === cat.toLowerCase()); 
}

function getOfertas() { 
    // Asumimos que si hay precio de oferta mayor a 0, está en oferta
    return PRODUCTOS.filter(p => p.precio_oferta > 0); 
}