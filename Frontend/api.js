
'use strict';

// ── Backend URL ──
    const API_URL = 'https://folio-craft-two.vercel.app/api';
// ── Token Helper ──
const getToken  = ()        => localStorage.getItem('fc_token');
const setToken  = (token)   => localStorage.setItem('fc_token', token);
const clearAuth = ()        => {
  localStorage.removeItem('fc_token');
  localStorage.removeItem('fc_user');
};
const isLoggedIn = ()       => !!getToken();

// ── Base Fetch Helper ──
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...defaultHeaders, ...(options.headers || {}) }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Server error: ${res.status}`);
    }

    return data;

  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Check your internet connection');
    }
    throw err;
  }
}

//   AUTH FUNCTIONS

// Register
async function register(name, email, password) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  setToken(data.token);
  localStorage.setItem('fc_user', JSON.stringify(data.user));
  return data;
}

// Login
async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  localStorage.setItem('fc_user', JSON.stringify(data.user));

  if (data.portfolio) {
    localStorage.setItem('portfolioData', JSON.stringify(data.portfolio));
  }

  return data;
}

// Logout
function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

// Current user
function getCurrentUser() {
  const u = localStorage.getItem('fc_user');
  return u ? JSON.parse(u) : null;
}


//   PORTFOLIO FUNCTIONS

async function loadPortfolio() {
  const data = await apiFetch('/portfolio');

  if (data.portfolio) {
    // LocalStorage mein bhi save karo templates ke liye
    localStorage.setItem('portfolioData', JSON.stringify(data.portfolio));
    localStorage.setItem('selectedTemplate', data.portfolio.selectedTemplate || 'modern-dark');
  }

  return data.portfolio;
}

async function savePortfolio(portfolioData) {

  localStorage.setItem('portfolioData', JSON.stringify(portfolioData));

  if (isLoggedIn()) {
    const data = await apiFetch('/portfolio', {
      method: 'PUT',
      body: JSON.stringify(portfolioData)
    });
    return data;
  }

  return { success: true, local: true };
}

// Publish Portfolio
async function publishPortfolio() {
  const currentId = localStorage.getItem('currentPortfolioId');
  if (!currentId) {
    throw new Error('No portfolio selected. Please generate a portfolio first.');
  }
  const data = await apiFetch(`/portfolio/${currentId}/publish`, { method: 'POST' });
  return data;
}

// Take Share link 
async function getShareLink() {
  const data = await apiFetch('/portfolio/share-link');
  return data.shareUrl;
}

//   ANALYTICS FUNCTIONS
async function getAnalytics() {
  const data = await apiFetch('/analytics/overview');
  return data.stats;
}
//   PUBLIC PORTFOLIO (Share link)


async function getPublicPortfolio(shareId) {
  const data = await apiFetch(`/public/p/${shareId}`);
  return data.portfolio;
}

//   MULTIPLE PORTFOLIO FUNCTIONS
async function getAllPortfolios() {
  const data = await apiFetch('/portfolio/all');
  return data.portfolios;
}

// Make new Portfolio
async function createPortfolio(name) {
  const data = await apiFetch('/portfolio/create', {
    method: 'POST',
    body: JSON.stringify({ portfolioName: name })
  });
  return data.portfolio;
}

// Load specific Portfolio
async function loadPortfolioById(id) {
  const data = await apiFetch('/portfolio/' + id);
  if (data.portfolio) {
    localStorage.setItem('portfolioData', JSON.stringify(data.portfolio));
    localStorage.setItem('currentPortfolioId', id);
  }
  return data.portfolio;
}

// Save your specific porfolio
async function savePortfolioById(id, portfolioData) {
  const data = await apiFetch('/portfolio/' + id, {
    method: 'PUT',
    body: JSON.stringify(portfolioData)
  });
  return data;
}

// Delete Portfolio
async function deletePortfolio(id) {
  const data = await apiFetch('/portfolio/' + id, {
    method: 'DELETE'
  });
  return data;
}
// Google Login
function loginWithGoogle() {
  window.location.href = 'https://folio-craft-two.vercel.app/api/auth/google';
}
// ── Export ──
window.FolioAPI = {
  // Auth
  register,
  login,
  logout,
  isLoggedIn,
  getCurrentUser,
  loginWithGoogle,

  // Portfolio
  loadPortfolio,
  savePortfolio,
  publishPortfolio,
  getShareLink,

  // Multiple Portfolios  
  getAllPortfolios,
  createPortfolio,
  loadPortfolioById,
  savePortfolioById,
  deletePortfolio,

  // Analytics
  getAnalytics,

  // Public
  getPublicPortfolio
};

// ── Custom Confirm Modal ──
function showConfirmModal(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: fcFadeIn 0.2s ease;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes fcFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes fcSlideUp { from { opacity:0; transform:translateY(16px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      </style>
      <div style="
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
        border-radius: 24px;
        padding: 36px 32px;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 32px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08);
        animation: fcSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
      ">
        <div style="
          width: 52px; height: 52px;
          background: rgba(220,38,38,0.08);
          border: 1px solid rgba(220,38,38,0.18);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 4px 12px rgba(220,38,38,0.1);
        ">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>

        <p style="
          text-align: center;
          font-size: 16px;
          font-weight: 700;
          color: var(--text, #0f1623);
          margin: 0 0 8px;
          font-family: 'Bricolage Grotesque', sans-serif;
          letter-spacing: -0.02em;
        ">Are you sure?</p>

        <p style="
          text-align: center;
          font-size: 13.5px;
          color: var(--text-2, #556070);
          margin: 0 0 28px;
          line-height: 1.6;
          font-family: 'Instrument Sans', sans-serif;
        ">${message}</p>

        <div style="display: flex; gap: 10px;">
          <button id="cancelBtn" style="
            flex: 1; padding: 12px 16px;
            border-radius: 14px;
            border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
            background: transparent;
            color: var(--text-2, #556070);
            font-size: 14px; font-weight: 500;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
            transition: all 0.2s ease;
            letter-spacing: 0.01em;
          "
          onmouseover="this.style.background='var(--a-dim, rgba(91,77,232,0.08))';this.style.borderColor='var(--a, #5b4de8)';this.style.color='var(--a, #5b4de8)'"
          onmouseout="this.style.background='transparent';this.style.borderColor='var(--border-hi, rgba(0,0,0,0.1))';this.style.color='var(--text-2, #556070)'"
          >Cancel</button>

          <button id="confirmBtn" style="
            flex: 1; padding: 12px 16px;
            border-radius: 14px;
            border: 1px solid rgba(220,38,38,0.3);
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            font-size: 14px; font-weight: 600;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
            transition: all 0.2s ease;
            letter-spacing: 0.01em;
            box-shadow: 0 4px 14px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.12);
          "
          onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 20px rgba(220,38,38,0.35), inset 0 1px 0 rgba(255,255,255,0.12)'"
          onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 14px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.12)'"
          >Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

   function safeRemove() {
  try {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  } catch(e) {}
}

    overlay.querySelector('#cancelBtn').onclick  = () => { safeRemove(); resolve(false); };
    overlay.querySelector('#confirmBtn').onclick = () => { safeRemove(); resolve(true);  };
  });
}

// ── Custom Input Modal ──
function showInputModal(label, placeholder = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: fcFadeIn 0.2s ease;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes fcFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes fcSlideUp { from { opacity:0; transform:translateY(16px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      </style>
      <div style="
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
        border-radius: 24px;
        padding: 36px 32px;
        max-width: 420px;
        width: 100%;
        box-shadow: 0 32px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08);
        animation: fcSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
      ">
        <p style="
          font-size: 16px;
          font-weight: 700;
          color: var(--text, #0f1623);
          margin: 0 0 16px;
          font-family: 'Bricolage Grotesque', sans-serif;
          letter-spacing: -0.02em;
        ">${label}</p>

        <div style="position: relative; margin-bottom: 20px;">
          <input id="modalInput" type="text" placeholder="${placeholder}" style="
            width: 100%;
            padding: 13px 16px;
            border-radius: 14px;
            border: 1px solid var(--border, rgba(0,0,0,0.1));
            background: var(--bg-card, #fff);
            color: var(--text, #0f1623);
            font-size: 14px;
            font-family: 'Instrument Sans', sans-serif;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s, box-shadow 0.2s;
            caret-color: var(--a, #5b4de8);
          "/>
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="cancelBtn" style="
            flex: 1; padding: 12px 16px;
            border-radius: 14px;
            border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
            background: transparent;
            color: var(--text-2, #556070);
            font-size: 14px; font-weight: 500;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
            transition: all 0.2s ease;
            letter-spacing: 0.01em;
          "
          onmouseover="this.style.background='var(--a-dim, rgba(91,77,232,0.08))';this.style.borderColor='var(--a, #5b4de8)';this.style.color='var(--a, #5b4de8)'"
          onmouseout="this.style.background='transparent';this.style.borderColor='var(--border-hi, rgba(0,0,0,0.1))';this.style.color='var(--text-2, #556070)'"
          >Cancel</button>

          <button id="okBtn" style="
            flex: 1; padding: 12px 16px;
            border-radius: 14px;
            border: none;
            background: linear-gradient(135deg, #5b4de8, #0ba89a);
            color: white;
            font-size: 14px; font-weight: 600;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
            transition: all 0.2s ease;
            letter-spacing: 0.01em;
            box-shadow: 0 4px 14px rgba(91,77,232,0.25), inset 0 1px 0 rgba(255,255,255,0.12);
          "
          onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 20px rgba(91,77,232,0.35), inset 0 1px 0 rgba(255,255,255,0.12)'"
          onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 14px rgba(91,77,232,0.25), inset 0 1px 0 rgba(255,255,255,0.12)'"
          >OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#modalInput');
    input.focus();

    input.addEventListener('focus', () => {
      input.style.borderColor = 'var(--a, #5b4de8)';
      input.style.boxShadow   = '0 0 0 3px var(--a-dim, rgba(91,77,232,0.12))';
    });
    input.addEventListener('blur', () => {
      input.style.borderColor = 'var(--border, rgba(0,0,0,0.1))';
      input.style.boxShadow   = 'none';
    });

    function safeRemove() {
  try {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  } catch(e) {}
}

    const submit = () => {
      const val = input.value.trim();
      safeRemove();
      resolve(val || null);
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  submit();
      if (e.key === 'Escape') { safeRemove(); resolve(null); }
    });

    overlay.querySelector('#cancelBtn').onclick = () => { safeRemove(); resolve(null);  };
    overlay.querySelector('#okBtn').onclick      = submit;
  });
}

window.showConfirmModal = showConfirmModal;
window.showInputModal   = showInputModal;

(function handleGoogleCallback() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');
  const name   = params.get('name');
  const avatar = params.get('avatar');

  if (token && name) {
    localStorage.setItem('fc_token', token);
    localStorage.setItem('fc_user', JSON.stringify({
      name:    decodeURIComponent(name),
      avatar:  decodeURIComponent(avatar || '')
    }));

    // Clean URL 
    window.history.replaceState({}, document.title, '/index.html');

    // Send to Dashboard
    window.location.href = 'dashboard.html';
  }
})();
