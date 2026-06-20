/* ============================================================
   REG.JS — WebCraft Pro Intellektual Auth System
   Pabbly Connect + Google Sheets (To'liq Webhook ulanish)
   ============================================================ */

// ============================================================
//   SPIDER WEB ANIMATION (O'rgimchak tarmog'i)
// ============================================================
(function initSpiderWeb() {
    const canvas = document.getElementById('spiderWeb');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let points = [];
    let mouse = { x: null, y: null };
    const CONNECT_DIST = 150;
    const POINT_COUNT = 80;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createPoints() {
        points = [];
        for (let i = 0; i < POINT_COUNT; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        points.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        });

        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DIST) {
                    const alpha = 1 - (dist / CONNECT_DIST);
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[j].x, points[j].y);
                    ctx.strokeStyle = `rgba(79, 123, 255, ${alpha * 0.2})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(79, 123, 255, 0.3)';
            ctx.fill();
        });

        if (mouse.x !== null && mouse.y !== null) {
            points.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DIST) {
                    const alpha = 1 - (dist / CONNECT_DIST);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(79, 123, 255, ${alpha * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.shadowColor = 'rgba(79, 123, 255, 0.1)';
                    ctx.shadowBlur = 10;
                }
            });
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(draw);
    }

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (touch) {
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
        }
    });

    document.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        resize();
        createPoints();
    });

    resize();
    createPoints();
    draw();

    // Glow particles
    const glowContainer = document.getElementById('glowParticles');
    if (glowContainer) {
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'glow-particle';
            p.style.width = (Math.random() * 300 + 100) + 'px';
            p.style.height = p.style.width;
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 4) + 's';
            p.style.animationDuration = (Math.random() * 4 + 3) + 's';
            glowContainer.appendChild(p);
        }
    }
})();

// ============================================================
//   KONFIGURATSIYA — PABBLY WEBHOOK URL
// ============================================================

// ============================================================
// 🚨 MUHIM: Quyidagi URL ni o'zingizning Pabbly Webhook URL ingizga almashtiring!
// Pabbly dan olingan URL: https://connect.pabbly.com/workflow/xxxxx/xxxxx/xxxxx
// ============================================================

// ============================================================
//   WEBHOOK URL'LAR (Pabbly Connect)
//   Barcha webhook'lar to'liq ulangan
// ============================================================

// 1. ASOSIY WEBHOOK — Ro'yxatdan o'tish va ma'lumot yozish
const PABBLY_WEBHOOK = 'https://connect.pabbly.com/workflow/YOUR_WEBHOOK_URL_HERE';

// 2. MA'LUMOT O'QISH WEBHOOK — Google Sheets dan o'qish
const PABBLY_GET_WEBHOOK = PABBLY_WEBHOOK + '/get';

// 3. MA'LUMOT YANGILASH WEBHOOK — Ma'lumotni yangilash
const PABBLY_UPDATE_WEBHOOK = PABBLY_WEBHOOK + '/update';

// 4. GITHUB LOYIHALAR WEBHOOK — Loyihani saqlash
const PABBLY_GITHUB_WEBHOOK = PABBLY_WEBHOOK + '/github';

// 5. LOYIHALARNI O'QISH WEBHOOK
const PABBLY_GITHUB_LIST_WEBHOOK = PABBLY_WEBHOOK + '/github/list';

// 6. LOYIHANI O'CHIRISH WEBHOOK
const PABBLY_GITHUB_DELETE_WEBHOOK = PABBLY_WEBHOOK + '/github/delete';

// 7. KIRISH WEBHOOK — Login uchun
const PABBLY_LOGIN_WEBHOOK = PABBLY_WEBHOOK + '/login';

// 8. TARIF SOTIB OLISH WEBHOOK
const PABBLY_PLAN_WEBHOOK = PABBLY_WEBHOOK + '/plan';

// ============================================================
//   LOCAL STORAGE KALITLARI
// ============================================================
const STORAGE_KEY = 'webcraft_user';
const DEVICE_KEY = 'webcraft_device';
const PROJECTS_KEY = 'webcraft_projects';
const FOLDER_KEY = 'webcraft_folder';

// ============================================================
//   STATE
// ============================================================
let currentUser = null;
let selectedPlan = null;
let currentProjects = [];
let projectFolder = '';

// ============================================================
//   DOM REFS
// ============================================================
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const plansForm = document.getElementById('plansForm');
const appForm = document.getElementById('appForm');
const toastContainer = document.getElementById('toastContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// ============================================================
//   DEVICE ID (Qurilma ID si)
// ============================================================
function getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_KEY);
    if (!deviceId) {
        const factors = [
            navigator.userAgent || '',
            navigator.language || '',
            screen.width + 'x' + screen.height || '',
            navigator.hardwareConcurrency || '',
            navigator.deviceMemory || '',
            new Date().getTimezoneOffset() || '',
            navigator.platform || '',
            navigator.vendor || ''
        ];
        const hash = factors.join('|');
        const encoded = btoa(encodeURIComponent(hash));
        deviceId = 'dev_' + encoded.replace(/[^a-zA-Z0-9]/g, '').substr(0, 24);
        localStorage.setItem(DEVICE_KEY, deviceId);
    }
    return deviceId;
}

// ============================================================
//   API FUNCTIONS — BARCHA WEBHOOK'LAR TO'LIQ ULANGAN
// ============================================================

// ============================================================
// 1. MA'LUMOT O'QISH (GET) — Google Sheets dan
// ============================================================
async function fetchUsers() {
    try {
        console.log('📤 Webhook so\'rovi: MA\'LUMOT O\'QISH');
        console.log('🔗 URL:', PABBLY_GET_WEBHOOK);
        
        const response = await fetch(PABBLY_GET_WEBHOOK, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Ma\'lumot olindi:', data.length || 0, 'ta foydalanuvchi');
        return data;
    } catch (error) {
        console.error('❌ Fetch users error:', error);
        showToast('Ma\'lumot olishda xatolik!', 'error');
        return [];
    }
}

// ============================================================
// 2. RO'YXATDAN O'TISH (POST) — Google Sheets ga yozish
// ============================================================
async function postUser(data) {
    try {
        console.log('📤 Webhook so\'rovi: RO\'YXATDAN O\'TISH');
        console.log('🔗 URL:', PABBLY_WEBHOOK);
        console.log('📦 Ma\'lumot:', data);
        
        const response = await fetch(PABBLY_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Ro\'yxatdan o\'tish muvaffaqiyatli:', result);
        return result;
    } catch (error) {
        console.error('❌ Post user error:', error);
        showToast('Ma\'lumotni saqlashda xatolik!', 'error');
        throw error;
    }
}

// ============================================================
// 3. KIRISH (LOGIN) — Foydalanuvchini tekshirish
// ============================================================
async function loginUser(nik, password) {
    try {
        console.log('📤 Webhook so\'rovi: KIRISH');
        console.log('🔗 URL:', PABBLY_LOGIN_WEBHOOK);
        console.log('👤 Nik:', nik);
        
        const response = await fetch(PABBLY_LOGIN_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nik, password })
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Kirish muvaffaqiyatli:', result);
        return result;
    } catch (error) {
        console.error('❌ Login error:', error);
        showToast('Kirishda xatolik!', 'error');
        throw error;
    }
}

// ============================================================
// 4. MA'LUMOT YANGILASH (PUT) — Google Sheets da yangilash
// ============================================================
async function updateUser(id, data) {
    try {
        console.log('📤 Webhook so\'rovi: MA\'LUMOT YANGILASH');
        console.log('🔗 URL:', PABBLY_UPDATE_WEBHOOK);
        console.log('🆔 ID:', id);
        console.log('📦 Yangilash ma\'lumotlari:', data);
        
        const response = await fetch(PABBLY_UPDATE_WEBHOOK, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id, ...data })
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Ma\'lumot yangilandi:', result);
        return result;
    } catch (error) {
        console.error('❌ Update user error:', error);
        showToast('Ma\'lumotni yangilashda xatolik!', 'error');
        throw error;
    }
}

// ============================================================
// 5. TARIF SOTIB OLISH (PLAN) — Tarifni yangilash
// ============================================================
async function buyPlanWebhook(id, planData) {
    try {
        console.log('📤 Webhook so\'rovi: TARIF SOTIB OLISH');
        console.log('🔗 URL:', PABBLY_PLAN_WEBHOOK);
        console.log('🆔 ID:', id);
        console.log('📦 Tarif ma\'lumotlari:', planData);
        
        const response = await fetch(PABBLY_PLAN_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id, ...planData })
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Tarif sotib olindi:', result);
        return result;
    } catch (error) {
        console.error('❌ Buy plan error:', error);
        showToast('Tarif sotib olishda xatolik!', 'error');
        throw error;
    }
}

// ============================================================
// 6. LOYIHANI SAQLASH (GITHUB)
// ============================================================
async function saveProjectToGitHub(project) {
    try {
        console.log('📤 Webhook so\'rovi: LOYIHANI SAQLASH');
        console.log('🔗 URL:', PABBLY_GITHUB_WEBHOOK);
        console.log('📦 Loyiha:', project);
        
        const response = await fetch(PABBLY_GITHUB_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_project',
                project: project
            })
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Loyiha saqlandi:', result);
        return result;
    } catch (error) {
        console.error('❌ Save project error:', error);
        showToast('Loyihani saqlashda xatolik!', 'error');
        throw error;
    }
}

// ============================================================
// 7. LOYIHALARNI O'QISH (GITHUB LIST)
// ============================================================
async function fetchProjectsFromGitHub() {
    try {
        console.log('📤 Webhook so\'rovi: LOYIHALARNI O\'QISH');
        console.log('🔗 URL:', PABBLY_GITHUB_LIST_WEBHOOK);
        
        const response = await fetch(PABBLY_GITHUB_LIST_WEBHOOK, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Loyihalar olindi:', result.length || 0, 'ta');
        return result;
    } catch (error) {
        console.error('❌ Fetch projects error:', error);
        return [];
    }
}

// ============================================================
// 8. LOYIHANI O'CHIRISH (GITHUB DELETE)
// ============================================================
async function deleteProjectFromGitHub(projectId) {
    try {
        console.log('📤 Webhook so\'rovi: LOYIHANI O\'CHIRISH');
        console.log('🔗 URL:', PABBLY_GITHUB_DELETE_WEBHOOK);
        console.log('🆔 Loyiha ID:', projectId);
        
        const response = await fetch(PABBLY_GITHUB_DELETE_WEBHOOK, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id: projectId })
        });
        
        console.log('📥 Javob status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Loyiha o\'chirildi:', result);
        return result;
    } catch (error) {
        console.error('❌ Delete project error:', error);
        showToast('Loyihani o\'chirishda xatolik!', 'error');
        throw error;
    }
}

// ============================================================
//   HELPERS
// ============================================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getExpiryDate(months) {
    const now = new Date();
    now.setMonth(now.getMonth() + months);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return password && password.length >= 6;
}

// ============================================================
//   SHOW/HIDE FORMS
// ============================================================
function showRegister() {
    if (registerForm) registerForm.style.display = 'block';
    if (loginForm) loginForm.style.display = 'none';
    if (plansForm) plansForm.style.display = 'none';
    if (appForm) appForm.style.display = 'none';
}

function showLogin() {
    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    if (plansForm) plansForm.style.display = 'none';
    if (appForm) appForm.style.display = 'none';
}

function showPlans(user) {
    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'none';
    if (plansForm) plansForm.style.display = 'block';
    if (appForm) appForm.style.display = 'none';
    
    const plansUserNik = document.getElementById('plansUserNik');
    const plansDeviceId = document.getElementById('plansDeviceId');
    
    if (plansUserNik) plansUserNik.textContent = user?.nik || '-';
    if (plansDeviceId) plansDeviceId.textContent = getDeviceId().substr(0, 12) + '...';
}

function showApp(user) {
    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'none';
    if (plansForm) plansForm.style.display = 'none';
    if (appForm) appForm.style.display = 'block';
    
    const appUserNik = document.getElementById('appUserNik');
    const appDeviceId = document.getElementById('appDeviceId');
    const appPlanStatus = document.getElementById('appPlanStatus');
    
    if (appUserNik) appUserNik.textContent = user?.nik || '-';
    if (appDeviceId) appDeviceId.textContent = getDeviceId().substr(0, 12) + '...';
    
    const planEnd = user?.plan_end ? new Date(user.plan_end) : null;
    const now = new Date();
    const hasActivePlan = planEnd && planEnd > now;
    
    if (appPlanStatus) {
        if (hasActivePlan) {
            const daysLeft = Math.ceil((planEnd - now) / (1000 * 60 * 60 * 24));
            appPlanStatus.textContent = `✅ Faol (${daysLeft} kun qoldi)`;
            appPlanStatus.style.color = 'var(--success)';
        } else {
            appPlanStatus.textContent = '⛔ Tarif tugagan';
            appPlanStatus.style.color = 'var(--error)';
        }
    }
    
    loadProjects();
}

// ============================================================
//   TOGGLE PASSWORD
// ============================================================
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}

// ============================================================
//   TOGGLE TERMS
// ============================================================
function toggleTerms() {
    const content = document.getElementById('termsContent');
    const arrow = document.getElementById('termsArrow');
    if (content) content.classList.toggle('open');
    if (arrow) arrow.classList.toggle('open');
}

// ============================================================
//   MODAL FUNCTIONS
// ============================================================
function openTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function openPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function openProjectSettings() {
    const modal = document.getElementById('folderModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(event, id) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => {
            if (m.style.display === 'flex') {
                m.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
});

// ============================================================
//   TOAST SYSTEM
// ============================================================
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================================
//   LOADING OVERLAY
// ============================================================
function showLoading(text = 'Iltimos kuting...') {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        if (loadingText) loadingText.textContent = text;
        document.body.style.overflow = 'hidden';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ============================================================
//   REGISTER HANDLER
// ============================================================
async function handleRegister(event) {
    event.preventDefault();
    
    const familya = document.getElementById('regFamilya')?.value.trim() || '';
    const ism = document.getElementById('regIsm')?.value.trim() || '';
    const nik = document.getElementById('regNik')?.value.trim() || '';
    const email = document.getElementById('regEmail')?.value.trim() || '';
    const password = document.getElementById('regPassword')?.value || '';
    const confirm = document.getElementById('regPasswordConfirm')?.value || '';
    const terms = document.getElementById('regTerms')?.checked || false;

    if (!familya || !ism || !nik || !email || !password) {
        showToast('Barcha maydonlarni to\'ldiring!', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Noto\'g\'ri email manzili!', 'error');
        return;
    }

    if (!isValidPassword(password)) {
        showToast('Parol 6 ta belgidan kam bo\'lmasligi kerak!', 'error');
        return;
    }

    if (password !== confirm) {
        showToast('Parollar mos kelmadi!', 'error');
        return;
    }

    if (!terms) {
        showToast('Iltimos, shartlarga rozilik bering!', 'warning');
        return;
    }

    showLoading('Ro\'yxatdan o\'tkazilmoqda...');

    try {
        const users = await fetchUsers();
        const userList = Array.isArray(users) ? users : [];
        
        if (userList.some(u => u.nik && u.nik.toLowerCase() === nik.toLowerCase())) {
            hideLoading();
            showToast('Bu nik allaqachon band!', 'error');
            return;
        }
        
        if (userList.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
            hideLoading();
            showToast('Bu email allaqachon ro\'yxatdan o\'tgan!', 'error');
            return;
        }

        const deviceId = getDeviceId();
        const newUser = {
            id: generateId(),
            familya: familya,
            ism: ism,
            nik: nik,
            email: email,
            password: password,
            plan_type: 'free',
            plan_start: '',
            plan_end: '',
            plan_price: '',
            device_id: deviceId,
            created_at: getCurrentDateTime(),
            updated_at: getCurrentDateTime()
        };

        await postUser(newUser);
        
        hideLoading();
        showToast('Ro\'yxatdan o\'tish muvaffaqiyatli! 🎉', 'success');
        
        const form = document.getElementById('registerFormElement');
        if (form) form.reset();
        const termsCheck = document.getElementById('regTerms');
        if (termsCheck) termsCheck.checked = false;
        
        setTimeout(() => {
            showLogin();
            const loginNik = document.getElementById('loginNik');
            if (loginNik) loginNik.value = nik;
            const loginPassword = document.getElementById('loginPassword');
            if (loginPassword) loginPassword.focus();
        }, 1500);
        
    } catch (error) {
        hideLoading();
        console.error('Register error:', error);
        showToast('Xatolik yuz berdi. Qayta urinib ko\'ring!', 'error');
    }
}

// ============================================================
//   LOGIN HANDLER
// ============================================================
async function handleLogin(event) {
    event.preventDefault();
    
    const nik = document.getElementById('loginNik')?.value.trim() || '';
    const password = document.getElementById('loginPassword')?.value || '';
    const remember = document.getElementById('loginRemember')?.checked || false;

    if (!nik || !password) {
        showToast('Nik va parolni kiriting!', 'error');
        return;
    }

    showLoading('Kirmoqda...');

    try {
        const users = await fetchUsers();
        const userList = Array.isArray(users) ? users : [];
        
        const user = userList.find(u => 
            u.nik && u.nik.toLowerCase() === nik.toLowerCase() && 
            u.password === password
        );
        
        if (!user) {
            hideLoading();
            showToast('Nik yoki parol noto\'g\'ri!', 'error');
            return;
        }

        const deviceId = getDeviceId();
        if (user.device_id !== deviceId) {
            try {
                await updateUser(user.id, { 
                    device_id: deviceId,
                    updated_at: getCurrentDateTime()
                });
                user.device_id = deviceId;
            } catch (updateError) {
                console.warn('Device ID update failed:', updateError);
            }
        }

        currentUser = user;
        
        if (remember) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                nik: user.nik,
                id: user.id
            }));
        }

        hideLoading();
        
        const now = new Date();
        const planEnd = user.plan_end ? new Date(user.plan_end) : null;
        const hasActivePlan = planEnd && planEnd > now;

        if (hasActivePlan) {
            showToast(`Xush kelibsiz, ${user.ism}! 👋`, 'success');
            setTimeout(() => showApp(user), 500);
        } else {
            showToast('Iltimos, tarif sotib oling! 💳', 'warning');
            setTimeout(() => showPlans(user), 500);
        }
        
    } catch (error) {
        hideLoading();
        console.error('Login error:', error);
        showToast('Xatolik yuz berdi. Qayta urinib ko\'ring!', 'error');
    }
}

// ============================================================
//   SELECT PLAN
// ============================================================
function selectPlan(type) {
    const plans = document.querySelectorAll('.plan-card');
    plans.forEach(p => p.classList.remove('selected'));
    
    const planMap = {
        monthly: 0,
        halfyear: 1,
        yearly: 2
    };
    
    if (planMap[type] !== undefined && plans[planMap[type]]) {
        plans[planMap[type]].classList.add('selected');
        selectedPlan = type;
    }
}

// ============================================================
//   BUY PLAN
// ============================================================
async function buyPlan(type) {
    if (!currentUser) {
        showToast('Iltimos, avval kiring!', 'error');
        return;
    }
    
    const planNames = { 
        monthly: '1 oylik', 
        halfyear: '6 oylik', 
        yearly: '1 yillik' 
    };
    const planMonths = { 
        monthly: 1, 
        halfyear: 6, 
        yearly: 12 
    };
    const planPrices = { 
        monthly: 49000, 
        halfyear: 199000, 
        yearly: 349000 
    };
    
    const planName = planNames[type];
    const planMonthsCount = planMonths[type];
    const planPrice = planPrices[type];
    
    selectPlan(type);
    
    const confirmBuy = confirm(
        `${planName} tarifini ${planPrice.toLocaleString()} so'mga sotib olasizmi?\n\n` +
        `📅 Muddati: ${planMonthsCount} oy\n` +
        `💳 Narxi: ${planPrice.toLocaleString()} so'm\n\n` +
        `To'lovni tasdiqlaysizmi?`
    );
    
    if (!confirmBuy) return;
    
    showLoading('To\'lov amalga oshirilmoqda... 💳');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const updateData = {
            plan_type: type,
            plan_start: getCurrentDateTime(),
            plan_end: getExpiryDate(planMonthsCount),
            plan_price: planPrice,
            updated_at: getCurrentDateTime()
        };
        
        // Webhook orqali tarifni yangilash
        await buyPlanWebhook(currentUser.id, updateData);
        
        // Local user ni yangilash
        currentUser.plan_type = type;
        currentUser.plan_start = updateData.plan_start;
        currentUser.plan_end = updateData.plan_end;
        currentUser.plan_price = updateData.plan_price;
        
        hideLoading();
        showToast(`${planName} tarifi sotib olindi! 🎉`, 'success');
        
        setTimeout(() => showApp(currentUser), 1500);
        
    } catch (error) {
        hideLoading();
        console.error('Buy plan error:', error);
        showToast('To\'lov amalga oshmadi. Qayta urinib ko\'ring!', 'error');
    }
}

