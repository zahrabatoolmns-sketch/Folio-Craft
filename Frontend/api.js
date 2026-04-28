
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
      throw new Error('Server se connection nahi ho raha. Internet check karein.');
    }
    throw err;
  }
}

// ════════════════════════════════════════════
//   AUTH FUNCTIONS
// ════════════════════════════════════════════

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

// ════════════════════════════════════════════
//   PORTFOLIO FUNCTIONS
// ════════════════════════════════════════════

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

// ════════════════════════════════════════════
//   ANALYTICS FUNCTIONS
// ════════════════════════════════════════════

async function getAnalytics() {
  const data = await apiFetch('/analytics/overview');
  return data.stats;
}

// ════════════════════════════════════════════
//   PUBLIC PORTFOLIO (Share link)
// ════════════════════════════════════════════

async function getPublicPortfolio(shareId) {
  const data = await apiFetch(`/public/p/${shareId}`);
  return data.portfolio;
}

// ════════════════════════════════════════════
//   MULTIPLE PORTFOLIO FUNCTIONS
// ════════════════════════════════════════════

// Sare portfolios lo
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