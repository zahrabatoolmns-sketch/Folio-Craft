
'use strict';

/* ---- THEME ---- */
const THEME_KEY = 'fc_theme';

function applyTheme(t) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(t);
  localStorage.setItem(THEME_KEY, t);
}

function toggleTheme() {
  applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
}

// restore saved preference
const saved = localStorage.getItem(THEME_KEY);
if (saved === 'light' || saved === 'dark') applyTheme(saved);

document.getElementById('themeBtn').addEventListener('click', toggleTheme);

/* ---- CTA ---- */
document.getElementById('getStartedBtn').addEventListener('click', () => {
  if (window.FolioAPI && window.FolioAPI.isLoggedIn()) {
    window.location.href = 'wizard.html';
  } else {
    const guestUsed = localStorage.getItem('fc_guest_used');
    if (guestUsed) {
      window.showAuthModal && window.showAuthModal();
      setTimeout(function() {
        const msgBox = document.getElementById('authMessage');
        if (msgBox) {
          msgBox.textContent   = 'Sign up to save and manage unlimited portfolios!';
          msgBox.className     = 'auth-message success';
          msgBox.style.display = 'block';
        }
      }, 100);
    } else {
      localStorage.setItem('fc_guest_used', 'true');
      window.location.href = 'wizard.html';
    }
  }
});

/* ---- PARTICLES ---- */
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let pts = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function color() {
    const isDark = document.body.classList.contains('dark');
    const pick = Math.random() > .5;
    if (isDark) return pick ? 'rgba(123,110,246,.32)' : 'rgba(52,209,191,.24)';
    return pick ? 'rgba(91,77,232,.28)' : 'rgba(11,168,154,.22)';
  }

  class Dot {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.6 + .3;
      this.vx = (Math.random() - .5) * .42;
      this.vy = (Math.random() - .5) * .42;
      this.c  = color();
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c;
      ctx.fill();
    }
  }

  function init() {
    pts = Array.from({ length: 88 }, () => new Dot());
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { p.step(); p.draw(); });
    requestAnimationFrame(frame);
  }

  resize();
  init();
  frame();

  window.addEventListener('resize', () => { resize(); init(); });

  // subtle parallax on shapes
  document.addEventListener('mousemove', e => {
    const rx = (e.clientX / W - .5) * 16;
    const ry = (e.clientY / H - .5) * 16;
    document.querySelectorAll('.fs, .bg-orb').forEach((el, i) => {
      const f = (i % 3 + 1) * .38;
      el.style.transform = `translate(${rx * f}px, ${ry * f}px)`;
    });
  });
})();

/* ---- AUTH MODAL ---- */
(function() {

  const overlay      = document.getElementById('authOverlay');
  const closeBtn     = document.getElementById('authClose');
  const loginTab     = document.getElementById('loginTab');
  const registerTab  = document.getElementById('registerTab');
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const msgBox       = document.getElementById('authMessage');
  const navLoginBtn  = document.getElementById('navLoginBtn');
  const navUserInfo  = document.getElementById('navUserInfo');
  const navUserName  = document.getElementById('navUserName');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  if (!overlay) return;

  // ── Modal Open/Close ──
  function showModal() {
    overlay.style.display = 'flex';
  }
  function hideModal() {
    overlay.style.display = 'none';
  }

  // ── Tab Switch ──
  function switchTab(tab) {
    loginTab.classList.toggle('active', tab === 'login');
    registerTab.classList.toggle('active', tab === 'register');
    loginForm.style.display    = tab === 'login'    ? 'block' : 'none';
    registerForm.style.display = tab === 'register' ? 'block' : 'none';
    clearMessage();
  }

  // ── Messages ──
  function showMessage(msg, type = 'error') {
    msgBox.textContent   = msg;
    msgBox.className     = 'auth-message ' + type;
    msgBox.style.display = 'block';
  }
  function clearMessage() {
    msgBox.style.display = 'none';
  }

  // ── Nav Update ──
  function updateNav() {
    const user = window.FolioAPI && window.FolioAPI.getCurrentUser();
    if (user) {
      navLoginBtn.style.display = 'none';
      navUserInfo.style.display = 'flex';
      navUserName.textContent   = user.name.split(' ')[0];
    } else {
      navLoginBtn.style.display = '';
      navUserInfo.style.display = 'none';
    }
  }

  // Google Login Button
const googleBtn = document.getElementById('googleLoginBtn');
googleBtn?.addEventListener('click', function() {
  if (window.FolioAPI) {
    window.FolioAPI.loginWithGoogle();
  }
});

  // ── Button Events ──
  navLoginBtn.addEventListener('click', showModal);
  closeBtn.addEventListener('click', hideModal);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) hideModal();
  });
  loginTab.addEventListener('click',    function() { switchTab('login'); });
  registerTab.addEventListener('click', function() { switchTab('register'); });
  navLogoutBtn.addEventListener('click', function() {
    window.FolioAPI.logout();
    updateNav();
  });

  // ── Login Submit ──
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn   = document.getElementById('loginSubmit');
    const email = document.getElementById('loginEmail').value;
    const pass  = document.getElementById('loginPassword').value;
    btn.disabled = true;
    clearMessage();
    try {
      await window.FolioAPI.login(email, pass);
      showMessage('Logged in!', 'success');
      updateNav();
      setTimeout(function() {
        hideModal();
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch(err) {
      showMessage(err.message);
      btn.disabled = false;
    }
  });

  // ── Register Submit ──
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn   = document.getElementById('registerSubmit');
    const name  = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass  = document.getElementById('regPassword').value;
    btn.disabled = true;
    clearMessage();
    try {
      await window.FolioAPI.register(name, email, pass);
      showMessage('Account created! 🎉', 'success');
      updateNav();
      setTimeout(function() {
        hideModal();
        window.location.href = 'dashboard.html';
      }, 1200);
    } catch(err) {
      showMessage(err.message);
      btn.disabled = false;
    }
  });

  // ── Init ──
  updateNav();
  window.showAuthModal = showModal;

  // ── Show/Hide Password ──
