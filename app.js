/* ============================================================
   CONFIGURACION — editar aqui
   ============================================================ */
const SHEET_ID = '1Ex3hT95Tm7pFK1Nxb6NfqrvUnioG8eM01Kc8_tGWDUs';
const TABS = [
  { name: 'TTL GT Team',     gid: '208593086'  },
  { name: 'TTL HIBRID Team', gid: '209884296'  },
  { name: 'TTL INT. Team',   gid: '1686497011' },
  { name: 'TTL TB Team',     gid: '2119050074' },
];
const csvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;

// Columnas (0-indexadas). A=0, B=1, D=3, G=6, O=14
const COL_BROKER  = 0;  // A
const COL_PENDING = 1;  // B (marcador "PENDING")
const COL_ORDEN   = 3;  // D
const COL_MONTO   = 6;  // G
const COL_FECHA   = 14; // O

const REFRESH_MS = 5 * 60 * 1000;
const PREMIOS_DAN_PUNTO_EXTRA = false; // activar a futuro: +1 al equipo del ganador de cada premio individual
const INDIVIDUAL_FLOOR = 100; // piso ficticio para quien no tiene promedio semestral

// Promedio semanal semestral POR BROKER (para el Camion de Oro y la meta personal
// semanal). Fuente: Mundial de Ventas - Promedios Ene-Jun 2026 (columna Semanal).
// Llenar aqui: 'NOMBRE EN MAYUSCULAS': monto
const INDIVIDUAL_AVG_SEMESTRAL = {
  // Equipo 1 - Francia
  'GABE MENDEZ': 1102.04,
  'EDDUAR GUDIEL': 883.49,
  'SAUL ESCOBAR': 593.23,
  'JOSE RUANO': 99.08,
  // Equipo 2 - Argentina
  'MARY GAYTAN': 1228.90,
  'ALEXIS GARCIA': 1228.73,
  'EDVIN PAREDES': 1013.75,
  'JOE AYALA': 392.33,
  'MARV LINARES': 179.63,
  // Equipo 3 - España
  'GUS MENDEZ': 4424.73,
  'OLIVER CENTENO': 1812.50,
  'BRYAN GUERRA': 393.58,
  'CHARLY MOLINA': 200.56,
  'JUAN DIAZ': 181.88,
  'PAUL BATS': 57.75,
  // Equipo 4 - Noruega
  'JOSE ROMERO': 1564.77,
  'NERY MENDEZ': 1110.73,
  'MARVIN GUARCHAJ': 938.92,
  'JONATHAN SUAZO': 293.75,
  'JAMES PENA': 291.58,
};

// Alias de nombres (variantes en el sheet -> nombre oficial en MAYUSCULAS)
const ALIAS_MAP = {
  'JOSEPH RUANO': 'JOSE RUANO',
  // 'DANNY': 'NOMBRE OFICIAL',
  // 'EDDU': 'NOMBRE OFICIAL',
};

const EXCLUDED_NAMES = ['KEVIN ROMERO', 'DANIEL VELASQUEZ'];

// start/end son solo para mostrar en pantalla. filterStart/filterEnd (si se
// definen) son los limites reales usados para clasificar ventas por fecha;
// null significa "sin limite" (Semana 1 tambien cuenta ventas de fechas
// anteriores, Semana 4 tambien cuenta ventas de fechas posteriores).
const WEEKS = [
  { id: 1, label: 'Semana 1', start: '2026-07-01', end: '2026-07-11', filterStart: null },
  { id: 2, label: 'Semana 2', start: '2026-07-12', end: '2026-07-19' },
  { id: 3, label: 'Semana 3', start: '2026-07-20', end: '2026-07-25' },
  { id: 4, label: 'Semana 4 · Finales', start: '2026-07-26', end: '2026-07-31', filterEnd: null },
];

const TEAMS = [
  {
    id: 1, name: 'Francia', flag: '🇫🇷', flagCode: 'FR', color: 'var(--fr)',
    baseReal: 2677.85, umbral: 2700,
    members: [
      { name: 'Saul Escobar' },
      { name: 'Andy Taracena' },
      { name: 'Karen Molina', staff: true },
      { name: 'Ale Noriega' },
      { name: 'Edduar Gudiel' },
      { name: 'Gabe Mendez' },
      { name: 'Jose Ruano', staff: true },
    ],
  },
  {
    id: 2, name: 'Argentina', flag: '🇦🇷', flagCode: 'AR', color: 'var(--ar)',
    baseReal: 4043.33, umbral: 4000,
    members: [
      { name: 'Mary Gaytan' },
      { name: 'Alexis Garcia' },
      { name: 'Will Patzan' },
      { name: 'Marv Linares' },
      { name: 'Isabel Ortiz', staff: true },
      { name: 'Edvin Paredes' },
      { name: 'Joe Ayala' },
    ],
  },
  {
    id: 3, name: 'España', flag: '🇪🇸', flagCode: 'ES', color: 'var(--es)',
    baseReal: 7071.00, umbral: 7000,
    members: [
      { name: 'Gus Mendez' },
      { name: 'Oliver Centeno' },
      { name: 'Juan Diaz' },
      { name: 'Paul Bats' },
      { name: 'Bryan Guerra' },
      { name: 'Charly Molina', staff: true },
      { name: 'Erwin Solorzano', staff: true },
    ],
  },
  {
    id: 4, name: 'Noruega', flag: '🇳🇴', flagCode: 'NO', color: 'var(--no)',
    baseReal: 4199.75, umbral: 4200,
    members: [
      { name: 'Marvin Guarchaj' },
      { name: 'Jose Romero' },
      { name: 'Nery Mendez' },
      { name: 'Jonathan Suazo' },
      { name: 'James Pena' },
      { name: 'David Molina', staff: true },
    ],
  },
];

// Cruces fijos de fase de grupos (semanas 1-3). Semana 4 se define por posiciones.
const FIXED_MATCHUPS = {
  1: [[1, 2], [3, 4]],
  2: [[1, 3], [2, 4]],
  3: [[1, 4], [2, 3]],
};

