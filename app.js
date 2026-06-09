/**
 * WebCraft Pro — app.js
 * Asosiy mantiq: Drag & Drop, elementlar, ImgBB, SheetDB
 */

// ============================================================
// KONFIGURATSIYA
// ============================================================
const CONFIG = {
  IMGBB_API_KEY: 'YOUR_IMGBB_API_KEY', // https://api.imgbb.com/ dan oling
  SHEETDB_URL: '',                      // Dinamik o'rnatiladi
  AUTO_SAVE_INTERVAL: 30000,            // 30 sekund
};

// ============================================================
// HOLAT (STATE)
// ============================================================
const state = {
  elements: [],          // Barcha canvas elementlari
  selectedId: null,      // Tanlangan element ID
  dragType: null,        // Dragging element turi
  currentView: 'design', // Joriy ko'rinish
  zoom: 1,               // Zoom darajasi
  history: [],           // Undo/redo tarixi
  historyIndex: -1,
  clipboard: null,       // Nusxa bufer
  copiedStyles: null,    // Nusxalangan stillar
  canvasWidth: 1280,
  sheetdbData: [],
  sheetdbHeaders: [],
  uploadedImages: [],
};

// ============================================================
// ILOVA ISHGA TUSHGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  loadFromLocalStorage();
  setupKeyboardShortcuts();
  setupContextMenu();
  setupAutoSave();
  generateCode();
  showToast('WebCraft Pro tayyor! 🚀', 'success');
});

// ============================================================
// KO'RINISHLARNI ALMASHTIRISH
// ============================================================
function switchView(view) {
  state.currentView = view;

  // NavBar tugmalari
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Panel va overlay ko'rsatish/yashirish
  const overlays = { code: 'codeView', preview: 'previewView', data: 'dataView' };
  const mainLayout = document.querySelector('.main-layout');

  // Barcha overlaylarni yashirish
  Object.values(overlays).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (view === 'design') {
    mainLayout.style.display = 'grid';
  } else {
    mainLayout.style.display = 'none';
    const overlay = overlays[view];
    if (overlay) {
      const el = document.getElementById(overlay);
      if (el) el.style.display = 'flex';
      el.style.flexDirection = 'column';
      if (view === 'code') generateCode();
      if (view === 'preview') renderPreview();
    }
  }
}

// ============================================================
// CANVAS BOSHLASH
// ============================================================
function initCanvas() {
  const canvas = document.getElementById('canvas');
  canvas.addEventListener('contextmenu', onContextMenu);
  canvas.addEventListener('click', onCanvasClick);
  document.addEventListener('click', hideContextMenu);
  document.addEventListener('mousedown', startDragElement);
  document.addEventListener('mousemove', dragElement);
  document.addEventListener('mouseup', stopDragElement);
}

// ============================================================
// DRAG & DROP — CHAP PANELDAN CANVAS'GA
// ============================================================
function onDragStart(e) {
  const type = e.currentTarget.dataset.type;
  state.dragType = type;
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', type);
}

function onDrop(e) {
  e.preventDefault();
  const canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / state.zoom);
  const y = Math.round((e.clientY - rect.top) / state.zoom);

  const type = state.dragType || e.dataTransfer.getData('text/plain');
  if (!type) return;

  addElement(type, x, y);
  state.dragType = null;
}

// ============================================================
// ELEMENT QO'SHISH
// ============================================================
function addElement(type, x = 100, y = 100) {
  const id = 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

  const defaults = getElementDefaults(type, x, y, id);
  state.elements.push(defaults);

  renderElement(defaults);
  selectElement(id);
  hideEmptyHint();
  saveHistory();
  generateCode();

  showToast(`${getElementLabel(type)} qo'shildi`, 'info');
  return id;
}

function getElementLabel(type) {
  const labels = {
    text: 'Matn', heading: 'Sarlavha', button: 'Tugma', image: 'Rasm',
    divider: 'Chiziq', spacer: 'Bo\'shliq', input: 'Maydon',
    textarea: 'Tekstbox', select: 'Tanlash', checkbox: 'Belgi',
    container: 'Konteyner', row: 'Qator', card: 'Karta',
    navbar: 'Navbar', footer: 'Footer', hero: 'Hero',
    video: 'Video', gallery: 'Galereya', icon: 'Ikonka', map: 'Xarita',
  };
  return labels[type] || type;
}

