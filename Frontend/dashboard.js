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
  const firstName    = user.name.split(' ')[0];
  const avatarLetter = user.name.charAt(0).toUpperCase();

  document.getElementById('userName').textContent  = firstName;
  document.getElementById('userName2').textContent = firstName;

  const sidebarName = document.getElementById('sidebarUserName');
  if (sidebarName) sidebarName.textContent = firstName;

  const avatarHTML = user.avatar
    ? `<img src="${user.avatar}" 
        style="width:100%;height:100%;border-radius:50%;object-fit:cover;" 
        onerror="this.parentElement.textContent='${avatarLetter}'"
        alt="avatar"/>`
    : avatarLetter;

  const mainAvatar    = document.getElementById('userAvatar');
  const sidebarAvatar = document.getElementById('sidebarAvatar');

  if (mainAvatar)    mainAvatar.innerHTML    = avatarHTML;
  if (sidebarAvatar) sidebarAvatar.innerHTML = avatarHTML;
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

// ── Format Date + Time ──
function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  const dateFormatted = d.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric'
  });
  const timeFormatted = d.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateFormatted}, ${timeFormatted}`;
}

// Short version for stat card (date + time on 2 lines)
function formatDateTimeShort(dateStr) {
  const d = new Date(dateStr);
  const dateFormatted = d.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric'
  });
  const timeFormatted = d.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateFormatted} · ${timeFormatted}`;
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

    // Update section count badge
    const countEl = document.getElementById('sectionCount');
    if (countEl) {
      countEl.textContent = `${portfolios.length} item${portfolios.length !== 1 ? 's' : ''}`;
    }

    if (portfolios.length > 0) {
      const latest = [...portfolios].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];
      // Show date + time in Last Active stat
      document.getElementById('lastActive').textContent =
        formatDateTimeShort(latest.updatedAt);
    }

    const grid = document.getElementById('portfolioGrid');
    document.getElementById('loadingState')?.remove();

    if (portfolios.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <h3>No portfolios yet</h3>
          <p>Build your first portfolio in under 5 minutes - no code needed.</p>
          <a href="wizard.html" class="btn-primary" onclick="newPortfolio()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
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
          ${p.fullname ? `
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            ${p.fullname}
          </span>` : ''}

          ${p.title ? `
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-4 0v2"/>
            </svg>
            ${p.title}
          </span>` : ''}

          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Updated ${formatDateTime(p.updatedAt)}
          </span>
        </div>

        <div class="portfolio-card-actions">
          <a href="wizard.html" class="btn-action btn-action--edit"
             onclick="selectPortfolio('${p._id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </a>
          <a href="preview.html" class="btn-action btn-action--preview"
             onclick="selectPortfolio('${p._id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </a>
          <button class="btn-action btn-action--danger"
                  onclick="deletePortfolio('${p._id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
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
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
           stroke="#dc2626" stroke-width="1.5" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p style="color:#dc2626;font-size:13px;margin-top:8px;">Failed to load. Please refresh.</p>`;
  }
}

// ── Select Portfolio ──
function selectPortfolio(id) {
  localStorage.setItem('currentPortfolioId', id);
}

// ── Delete Portfolio ──
async function deletePortfolio(id) {
  const confirmed = await showConfirmModal('Delete this portfolio? This cannot be undone.');
if (!confirmed) return;

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

// ── Analytics ──

let chartsRendered = false;

document.getElementById('analyticsNavBtn')?.addEventListener('click', function(e) {
  e.preventDefault();

  const portfolioSection  = document.querySelector('.section:not(#analyticsSection)');
  const analyticsSection  = document.getElementById('analyticsSection');

  // Toggle
  const isShowing = analyticsSection.style.display !== 'none';

  if (isShowing) {
    analyticsSection.style.display = 'none';
    portfolioSection.style.display = '';
    this.classList.remove('active');
    document.querySelector('.nav-item.active:not(#analyticsNavBtn)')?.classList.add('active');
  } else {
    portfolioSection.style.display  = 'none';
    analyticsSection.style.display  = '';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
    renderAnalyticsCharts();
  }
});

async function renderAnalyticsCharts() {
  if (chartsRendered) return;
  chartsRendered = true;

  const isDark    = document.body.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
  const textColor = isDark ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.45)';

  // Real data fetch
  let stats = null;
  try {
    const res  = await fetch(API_URL + '/analytics/overview', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    stats      = data.stats;
  } catch(e) {}

  // Stats update
  document.getElementById('anTotalViews').textContent = stats?.totalViews || 0;
  document.getElementById('anVisitors').textContent   = Math.round((stats?.totalViews || 0) * 0.75);
  document.getElementById('anLast7').textContent      = stats?.last7Days  || 0;
  document.getElementById('anLast30').textContent     = stats?.last30Days || 0;

  // Views line chart
  const dailyViews = stats?.dailyViews || [];
  const labels = dailyViews.length
    ? dailyViews.slice(-7).map(d => new Date(d.date).toLocaleDateString('en', { weekday: 'short' }))
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const viewData = dailyViews.length
    ? dailyViews.slice(-7).map(d => d.views)
    : [0,0,0,0,0,0,0];

  new Chart(document.getElementById('viewsChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: viewData,
        borderColor: '#7b6ef6',
        backgroundColor: 'rgba(123,110,246,.08)',
        borderWidth: 2,
        tension: .4,
        fill: true,
        pointBackgroundColor: '#7b6ef6',
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true }
      }
    }
  });

  // Device donut chart
  const deviceBreakdown = stats?.deviceBreakdown || {};
  const deviceLabels = Object.keys(deviceBreakdown).length ? Object.keys(deviceBreakdown) : ['Mobile','Desktop','Tablet'];
  const deviceValues = Object.keys(deviceBreakdown).length ? Object.values(deviceBreakdown) : [0,0,0];
  const deviceColors = ['#7b6ef6','#34d1bf','#f97316'];

  new Chart(document.getElementById('deviceChart'), {
    type: 'doughnut',
    data: {
      labels: deviceLabels,
      datasets: [{ data: deviceValues, backgroundColor: deviceColors, borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      cutout: '72%'
    }
  });

  const total = deviceValues.reduce((a,b) => a+b, 0) || 1;
  document.getElementById('deviceList').innerHTML = deviceLabels.map((d,i) => `
    <div class="an-device-row">
      <div class="an-device-dot" style="background:${deviceColors[i]}"></div>
      <span class="an-device-name">${d}</span>
      <span class="an-device-pct">${Math.round(deviceValues[i]/total*100)}%</span>
    </div>
  `).join('');

  // Portfolio bar chart
  let portfolios = [];
  try {
    const res  = await fetch(API_URL + '/portfolio/all', { headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json();
    portfolios = data.portfolios || [];
  } catch(e) {}

  new Chart(document.getElementById('portfolioViewsChart'), {
    type: 'bar',
    data: {
      labels: portfolios.length ? portfolios.map(p => p.portfolioName || 'Portfolio') : ['No portfolios'],
      datasets: [{
        data: portfolios.length ? portfolios.map(p => p.totalViews || 0) : [0],
        backgroundColor: 'rgba(123,110,246,.7)',
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 12 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true }
      }
    }
  });
}