/* ============================================================
   BANDERAS (SVG inline) — evita el bug de Windows/Chromium que
   renderiza emoji de bandera como texto plano ("FR", "AR", ...)
   ============================================================ */
const FLAG_SVGS = {
  FR: `<svg viewBox="0 0 3 2" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1" height="2" x="0" fill="#0055A4"/>
    <rect width="1" height="2" x="1" fill="#FFFFFF"/>
    <rect width="1" height="2" x="2" fill="#EF4135"/>
  </svg>`,
  AR: `<svg viewBox="0 0 3 2" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="3" height="2" fill="#FFFFFF"/>
    <rect width="3" height="0.667" y="0" fill="#75AADB"/>
    <rect width="3" height="0.667" y="1.333" fill="#75AADB"/>
    <circle cx="1.5" cy="1" r="0.24" fill="#F6B40E" stroke="#85340A" stroke-width="0.02"/>
  </svg>`,
  ES: `<svg viewBox="0 0 3 2" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="3" height="2" fill="#AA151B"/>
    <rect width="3" height="1" y="0.5" fill="#F1BF00"/>
  </svg>`,
  NO: `<svg viewBox="0 0 22 16" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="22" height="16" fill="#EF2B2D"/>
    <rect x="6" width="4" height="16" fill="#FFFFFF"/>
    <rect y="6" width="22" height="4" fill="#FFFFFF"/>
    <rect x="7" width="2" height="16" fill="#002868"/>
    <rect y="7" width="22" height="2" fill="#002868"/>
  </svg>`,
};
function flagIcon(code, size) {
  const cls = size === 'big' ? 'flag-icon big' : 'flag-icon';
  return `<span class="${cls}">${FLAG_SVGS[code] || ''}</span>`;
}

/* ============================================================
   UTILIDADES
   ============================================================ */
const MONTHS_EN = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* ignore */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function parseMonto(raw) {
  if (raw == null) return 0;
  let s = String(raw).trim();
  if (!s) return 0;
  let negative = false;
  if (/^\(.*\)$/.test(s)) { negative = true; s = s.slice(1, -1); }
  s = s.replace(/[$,\s]/g, '');
  if (s.startsWith('-')) { negative = true; s = s.slice(1); }
  const n = parseFloat(s);
  if (isNaN(n)) return NaN;
  return negative ? -Math.abs(n) : n;
}

function parseFecha(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Serial de Google Sheets (numero puro)
  if (/^\d+(\.\d+)?$/.test(s)) {
    const serial = parseFloat(s);
    if (serial > 20000 && serial < 80000) {
      const epoch = Date.UTC(1899, 11, 30);
      return new Date(epoch + serial * 86400000);
    }
    return null;
  }

  // Mmm/d/yyyy (mes abreviado en ingles) - formato esperado principal
  let m = s.match(/^([A-Za-z]{3})[\/\-]\s*(\d{1,2})[\/\-]\s*(\d{2,4})$/);
  if (m) {
    const mon = MONTHS_EN[m[1].toLowerCase()];
    if (mon != null) {
      let year = parseInt(m[3], 10); if (year < 100) year += 2000;
      const day = parseInt(m[2], 10);
      const d = new Date(Date.UTC(year, mon, day));
      if (!isNaN(d.getTime())) return d;
    }
  }

  // d/m/yyyy o m/d/yyyy numerico, tolerante
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let a = parseInt(m[1], 10), b = parseInt(m[2], 10), year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    let day, month;
    if (a > 12 && b <= 12) { day = a; month = b - 1; }
    else if (b > 12 && a <= 12) { month = a - 1; day = b; }
    else { month = a - 1; day = b; }
    const d = new Date(Date.UTC(year, month, day));
    if (!isNaN(d.getTime())) return d;
  }

  const parsed = Date.parse(s);
  if (!isNaN(parsed)) return new Date(parsed);
  return null;
}

function normalizeBrokerName(raw) {
  let n = String(raw).trim().toUpperCase().replace(/\s+/g, ' ');
  if (ALIAS_MAP[n]) n = ALIAS_MAP[n];
  return n;
}

function normalizeOrden(raw) {
  if (raw == null) return '';
  return String(raw).trim().replace(/[\s\-]+/g, '');
}

function fmtMoney(n) {
  if (isNaN(n) || n == null) return '$0';
  const sign = n < 0 ? '-' : '';
  return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtPct(n) {
  if (isNaN(n) || n == null) return '0%';
  return (n > 0 ? '+' : '') + n.toFixed(1) + '%';
}
function dayjsInWeek(date, week) {
  const t = date.getTime();
  const startStr = 'filterStart' in week ? week.filterStart : week.start;
  const endStr = 'filterEnd' in week ? week.filterEnd : week.end;
  const start = startStr ? Date.parse(startStr + 'T00:00:00Z') : -Infinity;
  const end = endStr ? Date.parse(endStr + 'T23:59:59Z') : Infinity;
  return t >= start && t <= end;
}
function weekHasStarted(week, now) {
  return now.getTime() >= Date.parse(week.start + 'T00:00:00Z');
}
function weekHasEnded(week, now) {
  return now.getTime() > Date.parse(week.end + 'T23:59:59Z');
}
function getCurrentWeek(now) {
  for (const w of WEEKS) if (!weekHasEnded(w, now) ) { if(weekHasStarted(w,now) || w.id===1) return w; }
  return WEEKS[WEEKS.length - 1];
}
function getWeekForDate(date) {
  return WEEKS.find(w => dayjsInWeek(date, w)) || null;
}

/* ============================================================
   INDICE DE MIEMBROS (para reconocer brokers del sheet)
   ============================================================ */
const memberIndex = {}; // NOMBRE_NORMALIZADO -> { teamId, member }
const excludedSet = new Set(EXCLUDED_NAMES.map(n => n.toUpperCase()));
TEAMS.forEach(team => {
  team.members.forEach(m => {
    const key = m.name.trim().toUpperCase().replace(/\s+/g, ' ');
    memberIndex[key] = { teamId: team.id, member: m, teamName: team.name };
    m._key = key;
  });
});
function teamById(id) { return TEAMS.find(t => t.id === id); }

/* ============================================================
   DEBUG STATE
   ============================================================ */
function freshDebug() {
  return {
    discardedNoName: 0,
    discardedBadDate: 0,
    pendingExcluded: 0,
    excludedByRule: 0,
    unrecognized: new Set(),
    nanWarnings: [],
    badDateSamples: [],
    tabErrors: [],
    outOfRange: 0,
  };
}
let DEBUG = freshDebug();

/* ============================================================
   CARGA DE DATOS
   ============================================================ */
async function fetchTab(tab) {
  const cacheKey = 'mundialito_cache_' + tab.gid;
  try {
    const res = await fetch(csvUrl(tab.gid), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    localStorage.setItem(cacheKey, JSON.stringify({ text, ts: Date.now() }));
    return { tab, text, fromCache: false };
  } catch (e) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      DEBUG.tabErrors.push(`${tab.name}: fallo de red, usando cache de ${new Date(parsed.ts).toLocaleString('es-GT')} (${e.message})`);
      return { tab, text: parsed.text, fromCache: true, cacheTs: parsed.ts };
    }
    DEBUG.tabErrors.push(`${tab.name}: fallo de red y sin cache disponible (${e.message})`);
    return { tab, text: null, error: e };
  }
}

