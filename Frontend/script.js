
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
  window.location.href = 'wizard.html';
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
        window.location.href = 'wizard.html';
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
        window.location.href = 'wizard.html';
      }, 1200);
    } catch(err) {
      showMessage(err.message);
      btn.disabled = false;
    }
  });

  // ── Init ──
  updateNav();
  window.showAuthModal = showModal;

})();