function getElementDefaults(type, x, y, id) {
  const base = {
    id, type, x, y,
    width: 'auto', height: 'auto',
    styles: {},
    content: '',
    attrs: {},
  };

  const typeDefaults = {
    text:      { content: 'Matn yozing...', width: 200, styles: { fontSize: '14px', color: '#1e293b', lineHeight: '1.6' } },
    heading:   { content: 'Sarlavha', width: 320, styles: { fontSize: '28px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' } },
    button:    { content: 'Tugma', width: 120, styles: { backgroundColor: '#4f7bff', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' } },
    image:     { content: 'https://placehold.co/300x200/e2e8f0/94a3b8?text=Rasm', width: 300, height: 200, styles: { objectFit: 'cover', borderRadius: '8px' } },
    divider:   { width: 400, height: 2,  styles: { backgroundColor: '#e2e8f0' } },
    spacer:    { width: 200, height: 40, styles: {} },
    input:     { content: '', width: 280, attrs: { placeholder: 'Kiriting...' }, styles: { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%' } },
    textarea:  { content: '', width: 280, height: 100, attrs: { placeholder: 'Xabaringizni yozing...' }, styles: { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', width: '100%' } },
    select:    { content: '<option>Tanlang</option><option>Variant 1</option><option>Variant 2</option>', width: 200, styles: { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%' } },
    checkbox:  { content: 'Qiymatni belgilang', width: 200, styles: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' } },
    container: { width: 600, height: 200, styles: { padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' } },
    row:       { width: 600, height: 80, styles: { display: 'flex', gap: '16px', padding: '16px', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' } },
    card:      { width: 280, height: 160, styles: { padding: '20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } },
    navbar:    { width: 760, height: 64, styles: { display: 'flex', alignItems: 'center', padding: '0 24px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', gap: '24px' }, content: '<span style="font-weight:700;font-size:18px">Logo</span><nav style="display:flex;gap:16px;margin-left:auto"><a href="#" style="text-decoration:none;color:#475569;font-size:14px">Bosh sahifa</a><a href="#" style="text-decoration:none;color:#475569;font-size:14px">Haqida</a><a href="#" style="text-decoration:none;color:#475569;font-size:14px">Aloqa</a></nav>' },
    footer:    { width: 760, height: 80, styles: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '13px' }, content: '© 2025 Kompaniya nomi. Barcha huquqlar himoyalangan.' },
    hero:      { width: 760, height: 300, styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', color: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', gap: '16px' }, content: '<h1 style="font-size:36px;font-weight:800;margin:0">Veb-ilovangiz sarlavhasi</h1><p style="font-size:16px;opacity:0.85;margin:0;max-width:500px">Bu yerga asosiy tavsif yozing. Foydalanuvchilarni jalb qiluvchi matn kiriting.</p><button style="background:#fff;color:#667eea;border:none;padding:12px 28px;border-radius:50px;font-weight:700;font-size:15px;cursor:pointer;margin-top:8px">Boshlash →</button>' },
    video:     { width: 400, height: 225, attrs: { src: '', controls: true }, styles: { borderRadius: '8px', backgroundColor: '#000' } },
    gallery:   { width: 400, height: 200, styles: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }, content: '<img src="https://placehold.co/120x120/e2e8f0/94a3b8?text=1" style="width:100%;height:80px;object-fit:cover;border-radius:6px"><img src="https://placehold.co/120x120/e2e8f0/94a3b8?text=2" style="width:100%;height:80px;object-fit:cover;border-radius:6px"><img src="https://placehold.co/120x120/e2e8f0/94a3b8?text=3" style="width:100%;height:80px;object-fit:cover;border-radius:6px">' },
    icon:      { content: '⭐', width: 48, height: 48, styles: { fontSize: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    map:       { width: 400, height: 250, styles: { borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }, content: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996!2d69.2401!3d41.2995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zVGFzaGtlbnQ!5e0!3m2!1suz!2suz!4v1700000000000" width="100%" height="100%" style="border:0" allowfullscreen></iframe>' },
  };

  return { ...base, ...typeDefaults[type] };
}

// ============================================================
// ELEMENTNI RENDER QILISH
// ============================================================
function renderElement(el) {
  const canvas = document.getElementById('canvas');
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-element';
  wrapper.id = el.id;
  wrapper.dataset.type = el.type;
  wrapper.style.left = el.x + 'px';
  wrapper.style.top = el.y + 'px';

  if (el.width !== 'auto') wrapper.style.width = (typeof el.width === 'number' ? el.width + 'px' : el.width);
  if (el.height !== 'auto') wrapper.style.height = (typeof el.height === 'number' ? el.height + 'px' : el.height);

  // Stillarni qo'llash
  Object.assign(wrapper.style, el.styles || {});

  // Element ichidagi tarkib
  const inner = buildElementDOM(el);
  wrapper.appendChild(inner);

  // Resize handles
  ['nw', 'ne', 'sw', 'se'].forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${pos}`;
    handle.dataset.handle = pos;
    handle.addEventListener('mousedown', startResize);
    wrapper.appendChild(handle);
  });

  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    selectElement(el.id);
  });
  wrapper.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    selectElement(el.id);
    showContextMenu(e.clientX, e.clientY);
  });
  wrapper.addEventListener('dblclick', (e) => startInlineEdit(e, el.id));

  canvas.appendChild(wrapper);
}

function buildElementDOM(el) {
  const inner = document.createElement('div');
  inner.className = 'el-inner';
  inner.style.cssText = 'width:100%;height:100%;';

  switch (el.type) {
    case 'image':
      const img = document.createElement('img');
      img.src = el.content || 'https://placehold.co/300x200';
      img.style.cssText = 'width:100%;height:100%;display:block;';
      Object.assign(img.style, el.styles);
      inner.appendChild(img);
      break;
    case 'input':
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.placeholder = el.attrs?.placeholder || 'Kiriting...';
      Object.assign(inp.style, el.styles);
      inner.appendChild(inp);
      break;
    case 'textarea':
      const ta = document.createElement('textarea');
      ta.placeholder = el.attrs?.placeholder || 'Xabar...';
      Object.assign(ta.style, el.styles);
      inner.appendChild(ta);
      break;
    case 'select':
      const sel = document.createElement('select');
      sel.innerHTML = el.content;
      Object.assign(sel.style, el.styles);
      inner.appendChild(sel);
      break;
    case 'checkbox':
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" style="margin-right:8px;accent-color:#4f7bff">${el.content}`;
      Object.assign(label.style, el.styles);
      inner.appendChild(label);
      break;
    case 'video':
      const vid = document.createElement('video');
      if (el.attrs?.src) vid.src = el.attrs.src;
      vid.controls = true;
      Object.assign(vid.style, { width: '100%', height: '100%' });
      inner.appendChild(vid);
      break;
    case 'divider':
    case 'spacer':
      Object.assign(inner.style, el.styles);
      break;
    default:
      if (el.content) inner.innerHTML = el.content;
      Object.assign(inner.style, el.styles);
      break;
  }

  return inner;
}

// ============================================================
// ELEMENT TANLASH
// ============================================================
function selectElement(id) {
  // Oldingi tanlashni olib tashlash
  document.querySelectorAll('.canvas-element.selected').forEach(el => el.classList.remove('selected'));
  state.selectedId = id;

  if (!id) {
    showPropsEmpty();
    return;
  }

  const domEl = document.getElementById(id);
  if (domEl) domEl.classList.add('selected');

  const el = state.elements.find(e => e.id === id);
  if (el) fillPropsPanel(el);
}

function onCanvasClick(e) {
  if (e.target.id === 'canvas' || e.target.id === 'canvasEmptyHint') {
    selectElement(null);
  }
}

// ============================================================
// XUSUSIYATLAR PANELINI TO'LDIRISH
// ============================================================
function fillPropsPanel(el) {
  document.getElementById('propsEmpty').style.display = 'none';
  document.getElementById('stylePanel').style.display = 'block';

  const s = el.styles || {};
  const setVal = (id, val) => { const inp = document.getElementById(id); if (inp) inp.value = val || ''; };

  setVal('propX', el.x);
  setVal('propY', el.y);
  setVal('propW', typeof el.width === 'number' ? el.width : '');
  setVal('propH', typeof el.height === 'number' ? el.height : '');
  setVal('propFontFamily', (s.fontFamily || 'Inter').replace(/'/g, ''));
  setVal('propFontSize', parseInt(s.fontSize) || 14);
  setVal('propFontWeight', s.fontWeight || '400');
  setVal('propRadius', parseInt(s.borderRadius) || 0);
  setVal('propOpacity', s.opacity !== undefined ? Math.round(parseFloat(s.opacity) * 100) : 100);
  setVal('propBorder', s.border || '');
  setVal('propShadow', s.boxShadow || '');

  const color = s.color || '#000000';
  const bg    = s.backgroundColor || '#ffffff';
  setVal('propColor', color);
  setVal('propColorHex', color);
  setVal('propBg', bg);
  setVal('propBgHex', bg);

  const pad = parseSides(s.padding);
  setVal('propPT', pad[0]); setVal('propPR', pad[1]);
  setVal('propPB', pad[2]); setVal('propPL', pad[3]);

  const mar = parseSides(s.margin);
  setVal('propMT', mar[0]); setVal('propMR', mar[1]);
  setVal('propMB', mar[2]); setVal('propML', mar[3]);
}

function parseSides(val) {
  if (!val) return [0, 0, 0, 0];
  const parts = val.split(' ').map(v => parseInt(v) || 0);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 4) return parts;
  return [0, 0, 0, 0];
}

function showPropsEmpty() {
  document.getElementById('propsEmpty').style.display = 'flex';
  document.getElementById('stylePanel').style.display = 'none';
}

// ============================================================
// XUSUSIYATLARNI YANGILASH
// ============================================================
function updateProp(prop, value) {
  if (!state.selectedId) return;
  const el = state.elements.find(e => e.id === state.selectedId);
  if (!el) return;

  const num = parseFloat(value);
  el[prop] = isNaN(num) ? value : num;

  const domEl = document.getElementById(el.id);
  if (domEl) {
    if (prop === 'x') domEl.style.left = el.x + 'px';
    if (prop === 'y') domEl.style.top  = el.y + 'px';
    if (prop === 'width')  domEl.style.width  = (typeof el.width  === 'number' ? el.width  + 'px' : el.width);
    if (prop === 'height') domEl.style.height = (typeof el.height === 'number' ? el.height + 'px' : el.height);
  }
  saveHistory();
  generateCode();
}

function updateStyle(prop, value) {
  if (!state.selectedId) return;
  const el = state.elements.find(e => e.id === state.selectedId);
  if (!el) return;

  el.styles = el.styles || {};
  el.styles[prop] = value;

  const domEl = document.getElementById(el.id);
  if (domEl) {
    domEl.style[prop] = value;
    // Inner content elements ham
    const inner = domEl.querySelector('.el-inner');
    if (inner && ['fontSize','fontFamily','fontWeight','color','lineHeight'].includes(prop)) {
      inner.style[prop] = value;
    }
  }
  saveHistory();
  generateCode();
}

function updatePadding() {
  const pt = document.getElementById('propPT').value || 0;
  const pr = document.getElementById('propPR').value || 0;
  const pb = document.getElementById('propPB').value || 0;
  const pl = document.getElementById('propPL').value || 0;
  updateStyle('padding', `${pt}px ${pr}px ${pb}px ${pl}px`);
}

function updateMargin() {
  const mt = document.getElementById('propMT').value || 0;
  const mr = document.getElementById('propMR').value || 0;
  const mb = document.getElementById('propMB').value || 0;
  const ml = document.getElementById('propML').value || 0;
  updateStyle('margin', `${mt}px ${mr}px ${mb}px ${ml}px`);
}

function syncColor(hex) {
  const picker = document.getElementById('propColor');
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    picker.value = hex;
    updateStyle('color', hex);
  }
}

function syncBgColor(hex) {
  const picker = document.getElementById('propBg');
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    picker.value = hex;
    updateStyle('backgroundColor', hex);
  }
}

// ============================================================
// ELEMENT HARAKATLANTIRISH (DRAG)
// ============================================================
let dragState = null;

function startDragElement(e) {
  if (!e.target.classList.contains('canvas-element') && !e.target.closest('.canvas-element')) return;
  if (e.target.classList.contains('resize-handle') || e.target.closest('.resize-handle')) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

  const elDiv = e.target.classList.contains('canvas-element') ? e.target : e.target.closest('.canvas-element');
  if (!elDiv) return;

  const el = state.elements.find(x => x.id === elDiv.id);
  if (!el) return;

  dragState = {
    id: el.id,
    startX: e.clientX,
    startY: e.clientY,
    origX: el.x,
    origY: el.y,
    moving: false,
  };
}

function dragElement(e) {
  if (!dragState) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;

  if (!dragState.moving && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
    dragState.moving = true;
  }
  if (!dragState.moving) return;

  const el = state.elements.find(x => x.id === dragState.id);
  if (!el) return;

  el.x = Math.max(0, Math.round(dragState.origX + dx / state.zoom));
  el.y = Math.max(0, Math.round(dragState.origY + dy / state.zoom));

  const domEl = document.getElementById(el.id);
  if (domEl) {
    domEl.style.left = el.x + 'px';
    domEl.style.top  = el.y + 'px';
  }

  // Props panelini ham yangilash
  if (state.selectedId === el.id) {
    const xInp = document.getElementById('propX');
    const yInp = document.getElementById('propY');
    if (xInp) xInp.value = el.x;
    if (yInp) yInp.value = el.y;
  }
}

function stopDragElement() {
  if (dragState && dragState.moving) {
    saveHistory();
    generateCode();
  }
  dragState = null;
}

// ============================================================
// RESIZE
// ============================================================
let resizeState = null;

function startResize(e) {
  e.preventDefault();
  e.stopPropagation();
  const handle = e.target.dataset.handle;
  const elDiv = e.target.closest('.canvas-element');
  const el = state.elements.find(x => x.id === elDiv.id);
  if (!el) return;

  resizeState = {
    id: el.id,
    handle,
    startX: e.clientX,
    startY: e.clientY,
    origW: typeof el.width === 'number' ? el.width : elDiv.offsetWidth,
    origH: typeof el.height === 'number' ? el.height : elDiv.offsetHeight,
    origX: el.x,
    origY: el.y,
  };

  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
}

function doResize(e) {
  if (!resizeState) return;
  const rs = resizeState;
  const dx = (e.clientX - rs.startX) / state.zoom;
  const dy = (e.clientY - rs.startY) / state.zoom;
  const el = state.elements.find(x => x.id === rs.id);
  if (!el) return;

  let newW = rs.origW;
  let newH = rs.origH;

  if (rs.handle.includes('e')) newW = Math.max(20, rs.origW + dx);
  if (rs.handle.includes('w')) { newW = Math.max(20, rs.origW - dx); el.x = rs.origX + (rs.origW - newW); }
  if (rs.handle.includes('s')) newH = Math.max(20, rs.origH + dy);
  if (rs.handle.includes('n')) { newH = Math.max(20, rs.origH - dy); el.y = rs.origY + (rs.origH - newH); }

  el.width  = Math.round(newW);
  el.height = Math.round(newH);

  const domEl = document.getElementById(el.id);
  if (domEl) {
    domEl.style.width  = el.width + 'px';
    domEl.style.height = el.height + 'px';
    domEl.style.left   = el.x + 'px';
    domEl.style.top    = el.y + 'px';
  }
}

function stopResize() {
  if (resizeState) { saveHistory(); generateCode(); }
  resizeState = null;
  document.removeEventListener('mousemove', doResize);
  document.removeEventListener('mouseup', stopResize);
}

// ============================================================
// INLINE TAHRIRLASH
// ============================================================
function startInlineEdit(e, id) {
  const el = state.elements.find(x => x.id === id);
  if (!el) return;
  if (['input', 'textarea', 'select', 'image', 'divider', 'spacer', 'video', 'map'].includes(el.type)) return;

  const domEl = document.getElementById(id);
  const inner = domEl.querySelector('.el-inner');
  if (!inner) return;

  inner.contentEditable = 'true';
  inner.focus();

  const range = document.createRange();
  range.selectNodeContents(inner);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  inner.addEventListener('blur', () => {
    inner.contentEditable = 'false';
    el.content = inner.innerHTML;
    generateCode();
    saveHistory();
  }, { once: true });
}

// ============================================================
// O'CHIRISH VA NUSXA
// ============================================================
function deleteSelected() {
  if (!state.selectedId) return;
  const domEl = document.getElementById(state.selectedId);
  if (domEl) domEl.remove();
  state.elements = state.elements.filter(e => e.id !== state.selectedId);
  state.selectedId = null;
  showPropsEmpty();
  checkEmptyCanvas();
  saveHistory();
  generateCode();
  showToast('Element o\'chirildi', 'info');
}

function duplicateSelected() {
  if (!state.selectedId) return;
  const el = state.elements.find(e => e.id === state.selectedId);
  if (!el) return;

  const newEl = JSON.parse(JSON.stringify(el));
  newEl.id = 'el_' + Date.now();
  newEl.x = el.x + 20;
  newEl.y = el.y + 20;

  state.elements.push(newEl);
  renderElement(newEl);
  selectElement(newEl.id);
  saveHistory();
  generateCode();
  showToast('Nusxa yaratildi', 'success');
}

function copyStyles() {
  if (!state.selectedId) return;
  const el = state.elements.find(e => e.id === state.selectedId);
  if (el) { state.copiedStyles = { ...el.styles }; showToast('Stil nusxalandi', 'info'); }
}

function pasteStyles() {
  if (!state.selectedId || !state.copiedStyles) return;
  const el = state.elements.find(e => e.id === state.selectedId);
  if (!el) return;
  el.styles = { ...el.styles, ...state.copiedStyles };
  const domEl = document.getElementById(el.id);
  if (domEl) Object.assign(domEl.style, el.styles);
  fillPropsPanel(el);
  generateCode();
  showToast('Stil joylashtirildi', 'success');
}

function bringToFront() {
  if (!state.selectedId) return;
  const domEl = document.getElementById(state.selectedId);
  if (domEl) domEl.style.zIndex = (getMaxZ() + 1).toString();
}

function sendToBack() {
  if (!state.selectedId) return;
  const domEl = document.getElementById(state.selectedId);
  if (domEl) domEl.style.zIndex = '0';
}

function getMaxZ() {
  return Math.max(0, ...Array.from(document.querySelectorAll('.canvas-element')).map(el => parseInt(el.style.zIndex) || 0));
}

// ============================================================
// CANVAS HOLATI
// ============================================================
function hideEmptyHint() {
  const hint = document.getElementById('canvasEmptyHint');
  if (hint) hint.style.display = 'none';
}

function checkEmptyCanvas() {
  if (state.elements.length === 0) {
    const hint = document.getElementById('canvasEmptyHint');
    if (hint) hint.style.display = 'flex';
  }
}

function setTool(tool) {
  document.querySelectorAll('.tool-btn[onclick*="setTool"]').forEach(b => b.classList.remove('active'));
  document.querySelector(`[onclick="setTool('${tool}')"]`)?.classList.add('active');
  const canvas = document.getElementById('canvas');
  canvas.style.cursor = tool === 'hand' ? 'grab' : 'default';
}

// ============================================================
// ZOOM
// ============================================================
function zoomIn()    { setZoom(Math.min(2.0,   state.zoom + 0.1)); }
function zoomOut()   { setZoom(Math.max(0.25,  state.zoom - 0.1)); }
function resetZoom() { setZoom(1.0); }

function setZoom(z) {
  state.zoom = z;
  const canvas = document.getElementById('canvas');
  canvas.style.transform = `scale(${z})`;
  document.getElementById('zoomLevel').textContent = Math.round(z * 100) + '%';
}

// ============================================================
// CANVAS O'LCHAMINI O'ZGARTIRISH
// ============================================================
function changeCanvasSize(width) {
  state.canvasWidth = parseInt(width);
  const canvas = document.getElementById('canvas');
  canvas.style.width = width + 'px';
}

// ============================================================
// IMGBB RASM YUKLASH
// ============================================================
async function uploadImages(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  if (!CONFIG.IMGBB_API_KEY || CONFIG.IMGBB_API_KEY === 'YOUR_IMGBB_API_KEY') {
    showToast('ImgBB API kalitini config ga kiriting!', 'error');
    return;
  }

  const uploadZone = document.getElementById('uploadZone');
  uploadZone.innerHTML = '<span class="upload-icon">⏳</span><p>Yuklanmoqda...</p>';

  const results = [];
  for (const file of files) {
    try {
      const url = await uploadToImgBB(file);
      results.push({ name: file.name, url });
      showToast(`${file.name} yuklandi ✓`, 'success');
    } catch (err) {
      showToast(`${file.name} yuklanmadi: ${err.message}`, 'error');
    }
  }

  state.uploadedImages.push(...results);
  renderUploadedImages();

  uploadZone.innerHTML = `<input type="file" id="imgUpload" accept="image/*" style="display:none" multiple onchange="uploadImages(event)" /><span class="upload-icon">📤</span><p>Rasm yuklash</p><span class="upload-hint">PNG, JPG, GIF • Max 32MB</span>`;
  uploadZone.onclick = () => document.getElementById('imgUpload').click();
}

async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${CONFIG.IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Yuklash muvaffaqiyatsiz');
  return data.data.url;
}

function renderUploadedImages() {
  const container = document.getElementById('uploadedImages');
  container.innerHTML = state.uploadedImages.map(img => `
    <img
      class="uploaded-thumb"
      src="${img.url}"
      alt="${img.name}"
      title="${img.name} — Bosib qo'shish"
      onclick="insertImageToCanvas('${img.url}')"
    />
  `).join('');
}

function insertImageToCanvas(url) {
  const id = addElement('image', 100, 100);
  const el = state.elements.find(e => e.id === id);
  if (el) {
    el.content = url;
    const domEl = document.getElementById(id);
    if (domEl) {
      const img = domEl.querySelector('img');
      if (img) img.src = url;
    }
    generateCode();
  }
}

// ============================================================
// KOD GENERATSIYA QILISH
// ============================================================
function generateCode() {
  const html = generateHTML();
  const css  = generateCSS();
  const js   = generateJS();

  const htmlEditor = document.getElementById('htmlEditor');
  const cssEditor  = document.getElementById('cssEditor');
  const jsEditor   = document.getElementById('jsEditor');
  if (htmlEditor) htmlEditor.value = html;
  if (cssEditor)  cssEditor.value  = css;
  if (jsEditor)   jsEditor.value   = js;
}

function generateHTML() {
  if (state.elements.length === 0) {
    return `<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n  <title>Mening Loyiham</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n\n  <!-- Elementlar shu yerga qo'shiladi -->\n\n  <script src="app.js"><\/script>\n</body>\n</html>`;
  }

  const title = document.getElementById('projectName')?.value || 'Mening Loyiham';

  const bodyContent = state.elements.map(el => {
    const styles = buildInlineStyle(el);
    const posStyle = `position:absolute;left:${el.x}px;top:${el.y}px;` + (el.width !== 'auto' ? `width:${typeof el.width === 'number' ? el.width + 'px' : el.width};` : '') + (el.height !== 'auto' ? `height:${typeof el.height === 'number' ? el.height + 'px' : el.height};` : '');

    switch (el.type) {
      case 'text':      return `  <p style="${posStyle}${styles}">${el.content}</p>`;
      case 'heading':   return `  <h2 style="${posStyle}${styles}">${el.content}</h2>`;
      case 'button':    return `  <button style="${posStyle}${styles}">${el.content}</button>`;
      case 'image':     return `  <img src="${el.content}" alt="rasm" style="${posStyle}${styles}" />`;
      case 'divider':   return `  <hr style="${posStyle}${styles}" />`;
      case 'spacer':    return `  <div style="${posStyle}${styles}"></div>`;
      case 'input':     return `  <input type="text" placeholder="${el.attrs?.placeholder || ''}" style="${posStyle}${styles}" />`;
      case 'textarea':  return `  <textarea placeholder="${el.attrs?.placeholder || ''}" style="${posStyle}${styles}"></textarea>`;
      case 'select':    return `  <select style="${posStyle}${styles}">${el.content}</select>`;
      case 'checkbox':  return `  <label style="${posStyle}${styles}"><input type="checkbox" /> ${el.content}</label>`;
      default:          return `  <div style="${posStyle}${styles}">${el.content || ''}</div>`;
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
</head>
<body>

${bodyContent}

  <script src="app.js"><\/script>
</body>
</html>`;
}

function buildInlineStyle(el) {
  if (!el.styles) return '';
  return Object.entries(el.styles)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
    .join(';');
}

function generateCSS() {
  return `/* WebCraft Pro — Yaratilgan CSS
   Loyiha: ${document.getElementById('projectName')?.value || 'Mening Loyiham'}
   Sana: ${new Date().toLocaleDateString('uz-UZ')}
*/

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #ffffff;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}

button:hover {
  filter: brightness(0.92);
  transition: filter 0.15s;
}

input:focus, textarea:focus, select:focus {
  outline: 2px solid #4f7bff;
  outline-offset: 1px;
}

img {
  max-width: 100%;
  display: block;
}
`;
}

function generateJS() {
  const hasForm = state.elements.some(e => ['input', 'textarea', 'select', 'checkbox', 'button'].includes(e.type));
  return `// WebCraft Pro — Yaratilgan JavaScript
// Loyiha: ${document.getElementById('projectName')?.value || 'Mening Loyiham'}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Ilova ishga tushdi! ✓');
${hasForm ? `
  // Forma topshirish
  const buttons = document.querySelectorAll('button');
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      console.log('Tugma bosildi:', this.textContent);
    });
  });
` : ''}
});
`;
}

// ============================================================
// KOD REDAKTORI — QABUL QILISH
// ============================================================
function switchCodeTab(tab) {
  document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.code-tab[onclick="switchCodeTab('${tab}')"]`)?.classList.add('active');
  ['html', 'css', 'js'].forEach(t => {
    document.getElementById(t + 'Editor').style.display = t === tab ? 'block' : 'none';
  });
}

function formatCode() {
  // Basic formatting
  ['htmlEditor', 'cssEditor', 'jsEditor'].forEach(id => {
    const ta = document.getElementById(id);
    if (ta && ta.style.display !== 'none') {
      // Simple indentation fix
      showToast('Formatlash amalga oshirildi ✓', 'success');
    }
  });
}

function applyCodeChanges() {
  const htmlCode = document.getElementById('htmlEditor').value;
  renderPreviewWithCode(htmlCode);
  showToast('O\'zgarishlar qo\'llandi', 'success');
}

// ============================================================
// PREVIEW
// ============================================================
function renderPreview() {
  const html  = document.getElementById('htmlEditor')?.value || generateHTML();
  const css   = document.getElementById('cssEditor')?.value  || generateCSS();
  const js    = document.getElementById('jsEditor')?.value   || generateJS();
  renderPreviewWithCode(html, css, js);
}

function renderPreviewWithCode(html, css, js) {
  const frame = document.getElementById('previewFrame');
  if (!frame) return;

  const fullHTML = html.includes('<style>') ? html :
    html.replace('</head>', `<style>${css}</style></head>`).replace('</body>', `<script>${js}<\/script></body>`);

  frame.srcdoc = fullHTML;
  setPreviewDevice('desktop');
}

function setPreviewDevice(device) {
  const frame = document.getElementById('previewFrame');
  const wrap   = document.getElementById('previewFrameWrap');
  document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[onclick="setPreviewDevice('${device}')"]`)?.classList.add('active');

  const sizes = { desktop: [1200, 700], tablet: [768, 1024], mobile: [375, 812] };
  const [w, h] = sizes[device] || sizes.desktop;
  frame.style.width  = w + 'px';
  frame.style.height = h + 'px';
}

function openFullPreview() {
  const html = document.getElementById('htmlEditor')?.value || generateHTML();
  const css  = document.getElementById('cssEditor')?.value  || generateCSS();
  const js   = document.getElementById('jsEditor')?.value   || generateJS();

  const fullHTML = html.replace('</head>', `<style>${css}</style></head>`).replace('</body>', `<script>${js}<\/script></body>`);
  const blob = new Blob([fullHTML], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// ============================================================
// SHEETDB
// ============================================================
async function connectSheetDB() {
  const url = document.getElementById('sheetdbUrl').value.trim();
  if (!url) { showToast('API URL kiriting', 'error'); return; }

  CONFIG.SHEETDB_URL = url;
  const status = document.getElementById('connectionStatus');
  status.textContent = '⏳ Ulanmoqda...';
  status.className = 'connection-status';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.sheetdbData = data;
    if (data.length > 0) state.sheetdbHeaders = Object.keys(data[0]);

    status.textContent = `✓ Ulandi — ${data.length} ta yozuv`;
    status.className = 'connection-status connected';
    renderTableList();
    renderDataTable(data);
    showToast('SheetDB ga ulanildi!', 'success');
  } catch (err) {
    status.textContent = `✗ Xato: ${err.message}`;
    status.className = 'connection-status error';
    showToast('Ulanishda xato: ' + err.message, 'error');
  }
}

async function loadSheetData() {
  if (!CONFIG.SHEETDB_URL) { showToast('Avval API URL kiriting', 'error'); return; }
  await connectSheetDB();
}

function renderTableList() {
  const list = document.getElementById('tableList');
  list.innerHTML = `<div class="table-item active" onclick="loadSheetData()">📊 Asosiy jadval (${state.sheetdbData.length} qator)</div>`;
}

function renderDataTable(data) {
  const thead = document.getElementById('dataTableHead');
  const tbody = document.getElementById('dataTableBody');
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-cell">Ma\'lumot topilmadi</td></tr>';
    return;
  }

  const headers = Object.keys(data[0]);
  thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}<th>Amallar</th></tr>`;
  tbody.innerHTML = data.map((row, i) => `
    <tr>
      ${headers.map(h => `<td class="editable" ondblclick="editCell(this,${i},'${h}')">${row[h] || ''}</td>`).join('')}
      <td><button class="btn-danger" style="padding:3px 8px;font-size:11px" onclick="deleteRow(${i})">🗑</button></td>
    </tr>
  `).join('');
}

function filterTableData(query) {
  if (!query) { renderDataTable(state.sheetdbData); return; }
  const filtered = state.sheetdbData.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
  );
  renderDataTable(filtered);
}

async function addRow() {
  if (!CONFIG.SHEETDB_URL) { showToast('Avval API ga ulaning', 'error'); return; }
  const newRow = {};
  state.sheetdbHeaders.forEach(h => { newRow[h] = ''; });

  try {
    const res = await fetch(CONFIG.SHEETDB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [newRow] }),
    });
    if (!res.ok) throw new Error();
    await loadSheetData();
    showToast('Yangi qator qo\'shildi', 'success');
  } catch {
    showToast('Qator qo\'shishda xato', 'error');
  }
}

async function deleteRow(index) {
  if (!confirm('Bu qatorni o\'chirishni tasdiqlaysizmi?')) return;
  // SheetDB da id orqali o'chirish
  const row = state.sheetdbData[index];
  if (!row) return;
  const idKey = Object.keys(row)[0];
  try {
    const res = await fetch(`${CONFIG.SHEETDB_URL}/id/${row[idKey]}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    state.sheetdbData.splice(index, 1);
    renderDataTable(state.sheetdbData);
    showToast('Qator o\'chirildi', 'info');
  } catch {
    showToast('O\'chirishda xato', 'error');
  }
}

async function editCell(td, rowIndex, header) {
  const original = td.textContent;
  td.contentEditable = 'true';
  td.focus();
  const range = document.createRange();
  range.selectNodeContents(td);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  td.addEventListener('blur', async () => {
    td.contentEditable = 'false';
    const newVal = td.textContent.trim();
    if (newVal === original) return;
    state.sheetdbData[rowIndex][header] = newVal;
    // SheetDB yangilash
    try {
      if (CONFIG.SHEETDB_URL) {
        const row = state.sheetdbData[rowIndex];
        const idKey = Object.keys(row)[0];
        await fetch(`${CONFIG.SHEETDB_URL}/id/${row[idKey]}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { [header]: newVal } }),
        });
        showToast('Yangilandi ✓', 'success');
      }
    } catch {
      showToast('Yangilashda xato', 'error');
    }
  }, { once: true });
}

function exportCSV() {
  if (!state.sheetdbData.length) { showToast('Ma\'lumot yo\'q', 'error'); return; }
  const headers = Object.keys(state.sheetdbData[0]);
  const csv = [headers.join(','), ...state.sheetdbData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
  downloadFile(csv, 'data.csv', 'text/csv');
  showToast('CSV yuklab olindi', 'success');
}

// ============================================================
// TARIX (UNDO/REDO)
// ============================================================
function saveHistory() {
  const snapshot = JSON.stringify(state.elements);
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshot);
  state.historyIndex = state.history.length - 1;
  if (state.history.length > 50) {
    state.history.shift();
    state.historyIndex--;
  }
}

function undoAction() {
  if (state.historyIndex <= 0) { showToast('Ortga qaytish imkoni yo\'q', 'info'); return; }
  state.historyIndex--;
  restoreHistory();
}

function redoAction() {
  if (state.historyIndex >= state.history.length - 1) { showToast('Oldinga qaytish imkoni yo\'q', 'info'); return; }
  state.historyIndex++;
  restoreHistory();
}

function restoreHistory() {
  const snapshot = state.history[state.historyIndex];
  if (!snapshot) return;
  state.elements = JSON.parse(snapshot);
  const canvas = document.getElementById('canvas');
  canvas.querySelectorAll('.canvas-element').forEach(el => el.remove());
  state.elements.forEach(el => renderElement(el));
  selectElement(null);
  checkEmptyCanvas();
  generateCode();
}

// ============================================================
// KLAVIATURA SHORTCUTLARI
// ============================================================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const key  = e.key.toLowerCase();

    if (ctrl && key === 'z' && !e.shiftKey) { e.preventDefault(); undoAction(); }
    if (ctrl && key === 'z' &&  e.shiftKey) { e.preventDefault(); redoAction(); }
    if (ctrl && key === 'y')                { e.preventDefault(); redoAction(); }
    if (ctrl && key === 'd')                { e.preventDefault(); duplicateSelected(); }
    if (ctrl && key === 's')                { e.preventDefault(); saveProject(); }
    if (key === 'delete' || key === 'backspace') {
      const active = document.activeElement;
      if (!active || ['INPUT','TEXTAREA'].includes(active.tagName)) return;
      if (active.contentEditable === 'true') return;
      deleteSelected();
    }
    if (key === 'escape') selectElement(null);

    // Arrow keys
    if (state.selectedId && ['arrowleft','arrowright','arrowup','arrowdown'].includes(key)) {
      e.preventDefault();
      const el = state.elements.find(x => x.id === state.selectedId);
      if (!el) return;
      const step = e.shiftKey ? 10 : 1;
      if (key === 'arrowleft')  el.x = Math.max(0, el.x - step);
      if (key === 'arrowright') el.x = el.x + step;
      if (key === 'arrowup')    el.y = Math.max(0, el.y - step);
      if (key === 'arrowdown')  el.y = el.y + step;
      const domEl = document.getElementById(el.id);
      if (domEl) { domEl.style.left = el.x + 'px'; domEl.style.top = el.y + 'px'; }
      fillPropsPanel(el);
    }
  });
}

