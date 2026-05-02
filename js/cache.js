/* ============================================================
   cache.js — Utilidad para Caché del Lado del Cliente (SWR)
   ============================================================ */

/**
 * Realiza una petición con la estrategia Stale-While-Revalidate.
 * 1. Devuelve los datos en caché (sessionStorage) instantáneamente si existen.
 * 2. En segundo plano, realiza la petición real.
 * 3. Si la nueva respuesta difiere de la caché, actualiza la caché y ejecuta un callback.
 * 
 * @param {string} url - La URL de la API a consultar.
 * @param {function} onData - Callback que recibe la data (puede llamarse hasta 2 veces).
 */
window.fetchCached = async function(url, onData) {
    const cacheKey = 'eh_cache_' + btoa(url);
    const cachedData = sessionStorage.getItem(cacheKey);

    // 1. STALE: Si hay caché, la devolvemos inmediatamente para un renderizado a 0.001s
    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            onData(parsedData, true); // true = isCached
        } catch(e) {
            console.error("Error parseando caché", e);
        }
    }

    // 2. REVALIDATE: Hacemos la petición en segundo plano siempre
    try {
        const response = await fetch(url);
        const freshData = await response.json();
        
        const freshDataStr = JSON.stringify(freshData);
        
        // Solo si los datos nuevos son diferentes a la caché actualizamos y re-renderizamos
        if (cachedData !== freshDataStr) {
            sessionStorage.setItem(cacheKey, freshDataStr);
            onData(freshData, false); // false = isFresh
        }
    } catch(e) {
        console.error("Error en validación en segundo plano", e);
        // Si no había caché y falló el fetch, mandamos un error
        if (!cachedData) {
            onData({ status: 'error', msg: 'Error de red' }, false);
        }
    }
};
