/**
 * WebCraft Pro — billing.js
 * To'lov tizimi xizmati
 * Hozircha: reja tizimi (free/pro/enterprise)
 * Kelajak: Click yoki Payme integratsiyasi
 */

// ============================================================
// REJA KONFIGURATSIYASI
// ============================================================
const PLANS = {
  free: {
    id: 'free',
    name: 'Bepul',
    price: 0,
    currency: 'UZS',
    limits: {
      projects: 3,
      elements: 50,
      storage_mb: 100,
      custom_domain: false,
      imgbb_uploads: 10,
      export_formats: ['html'],
      sheetdb_rows: 100,
    },
    features: ['3 ta loyiha', '50 element', '100MB saqlash', 'HTML export'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99000,  // 99,000 so'm / oy
    currency: 'UZS',
    limits: {
      projects: 20,
      elements: -1,       // cheksiz
      storage_mb: 5120,   // 5GB
      custom_domain: true,
      imgbb_uploads: -1,
      export_formats: ['html', 'zip', 'json'],
      sheetdb_rows: -1,
    },
    features: ['20 ta loyiha', 'Cheksiz elementlar', '5GB saqlash', 'Barcha export', 'O\'z domen', 'Ustuvor qo\'llab-quvvatlash'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499000, // 499,000 so'm / oy
    currency: 'UZS',
    limits: {
      projects: -1,
      elements: -1,
      storage_mb: -1,
      custom_domain: true,
      imgbb_uploads: -1,
      export_formats: ['html', 'zip', 'json'],
      sheetdb_rows: -1,
    },
    features: ['Cheksiz loyihalar', 'Cheksiz xotira', 'Maxsus integratsiyalar', 'Jamoa boshqaruvi', 'API kirish', 'Shaxsiy qo\'llab-quvvatlash'],
  },
};

// ============================================================
// FOYDALANUVCHI HOLATI
// ============================================================
const billing = {
  currentPlan: 'free',        // 'free' | 'pro' | 'enterprise'
  usage: {
    projects: 1,
    elements: 0,
    storage_mb: 0,
    imgbb_uploads: 0,
    sheetdb_rows: 0,
  },
  isTrialActive: false,
  trialEndsAt: null,
};

// LocalStorage dan yuklash
function loadBillingState() {
  try {
    const saved = localStorage.getItem('webcraft_billing');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(billing, data);
    }
  } catch (e) {}
}

function saveBillingState() {
  localStorage.setItem('webcraft_billing', JSON.stringify(billing));
}

// ============================================================
// REJA TEKSHIRISH FUNKSIYALARI
// ============================================================
function getCurrentPlan() {
  return PLANS[billing.currentPlan] || PLANS.free;
}

function isPro() {
  return billing.currentPlan === 'pro' || billing.currentPlan === 'enterprise';
}

function isEnterprise() {
  return billing.currentPlan === 'enterprise';
}

/**
 * Limitni tekshirish
 * @param {string} feature - 'elements', 'projects', 'storage_mb', etc.
 * @param {number} currentCount - Joriy foydalanish
 * @returns {{ allowed: boolean, message: string }}
 */
function checkLimit(feature, currentCount = null) {
  const plan = getCurrentPlan();
  const limit = plan.limits[feature];

  if (limit === -1) return { allowed: true, message: '' }; // Cheksiz

  const count = currentCount !== null ? currentCount : (billing.usage[feature] || 0);

  if (count >= limit) {
    return {
      allowed: false,
      message: `${plan.name} rejasida ${getFeatureLabel(feature)} limiti: ${limit}. Yangilash uchun Pro rejaga o'ting.`,
    };
  }

  return { allowed: true, message: '' };
}

function getFeatureLabel(feature) {
  const labels = {
    elements: 'element',
    projects: 'loyiha',
    storage_mb: 'MB saqlash',
    imgbb_uploads: 'rasm yuklash',
    sheetdb_rows: 'jadval qatori',
    export_formats: 'eksport formati',
  };
  return labels[feature] || feature;
}

/**
 * Element qo'shishdan oldin limit tekshirish
 * app.js addElement() ichidan chaqiriladi
 */
function canAddElement() {
  const result = checkLimit('elements', state?.elements?.length || 0);
  if (!result.allowed) {
    showUpgradePrompt(result.message);
    return false;
  }
  return true;
}

/**
 * Rasm yuklashdan oldin limit tekshirish
 */
function canUploadImage() {
  const result = checkLimit('imgbb_uploads', billing.usage.imgbb_uploads);
  if (!result.allowed) {
    showUpgradePrompt(result.message);
    return false;
  }
  return true;
}

/**
 * Export qilishdan oldin tekshirish
 */
function canExportAs(format) {
  const plan = getCurrentPlan();
  if (!plan.limits.export_formats.includes(format)) {
    showUpgradePrompt(`"${format.toUpperCase()}" formati ${plan.name} rejasida mavjud emas.`);
    return false;
  }
  return true;
}

// ============================================================
// FOYDALANISHNI YANGILASH
// ============================================================
function incrementUsage(feature, amount = 1) {
  if (billing.usage[feature] !== undefined) {
    billing.usage[feature] += amount;
    saveBillingState();
  }
}

function decrementUsage(feature, amount = 1) {
  if (billing.usage[feature] !== undefined) {
    billing.usage[feature] = Math.max(0, billing.usage[feature] - amount);
    saveBillingState();
  }
}

// ============================================================
// UPGRADE MODAL
// ============================================================
function showUpgradePrompt(message = '') {
  const existing = document.getElementById('upgradeModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'upgradeModal';
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h3>⭐ Pro rejaga yangilang</h3>
        <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">✕</button>
      </div>
      <div class="modal-body">
        ${message ? `<p style="color:var(--text-secondary);margin-bottom:16px;font-size:13px">${message}</p>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          ${renderPlanCard(PLANS.pro)}
          ${renderPlanCard(PLANS.enterprise)}
        </div>
        <p style="font-size:11px;color:var(--text-muted);text-align:center">
          To'lov xizmati tez orada qo'shiladi. Hozircha bepul rejadan foydalaning.
        </p>
      </div>
    </div>
  `;
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

function renderPlanCard(plan) {
  const price = plan.price === 0 ? 'Bepul' : `${(plan.price / 1000).toFixed(0)}K so'm/oy`;
  const isCurrent = billing.currentPlan === plan.id;
  return `
    <div style="border:1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'};border-radius:12px;padding:16px;background:${isCurrent ? 'var(--accent-dim)' : 'var(--bg-surface)'}">
      <div style="font-weight:700;font-size:16px;margin-bottom:4px">${plan.name}</div>
      <div style="font-size:18px;font-weight:800;color:var(--accent);margin-bottom:12px">${price}</div>
      <ul style="list-style:none;font-size:12px;color:var(--text-secondary);display:flex;flex-direction:column;gap:6px">
        ${plan.features.map(f => `<li>✓ ${f}</li>`).join('')}
      </ul>
      <button
        onclick="selectPlan('${plan.id}')"
        style="margin-top:16px;width:100%;padding:8px;border-radius:8px;border:none;background:${isCurrent ? 'var(--accent)' : 'var(--bg-hover)'};color:${isCurrent ? '#fff' : 'var(--text-primary)'};font-weight:600;cursor:pointer;font-size:13px"
      >${isCurrent ? 'Joriy reja' : 'Tanlash'}</button>
    </div>
  `;
}

function selectPlan(planId) {
  if (planId === 'free') {
    billing.currentPlan = 'free';
    saveBillingState();
    document.getElementById('upgradeModal')?.remove();
    if (typeof showToast === 'function') showToast('Bepul rejaga qaytildi', 'info');
    return;
  }

  // Pro/Enterprise uchun to'lov oqimi (kelajakda Click/Payme)
  initPayment(planId);
}

// ============================================================
// TO'LOV INTEGRATSIYASI (Click / Payme — kelajak)
// ============================================================

/**
 * Click to'lov tizimi bilan integratsiya
 * Hozircha simulyatsiya — haqiqiy to'lov uchun Click API kerak
 */
function initPayment(planId) {
  const plan = PLANS[planId];
  if (!plan) return;

  // TODO: Haqiqiy Click/Payme integratsiyasi
  // Click uchun: https://docs.click.uz
  // Payme uchun: https://developer.payme.uz

  const confirmed = confirm(
    `"${plan.name}" rejasini tanlaysizmi?\n` +
    `Narx: ${plan.price.toLocaleString()} UZS / oy\n\n` +
    `(Hozircha demo rejim — haqiqiy to'lov qo'llanilmaydi)`
  );

  if (confirmed) {
    activatePlan(planId);
  }
}

/**
 * Click to'lov URL yaratish (kelajakda ishlatiladi)
 * @param {string} planId
 * @param {string} userId
 */
function createClickPaymentUrl(planId, userId) {
  const plan = PLANS[planId];
  // Click to'lov parametrlari
  const params = {
    service_id: 'YOUR_CLICK_SERVICE_ID',   // Click dan olinadi
    merchant_id: 'YOUR_CLICK_MERCHANT_ID', // Click dan olinadi
    amount: plan.price,
    transaction_param: `${planId}_${userId}_${Date.now()}`,
    return_url: window.location.origin + '/payment/success',
  };
  const query = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `https://my.click.uz/services/pay?${query}`;
}

/**
 * Payme to'lov URL yaratish (kelajakda ishlatiladi)
 */
function createPaymePaymentUrl(planId, userId) {
  const plan = PLANS[planId];
  const params = {
    m: 'YOUR_PAYME_MERCHANT_ID',  // Payme dan olinadi
    ac: JSON.stringify({ plan_id: planId, user_id: userId }),
    a: plan.price * 100,           // tiyin hisobida
    c: window.location.origin + '/payment/success',
  };
  const encoded = btoa(JSON.stringify(params));
  return `https://checkout.paycom.uz/${encoded}`;
}

// ============================================================
// REJA FAOLLASHTIRISH
// ============================================================
function activatePlan(planId) {
  billing.currentPlan = planId;
  billing.isTrialActive = false;
  saveBillingState();

  document.getElementById('upgradeModal')?.remove();

  const plan = PLANS[planId];
  if (typeof showToast === 'function') {
    showToast(`${plan.name} rejasi faollashtirildi! 🎉`, 'success');
  }

  // Reja badge yangilash
  updatePlanBadge();
}

function startTrial(planId = 'pro', days = 7) {
  billing.isTrialActive = true;
  billing.trialEndsAt = new Date(Date.now() + days * 86400000).toISOString();
  billing.currentPlan = planId;
  saveBillingState();

  if (typeof showToast === 'function') {
    showToast(`${days} kunlik sinov davri boshlandi!`, 'success');
  }
  updatePlanBadge();
}

function checkTrialExpiry() {
  if (!billing.isTrialActive || !billing.trialEndsAt) return;
  if (new Date() > new Date(billing.trialEndsAt)) {
    billing.isTrialActive = false;
    billing.currentPlan = 'free';
    saveBillingState();
    if (typeof showToast === 'function') {
      showToast('Sinov davri tugadi. Bepul rejaga qaytildi.', 'info');
    }
  }
}

// ============================================================
// UI YANGILASH
// ============================================================
function updatePlanBadge() {
  const plan = getCurrentPlan();
  let badge = document.getElementById('planBadge');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'planBadge';
    badge.style.cssText = `
      font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;
      background:var(--accent-dim);color:var(--accent);letter-spacing:0.5px;
      text-transform:uppercase;
    `;
    const navbar = document.querySelector('.navbar-right');
    if (navbar) navbar.insertBefore(badge, navbar.firstChild);
  }
  badge.textContent = billing.isTrialActive ? `${plan.name} (sinov)` : plan.name;
  badge.style.background = plan.id === 'free' ? 'var(--bg-surface)' : 'var(--accent-dim)';
  badge.style.color       = plan.id === 'free' ? 'var(--text-muted)' : 'var(--accent)';
}

function showUsageStats() {
  const plan  = getCurrentPlan();
  const usage = billing.usage;

  const lines = Object.entries(usage).map(([key, val]) => {
    const limit = plan.limits[key];
    const limitStr = limit === -1 ? '∞' : String(limit);
    return `${getFeatureLabel(key)}: ${val} / ${limitStr}`;
  });

  alert('Foydalanish statistikasi:\n\n' + lines.join('\n'));
}

// ============================================================
// BILLING BILDIRISHNOMASI (Navbar uchun)
// ============================================================
function addBillingButton() {
  const navRight = document.querySelector('.navbar-right');
  if (!navRight) return;

  const btn = document.createElement('button');
  btn.className = 'btn-secondary';
  btn.style.fontSize = '12px';
  btn.innerHTML = '💳 Reja';
  btn.onclick = () => showUpgradePrompt();
  navRight.insertBefore(btn, navRight.firstChild);
}

// ============================================================
// ILOVA ISHGA TUSHGANDA BILLING NI BOSHLASH
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadBillingState();
  checkTrialExpiry();
  updatePlanBadge();
  addBillingButton();
});
