/**
 * WebCraft Pro — bot_template.js
 * Tayyor shablonlar va AI yordamchisi
 * Web ilovalar uchun tez boshlash shablonlari
 */

// ============================================================
// TAYYOR SHABLONLAR
// ============================================================
const TEMPLATES = {
  landing: {
    id: 'landing',
    name: 'Landing Page',
    description: 'Biznes uchun professional sahifa',
    icon: '🚀',
    category: 'Biznes',
    elements: [
      {
        type: 'navbar',
        x: 0, y: 0, width: 1280, height: 64,
        styles: { display: 'flex', alignItems: 'center', padding: '0 48px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', gap: '24px', position: 'absolute' },
        content: '<span style="font-weight:800;font-size:20px;color:#1e293b">YourBrand</span><nav style="display:flex;gap:24px;margin-left:auto;align-items:center"><a href="#" style="text-decoration:none;color:#64748b;font-size:14px;font-weight:500">Xizmatlar</a><a href="#" style="text-decoration:none;color:#64748b;font-size:14px;font-weight:500">Haqida</a><a href="#" style="text-decoration:none;color:#64748b;font-size:14px;font-weight:500">Aloqa</a><button style="background:#4f7bff;color:#fff;border:none;padding:8px 20px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px">Boshlash</button></nav>',
      },
      {
        type: 'hero',
        x: 0, y: 64, width: 1280, height: 440,
        styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', color: '#fff', padding: '60px', textAlign: 'center', gap: '20px' },
        content: '<h1 style="font-size:48px;font-weight:800;margin:0;line-height:1.2">Biznesingizni onlayn olib chiqing</h1><p style="font-size:18px;opacity:0.85;margin:0;max-width:560px;line-height:1.6">Mijozlaringizga professional web ilova orqali yeting. Tez, arzon va ishonchli.</p><div style="display:flex;gap:12px;margin-top:8px"><button style="background:#fff;color:#667eea;border:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;cursor:pointer">Bepul boshlash →</button><button style="background:transparent;color:#fff;border:2px solid rgba(255,255,255,0.5);padding:14px 32px;border-radius:50px;font-weight:600;font-size:15px;cursor:pointer">Demo ko\'rish</button></div>',
      },
      {
        type: 'container',
        x: 0, y: 504, width: 1280, height: 200,
        styles: { display: 'flex', justifyContent: 'center', gap: '32px', padding: '48px', backgroundColor: '#f8fafc', alignItems: 'flex-start' },
        content: `
          <div style="text-align:center;flex:1;max-width:220px">
            <div style="font-size:36px;margin-bottom:8px">⚡</div>
            <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;color:#1e293b">Tez ishlaydi</h3>
            <p style="font-size:13px;color:#64748b;line-height:1.6">Yuqori tezlik va optimallashtirilgan kod bilan saytingiz tez yuklanadi</p>
          </div>
          <div style="text-align:center;flex:1;max-width:220px">
            <div style="font-size:36px;margin-bottom:8px">🔒</div>
            <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;color:#1e293b">Xavfsiz</h3>
            <p style="font-size:13px;color:#64748b;line-height:1.6">SSL sertifikat va zamonaviy xavfsizlik standartlari bilan himoyalangan</p>
          </div>
          <div style="text-align:center;flex:1;max-width:220px">
            <div style="font-size:36px;margin-bottom:8px">📱</div>
            <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;color:#1e293b">Moslashuvchan</h3>
            <p style="font-size:13px;color:#64748b;line-height:1.6">Barcha qurilmalar: telefon, planshet va kompyuterda mukammal ko'rinadi</p>
          </div>
          <div style="text-align:center;flex:1;max-width:220px">
            <div style="font-size:36px;margin-bottom:8px">🎯</div>
            <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;color:#1e293b">Samarali</h3>
            <p style="font-size:13px;color:#64748b;line-height:1.6">Konversiyani oshiruvchi dizayn va A/B test imkoniyatlari</p>
          </div>
        `,
      },
    ],
  },

  contact_form: {
    id: 'contact_form',
    name: 'Aloqa Forması',
    description: 'Mijozlardan xabar qabul qilish',
    icon: '📬',
    category: 'Forma',
    elements: [
      {
        type: 'heading',
        x: 80, y: 60, width: 500,
        styles: { fontSize: '32px', fontWeight: '800', color: '#1e293b' },
        content: 'Biz bilan bog\'laning',
      },
      {
        type: 'text',
        x: 80, y: 110, width: 480,
        styles: { fontSize: '15px', color: '#64748b', lineHeight: '1.6' },
        content: 'Savollaringiz bo\'lsa, quyidagi formani to\'ldiring.',
      },
      {
        type: 'input',
        x: 80, y: 170, width: 480,
        attrs: { placeholder: 'Ismingiz' },
        styles: { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', width: '100%' },
      },
      {
        type: 'input',
        x: 80, y: 230, width: 480,
        attrs: { placeholder: 'Email manzilingiz' },
        styles: { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', width: '100%' },
      },
      {
        type: 'input',
        x: 80, y: 290, width: 480,
        attrs: { placeholder: 'Telefon raqamingiz' },
        styles: { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', width: '100%' },
      },
      {
        type: 'textarea',
        x: 80, y: 350, width: 480, height: 120,
        attrs: { placeholder: 'Xabaringiz...' },
        styles: { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', resize: 'vertical', width: '100%' },
      },
      {
        type: 'button',
        x: 80, y: 492, width: 200,
        styles: { backgroundColor: '#4f7bff', color: '#fff', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px', width: '100%' },
        content: 'Yuborish →',
      },
    ],
  },

  pricing: {
    id: 'pricing',
    name: 'Narxlar Jadvali',
    description: 'Xizmat narxlarini ko\'rsatish',
    icon: '💰',
    category: 'Biznes',
    elements: [
      {
        type: 'heading',
        x: 390, y: 40, width: 500,
        styles: { fontSize: '36px', fontWeight: '800', color: '#1e293b', textAlign: 'center' },
        content: 'Narxlar',
      },
      {
        type: 'text',
        x: 340, y: 95, width: 600,
        styles: { fontSize: '16px', color: '#64748b', textAlign: 'center', lineHeight: '1.6' },
        content: 'Biznesingiz uchun eng mos rejani tanlang',
      },
      {
        type: 'card',
        x: 80, y: 160, width: 340, height: 400,
        styles: { padding: '32px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
        content: '<h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Asosiy</h3><div style="font-size:36px;font-weight:800;color:#4f7bff;margin-bottom:4px">Bepul</div><p style="color:#94a3b8;font-size:13px;margin-bottom:24px">har doim</p><hr style="border-color:#f1f5f9;margin-bottom:20px"><ul style="list-style:none;display:flex;flex-direction:column;gap:10px;font-size:13px;color:#475569"><li>✓ 3 ta loyiha</li><li>✓ 50 element</li><li>✓ HTML export</li><li style="color:#94a3b8">✗ O\'z domen</li><li style="color:#94a3b8">✗ Ustuvor qo\'llab-quvvatlash</li></ul><button style="margin-top:24px;width:100%;padding:12px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#4f7bff;font-weight:700;cursor:pointer;font-size:14px">Boshlash</button>',
      },
      {
        type: 'card',
        x: 470, y: 140, width: 340, height: 440,
        styles: { padding: '32px', background: 'linear-gradient(135deg,#4f7bff,#764ba2)', color: '#fff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(79,123,255,0.35)', position: 'relative' },
        content: '<div style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700">MASHHUR</div><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Pro</h3><div style="font-size:36px;font-weight:800;margin-bottom:4px">99K <span style="font-size:16px;font-weight:400">so\'m</span></div><p style="opacity:0.7;font-size:13px;margin-bottom:24px">oyiga</p><hr style="border-color:rgba(255,255,255,0.2);margin-bottom:20px"><ul style="list-style:none;display:flex;flex-direction:column;gap:10px;font-size:13px"><li>✓ 20 ta loyiha</li><li>✓ Cheksiz elementlar</li><li>✓ Barcha export</li><li>✓ O\'z domen</li><li>✓ Ustuvor qo\'llab-quvvatlash</li></ul><button style="margin-top:24px;width:100%;padding:12px;border-radius:10px;border:none;background:#fff;color:#4f7bff;font-weight:700;cursor:pointer;font-size:14px">Pro ni tanlash</button>',
      },
      {
        type: 'card',
        x: 860, y: 160, width: 340, height: 400,
        styles: { padding: '32px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' },
        content: '<h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Enterprise</h3><div style="font-size:36px;font-weight:800;color:#a78bfa;margin-bottom:4px">499K <span style="font-size:16px;font-weight:400">so\'m</span></div><p style="color:#64748b;font-size:13px;margin-bottom:24px">oyiga</p><hr style="border-color:#1e293b;margin-bottom:20px"><ul style="list-style:none;display:flex;flex-direction:column;gap:10px;font-size:13px;color:#94a3b8"><li>✓ Cheksiz loyihalar</li><li>✓ Cheksiz xotira</li><li>✓ Maxsus integratsiyalar</li><li>✓ Jamoa boshqaruvi</li><li>✓ API kirish</li></ul><button style="margin-top:24px;width:100%;padding:12px;border-radius:10px;border:1px solid #334155;background:transparent;color:#a78bfa;font-weight:700;cursor:pointer;font-size:14px">Bog\'lanish</button>',
      },
    ],
  },

  portfolio: {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Shaxsiy portfolio sahifasi',
    icon: '🎨',
    category: 'Shaxsiy',
    elements: [
      {
        type: 'hero',
        x: 0, y: 0, width: 1280, height: 360,
        styles: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff', padding: '60px 80px', gap: '16px' },
        content: '<p style="font-size:14px;color:#4f7bff;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0">Web Dasturchi</p><h1 style="font-size:56px;font-weight:800;margin:0;line-height:1.1">Ismi Familiya</h1><p style="font-size:16px;color:#94a3b8;margin:0;max-width:480px;line-height:1.7">React, Node.js va zamonaviy web texnologiyalar bilan ishlaydigan tajribali dasturchi.</p><div style="display:flex;gap:12px;margin-top:8px"><button style="background:#4f7bff;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px">Loyihalarni ko\'rish</button><button style="background:transparent;color:#fff;border:1px solid #334155;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px">Bog\'lanish</button></div>',
      },
    ],
  },

  blank: {
    id: 'blank',
    name: 'Bo\'sh sahifa',
    description: 'Noldan boshlash',
    icon: '📄',
    category: 'Asosiy',
    elements: [],
  },
};

// ============================================================
// SHABLON TANLASH MODAL
// ============================================================
function showTemplateModal() {
  const existing = document.getElementById('templateModal');
  if (existing) existing.remove();

  const categories = [...new Set(Object.values(TEMPLATES).map(t => t.category))];

  const modal = document.createElement('div');
  modal.id = 'templateModal';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex;z-index:9999';
  modal.innerHTML = `
    <div class="modal" style="max-width:700px;width:95vw">
      <div class="modal-header">
        <h3>📐 Shablon tanlang</h3>
        <button class="modal-close" onclick="document.getElementById('templateModal').remove()">✕</button>
      </div>
      <div class="modal-body" style="max-height:60vh;overflow-y:auto">
        ${categories.map(cat => `
          <div style="margin-bottom:20px">
            <div class="section-label">${cat}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:8px">
              ${Object.values(TEMPLATES).filter(t => t.category === cat).map(t => `
                <div
                  onclick="applyTemplate('${t.id}')"
                  style="border:1px solid var(--border);border-radius:10px;padding:16px;cursor:pointer;transition:all 0.15s;background:var(--bg-surface)"
                  onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-dim)'"
                  onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg-surface)'"
                >
                  <div style="font-size:28px;margin-bottom:8px">${t.icon}</div>
                  <div style="font-weight:600;font-size:13px;margin-bottom:4px">${t.name}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${t.description}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

function applyTemplate(templateId) {
  const template = TEMPLATES[templateId];
  if (!template) return;

  if (state.elements.length > 0) {
    if (!confirm('Joriy canvas tozalanadi. Davom etasizmi?')) return;
  }

  // Canvasni tozalash
  const canvas = document.getElementById('canvas');
  canvas.querySelectorAll('.canvas-element').forEach(el => el.remove());
  state.elements = [];
  state.selectedId = null;

  // Shablon elementlarini qo'shish
  template.elements.forEach(templateEl => {
    const id = 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const el = { ...templateEl, id };
    state.elements.push(el);
    renderElement(el);
  });

  if (template.elements.length > 0) {
    hideEmptyHint();
  } else {
    checkEmptyCanvas();
  }

  saveHistory();
  generateCode();

  document.getElementById('templateModal')?.remove();
  if (typeof showToast === 'function') {
    showToast(`"${template.name}" shabloni qo'llanildi`, 'success');
  }
}

// ============================================================
// BOT YORDAMCHI (AI yordamida element tavsiya qilish)
// ============================================================
const BOT = {
  isOpen: false,
  history: [],
};

const BOT_RESPONSES = {
  greetings: ['salom', 'hello', 'hi', 'assalomu'],
  layout: ['landing page', 'landing', 'sahifa', 'homepage', 'bosh sahifa'],
  form: ['forma', 'form', 'aloqa', 'contact', 'xabar'],
  card: ['karta', 'card', 'blok', 'box'],
  pricing: ['narx', 'price', 'pricing', 'to\'lov'],
  button: ['tugma', 'button', 'btn'],
  image: ['rasm', 'image', 'img', 'photo'],
  text: ['matn', 'text', 'yozuv'],
  nav: ['navbar', 'nav', 'menu', 'navigatsiya'],
};

function getBotResponse(input) {
  const lower = input.toLowerCase().trim();

  // Salomlashish
  if (BOT_RESPONSES.greetings.some(g => lower.includes(g))) {
    return { text: 'Assalomu alaykum! 👋 Men sizga web ilovangizni yaratishda yordam beraman. Nima qo\'shishni xohlaysiz?', action: null };
  }

  // Landing page
  if (BOT_RESPONSES.layout.some(g => lower.includes(g))) {
    return {
      text: 'Landing page uchun sizga shablon taklif qilaman! ✨',
      action: () => applyTemplate('landing'),
      actionLabel: '🚀 Landing Page shablonini qo\'llash',
    };
  }

  // Forma
  if (BOT_RESPONSES.form.some(g => lower.includes(g))) {
    return {
      text: 'Aloqa formasi uchun tayyor shablon bor! 📬',
      action: () => applyTemplate('contact_form'),
      actionLabel: '📬 Aloqa formasini qo\'llash',
    };
  }

  // Narxlar
  if (BOT_RESPONSES.pricing.some(g => lower.includes(g))) {
    return {
      text: 'Narxlar jadvalini qo\'shishni xohlaysizmi? 💰',
      action: () => applyTemplate('pricing'),
      actionLabel: '💰 Narxlar jadvalini qo\'llash',
    };
  }

  // Tugma
  if (BOT_RESPONSES.button.some(g => lower.includes(g))) {
    return {
      text: 'Tugma qo\'shish uchun tugmasini bosing yoki "Tugma" elementini canvas ga torting.',
      action: () => addElement('button', 100, 100),
      actionLabel: '◻ Tugma qo\'shish',
    };
  }

  // Rasm
  if (BOT_RESPONSES.image.some(g => lower.includes(g))) {
    return {
      text: 'Rasm qo\'shish uchun chap paneldan "Rasm" elementini torting yoki ImgBB orqali yuklang.',
      action: () => addElement('image', 100, 100),
      actionLabel: '🖼 Rasm qo\'shish',
    };
  }

  // Navbar
  if (BOT_RESPONSES.nav.some(g => lower.includes(g))) {
    return {
      text: 'Navbar qo\'shaman!',
      action: () => addElement('navbar', 0, 0),
      actionLabel: '☰ Navbar qo\'shish',
    };
  }

  // Qanday foydalanish
  if (lower.includes('yordam') || lower.includes('help') || lower.includes('qanday')) {
    return {
      text: `Quyidagi buyruqlardan foydalaning:\n• "landing page" — landing page shabloni\n• "forma" — aloqa formasi\n• "narxlar" — narxlar jadvali\n• "tugma" — tugma qo'shish\n• "rasm" — rasm qo'shish\n• "shablon" — barcha shablonlar`,
      action: () => showTemplateModal(),
      actionLabel: '📐 Barcha shablonlar',
    };
  }

  // Default
  return {
    text: 'Tushunmadim 🤔 "yordam" deb yozing yoki shablonlardan birini tanlang.',
    action: () => showTemplateModal(),
    actionLabel: '📐 Shablonlarni ko\'rish',
  };
}

// ============================================================
// BOT UI
// ============================================================
function toggleBot() {
  BOT.isOpen = !BOT.isOpen;
  const panel = document.getElementById('botPanel');
  if (panel) {
    panel.style.display = BOT.isOpen ? 'flex' : 'none';
    if (BOT.isOpen) document.getElementById('botInput')?.focus();
  } else if (BOT.isOpen) {
    createBotPanel();
  }
}

function createBotPanel() {
  const panel = document.createElement('div');
  panel.id = 'botPanel';
  panel.style.cssText = `
    position:fixed;
    bottom:80px;right:20px;
    width:320px;height:420px;
    background:var(--bg-surface);
    border:1px solid var(--border-light);
    border-radius:16px;
    box-shadow:var(--shadow-lg);
    display:flex;flex-direction:column;
    z-index:9990;
    overflow:hidden;
  `;

  panel.innerHTML = `
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:var(--bg-panel)">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">🤖</span>
        <div>
          <div style="font-weight:700;font-size:13px">WebCraft Yordamchi</div>
          <div style="font-size:10px;color:var(--green)">● Onlayn</div>
        </div>
      </div>
      <button onclick="toggleBot()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px">✕</button>
    </div>
    <div id="botMessages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px">
      ${renderBotMessage('Salom! 👋 Men sizga web ilovangizni yaratishda yordam beraman. Nima qo\'shishni xohlaysiz?', 'bot')}
    </div>
    <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px">
      <input
        id="botInput"
        type="text"
        placeholder="Xabar yozing..."
        style="flex:1;background:var(--bg-hover);border:1px solid var(--border);color:var(--text-primary);padding:8px 12px;border-radius:8px;font-size:12px;font-family:var(--font-ui);outline:none"
        onkeydown="if(event.key==='Enter')sendBotMessage()"
      />
      <button onclick="sendBotMessage()" style="background:var(--accent);color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:14px">→</button>
    </div>
  `;

  document.body.appendChild(panel);
}

function renderBotMessage(text, sender, action = null, actionLabel = '') {
  const isBot = sender === 'bot';
  return `
    <div style="display:flex;flex-direction:column;align-items:${isBot ? 'flex-start' : 'flex-end'};gap:4px">
      <div style="
        max-width:85%;padding:10px 12px;
        background:${isBot ? 'var(--bg-panel)' : 'var(--accent)'};
        color:${isBot ? 'var(--text-primary)' : '#fff'};
        border-radius:${isBot ? '4px 12px 12px 12px' : '12px 4px 12px 12px'};
        font-size:12px;line-height:1.6;white-space:pre-wrap;
      ">${text}</div>
      ${action ? `
        <button
          onclick="(${action.toString()})()"
          style="font-size:11px;background:var(--accent-dim);color:var(--accent);border:1px solid var(--accent);padding:5px 10px;border-radius:8px;cursor:pointer;font-weight:600"
        >${actionLabel}</button>
      ` : ''}
    </div>
  `;
}

function sendBotMessage() {
  const input = document.getElementById('botInput');
  const messages = document.getElementById('botMessages');
  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;

  // Foydalanuvchi xabari
  messages.innerHTML += renderBotMessage(text, 'user');
  input.value = '';

  // Bot javobi
  setTimeout(() => {
    const response = getBotResponse(text);
    messages.innerHTML += renderBotMessage(response.text, 'bot', response.action, response.actionLabel);
    messages.scrollTop = messages.scrollHeight;
  }, 400);

  messages.scrollTop = messages.scrollHeight;
}

// ============================================================
// BOT TUGMASI (Navbar ga qo'shish)
// ============================================================
function addBotAndTemplateButtons() {
  const navRight = document.querySelector('.navbar-right');
  if (!navRight) return;

  // Shablonlar tugmasi
  const tplBtn = document.createElement('button');
  tplBtn.className = 'btn-secondary';
  tplBtn.innerHTML = '📐 Shablonlar';
  tplBtn.onclick = showTemplateModal;
  navRight.insertBefore(tplBtn, navRight.firstChild);

  // Bot tugmasi (o'ng pastki burchak)
  const botBtn = document.createElement('button');
  botBtn.id = 'botToggleBtn';
  botBtn.innerHTML = '🤖';
  botBtn.style.cssText = `
    position:fixed;bottom:20px;right:20px;
    width:52px;height:52px;
    background:var(--accent);
    color:#fff;border:none;
    border-radius:50%;
    font-size:22px;
    cursor:pointer;
    box-shadow:0 4px 16px rgba(79,123,255,0.45);
    z-index:9989;
    transition:transform 0.15s;
    display:flex;align-items:center;justify-content:center;
  `;
  botBtn.onmouseover = () => { botBtn.style.transform = 'scale(1.1)'; };
  botBtn.onmouseout  = () => { botBtn.style.transform = 'scale(1)'; };
  botBtn.onclick = toggleBot;
  document.body.appendChild(botBtn);
}

// ============================================================
// ILOVA ISHGA TUSHGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  addBotAndTemplateButtons();

  // Birinchi kirish uchun shablon modal
  const isFirstVisit = !localStorage.getItem('webcraft_project');
  if (isFirstVisit) {
    setTimeout(() => showTemplateModal(), 1000);
  }
});