// ============================================================
//   PROJECTS
// ============================================================
function loadProjects() {
    const saved = localStorage.getItem(PROJECTS_KEY);
    if (saved) {
        try {
            currentProjects = JSON.parse(saved);
        } catch {
            currentProjects = [];
        }
    } else {
        currentProjects = [];
    }
    
    const folder = localStorage.getItem(FOLDER_KEY);
    if (folder) {
        projectFolder = folder;
        const projectPath = document.getElementById('projectPath');
        if (projectPath) projectPath.value = folder;
    }
    
    renderProjects();
}

function renderProjects() {
    const list = document.getElementById('projectsList');
    if (!list) return;
    
    if (currentProjects.length === 0) {
        list.innerHTML = `
            <div class="empty-projects">
                <i class="fas fa-folder-open"></i>
                <p>Hali loyihalar mavjud emas</p>
                <span>"Yangi loyiha" tugmasini bosing</span>
            </div>
        `;
        return;
    }
    
    list.innerHTML = currentProjects.map((project, index) => `
        <div class="project-item" onclick="openProject(${index})">
            <div>
                <div class="project-name">
                    <i class="fas fa-file-code" style="color:var(--accent);font-size:0.8rem;margin-right:6px;"></i>
                    ${project.name || 'Nomsiz loyiha'}
                </div>
                <div class="project-date">
                    <i class="far fa-calendar-alt" style="font-size:0.6rem;"></i>
                    ${project.date || 'Noma\'lum'}
                </div>
            </div>
            <div class="project-actions">
                <button onclick="event.stopPropagation();openProject(${index})" title="Ochish">
                    <i class="fas fa-folder-open"></i>
                </button>
                <button class="delete" onclick="event.stopPropagation();deleteProject(${index})" title="O'chirish">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function createNewProject() {
    if (!projectFolder) {
        showToast('Iltimos, avval loyiha papkasini tanlang! 📁', 'warning');
        openProjectSettings();
        return;
    }
    
    const name = prompt('Yangi loyiha nomini kiriting:', 'Mening Loyiham');
    if (!name) return;
    
    if (name.trim().length < 2) {
        showToast('Loyiha nomi kamida 2 ta belgidan iborat bo\'lishi kerak!', 'error');
        return;
    }
    
    const newProject = {
        id: generateId(),
        name: name.trim(),
        date: getCurrentDateTime(),
        folder: projectFolder,
        path: projectFolder + '/' + name.trim().replace(/\s+/g, '_')
    };
    
    // GitHub ga saqlash (webhook orqali)
    try {
        saveProjectToGitHub(newProject).catch(err => console.warn('GitHub save failed:', err));
    } catch (error) {
        console.warn('GitHub save error:', error);
    }
    
    currentProjects.unshift(newProject);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(currentProjects));
    renderProjects();
    
    showToast(`"${name.trim()}" loyihasi yaratildi! 🚀`, 'success');
    
    setTimeout(() => {
        const projectParam = encodeURIComponent(newProject.id);
        window.location.href = `index.html?project=${projectParam}`;
    }, 1000);
}

function openProject(index) {
    const project = currentProjects[index];
    if (!project) {
        showToast('Loyiha topilmadi!', 'error');
        return;
    }
    
    showToast(`"${project.name}" loyihasi ochilmoqda... 📂`, 'info');
    
    setTimeout(() => {
        const projectParam = encodeURIComponent(project.id);
        window.location.href = `index.html?project=${projectParam}`;
    }, 500);
}

function deleteProject(index) {
    const project = currentProjects[index];
    if (!project) return;
    
    if (!confirm(`"${project.name}" loyihasini o'chirishni xohlaysizmi?\n\nBu amalni qaytarib bo'lmaydi!`)) {
        return;
    }
    
    const name = project.name;
    
    // GitHub dan o'chirish (webhook orqali)
    try {
        deleteProjectFromGitHub(project.id).catch(err => console.warn('GitHub delete failed:', err));
    } catch (error) {
        console.warn('GitHub delete error:', error);
    }
    
    currentProjects.splice(index, 1);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(currentProjects));
    renderProjects();
    
    showToast(`"${name}" loyihasi o'chirildi 🗑️`, 'info');
}

// ============================================================
//   PROJECT FOLDER
// ============================================================
function selectFolder(folder) {
    if (folder === 'custom') {
        const custom = document.getElementById('customFolderInput')?.value.trim();
        if (custom) {
            projectFolder = custom;
            const projectPath = document.getElementById('projectPath');
            if (projectPath) projectPath.value = custom;
            localStorage.setItem(FOLDER_KEY, custom);
            closeModal(null, 'folderModal');
            showToast('Papka saqlandi! 📁', 'success');
        } else {
            showToast('Papka manzilini kiriting!', 'warning');
        }
        return;
    }
    
    const username = navigator.userAgent.includes('Windows') ? 'User' : 
                     navigator.userAgent.includes('Mac') ? 'Username' : 'user';
    
    const paths = {
        'Desktop': `C:/Users/${username}/Desktop/WebCraft_Pro`,
        'Documents': `C:/Users/${username}/Documents/WebCraft_Pro`,
        'Downloads': `C:/Users/${username}/Downloads/WebCraft_Pro`,
        'WebCraft_Pro': './WebCraft_Pro'
    };
    
    projectFolder = paths[folder] || './WebCraft_Pro';
    const projectPath = document.getElementById('projectPath');
    if (projectPath) projectPath.value = projectFolder;
    localStorage.setItem(FOLDER_KEY, projectFolder);
    closeModal(null, 'folderModal');
    showToast(`Papka tanlandi: ${projectFolder} 📁`, 'success');
}

function saveFolderSelection() {
    const custom = document.getElementById('customFolderInput')?.value.trim();
    if (custom) {
        projectFolder = custom;
        const projectPath = document.getElementById('projectPath');
        if (projectPath) projectPath.value = custom;
        localStorage.setItem(FOLDER_KEY, custom);
        closeModal(null, 'folderModal');
        showToast('Papka saqlandi! 📁', 'success');
    } else {
        showToast('Iltimos, papka manzilini kiriting!', 'warning');
    }
}

// ============================================================
//   LOGOUT
// ============================================================
function logoutUser() {
    if (!confirm('Chiqishni xohlaysizmi?')) return;
    
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    
    showToast('Chiqildi! 👋', 'info');
    
    setTimeout(() => {
        showLogin();
        const loginNik = document.getElementById('loginNik');
        const loginPassword = document.getElementById('loginPassword');
        if (loginNik) loginNik.value = '';
        if (loginPassword) loginPassword.value = '';
    }, 500);
}

// ============================================================
//   CHECK SESSION
// ============================================================
async function checkSession() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        showLogin();
        return;
    }
    
    try {
        const data = JSON.parse(saved);
        const users = await fetchUsers();
        const userList = Array.isArray(users) ? users : [];
        const user = userList.find(u => u.id === data.id && u.nik === data.nik);
        
        if (user) {
            currentUser = user;
            
            const deviceId = getDeviceId();
            if (user.device_id !== deviceId) {
                try {
                    await updateUser(user.id, { 
                        device_id: deviceId,
                        updated_at: getCurrentDateTime()
                    });
                    user.device_id = deviceId;
                } catch (updateError) {
                    console.warn('Device ID update failed:', updateError);
                }
            }
            
            const now = new Date();
            const planEnd = user.plan_end ? new Date(user.plan_end) : null;
            const hasActivePlan = planEnd && planEnd > now;
            
            if (hasActivePlan) {
                showApp(user);
            } else {
                showPlans(user);
            }
        } else {
            localStorage.removeItem(STORAGE_KEY);
            showLogin();
        }
    } catch (error) {
        console.error('Session check error:', error);
        showLogin();
    }
}