const eyeOpen = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>`;

const eyeClosed = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`;

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type    = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden ? eyeClosed : eyeOpen;
}

document.getElementById('loginEyeBtn')?.addEventListener('click', function() {
  togglePassword('loginPassword', this);
});

document.getElementById('regEyeBtn')?.addEventListener('click', function() {
  togglePassword('regPassword', this);
});

// ── Password Strength (Register) ──
document.getElementById('regPassword')?.addEventListener('input', function() {
  const val  = this.value;
  const wrap = document.getElementById('regStrengthWrap');
  const fill = document.getElementById('regStrengthFill');
  const text = document.getElementById('regStrengthText');

  if (!val) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';

  let score = 0;
  if (val.length >= 6)           score++;
  if (val.length >= 10)          score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;

  const levels = [
    { label: 'Very Weak',  color: '#ef4444', width: '20%'  },
    { label: 'Weak',       color: '#f97316', width: '40%'  },
    { label: 'Fair',       color: '#eab308', width: '60%'  },
    { label: 'Good',       color: '#22c55e', width: '80%'  },
    { label: 'Strong',     color: '#16a34a', width: '100%' },
  ];

  const level           = levels[Math.min(score, 4)];
  fill.style.width      = level.width;
  fill.style.background = level.color;
  text.textContent      = level.label;
  text.style.color      = level.color;
});

// ── Forgot Password ──
document.getElementById('forgotBtn')?.addEventListener('click', function() {
  const email = document.getElementById('loginEmail').value.trim();

  if (!email) {
    showMessage('Please enter your email first.', 'error');
    return;
  }

  const btn = this;
  btn.textContent = 'Sending...';
  btn.disabled    = true;

  fetch('https://folio-craft-two.vercel.app/api/auth/forgot-password', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email })
  })
  .then(r => r.json())
  .then(data => {
    showMessage('Password reset link has been sent to your email.', 'success');
    btn.textContent = 'Forgot password?';
    btn.disabled    = false;
  })
  .catch(() => {
    showMessage('Failed to send email. Please try again.', 'error');
    btn.textContent = 'Forgot password?';
    btn.disabled    = false;
  });
});

})();

/* ---- FAQ ACCORDION ---- */
document.querySelectorAll('.faq-question').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const item   = this.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function(i) {
      i.classList.remove('open');
    });
    if (!isOpen) item.classList.add('open');
  });
});

/* ---- FOOTER ---- */
document.getElementById('footerYear').textContent = new Date().getFullYear();
document.getElementById('footerLoginBtn')?.addEventListener('click', function() {
  window.showAuthModal && window.showAuthModal();
});

document.getElementById('footerDashboardBtn')?.addEventListener('click', function(e) {
  e.preventDefault();
  const token = localStorage.getItem('fc_token');
  if (token) {
    window.location.href = 'dashboard.html';
  } else {
    window.showAuthModal && window.showAuthModal();
  }
});