// Procesa las filas de UNA pestana aplicando la regla de bloques PENDING.
// Supuesto (no explicito en el sheet): un nuevo nombre DISTINTO al broker activo
// siempre marca el inicio de un nuevo bloque y cierra cualquier PENDING abierto;
// filas PENDING que repiten el mismo nombre del bloque activo siguen excluidas.
function parseTabRows(csvText, tabName) {
  const rows = parseCSV(csvText);
  let currentBroker = null;
  let inPending = false;
  const transactions = [];

  rows.forEach((row, idx) => {
    const rawPendingCell = (row[COL_PENDING] || '').trim().toUpperCase();
    if (rawPendingCell === 'PENDING') {
      inPending = true;
      DEBUG.pendingExcluded++;
      return;
    }

    const rawName = (row[COL_BROKER] || '').trim();
    if (!rawName) {
      if (inPending) DEBUG.pendingExcluded++;
      else DEBUG.discardedNoName++;
      return;
    }

    const norm = normalizeBrokerName(rawName);

    if (excludedSet.has(norm)) return; // exclusion explicita, no se reporta como no reconocido

    const info = memberIndex[norm];
    if (!info) {
      DEBUG.unrecognized.add(`${norm} (${tabName}, fila ${idx + 1})`);
      return;
    }

    if (norm === currentBroker && inPending) {
      DEBUG.pendingExcluded++;
      return;
    }

    // nuevo bloque (broker nuevo, o mismo broker fuera de pending)
    currentBroker = norm;
    inPending = false;

    const date = parseFecha(row[COL_FECHA]);
    if (!date) {
      DEBUG.discardedBadDate++;
      DEBUG.badDateSamples.push(`${tabName} fila ${idx + 1}: "${row[COL_FECHA]}"`);
      return;
    }

    let monto = parseMonto(row[COL_MONTO]);
    if (isNaN(monto)) {
      DEBUG.nanWarnings.push(`${tabName} fila ${idx + 1}: monto invalido "${row[COL_MONTO]}" -> 0`);
      monto = 0;
    }

    const orden = normalizeOrden(row[COL_ORDEN]);

    transactions.push({
      broker: norm,
      teamId: info.teamId,
      monto,
      date,
      orden,
      tab: tabName,
      row: idx + 1,
    });
  });

  return transactions;
}

let ALL_TRANSACTIONS = [];

async function loadAllData() {
  DEBUG = freshDebug();
  setStatus('loading');
  const results = await Promise.all(TABS.map(fetchTab));
  let all = [];
  results.forEach(r => {
    if (!r.text) return;
    all = all.concat(parseTabRows(r.text, r.tab.name));
  });
  ALL_TRANSACTIONS = all;
  const anyError = results.some(r => r.error || r.fromCache);
  setStatus(anyError ? 'warn' : 'ok');
  document.getElementById('lastUpdated').textContent = 'Ultima actualizacion: ' + new Date().toLocaleString('es-GT');
  renderAll();
}

function setStatus(kind) {
  const el = document.getElementById('statusLine');
  if (kind === 'loading') {
    el.innerHTML = '<span class="status-dot status-ok"></span>Cargando datos…';
  } else if (kind === 'ok') {
    el.innerHTML = '<span class="status-dot status-ok"></span>Datos actualizados';
  } else {
    el.innerHTML = '<span class="status-dot status-err"></span>Datos con avisos — revisa el panel Debug';
  }
}

/* ============================================================
   AGREGACION: ventas por broker/semana, ordenes por broker/semana
   ============================================================ */
function buildWeeklyIndex(transactions) {
  const salesByBrokerWeek = {}; // norm -> weekId -> monto
  const ordersByBrokerWeek = {}; // norm -> weekId -> Set(orden)
  const teamSalesByWeek = {}; // teamId -> weekId -> monto

  TEAMS.forEach(t => { teamSalesByWeek[t.id] = {}; WEEKS.forEach(w => teamSalesByWeek[t.id][w.id] = 0); });

  let outOfRange = 0;
  transactions.forEach(tx => {
    const week = WEEKS.find(w => dayjsInWeek(tx.date, w));
    if (!week) { outOfRange++; return; }

    salesByBrokerWeek[tx.broker] = salesByBrokerWeek[tx.broker] || {};
    salesByBrokerWeek[tx.broker][week.id] = (salesByBrokerWeek[tx.broker][week.id] || 0) + tx.monto;

    if (tx.orden) {
      ordersByBrokerWeek[tx.broker] = ordersByBrokerWeek[tx.broker] || {};
      ordersByBrokerWeek[tx.broker][week.id] = ordersByBrokerWeek[tx.broker][week.id] || new Set();
      ordersByBrokerWeek[tx.broker][week.id].add(tx.orden);
    }

    teamSalesByWeek[tx.teamId][week.id] += tx.monto;
  });
  DEBUG.outOfRange = outOfRange;

  return { salesByBrokerWeek, ordersByBrokerWeek, teamSalesByWeek };
}