// ============================================================
//   INPUT VALIDATION (Real-time)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Email validatsiya
    const emailInput = document.getElementById('regEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.classList.add('error');
                this.classList.remove('success');
            } else if (this.value) {
                this.classList.remove('error');
                this.classList.add('success');
            }
        });
        emailInput.addEventListener('input', function() {
            this.classList.remove('error', 'success');
        });
    }
    
    // Parol uzunligi validatsiya
    const passInput = document.getElementById('regPassword');
    if (passInput) {
        passInput.addEventListener('blur', function() {
            if (this.value && !isValidPassword(this.value)) {
                this.classList.add('error');
                this.classList.remove('success');
            } else if (this.value) {
                this.classList.remove('error');
                this.classList.add('success');
            }
        });
        passInput.addEventListener('input', function() {
            this.classList.remove('error', 'success');
        });
    }
    
    // Parol mosligi validatsiya
    const passConfirm = document.getElementById('regPasswordConfirm');
    if (passConfirm) {
        passConfirm.addEventListener('blur', function() {
            const pass = document.getElementById('regPassword')?.value || '';
            if (this.value && this.value !== pass) {
                this.classList.add('error');
                this.classList.remove('success');
            } else if (this.value) {
                this.classList.remove('error');
                this.classList.add('success');
            }
        });
        passConfirm.addEventListener('input', function() {
            this.classList.remove('error', 'success');
        });
    }
    
    // Webhook URL ni konsolga chiqarish
    console.log('🕸️ WebCraft Pro — Intellektual Auth System');
    console.log('📋 Webhook URL sozlamalari:');
    console.log('  🔗 ASOSIY WEBHOOK:', PABBLY_WEBHOOK);
    console.log('  🔗 GET WEBHOOK:', PABBLY_GET_WEBHOOK);
    console.log('  🔗 UPDATE WEBHOOK:', PABBLY_UPDATE_WEBHOOK);
    console.log('  🔗 LOGIN WEBHOOK:', PABBLY_LOGIN_WEBHOOK);
    console.log('  🔗 PLAN WEBHOOK:', PABBLY_PLAN_WEBHOOK);
    console.log('  🔗 GITHUB WEBHOOK:', PABBLY_GITHUB_WEBHOOK);
    console.log('🔑 Device ID:', getDeviceId());
});