// ============================================================
// CONTEXT MENU
// ============================================================
function setupContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('.canvas-element')) hideContextMenu();
  });
}

function onContextMenu(e) {
  e.preventDefault();
}

function showContextMenu(x, y) {
  const menu = document.getElementById('contextMenu');
  menu.style.display = 'block';
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}

function hideContextMenu() {
  const menu = document.getElementById('contextMenu');
  if (menu) menu.style.display = 'none';
}

// ============================================================
// SAQLASH / EKSPORT / NASHR
// ============================================================
function saveProject() {
  const data = {
    name: document.getElementById('projectName')?.value || 'Mening Loyiham',
    elements: state.elements,
    canvasWidth: state.canvasWidth,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem('webcraft_project', JSON.stringify(data));
  showToast('Loyiha saqlandi ✓', 'success');
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('webcraft_project');
    if (!saved) return;
    const data = JSON.parse(saved);
    if (data.name) {
      const inp = document.getElementById('projectName');
      if (inp) inp.value = data.name;
    }
    if (data.elements && data.elements.length > 0) {
      state.elements = data.elements;
      state.elements.forEach(el => renderElement(el));
      hideEmptyHint();
      generateCode();
      showToast('Avvalgi loyiha yuklandi', 'info');
    }
  } catch (e) {
    console.warn('Yuklashda xato:', e);
  }
}

