/* ============================================================
   productos.js — Base de datos de productos ElectroHogar Tacna
   ============================================================ */

const PRODUCTOS = [
  /* ── LAVADORAS ─────────────────────────────────────── */
  {
    id: 'lav-001', nombre: 'Lavadora EcoBubble 8.5kg WW85T', marca: 'Samsung', precio: 1450, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '🫧', img: 'linea-blanca/lavadora-samsung-ww85t.webp', categoria: 'lavadoras', enOferta: false,
    especificaciones: ['📌 Tipo: Carga Frontal', '⚙️ Tecnología: EcoBubble (lavado en frío)', '📏 Capacidad: 8.5 kg', '🛡️ Garantía: 10 años en motor Digital Inverter']
  },
  {
    id: 'lav-002', nombre: 'Lavadora AI DD 9kg F4WV3009S3W', marca: 'LG', precio: 1290, precioAntes: 1599,
    badge: 'sale', badgeText: '-20%', emoji: '🫧', img: 'linea-blanca/lavadora-lg-f4wv.webp', categoria: 'lavadoras', enOferta: true,
    especificaciones: ['📌 Tipo: Carga Frontal', '🧠 Tecnología: Inteligencia Artificial AI DD', '📏 Capacidad: 9 kg', '🛡️ Garantía: 10 años en motor Direct Drive']
  },
  {
    id: 'lav-003', nombre: 'Lavadora Carga Superior 17kg', marca: 'Whirlpool', precio: 980, precioAntes: 1199,
    badge: 'sale', badgeText: '-18%', emoji: '🫧', img: 'linea-blanca/lavadora-whirlpool-17kg.webp', categoria: 'lavadoras', enOferta: false,
    especificaciones: ['📌 Tipo: Carga Superior', '⚙️ Panel: Digital Intuitivo', '📏 Capacidad: 17 kg', '🛡️ Garantía: 1 año de fábrica']
  },
  {
    id: 'lav-004', nombre: 'Secadora Serie 6 9kg WTW85231EE', marca: 'Bosch', precio: 2290, precioAntes: null,
    badge: '', badgeText: '', emoji: '🫧', img: 'linea-blanca/secadora-bosch-serie6.webp', categoria: 'lavadoras', enOferta: false,
    especificaciones: ['📌 Tipo: Secadora por bomba de calor', '⚙️ Tecnología: AutoDry', '📏 Capacidad: 9 kg', '⚡ Eficiencia: A++']
  },

  /* ── SMART TVs ──────────────────────────────────────── */
  {
    id: 'tv-001', nombre: 'Crystal UHD 55" 4K TU8000', marca: 'Samsung', precio: 1899, precioAntes: 2499,
    badge: 'sale', badgeText: '-25%', emoji: '🖥️', img: 'tecnologia/tv-samsung-tu8000-55.webp', categoria: 'tvs', enOferta: true,
    especificaciones: ['🖥️ Pantalla: 55 pulgadas LED', '📺 Resolución: 4K Ultra HD', '📱 Sistema: Tizen OS', '🔌 Conectividad: 3 HDMI, 2 USB, Bluetooth']
  },
  {
    id: 'tv-002', nombre: 'OLED evo 65" C3 Serie 2024', marca: 'LG', precio: 5990, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '📺', img: 'tecnologia/tv-lg-oled-c3-65.webp', categoria: 'tvs', enOferta: false,
    especificaciones: ['🖥️ Pantalla: 65 pulgadas OLED evo', '📺 Resolución: 4K Ultra HD a 120Hz', '🧠 Procesador: α9 Gen6 AI', '🎮 Gaming: G-Sync, FreeSync Premium']
  },
  {
    id: 'tv-003', nombre: 'BRAVIA XR 55" X90L Full Array LED', marca: 'Sony', precio: 3490, precioAntes: null,
    badge: '', badgeText: '', emoji: '🖥️', img: 'tecnologia/tv-sony-bravia-x90l.webp', categoria: 'tvs', enOferta: false,
    especificaciones: ['🖥️ Pantalla: 55 pulgadas Full Array LED', '🧠 Procesador: Cognitive Processor XR', '📱 Sistema: Google TV', '🔊 Audio: Acoustic Multi-Audio']
  },
  {
    id: 'tv-004', nombre: 'Smart TV QLED 50" C635 Google TV', marca: 'TCL', precio: 1299, precioAntes: null,
    badge: '', badgeText: '', emoji: '📺', img: 'tecnologia/tv-tcl-qled-c635.webp', categoria: 'tvs', enOferta: false,
    especificaciones: ['🖥️ Pantalla: 50 pulgadas QLED', '📺 Resolución: 4K HDR Pro', '📱 Sistema: Google TV Manos Libres', '🔊 Audio: Parlantes ONKYO']
  },

  /* ── BAÑO ───────────────────────────────────────────── */
  {
    id: 'ban-001', nombre: 'Calentador Eléctrico 15L RE-15P', marca: 'Rheem', precio: 450, precioAntes: null,
    badge: '', badgeText: '', emoji: '🚿', img: 'pequenos-electro/calentador-rheem-15l.webp', categoria: 'bano', enOferta: false,
    especificaciones: ['📌 Tipo: Calentador de agua eléctrico', '📏 Capacidad: 15 Litros', '🛡️ Tanque: Esmaltado de zafiro', '⚡ Potencia: 1500W']
  },
  {
    id: 'ban-002', nombre: 'Ducha Eléctrica Advanced 7500W', marca: 'Lorenzetti', precio: 189, precioAntes: 210,
    badge: 'sale', badgeText: '-10%', emoji: '🛁', img: 'pequenos-electro/ducha-lorenzetti-7500w.webp', categoria: 'bano', enOferta: false,
    especificaciones: ['📌 Tipo: Ducha multitemperatura', '⚡ Potencia Máxima: 7500W', '🌡️ Control: Comando electrónico gradual', '🚿 Esparcidor: Gran tamaño']
  },
  {
    id: 'ban-003', nombre: 'Termo Eléctrico 80L ES 080-5', marca: 'Bosch', precio: 890, precioAntes: null,
    badge: '', badgeText: '', emoji: '🚿', img: 'pequenos-electro/termo-bosch-80l.webp', categoria: 'bano', enOferta: false,
    especificaciones: ['📌 Tipo: Termo eléctrico de acumulación', '📏 Capacidad: 80 Litros', '🛡️ Recubrimiento: Vitrificado', '⚙️ Instalación: Vertical']
  },
  {
    id: 'ban-004', nombre: 'Secador de Cabello Pro 2300W', marca: 'Philips', precio: 165, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '💨', img: 'pequenos-electro/secador-philips-2300w.webp', categoria: 'bano', enOferta: false,
    especificaciones: ['📌 Tipo: Secador profesional', '⚡ Potencia: 2300W', '✨ Cuidado: Emisión de iones anti-frizz', '🌡️ Ajustes: 6 posiciones de velocidad/calor']
  },

  /* ── COCINA ─────────────────────────────────────────── */
  {
    id: 'coc-001', nombre: 'Cocina a Gas 5 Hornillas TSSTTVDFL2', marca: 'Oster', precio: 649, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '🍳', img: 'linea-blanca/cocina-oster-5hornillas.webp', categoria: 'cocina', enOferta: true,
    especificaciones: ['📌 Quemadores: 5 hornillas (1 de triple llama)', '🔥 Encendido: Eléctrico automático', '🍳 Parrillas: Hierro fundido', '🛡️ Material: Acero inoxidable']
  },
  {
    id: 'coc-002', nombre: 'Microondas 20L con Grill MEG720', marca: 'Midea', precio: 299, precioAntes: null,
    badge: '', badgeText: '', emoji: '🥗', img: 'pequenos-electro/microondas-midea-20l.webp', categoria: 'cocina', enOferta: false,
    especificaciones: ['📏 Capacidad: 20 Litros', '⚡ Potencia: 700W (Grill 1000W)', '🎛️ Panel: Digital', '🥩 Funciones: Descongelamiento por peso/tiempo']
  },
  {
    id: 'coc-003', nombre: 'Horno Eléctrico Empotrable 60cm', marca: 'Whirlpool', precio: 1190, precioAntes: 1529,
    badge: 'sale', badgeText: '-22%', emoji: '🫕', img: 'linea-blanca/horno-whirlpool-60cm.webp', categoria: 'cocina', enOferta: false,
    especificaciones: ['📌 Tipo: Empotrable', '📏 Tamaño: 60 cm', '🌡️ Temperatura Máx: 250°C', '⏱️ Timer: Con apagado automático']
  },
  {
    id: 'coc-004', nombre: 'Cafetera Espresso Prima Latte 15 Bar', marca: 'Oster', precio: 345, precioAntes: null,
    badge: '', badgeText: '', emoji: '☕', img: 'pequenos-electro/cafetera-oster-primalatte.webp', categoria: 'cocina', enOferta: false,
    especificaciones: ['📌 Tipo: Cafetera Espresso y Capuccino', '⚡ Presión: 15 Bares', '🥛 Depósito: Leche extraíble', '☕ Compatibilidad: Café molido y cápsulas']
  },

  /* ── REFRIGERADORAS ─────────────────────────────────── */
  {
    id: 'ref-001', nombre: 'Refrigeradora No Frost 450L', marca: 'Bosch', precio: 2150, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '❄️', img: 'linea-blanca/refri-bosch-450l.webp', categoria: 'refrigeradoras', enOferta: true,
    especificaciones: ['📌 Sistema: No Frost (Sin escarcha)', '📏 Capacidad: 450 Litros', '🧊 Compresor: Inverter', '🍎 Cajones: VitaFresh para frutas y verduras']
  },
  {
    id: 'ref-002', nombre: 'Side by Side 617L RS64T5F01B4', marca: 'Samsung', precio: 4299, precioAntes: null,
    badge: '', badgeText: '', emoji: '🧊', img: 'linea-blanca/refri-samsung-sbs-617l.webp', categoria: 'refrigeradoras', enOferta: false,
    especificaciones: ['📌 Diseño: Side by Side (2 puertas verticales)', '📏 Capacidad: 617 Litros', '📱 Pantalla: Family Hub inteligente', '🧊 Extras: Dispensador de agua y hielo']
  },
  {
    id: 'ref-003', nombre: 'French Door 679L LRFXS2503S', marca: 'LG', precio: 3890, precioAntes: 4420,
    badge: 'sale', badgeText: '-12%', emoji: '❄️', img: 'linea-blanca/refri-lg-frenchdoor.webp', categoria: 'refrigeradoras', enOferta: false,
    especificaciones: ['📌 Diseño: French Door (Puertas francesas)', '📏 Capacidad: 679 Litros', '⚙️ Tecnología: DoorCooling+ y LinearCooling', '💧 Filtro: Higiene Fresh+']
  },
  {
    id: 'ref-004', nombre: 'Refrigeradora 248L MDRB379FGF50', marca: 'Midea', precio: 1099, precioAntes: null,
    badge: '', badgeText: '', emoji: '🧊', img: 'linea-blanca/refri-midea-248l.webp', categoria: 'refrigeradoras', enOferta: false,
    especificaciones: ['📌 Sistema: Frío Directo', '📏 Capacidad: 248 Litros', '💡 Iluminación: LED interior', '🛡️ Garantía: 10 años en el compresor']
  },

  /* ── AUDIO ──────────────────────────────────────────── */
  {
    id: 'aud-001', nombre: 'Soundbar HT-S400 2.1', marca: 'Sony', precio: 899, precioAntes: 1059,
    badge: 'sale', badgeText: '-15%', emoji: '🎧', img: 'tecnologia/soundbar-sony-hts400.webp', categoria: 'audio', enOferta: true,
    especificaciones: ['🔊 Canales: 2.1 con subwoofer inalámbrico', '⚡ Potencia: 330W', '📺 Conexión: HDMI ARC y Bluetooth', '🎵 Sonido: S-Force PRO Front Surround']
  },
  {
    id: 'aud-002', nombre: 'Parlante Xtreme 3 Portátil', marca: 'JBL', precio: 699, precioAntes: null,
    badge: '', badgeText: '', emoji: '🔊', img: 'tecnologia/parlante-jbl-xtreme3.webp', categoria: 'audio', enOferta: false,
    especificaciones: ['🔊 Potencia: 2 x 25W RMS + 2 x 25W RMS', '🔋 Batería: Hasta 15 horas de reproducción', '💧 Resistencia: IP67 (agua y polvo)', '🔌 Conexión: Bluetooth 5.1']
  },
  {
    id: 'aud-003', nombre: 'Soundbar Q600B 3.1.2 Atmos', marca: 'Samsung', precio: 1590, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '🎵', img: 'tecnologia/soundbar-samsung-q600b.webp', categoria: 'audio', enOferta: false,
    especificaciones: ['🔊 Canales: 3.1.2', '🎵 Audio: Dolby Atmos y DTS:X', '🔗 Función: Q-Symphony (sincroniza con TV)', '🎮 Modo: Game Mode Pro']
  },
  {
    id: 'aud-004', nombre: 'Audífonos WH-1000XM5', marca: 'Sony', precio: 1299, precioAntes: null,
    badge: '', badgeText: '', emoji: '🎧', img: 'tecnologia/audifonos-sony-xm5.webp', categoria: 'audio', enOferta: false,
    especificaciones: ['🎧 Tipo: Over-Ear inalámbricos', '🤫 Cancelación de ruido: Líder en la industria (8 micrófonos)', '🔋 Batería: Hasta 30 horas', '🎙️ Llamadas: Calidad ultra nítida']
  },

  /* ── ASPIRADORAS ────────────────────────────────────── */
  {
    id: 'asp-001', nombre: 'Roomba j7+ Robot Aspiradora', marca: 'iRobot', precio: 2890, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '🤖', img: 'pequenos-electro/aspiradora-irobot-j7.webp', categoria: 'aspiradoras', enOferta: false,
    especificaciones: ['🤖 Tipo: Robot Aspirador Inteligente', '🗑️ Base: Autovaciado Clean Base (hasta 60 días)', '👀 Navegación: PrecisionVision (esquiva obstáculos)', '📱 Control: App iRobot Home']
  },
  {
    id: 'asp-002', nombre: 'V15 Detect Inalámbrica', marca: 'Dyson', precio: 3490, precioAntes: null,
    badge: '', badgeText: '', emoji: '🌀', img: 'pequenos-electro/aspiradora-dyson-v15.webp', categoria: 'aspiradoras', enOferta: false,
    especificaciones: ['🌀 Tipo: Aspiradora vertical inalámbrica', '🔦 Tecnología: Láser que revela polvo microscópico', '⚡ Potencia: 240 AW (ajuste automático)', '🔋 Batería: Hasta 60 minutos sin pérdida de poder']
  },
  {
    id: 'asp-003', nombre: 'Aspiradora Power Pro FC9352 2200W', marca: 'Philips', precio: 449, precioAntes: 499,
    badge: 'sale', badgeText: '-10%', emoji: '🌀', img: 'pequenos-electro/aspiradora-philips-fc9352.webp', categoria: 'aspiradoras', enOferta: false,
    especificaciones: ['🌀 Tipo: Trineo sin bolsa', '⚡ Potencia: 2200W (alta succión)', '🌪️ Tecnología: PowerCyclone 5', '🛡️ Filtro: Allergy H13']
  },
  {
    id: 'asp-004', nombre: 'Robot Vacuum Mop 2 Pro+', marca: 'Xiaomi', precio: 1199, precioAntes: null,
    badge: '', badgeText: '', emoji: '🤖', img: 'pequenos-electro/aspiradora-xiaomi-mop2pro.webp', categoria: 'aspiradoras', enOferta: false,
    especificaciones: ['🤖 Tipo: Robot aspirador y trapeador', '👀 Navegación: 3D VSLAM (evita obstáculos)', '🔋 Batería: 5200 mAh (hasta 3 horas)', '💧 Tanque: Agua con control electrónico']
  },

  /* ── PLANCHAS ───────────────────────────────────────── */
  {
    id: 'pla-001', nombre: 'Plancha a Vapor Azur 8000', marca: 'Philips', precio: 299, precioAntes: null,
    badge: 'new', badgeText: 'Nuevo', emoji: '👔', img: 'pequenos-electro/plancha-philips-azur8000.webp', categoria: 'plancha', enOferta: false,
    especificaciones: ['👔 Tipo: Plancha a vapor', '⚡ Potencia: 3000W para calentamiento rápido', '💨 Golpe de vapor: Hasta 240g', '🛡️ Suela: SteamGlide Elite']
  },
  {
    id: 'pla-002', nombre: 'Centro de Planchado Compact Pro', marca: 'Tefal', precio: 599, precioAntes: null,
    badge: '', badgeText: '', emoji: '💨', img: 'pequenos-electro/centro-tefal-compactpro.webp', categoria: 'plancha', enOferta: false,
    especificaciones: ['👔 Tipo: Centro de planchado', '⚡ Presión: 6 Bares', '📏 Depósito: 1.7 Litros', '✨ Suela: Durilium Airglide']
  },
  {
    id: 'pla-003', nombre: 'Plancha TDS4080 Vapor 3100W', marca: 'Bosch', precio: 349, precioAntes: 379,
    badge: 'sale', badgeText: '-8%', emoji: '👔', img: 'pequenos-electro/plancha-bosch-tds4080.webp', categoria: 'plancha', enOferta: false,
    especificaciones: ['👔 Tipo: Plancha de inyección de vapor', '⚡ Potencia: 3100W', '💨 Golpe de vapor: 230g', '⚙️ Tecnología: SensorSecure (se apaga al soltarla)']
  },
  {
    id: 'pla-004', nombre: 'Vaporizador Vertical GCSTBS6060', marca: 'Oster', precio: 199, precioAntes: null,
    badge: '', badgeText: '', emoji: '💨', img: 'pequenos-electro/vaporizador-oster-6060.webp', categoria: 'plancha', enOferta: false,
    especificaciones: ['👔 Tipo: Vaporizador de prendas vertical', '⏱️ Calentamiento: En 45 segundos', '📏 Tanque: Extraíble para fácil llenado', '🦠 Extras: Elimina bacterias y ácaros']
  }
];

function getByCategoria(cat) { return PRODUCTOS.filter(p => p.categoria === cat); }
function getOfertas() { return PRODUCTOS.filter(p => p.enOferta); }