// ============================================================
//   KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (registerForm && registerForm.style.display !== 'none') {
            const form = document.getElementById('registerFormElement');
            if (form) form.dispatchEvent(new Event('submit'));
        } else if (loginForm && loginForm.style.display !== 'none') {
            const form = document.getElementById('loginFormElement');
            if (form) form.dispatchEvent(new Event('submit'));
        }
    }
});

// ============================================================
//   INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🕸️ WebCraft Pro — Intellektual Auth System');
    console.log('🔗 Pabbly Webhook:', PABBLY_WEBHOOK);
    console.log('🔑 Device ID:', getDeviceId());
    console.log('📱 Platform:', navigator.platform);
    console.log('🌐 Language:', navigator.language);
    
    checkSession();
    
    setTimeout(() => {
        if (!currentUser && !localStorage.getItem(STORAGE_KEY)) {
            const activeForm = document.querySelector('.auth-card[style*="display: block"]');
            if (!activeForm) {
                showLogin();
            }
        }
    }, 800);
});

// ============================================================
//   GLOBAL EXPOSE
// ============================================================
window.showRegister = showRegister;
window.showLogin = showLogin;
window.showPlans = showPlans;
window.showApp = showApp;
window.togglePassword = togglePassword;
window.toggleTerms = toggleTerms;
window.openTermsModal = openTermsModal;
window.openPrivacyModal = openPrivacyModal;
window.openProjectSettings = openProjectSettings;
window.closeModal = closeModal;
window.showToast = showToast;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.selectPlan = selectPlan;
window.buyPlan = buyPlan;
window.loadProjects = loadProjects;
window.renderProjects = renderProjects;
window.createNewProject = createNewProject;
window.openProject = openProject;
window.deleteProject = deleteProject;
window.selectFolder = selectFolder;
window.saveFolderSelection = saveFolderSelection;
window.logoutUser = logoutUser;
window.checkSession = checkSession;

console.log('✅ All functions exposed to global scope');