/* ============================================================
   CALCULO DE DUELOS Y PUNTOS
   ============================================================ */
function resolveDuel(salesA, umbralA, salesB, umbralB) {
  const pctA = ((salesA - umbralA) / umbralA) * 100;
  const pctB = ((salesB - umbralB) / umbralB) * 100;
  let winner;
  if (Math.abs(pctA - pctB) < 1e-9) {
    if (salesA === salesB) winner = 'draw';
    else winner = salesA > salesB ? 'A' : 'B';
  } else {
    winner = pctA > pctB ? 'A' : 'B';
  }
  return { pctA, pctB, winner };
}

function basePoints(alcanzoUmbral, result) {
  // result: 'gano' | 'perdio' (draw se trata como 'gano' para ambos)
  if (result === 'gano') return alcanzoUmbral ? 3 : 1;
  return alcanzoUmbral ? 1 : 0;
}

function requiredSellers(team) {
  return team.members.filter(m => !m.staff && !m.bonusExempt);
}

function staffFirst(members) {
  return [...members].sort((a, b) => (b.staff ? 1 : 0) - (a.staff ? 1 : 0));
}

// Directores tecnicos (staff) solo aparecen en la tabla de ventas si tuvieron
// ventas esa semana; de lo contrario se muestran solo en el encabezado del equipo.
function splitTeamMembers(team, idx, weekId) {
  const tableMembers = [];
  const hiddenStaff = [];
  team.members.forEach(m => {
    if (m.staff) {
      const sales = (idx.salesByBrokerWeek[m._key] || {})[weekId] || 0;
      if (sales > 0) tableMembers.push(m); else hiddenStaff.push(m);
    } else {
      tableMembers.push(m);
    }
  });
  return { tableMembers: staffFirst(tableMembers), hiddenStaff };
}

function dtHeaderLine(hiddenStaff) {
  if (!hiddenStaff.length) return '';
  const label = hiddenStaff.length > 1 ? 'Directores Técnicos' : 'Director Técnico';
  return `<div class="dt-line"><span class="badge-staff">${label}</span> ${hiddenStaff.map(m => m.name).join(', ')}</div>`;
}

function teamBonusAchieved(team, weekId, salesByBrokerWeek) {
  const req = requiredSellers(team);
  if (req.length === 0) return true;
  return req.every(m => (salesByBrokerWeek[m._key] || {})[weekId] > 0);
}

function computeMatch(teamAId, teamBId, weekId, idx) {
  const teamA = teamById(teamAId), teamB = teamById(teamBId);
  const salesA = idx.teamSalesByWeek[teamAId][weekId] || 0;
  const salesB = idx.teamSalesByWeek[teamBId][weekId] || 0;
  const { pctA, pctB, winner } = resolveDuel(salesA, teamA.umbral, salesB, teamB.umbral);
  const alcanzoA = salesA >= teamA.umbral;
  const alcanzoB = salesB >= teamB.umbral;
  const resultA = (winner === 'A' || winner === 'draw') ? 'gano' : 'perdio';
  const resultB = (winner === 'B' || winner === 'draw') ? 'gano' : 'perdio';
  const baseA = basePoints(alcanzoA, resultA);
  const baseB = basePoints(alcanzoB, resultB);
  const bonusA = teamBonusAchieved(teamA, weekId, idx.salesByBrokerWeek) ? 1 : 0;
  const bonusB = teamBonusAchieved(teamB, weekId, idx.salesByBrokerWeek) ? 1 : 0;

  return {
    weekId, teamAId, teamBId,
    salesA, salesB, pctA, pctB, alcanzoA, alcanzoB, winner,
    baseA, baseB, bonusA, bonusB,
    pointsA: baseA + bonusA, pointsB: baseB + bonusB,
  };
}

function computeGroupStageMatches(idx, now) {
  const matches = [];
  [1, 2, 3].forEach(weekId => {
    const week = WEEKS.find(w => w.id === weekId);
    if (!weekHasStarted(week, now)) return;
    FIXED_MATCHUPS[weekId].forEach(([a, b]) => {
      matches.push(computeMatch(a, b, weekId, idx));
    });
  });
  return matches;
}

function computeStandingsFromMatches(matches) {
  const table = {};
  TEAMS.forEach(t => table[t.id] = { teamId: t.id, pj: 0, g: 0, p: 0, pts: 0, pctSum: 0, pctCount: 0 });
  matches.forEach(m => {
    const rowA = table[m.teamAId], rowB = table[m.teamBId];
    rowA.pj++; rowB.pj++;
    rowA.pts += m.pointsA; rowB.pts += m.pointsB;
    if (m.winner === 'A') { rowA.g++; rowB.p++; }
    else if (m.winner === 'B') { rowB.g++; rowA.p++; }
    else { rowA.g++; rowB.g++; } // empate exacto: "Gano el duelo" para ambos
    rowA.pctSum += m.pctA; rowA.pctCount++;
    rowB.pctSum += m.pctB; rowB.pctCount++;
  });
  const rows = Object.values(table).map(r => ({
    ...r,
    pctAvg: r.pctCount ? r.pctSum / r.pctCount : 0,
  }));
  rows.sort((x, y) => (y.pts - x.pts) || (y.pctAvg - x.pctAvg));
  return rows;
}

function computeFinalsMatchups(standingsAfterGroupStage) {
  const ranked = standingsAfterGroupStage.map(r => r.teamId);
  return {
    final: [ranked[0], ranked[1]],
    third: [ranked[2], ranked[3]],
  };
}

/* ============================================================
   PREMIOS INDIVIDUALES
   ============================================================ */
