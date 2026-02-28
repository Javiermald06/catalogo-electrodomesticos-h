/* ============================================================
   productos.js — Base de datos de productos ElectroHogar Tacna
   
   Estructura de cada producto:
   {
     id:        (string)  identificador único
     nombre:    (string)  nombre del producto
     marca:     (string)  marca
     precio:    (number)  precio actual en S/
     precioAntes:(number|null) precio anterior (null si no hay descuento)
     badge:     (string)  'new' | 'sale' | '' 
     badgeText: (string)  texto del badge ej: '-25%' | 'Nuevo' | ''
     emoji:     (string)  emoji representativo (reemplazar por img cuando tengas fotos)
     img:       (string)  ruta relativa a /assets/img/  (vacío = usa emoji)
     categoria: (string)  id de la sección a la que pertenece
     enOferta:  (boolean) true = aparece también en el carrusel de Ofertas del Día
   }
   ============================================================ */

const PRODUCTOS = [

  /* ── LAVADORAS ─────────────────────────────────────── */
  {
    id: 'lav-001',
    nombre: 'Lavadora EcoBubble 8.5kg WW85T',
    marca: 'Samsung',
    precio: 1450,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '🫧',
    img: 'linea-blanca/lavadora-samsung-ww85t.webp',
    categoria: 'lavadoras',
    enOferta: false
  },
  {
    id: 'lav-002',
    nombre: 'Lavadora AI DD 9kg F4WV3009S3W',
    marca: 'LG',
    precio: 1290,
    precioAntes: 1599,
    badge: 'sale', badgeText: '-20%',
    emoji: '🫧',
    img: 'linea-blanca/lavadora-lg-f4wv.webp',
    categoria: 'lavadoras',
    enOferta: true
  },
  {
    id: 'lav-003',
    nombre: 'Lavadora Carga Superior 17kg',
    marca: 'Whirlpool',
    precio: 980,
    precioAntes: 1199,
    badge: 'sale', badgeText: '-18%',
    emoji: '🫧',
    img: 'linea-blanca/lavadora-whirlpool-17kg.webp',
    categoria: 'lavadoras',
    enOferta: false
  },
  {
    id: 'lav-004',
    nombre: 'Secadora Serie 6 9kg WTW85231EE',
    marca: 'Bosch',
    precio: 2290,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🫧',
    img: 'linea-blanca/secadora-bosch-serie6.webp',
    categoria: 'lavadoras',
    enOferta: false
  },

  /* ── SMART TVs ──────────────────────────────────────── */
  {
    id: 'tv-001',
    nombre: 'Crystal UHD 55" 4K TU8000',
    marca: 'Samsung',
    precio: 1899,
    precioAntes: 2499,
    badge: 'sale', badgeText: '-25%',
    emoji: '🖥️',
    img: 'tecnologia/tv-samsung-tu8000-55.webp',
    categoria: 'tvs',
    enOferta: true
  },
  {
    id: 'tv-002',
    nombre: 'OLED evo 65" C3 Serie 2024',
    marca: 'LG',
    precio: 5990,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '📺',
    img: 'tecnologia/tv-lg-oled-c3-65.webp',
    categoria: 'tvs',
    enOferta: false
  },
  {
    id: 'tv-003',
    nombre: 'BRAVIA XR 55" X90L Full Array LED',
    marca: 'Sony',
    precio: 3490,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🖥️',
    img: 'tecnologia/tv-sony-bravia-x90l.webp',
    categoria: 'tvs',
    enOferta: false
  },
  {
    id: 'tv-004',
    nombre: 'Smart TV QLED 50" C635 Google TV',
    marca: 'TCL',
    precio: 1299,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '📺',
    img: 'tecnologia/tv-tcl-qled-c635.webp',
    categoria: 'tvs',
    enOferta: false
  },

  /* ── BAÑO ───────────────────────────────────────────── */
  {
    id: 'ban-001',
    nombre: 'Calentador Eléctrico 15L RE-15P',
    marca: 'Rheem',
    precio: 450,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🚿',
    img: 'pequenos-electro/calentador-rheem-15l.webp',
    categoria: 'bano',
    enOferta: false
  },
  {
    id: 'ban-002',
    nombre: 'Ducha Eléctrica Advanced 7500W',
    marca: 'Lorenzetti',
    precio: 189,
    precioAntes: 210,
    badge: 'sale', badgeText: '-10%',
    emoji: '🛁',
    img: 'pequenos-electro/ducha-lorenzetti-7500w.webp',
    categoria: 'bano',
    enOferta: false
  },
  {
    id: 'ban-003',
    nombre: 'Termo Eléctrico 80L ES 080-5',
    marca: 'Bosch',
    precio: 890,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🚿',
    img: 'pequenos-electro/termo-bosch-80l.webp',
    categoria: 'bano',
    enOferta: false
  },
  {
    id: 'ban-004',
    nombre: 'Secador de Cabello Pro 2300W',
    marca: 'Philips',
    precio: 165,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '💨',
    img: 'pequenos-electro/secador-philips-2300w.webp',
    categoria: 'bano',
    enOferta: false
  },

  /* ── COCINA ─────────────────────────────────────────── */
  {
    id: 'coc-001',
    nombre: 'Cocina a Gas 5 Hornillas TSSTTVDFL2',
    marca: 'Oster',
    precio: 649,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '🍳',
    img: 'linea-blanca/cocina-oster-5hornillas.webp',
    categoria: 'cocina',
    enOferta: true
  },
  {
    id: 'coc-002',
    nombre: 'Microondas 20L con Grill MEG720',
    marca: 'Midea',
    precio: 299,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🥗',
    img: 'pequenos-electro/microondas-midea-20l.webp',
    categoria: 'cocina',
    enOferta: false
  },
  {
    id: 'coc-003',
    nombre: 'Horno Eléctrico Empotrable 60cm',
    marca: 'Whirlpool',
    precio: 1190,
    precioAntes: 1529,
    badge: 'sale', badgeText: '-22%',
    emoji: '🫕',
    img: 'linea-blanca/horno-whirlpool-60cm.webp',
    categoria: 'cocina',
    enOferta: false
  },
  {
    id: 'coc-004',
    nombre: 'Cafetera Espresso Prima Latte 15 Bar',
    marca: 'Oster',
    precio: 345,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '☕',
    img: 'pequenos-electro/cafetera-oster-primalatte.webp',
    categoria: 'cocina',
    enOferta: false
  },

  /* ── REFRIGERADORAS ─────────────────────────────────── */
  {
    id: 'ref-001',
    nombre: 'Refrigeradora No Frost 450L KGN56AIE0N',
    marca: 'Bosch',
    precio: 2150,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '❄️',
    img: 'linea-blanca/refri-bosch-450l.webp',
    categoria: 'refrigeradoras',
    enOferta: true
  },
  {
    id: 'ref-002',
    nombre: 'Side by Side 617L RS64T5F01B4',
    marca: 'Samsung',
    precio: 4299,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🧊',
    img: 'linea-blanca/refri-samsung-sbs-617l.webp',
    categoria: 'refrigeradoras',
    enOferta: false
  },
  {
    id: 'ref-003',
    nombre: 'French Door 679L LRFXS2503S',
    marca: 'LG',
    precio: 3890,
    precioAntes: 4420,
    badge: 'sale', badgeText: '-12%',
    emoji: '❄️',
    img: 'linea-blanca/refri-lg-frenchdoor.webp',
    categoria: 'refrigeradoras',
    enOferta: false
  },
  {
    id: 'ref-004',
    nombre: 'Refrigeradora 248L MDRB379FGF50',
    marca: 'Midea',
    precio: 1099,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🧊',
    img: 'linea-blanca/refri-midea-248l.webp',
    categoria: 'refrigeradoras',
    enOferta: false
  },

  /* ── AUDIO ──────────────────────────────────────────── */
  {
    id: 'aud-001',
    nombre: 'Soundbar HT-S400 2.1 con Subwoofer',
    marca: 'Sony',
    precio: 899,
    precioAntes: 1059,
    badge: 'sale', badgeText: '-15%',
    emoji: '🎧',
    img: 'tecnologia/soundbar-sony-hts400.webp',
    categoria: 'audio',
    enOferta: true
  },
  {
    id: 'aud-002',
    nombre: 'Parlante Bluetooth Xtreme 3 Portátil',
    marca: 'JBL',
    precio: 699,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🔊',
    img: 'tecnologia/parlante-jbl-xtreme3.webp',
    categoria: 'audio',
    enOferta: false
  },
  {
    id: 'aud-003',
    nombre: 'Soundbar Q600B 3.1.2 Dolby Atmos',
    marca: 'Samsung',
    precio: 1590,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '🎵',
    img: 'tecnologia/soundbar-samsung-q600b.webp',
    categoria: 'audio',
    enOferta: false
  },
  {
    id: 'aud-004',
    nombre: 'Audífonos WH-1000XM5 Noise Canceling',
    marca: 'Sony',
    precio: 1299,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🎧',
    img: 'tecnologia/audifonos-sony-xm5.webp',
    categoria: 'audio',
    enOferta: false
  },

  /* ── ASPIRADORAS ────────────────────────────────────── */
  {
    id: 'asp-001',
    nombre: 'Roomba j7+ Robot Aspiradora',
    marca: 'iRobot',
    precio: 2890,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '🤖',
    img: 'pequenos-electro/aspiradora-irobot-j7.webp',
    categoria: 'aspiradoras',
    enOferta: false
  },
  {
    id: 'asp-002',
    nombre: 'V15 Detect Aspiradora Inalámbrica',
    marca: 'Dyson',
    precio: 3490,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🌀',
    img: 'pequenos-electro/aspiradora-dyson-v15.webp',
    categoria: 'aspiradoras',
    enOferta: false
  },
  {
    id: 'asp-003',
    nombre: 'Aspiradora Power Pro FC9352 2200W',
    marca: 'Philips',
    precio: 449,
    precioAntes: 499,
    badge: 'sale', badgeText: '-10%',
    emoji: '🌀',
    img: 'pequenos-electro/aspiradora-philips-fc9352.webp',
    categoria: 'aspiradoras',
    enOferta: false
  },
  {
    id: 'asp-004',
    nombre: 'Robot Vacuum Mop 2 Pro+',
    marca: 'Xiaomi',
    precio: 1199,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '🤖',
    img: 'pequenos-electro/aspiradora-xiaomi-mop2pro.webp',
    categoria: 'aspiradoras',
    enOferta: false
  },

  /* ── PLANCHAS ───────────────────────────────────────── */
  {
    id: 'pla-001',
    nombre: 'Plancha a Vapor Azur 8000 Series',
    marca: 'Philips',
    precio: 299,
    precioAntes: null,
    badge: 'new', badgeText: 'Nuevo',
    emoji: '👔',
    img: 'pequenos-electro/plancha-philips-azur8000.webp',
    categoria: 'plancha',
    enOferta: false
  },
  {
    id: 'pla-002',
    nombre: 'Centro de Planchado Compact Pro',
    marca: 'Tefal',
    precio: 599,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '💨',
    img: 'pequenos-electro/centro-tefal-compactpro.webp',
    categoria: 'plancha',
    enOferta: false
  },
  {
    id: 'pla-003',
    nombre: 'Plancha TDS4080 Vapor 3100W',
    marca: 'Bosch',
    precio: 349,
    precioAntes: 379,
    badge: 'sale', badgeText: '-8%',
    emoji: '👔',
    img: 'pequenos-electro/plancha-bosch-tds4080.webp',
    categoria: 'plancha',
    enOferta: false
  },
  {
    id: 'pla-004',
    nombre: 'Vaporizador Vertical GCSTBS6060',
    marca: 'Oster',
    precio: 199,
    precioAntes: null,
    badge: '', badgeText: '',
    emoji: '💨',
    img: 'pequenos-electro/vaporizador-oster-6060.webp',
    categoria: 'plancha',
    enOferta: false
  },

];

/* ── Función auxiliar: filtrar por categoría ── */
function getByCategoria(cat) {
  return PRODUCTOS.filter(p => p.categoria === cat);
}

/* ── Función auxiliar: filtrar ofertas del día ── */
function getOfertas() {
  return PRODUCTOS.filter(p => p.enOferta);
}
