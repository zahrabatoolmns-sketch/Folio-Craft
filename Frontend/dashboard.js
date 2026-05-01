'use strict';

const THEME_KEY = 'fc_theme';

// ── Theme ──
function applyTheme(t) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(t);
  localStorage.setItem(THEME_KEY, t);
}

applyTheme(localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light');

document.getElementById('themeBtn')?.addEventListener('click', () => {
  applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

// ── Auth Check ──
const token = localStorage.getItem('fc_token');
if (!token) window.location.replace('index.html');

// ── User Info ──
const user = JSON.parse(localStorage.getItem('fc_user') || '{}');
if (user.name) {
  document.getElementById('userName').textContent   = user.name.split(' ')[0];
  document.getElementById('userName2').textContent  = user.name.split(' ')[0];
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
}

// ── Mobile Sidebar ──
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

document.getElementById('menuBtn')?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('show');
});

sidebarOverlay?.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
});

// ── Logout ──
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

// ── New Portfolio ──
function newPortfolio() {
  localStorage.removeItem('currentPortfolioId');
  localStorage.removeItem('portfolioData');
}

// ── API Helper ──
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
  return res.json();
}

// ── Load Portfolios ──
async function loadPortfolios() {
  try {
    const data       = await apiFetch('/portfolio/all');
    const portfolios = data.portfolios || [];

    document.getElementById('totalPortfolios').textContent = portfolios.length;
    document.getElementById('publishedCount').textContent  =
      portfolios.filter(p => p.isPublished).length;

    if (portfolios.length > 0) {
      const latest = [...portfolios].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];
      document.getElementById('lastActive').textContent =
        new Date(latest.updatedAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric'
        });
    }

    const grid = document.getElementById('portfolioGrid');
    document.getElementById('loadingState')?.remove();

    if (portfolios.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
          <h3>No portfolios yet</h3>
          <p>Build your first portfolio in under 5 minutes</p>
          <a href="wizard.html" class="btn-primary" onclick="newPortfolio()">
            Create Portfolio
          </a>
        </div>`;
      return;
    }

    grid.innerHTML = portfolios.map(p => `
      <div class="portfolio-card">
        <div class="portfolio-card-header">
          <span class="portfolio-card-name">
            ${p.portfolioName || 'My Portfolio'}
          </span>
          <span class="portfolio-badge ${p.isPublished
            ? 'portfolio-badge--published'
            : 'portfolio-badge--draft'}">
            ${p.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
        <div class="portfolio-card-meta">
          ${p.fullname ? `<span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            ${p.fullname}
          </span>` : ''}
          ${p.title ? `<span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-4 0v2"/>
            </svg>
            ${p.title}
          </span>` : ''}
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Updated ${new Date(p.updatedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </span>
        </div>
        <div class="portfolio-card-actions">
          <a href="wizard.html" class="btn-action"
             onclick="selectPortfolio('${p._id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </a>
          <a href="preview.html" class="btn-action"
             onclick="selectPortfolio('${p._id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </a>
          <button class="btn-action btn-action--danger"
                  onclick="deletePortfolio('${p._id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Load error:', err);
    const ls = document.getElementById('loadingState');
    if (ls) ls.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
           stroke="#dc2626" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p style="color:#dc2626;font-size:13px;">Failed to load. Please refresh.</p>`;
  }
}

// ── Select Portfolio ──
function selectPortfolio(id) {
  localStorage.setItem('currentPortfolioId', id);
}

// ── Delete Portfolio ──
async function deletePortfolio(id) {
  if (!confirm('Delete this portfolio? This cannot be undone.')) return;

  try {
    const res = await fetch(`${API_URL}/portfolio/${id}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      loadPortfolios();
    } else {
      alert('Failed to delete. Please try again.');
    }
  } catch {
    alert('Network error. Please try again.');
  }
}

// ── Init ──
loadPortfolios();