function getMemberAvg(memberKey) {
  return INDIVIDUAL_AVG_SEMESTRAL[memberKey] || INDIVIDUAL_FLOOR;
}

function computeCamionDeOro(weekId, idx) {
  const rows = [];
  TEAMS.forEach(team => {
    team.members.forEach(m => {
      const sales = (idx.salesByBrokerWeek[m._key] || {})[weekId] || 0;
      const avg = getMemberAvg(m._key);
      const pct = ((sales - avg) / avg) * 100;
      rows.push({ name: m.name, teamFlagCode: team.flagCode, teamName: team.name, sales, avg, pct });
    });
  });
  rows.sort((a, b) => b.pct - a.pct);
  return rows;
}

function computeCargaDeOro(weekId, idx) {
  const rows = [];
  TEAMS.forEach(team => {
    team.members.forEach(m => {
      const set = (idx.ordersByBrokerWeek[m._key] || {})[weekId];
      const count = set ? set.size : 0;
      rows.push({ name: m.name, teamFlagCode: team.flagCode, teamName: team.name, count });
    });
  });
  rows.sort((a, b) => b.count - a.count);
  return rows;
}

/* ============================================================
   RENDER
   ============================================================ */
let currentTeamTab = 1;
const expandedTeams = new Set();
const expandedMembers = new Set();
let STANDINGS_CACHE = { standings: null, now: null, idx: null };

function renderAll() {
  const now = new Date();
  const idx = buildWeeklyIndex(ALL_TRANSACTIONS);
  const groupMatches = computeGroupStageMatches(idx, now);
  const standings = computeStandingsFromMatches(groupMatches);

  STANDINGS_CACHE = { standings, now, idx };
  renderStandings(standings, now, idx);
  renderCurrentWeek(idx, now);
  renderBracket(idx, groupMatches, standings, now);
  renderTeamSelect();
  renderTeamDetail(currentTeamTab, idx, now);
  renderAwards(idx, now);
  renderDebug(groupMatches, idx);
}

function renderScoringLegend() {
  const bonusNote = PREMIOS_DAN_PUNTO_EXTRA
    ? 'El equipo del ganador de cada premio individual (Golden Wheel / Carga Dorada) recibe +1 punto extra.'
    : 'Los premios individuales (Golden Wheel / Carga Dorada) son honoríficos y NO otorgan puntos al equipo en esta edición.';
  document.getElementById('scoringLegend').innerHTML = `
    <ul class="legend-list">
      <li><strong>PJ</strong> — Partidos (duelos) jugados en la fase de grupos.</li>
      <li><strong>G / P</strong> — Duelos ganados / perdidos. Se gana un duelo cuando el % de crecimiento de tu equipo (ventas de la semana vs. tu umbral) es mayor al del rival. Si el % es exactamente igual para ambos, gana quien vendió más en monto; si también empatan en monto, el duelo se cuenta como "ganado" para los dos equipos.</li>
      <li><strong>PTS</strong> — Puntos acumulados. Por cada duelo jugado:
        <ul>
          <li>Ganas el duelo y alcanzas tu umbral semanal → <strong>3 pts</strong></li>
          <li>Ganas el duelo sin alcanzar tu umbral → <strong>1 pt</strong></li>
          <li>Pierdes el duelo pero sí alcanzas tu umbral → <strong>1 pt</strong></li>
          <li>Pierdes el duelo y no alcanzas tu umbral → <strong>0 pts</strong></li>
          <li>Bono equipo: <strong>+1 pt</strong> extra si TODOS los vendedores requeridos del equipo (excluye staff y a quienes están exentos de bono) tuvieron al menos una venta esa semana.</li>
        </ul>
      </li>
      <li><strong>% ACUM.</strong> — Promedio del % de crecimiento (ventas vs. umbral) del equipo en los duelos jugados. Se usa únicamente como <em>criterio de desempate</em> en la tabla; el campeón del torneo se decide en la Gran Final, no por esta tabla.</li>
      <li>${bonusNote}</li>
    </ul>
  `;
}

function renderStandings(standings, now, idx) {
  const week3Ended = weekHasEnded(WEEKS[2], now);
  const week = getCurrentWeek(now);
  let html = `<tr>
    <th></th><th>#</th><th style="text-align:left">Equipo</th><th>PJ</th><th>G</th><th>P</th><th>Pts</th><th>% acum.</th>
  </tr>`;
  standings.forEach((r, i) => {
    const team = teamById(r.teamId);
    const isOpen = expandedTeams.has(team.id);
    html += `<tr class="${i === 0 ? 'rank1' : ''} standings-row" data-team-toggle="${team.id}">
      <td class="chevron">${isOpen ? '▾' : '▸'}</td>
      <td>${i + 1}</td>
      <td class="team-cell">${flagIcon(team.flagCode)}${team.name}</td>
      <td>${r.pj}</td><td>${r.g}</td><td>${r.p}</td>
      <td><strong>${r.pts}</strong></td>
      <td>${fmtPct(r.pctAvg)}</td>
    </tr>`;
    if (isOpen) {
      html += `<tr class="team-detail-row"><td colspan="8">${renderTeamMemberDetail(team, idx, week)}</td></tr>`;
    }
  });
  document.getElementById('standingsTable').innerHTML = html;
  const note = document.querySelector('#view-posiciones .card > .note:last-child');
  if (!week3Ended) note.textContent = 'Tabla en vivo — fase de grupos aun en curso. Desempate: mayor % de crecimiento acumulado (vs. base interna) en las 3 fechas de fase de grupos.';
}

