
'use strict';

// ── Backend URL - Apna Vercel URL yahan dalein ──
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

  // Server se portfolio data bhi localStorge mein save karo
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


// Portfolio load karo (login ke baad)
async function loadPortfolio() {
  const data = await apiFetch('/portfolio');

  if (data.portfolio) {
    // LocalStorage mein bhi save karo templates ke liye
    localStorage.setItem('portfolioData', JSON.stringify(data.portfolio));
    localStorage.setItem('selectedTemplate', data.portfolio.selectedTemplate || 'modern-dark');
  }

  return data.portfolio;
}

// Wizard data save karo
async function savePortfolio(portfolioData) {
  // Pehle localStorage mein save karo (existing code ke liye)
  localStorage.setItem('portfolioData', JSON.stringify(portfolioData));

  // Agar logged in hain to server pe bhi save karo
  if (isLoggedIn()) {
    const data = await apiFetch('/portfolio', {
      method: 'PUT',
      body: JSON.stringify(portfolioData)
    });
    return data;
  }

  return { success: true, local: true };
}

// Portfolio publish karo
async function publishPortfolio() {
  const data = await apiFetch('/portfolio/publish', { method: 'POST' });
  return data;
}

// Share link lo
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

// Naya portfolio banao
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
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: fadeIn 0.15s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 24px 48px rgba(0,0,0,0.2);
        animation: slideUp 0.2s ease;
      ">
        <div style="
          width: 48px; height: 48px;
          background: rgba(220,38,38,0.1);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        ">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>
        <p style="
          text-align: center;
          font-size: 15px;
          font-weight: 600;
          color: var(--text, #0f1623);
          margin: 0 0 8px;
          font-family: 'Bricolage Grotesque', sans-serif;
        ">Are you sure?</p>
        <p style="
          text-align: center;
          font-size: 13px;
          color: var(--text-2, #556070);
          margin: 0 0 24px;
          line-height: 1.5;
        ">${message}</p>
        <div style="display: flex; gap: 10px;">
          <button id="cancelBtn" style="
            flex: 1; padding: 11px;
            border-radius: 12px;
            border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
            background: transparent;
            color: var(--text-2, #556070);
            font-size: 14px; font-weight: 500;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
            transition: all 0.2s;
          ">Cancel</button>
          <button id="confirmBtn" style="
            flex: 1; padding: 11px;
            border-radius: 12px;
            border: none;
            background: #dc2626;
            color: white;
            font-size: 14px; font-weight: 600;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
            transition: all 0.2s;
          ">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#cancelBtn').onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };

    overlay.querySelector('#confirmBtn').onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };
  });
}

// ── Custom Input Modal ──
function showInputModal(label, placeholder = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    `;

    overlay.innerHTML = `
      <div style="
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 24px 48px rgba(0,0,0,0.2);
      ">
        <p style="
          font-size: 16px;
          font-weight: 700;
          color: var(--text, #0f1623);
          margin: 0 0 16px;
          font-family: 'Bricolage Grotesque', sans-serif;
        ">${label}</p>
        <input id="modalInput" type="text" placeholder="${placeholder}" style="
          width: 100%;
          padding: 12px 15px;
          border-radius: 12px;
          border: 1px solid var(--border, rgba(0,0,0,0.1));
          background: var(--bg-card, #fff);
          color: var(--text, #0f1623);
          font-size: 14px;
          font-family: 'Instrument Sans', sans-serif;
          outline: none;
          margin-bottom: 20px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        "/>
        <div style="display: flex; gap: 10px;">
          <button id="cancelBtn" style="
            flex: 1; padding: 11px;
            border-radius: 12px;
            border: 1px solid var(--border-hi, rgba(0,0,0,0.1));
            background: transparent;
            color: var(--text-2, #556070);
            font-size: 14px; font-weight: 500;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
          ">Cancel</button>
          <button id="okBtn" style="
            flex: 1; padding: 11px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #5b4de8, #0ba89a);
            color: white;
            font-size: 14px; font-weight: 600;
            cursor: pointer;
            font-family: 'Instrument Sans', sans-serif;
          ">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#modalInput');
    input.focus();

    const submit = () => {
      const val = input.value.trim();
      document.body.removeChild(overlay);
      resolve(val || placeholder);
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        resolve(null);
      }
    });

    overlay.querySelector('#cancelBtn').onclick = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };

    overlay.querySelector('#okBtn').onclick = submit;
  });
}

window.showConfirmModal = showConfirmModal;
window.showInputModal   = showInputModal;