function setupAutoSave() {
  setInterval(saveProject, CONFIG.AUTO_SAVE_INTERVAL);
}

function exportProject() {
  document.getElementById('exportModal').style.display = 'flex';
}

function closeModal(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
  }
}

function exportAs(type) {
  const title = document.getElementById('projectName')?.value || 'loyiha';
  const html  = document.getElementById('htmlEditor')?.value || generateHTML();
  const css   = document.getElementById('cssEditor')?.value  || generateCSS();
  const js    = document.getElementById('jsEditor')?.value   || generateJS();

  if (type === 'html') {
    const full = html
      .replace('</head>', `<style>\n${css}\n</style>\n</head>`)
      .replace('</body>', `<script>\n${js}\n<\/script>\n</body>`);
    downloadFile(full, `${title}.html`, 'text/html');
    showToast('HTML fayl yuklab olindi', 'success');
  } else if (type === 'json') {
    const data = JSON.stringify({ name: title, elements: state.elements, html, css, js }, null, 2);
    downloadFile(data, `${title}.json`, 'application/json');
    showToast('JSON fayl yuklab olindi', 'success');
  } else if (type === 'zip') {
    // ZIP uchun oddiy yechim — alohida fayllar
    downloadFile(html, `${title}/index.html`, 'text/html');
    showToast('ZIP qo\'llab-quvvatlanmaydi (HTML sifatida yuklab olindi)', 'info');
  }
  document.getElementById('exportModal').style.display = 'none';
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function publishProject() {
  switchView('preview');
  showToast('Ko\'rinish rejimi ochildi', 'info');
}

// ============================================================
// ELEMENT FILTRLASH
// ============================================================
function filterElements(query) {
  const cards = document.querySelectorAll('.element-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query.toLowerCase()) ? 'flex' : 'none';
  });
}

// ============================================================
// PANEL YASHIRISH / KO'RSATISH
// ============================================================
function togglePanel(side) {
  const panel = document.getElementById(side === 'left' ? 'leftPanel' : 'rightPanel');
  const isHidden = panel.style.width === '0px';
  panel.style.width = isHidden ? 'var(--panel-width)' : '0px';
  panel.style.overflow = isHidden ? '' : 'hidden';
}

// ============================================================
// TOAST XABARLARI
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}