function renderTeamMemberDetail(team, idx, week) {
  const { tableMembers, hiddenStaff } = splitTeamMembers(team, idx, week.id);
  let rows = '';
  tableMembers.forEach(m => {
    const sales = (idx.salesByBrokerWeek[m._key] || {})[week.id] || 0;
    const set = (idx.ordersByBrokerWeek[m._key] || {})[week.id];
    const cargas = set ? set.size : 0;
    const avg = getMemberAvg(m._key);
    const pct = ((sales - avg) / avg) * 100;
    const tag = m.staff ? '<span class="badge-staff">Director Técnico</span>' : (m.bonusExempt ? '<span class="badge-exempt">exento bono</span>' : '');
    const isMemberOpen = expandedMembers.has(m._key);
    rows += `<tr class="member-row" data-member-toggle="${m._key}">
      <td class="chevron">${cargas ? (isMemberOpen ? '▾' : '▸') : ''}</td>
      <td>${m.name}${tag}</td>
      <td>${fmtMoney(sales)}</td>
      <td>${fmtMoney(avg)}</td>
      <td class="${pct >= 0 ? 'pos' : 'neg'}">${fmtPct(pct)}</td>
      <td>${cargas}</td>
    </tr>`;
    if (isMemberOpen && cargas) {
      const loads = getMemberLoads(m._key, week.id);
      const loadRows = loads.map(l => `<tr><td>${l.orden || '(sin # de orden)'}</td><td>${fmtMoney(l.monto)}</td><td>${l.date.toISOString().slice(0, 10)}</td></tr>`).join('');
      rows += `<tr class="member-loads-row"><td></td><td colspan="5">
        <table class="loads-table">
          <thead><tr><th>Orden</th><th>Monto (fee)</th><th>Fecha</th></tr></thead>
          <tbody>${loadRows}</tbody>
        </table>
      </td></tr>`;
    }
  });
  return `
    <div class="member-detail-wrap">
      <div class="member-detail-title">${flagIcon(team.flagCode)}${team.name} — detalle de ${week.label}</div>
      ${dtHeaderLine(hiddenStaff)}
      <table class="roster">
        <thead><tr><th></th><th>Integrante</th><th>Ventas semana</th><th>Meta personal semanal</th><th>% vs. meta</th><th>Cargas</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="note">Meta personal semanal = promedio semanal semestral del broker (piso ficticio de ${fmtMoney(INDIVIDUAL_FLOOR)} mientras no se cargue el dato real). Toca una fila con cargas para ver el detalle de cada carga y su monto/fee.</p>
    </div>
  `;
}

function getMemberLoads(memberKey, weekId) {
  return ALL_TRANSACTIONS
    .filter(tx => tx.broker === memberKey && (getWeekForDate(tx.date) || {}).id === weekId)
    .sort((a, b) => a.date - b.date);
}

function renderCurrentWeek(idx, now) {
  const week = getCurrentWeek(now);
  const container = document.getElementById('currentMatchups');
  const label = document.getElementById('currentWeekLabel');
  let pairs = FIXED_MATCHUPS[week.id];
  let title = `${week.label} (${week.start} al ${week.end})`;

  if (!pairs) {
    // semana 4: final + tercer lugar, requiere posiciones tras semana 3
    const groupMatches = computeGroupStageMatches(idx, new Date(WEEKS[2].end + 'T23:59:59Z'));
    const standings = computeStandingsFromMatches(groupMatches);
    const fm = computeFinalsMatchups(standings);
    pairs = [fm.final, fm.third];
    title += weekHasEnded(WEEKS[2], now) ? ' — definido por posiciones' : ' — proyeccion segun posiciones actuales';
  }
  label.textContent = title;

  container.innerHTML = '';
  pairs.forEach(([aId, bId], i) => {
    const m = computeMatch(aId, bId, week.id, idx);
    const teamA = teamById(aId), teamB = teamById(bId);
    const tagLabel = week.id === 4 ? (i === 0 ? 'GRAN FINAL' : 'TERCER LUGAR') : '';
    container.innerHTML += renderMatchCard(teamA, teamB, m, tagLabel);
  });
}

function renderMatchCard(teamA, teamB, m, tag) {
  const pctPill = (p) => `<span class="pct-pill ${p < 0 ? 'neg' : ''}">${fmtPct(p)}</span>`;
  const winnerText = m.winner === 'draw'
    ? 'Empate en el duelo — ambos ganan el duelo'
    : `${m.winner === 'A' ? teamA.name : teamB.name} va ganando el duelo`;
  const progA = Math.min(100, (m.salesA / teamA.baseReal) * 100);
  const progB = Math.min(100, (m.salesB / teamB.baseReal) * 100);
  return `<div class="match-card">
    ${tag ? `<div style="text-align:center;margin-bottom:8px;"><span class="pill-tag">${tag}</span></div>` : ''}
    <div class="match-teams">
      <div class="match-team ${m.winner === 'A' ? 'winning' : ''}">
        ${flagIcon(teamA.flagCode, 'big')}
        <div class="name">${teamA.name}</div>
        <div>${pctPill(m.pctA)}</div>
      </div>
      <div class="match-vs">VS</div>
      <div class="match-team ${m.winner === 'B' ? 'winning' : ''}">
        ${flagIcon(teamB.flagCode, 'big')}
        <div class="name">${teamB.name}</div>
        <div>${pctPill(m.pctB)}</div>
      </div>
    </div>
    <div class="progress-wrap">
      <div class="progress-row">
        <div class="progress-label"><span>${teamA.name}: ${fmtMoney(m.salesA)}</span><span>meta ${fmtMoney(teamA.baseReal)}</span></div>
        <div class="bar-bg"><div class="bar-fill flag-${teamA.flagCode.toLowerCase()}" style="width:${progA}%"></div></div>
      </div>
      <div class="progress-row">
        <div class="progress-label"><span>${teamB.name}: ${fmtMoney(m.salesB)}</span><span>meta ${fmtMoney(teamB.baseReal)}</span></div>
        <div class="bar-bg"><div class="bar-fill flag-${teamB.flagCode.toLowerCase()}" style="width:${progB}%"></div></div>
      </div>
    </div>
    <div class="duel-result">${winnerText}</div>
  </div>`;
}

function renderBracket(idx, groupMatches, standings, now) {
  const container = document.getElementById('bracketContainer');
  let html = '';
  [1, 2, 3].forEach(weekId => {
    const week = WEEKS.find(w => w.id === weekId);
    html += `<div class="bracket-week"><h3>${week.label} (${week.start} al ${week.end})</h3>`;
    if (!weekHasStarted(week, now)) {
      FIXED_MATCHUPS[weekId].forEach(([a, b]) => {
        const teamA = teamById(a), teamB = teamById(b);
        html += `<div class="bracket-match"><div class="side">${flagIcon(teamA.flagCode)}${teamA.name}</div><div class="bracket-score">vs</div><div class="side right">${teamB.name}${flagIcon(teamB.flagCode)}</div></div>`;
      });
    } else {
      FIXED_MATCHUPS[weekId].forEach(([a, b]) => {
        const m = computeMatch(a, b, weekId, idx);
        const teamA = teamById(a), teamB = teamById(b);
        html += `<div class="bracket-match decided">
          <div class="side"><span class="${m.winner === 'A' ? 'winner-name' : ''}">${flagIcon(teamA.flagCode)}${teamA.name}</span></div>
          <div class="bracket-score">${fmtPct(m.pctA)} — ${fmtPct(m.pctB)}</div>
          <div class="side right"><span class="${m.winner === 'B' ? 'winner-name' : ''}">${teamB.name}${flagIcon(teamB.flagCode)}</span></div>
        </div>`;
      });
    }
    html += `</div>`;
  });

  // semana 4
  const week4 = WEEKS[3];
  html += `<div class="bracket-week"><h3>${week4.label} (${week4.start} al ${week4.end})</h3>`;
  const fm = computeFinalsMatchups(standings);
  const finalLabel = weekHasEnded(WEEKS[2], now) ? '' : ' <span class="pill-tag">proyeccion actual</span>';
  [{ pair: fm.final, tag: 'GRAN FINAL' }, { pair: fm.third, tag: 'TERCER LUGAR' }].forEach(({ pair, tag }) => {
    const [a, b] = pair;
    const teamA = teamById(a), teamB = teamById(b);
    if (weekHasStarted(week4, now)) {
      const m = computeMatch(a, b, 4, idx);
      html += `<div class="bracket-match decided">
        <div class="side"><span class="pill-tag">${tag}</span> <span class="${m.winner === 'A' ? 'winner-name' : ''}">${flagIcon(teamA.flagCode)}${teamA.name}</span></div>
        <div class="bracket-score">${fmtPct(m.pctA)} — ${fmtPct(m.pctB)}</div>
        <div class="side right"><span class="${m.winner === 'B' ? 'winner-name' : ''}">${teamB.name}${flagIcon(teamB.flagCode)}</span></div>
      </div>`;
    } else {
      html += `<div class="bracket-match">
        <div class="side"><span class="pill-tag">${tag}</span> ${flagIcon(teamA.flagCode)}${teamA.name}${finalLabel}</div>
        <div class="bracket-score">vs</div>
        <div class="side right">${teamB.name}${flagIcon(teamB.flagCode)}</div>
      </div>`;
    }
  });
  html += `</div>`;

  if (weekHasStarted(week4, now)) {
    const mFinal = computeMatch(fm.final[0], fm.final[1], 4, idx);
    const champion = teamById(mFinal.winner === 'B' ? fm.final[1] : fm.final[0]);
    if (mFinal.winner !== 'draw') {
      html += `<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,209,102,.15),transparent);border-color:var(--gold2);">
        <div style="font-size:15px;color:var(--muted);">🏆 CAMPEON DEL MUNDIAL DE VENTAS</div>
        <div style="font-size:26px;font-weight:800;color:var(--gold);margin-top:6px;">${flagIcon(champion.flagCode)}${champion.name}</div>
      </div>`;
    }
  }

  container.innerHTML = html;
}

function renderTeamSelect() {
  const el = document.getElementById('teamSelect');
  el.innerHTML = TEAMS.map(t =>
    `<button data-team="${t.id}" class="${t.id === currentTeamTab ? 'active' : ''}">${flagIcon(t.flagCode)}${t.name}</button>`
  ).join('');
  el.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTeamTab = parseInt(btn.dataset.team, 10);
      renderTeamSelect();
      const idx = buildWeeklyIndex(ALL_TRANSACTIONS);
      renderTeamDetail(currentTeamTab, idx, new Date());
    });
  });
}

function renderTeamDetail(teamId, idx, now) {
  const team = teamById(teamId);
  const week = getCurrentWeek(now);
  const bonusOk = teamBonusAchieved(team, week.id, idx.salesByBrokerWeek);
  const teamSales = idx.teamSalesByWeek[teamId][week.id] || 0;

  const { tableMembers, hiddenStaff } = splitTeamMembers(team, idx, week.id);
  let rows = '';
  tableMembers.forEach(m => {
    const sales = (idx.salesByBrokerWeek[m._key] || {})[week.id] || 0;
    const set = (idx.ordersByBrokerWeek[m._key] || {})[week.id];
    const cargas = set ? set.size : 0;
    const aporte = teamSales !== 0 ? (sales / teamSales) * 100 : 0;
    const tag = m.staff ? '<span class="badge-staff">Director Técnico</span>' : (m.bonusExempt ? '<span class="badge-exempt">exento bono</span>' : '');
    rows += `<tr>
      <td>${m.name}${tag}</td>
      <td>${fmtMoney(sales)}</td>
      <td>${cargas}</td>
      <td>${aporte.toFixed(1)}%</td>
    </tr>`;
  });

  document.getElementById('teamDetail').innerHTML = `
    <h3 style="margin-top:0;">${flagIcon(team.flagCode)}${team.name} — ${week.label}</h3>
    ${dtHeaderLine(hiddenStaff)}
    <p class="note">Ventas del equipo esta semana: <strong>${fmtMoney(teamSales)}</strong> · Base real de referencia: ${fmtMoney(team.baseReal)}</p>
    <table class="roster">
      <thead><tr><th>Integrante</th><th>Ventas semana</th><th>Cargas (ordenes unicas)</th><th>Aporte al equipo</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="bonus-banner ${bonusOk ? 'bonus-yes' : 'bonus-no'}">
      ${bonusOk ? '✅ Bono "todos vendieron" cumplido (+1 punto)' : '❌ Bono "todos vendieron" no cumplido esta semana'}
    </div>
  `;
}

function renderAwards(idx, now) {
  const week = getCurrentWeek(now);
  document.getElementById('weekAwardLabel').textContent = week.label + ` (${week.start} al ${week.end})`;

  const camion = computeCamionDeOro(week.id, idx).slice(0, 10);
  const carga = computeCargaDeOro(week.id, idx).slice(0, 10);

  document.getElementById('camionOroList').innerHTML = camion.map(r => `
    <li>
      <span class="name">${flagIcon(r.teamFlagCode)}${r.name}</span>
      <span class="sub">${fmtMoney(r.sales)}</span>
      <span class="value">${fmtPct(r.pct)}</span>
    </li>`).join('');

  document.getElementById('cargaOroList').innerHTML = carga.map(r => `
    <li>
      <span class="name">${flagIcon(r.teamFlagCode)}${r.name}</span>
      <span class="value">${r.count} carga${r.count === 1 ? '' : 's'}</span>
    </li>`).join('');
}

function renderDebug(groupMatches, idx) {
  const stats = [
    { n: DEBUG.discardedNoName, l: 'Sin nombre (descartadas)' },
    { n: DEBUG.discardedBadDate, l: 'Fecha invalida (descartadas)' },
    { n: DEBUG.pendingExcluded, l: 'Filas PENDING excluidas' },
    { n: DEBUG.unrecognized.size, l: 'Nombres no reconocidos' },
    { n: DEBUG.nanWarnings.length, l: 'Montos invalidos -> 0' },
    { n: DEBUG.outOfRange, l: 'Fuera de rango de semanas' },
  ];
  document.getElementById('debugStats').innerHTML = stats.map(s =>
    `<div class="debug-stat"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`
  ).join('');

  let html = '';
  if (DEBUG.tabErrors.length) {
    html += `<p class="debug-tab-errors">${DEBUG.tabErrors.join('<br>')}</p>`;
  }
  if (DEBUG.unrecognized.size) {
    html += `<strong>Nombres no reconocidos:</strong><div class="debug-list">${[...DEBUG.unrecognized].map(n => `<div>${n}</div>`).join('')}</div>`;
  }
  if (DEBUG.badDateSamples.length) {
    html += `<strong>Ejemplos de fecha invalida:</strong><div class="debug-list">${DEBUG.badDateSamples.slice(0, 50).map(n => `<div>${n}</div>`).join('')}</div>`;
  }
  if (DEBUG.nanWarnings.length) {
    html += `<strong>Avisos de monto invalido:</strong><div class="debug-list">${DEBUG.nanWarnings.slice(0, 50).map(n => `<div>${n}</div>`).join('')}</div>`;
  }

  html += `<strong>Desglose de puntos por partido (fase de grupos):</strong>
  <table class="debug-points">
    <thead><tr><th>Semana</th><th>Equipo A</th><th>Ventas A</th><th>% A</th><th>Equipo B</th><th>Ventas B</th><th>% B</th><th>Duelo</th><th>Base A</th><th>Bono A</th><th>Pts A</th><th>Base B</th><th>Bono B</th><th>Pts B</th></tr></thead>
    <tbody>
    ${groupMatches.map(m => {
      const teamA = teamById(m.teamAId), teamB = teamById(m.teamBId);
      return `<tr>
        <td>S${m.weekId}</td>
        <td>${flagIcon(teamA.flagCode)}${teamA.name}</td><td>${fmtMoney(m.salesA)}</td><td>${fmtPct(m.pctA)}</td>
        <td>${flagIcon(teamB.flagCode)}${teamB.name}</td><td>${fmtMoney(m.salesB)}</td><td>${fmtPct(m.pctB)}</td>
        <td>${m.winner === 'draw' ? 'Empate' : (m.winner === 'A' ? teamA.name : teamB.name)}</td>
        <td>${m.baseA}</td><td>${m.bonusA}</td><td><strong>${m.pointsA}</strong></td>
        <td>${m.baseB}</td><td>${m.bonusB}</td><td><strong>${m.pointsB}</strong></td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>
  <p class="note">Nota: promedios semestrales individuales cargados desde Mundial de Ventas (Ene-Jun 2026). Quien no tenga dato real (staff u otros sin historial) usa el piso ficticio de ${fmtMoney(INDIVIDUAL_FLOOR)} en <code>INDIVIDUAL_AVG_SEMESTRAL</code>.</p>
  `;

  document.getElementById('debugDetails').innerHTML = html;
}

/* ============================================================
   NAVEGACION Y ARRANQUE
   ============================================================ */
document.querySelectorAll('nav.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('section.view').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('view-' + btn.dataset.view).classList.add('active');
  });
});

document.getElementById('btnRefresh').addEventListener('click', loadAllData);

document.getElementById('standingsTable').addEventListener('click', (e) => {
  const memberToggle = e.target.closest('[data-member-toggle]');
  const teamToggle = e.target.closest('[data-team-toggle]');
  if (memberToggle) {
    const key = memberToggle.dataset.memberToggle;
    if (expandedMembers.has(key)) expandedMembers.delete(key); else expandedMembers.add(key);
    if (STANDINGS_CACHE.standings) renderStandings(STANDINGS_CACHE.standings, STANDINGS_CACHE.now, STANDINGS_CACHE.idx);
    return;
  }
  if (teamToggle) {
    const id = parseInt(teamToggle.dataset.teamToggle, 10);
    if (expandedTeams.has(id)) expandedTeams.delete(id); else expandedTeams.add(id);
    if (STANDINGS_CACHE.standings) renderStandings(STANDINGS_CACHE.standings, STANDINGS_CACHE.now, STANDINGS_CACHE.idx);
  }
});

renderScoringLegend();

document.getElementById('teamFlagsSub').innerHTML = TEAMS.map(t =>
  `${t.name} ${flagIcon(t.flagCode)}`
).join(' &middot; ');

loadAllData();
setInterval(loadAllData, REFRESH_MS);
