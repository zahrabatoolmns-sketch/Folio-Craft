
'use strict';

/*
   0.  PARTICLES  (background) */
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

  function getColor() {
    const dark = document.body.classList.contains('dark');
    return Math.random() > .5
      ? (dark ? 'rgba(123,110,246,.28)' : 'rgba(91,77,232,.24)')
      : (dark ? 'rgba(52,209,191,.22)'  : 'rgba(11,168,154,.2)');
  }

  class Dot {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + .3;
      this.vx = (Math.random() - .5) * .38;
      this.vy = (Math.random() - .5) * .38;
      this.c  = getColor();
    }
    step() {
      this.x += this.vx; this.y += this.vy;
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

  function init() { pts = Array.from({ length: 80 }, () => new Dot()); }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { p.step(); p.draw(); });
    requestAnimationFrame(frame);
  }

  resize(); init(); frame();
  window.addEventListener('resize', () => { resize(); init(); });
})();

/* =====================================================
   1.  THEME
===================================================== */
const THEME_KEY = 'fc_theme';

function applyTheme(t) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(t);
  localStorage.setItem(THEME_KEY, t);
}

window.toggleTheme = () => applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
document.getElementById('themeBtn')?.addEventListener('click', window.toggleTheme);

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'light' || savedTheme === 'dark') applyTheme(savedTheme);

/* =====================================================
   2.  DATA MODEL
===================================================== */
const STORE = 'portfolioData';

function getPortfolio()  { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; } }
function setPortfolio(d) { localStorage.setItem(STORE, JSON.stringify(d)); }

function ensureModel(d) {
  d.skills     = Array.isArray(d.skills)     ? d.skills     : [];
  d.projects   = Array.isArray(d.projects)   ? d.projects   : [];
  d.experience = Array.isArray(d.experience) ? d.experience : [];
  d.education  = Array.isArray(d.education)  ? d.education  : [];
  d.selectedTemplate = d.selectedTemplate || localStorage.getItem('selectedTemplate') || 'modern-dark';
  return d;
}

let model = ensureModel(getPortfolio());

/* =====================================================
   3.  UTILITIES
===================================================== */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

function fileToBase64(file) {
  return new Promise(res => {
    if (!file) return res('');
    const r = new FileReader();
    r.onload  = () => res(String(r.result || ''));
    r.onerror = () => res('');
    r.readAsDataURL(file);
  });
}

/* toast */
function toast(msg, type = 'error') {
  const area = document.getElementById('toastArea');
  if (!area) return;
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = msg;
  area.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* =====================================================
   4.  WIZARD  —  STEP NAVIGATION
===================================================== */
const steps   = Array.from(document.querySelectorAll('.wizard-step'));
const dots    = Array.from(document.querySelectorAll('.step-dot'));
const fillEl  = document.getElementById('progressFill');
const trackEl = document.getElementById('progressBar');

let currentStep = 0;

function showStep(idx) {
  steps.forEach((s, i) => {
    s.classList.toggle('active', i === idx);
  });

  dots.forEach((d, i) => {
    d.classList.remove('active', 'completed');
    if (i < idx) d.classList.add('completed');
    if (i === idx) d.classList.add('active');
  });

  const pct = (idx / (steps.length - 1)) * 100;
  if (fillEl) { fillEl.style.width = pct + '%'; }
  if (trackEl) { trackEl.setAttribute('aria-valuenow', Math.round(pct)); }

  // scroll wizard wrap into view smoothly
  document.querySelector('.wizard-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  currentStep = idx;
}

showStep(0);

/* next / prev buttons */
document.querySelectorAll('.next-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // basic validation on step 0
    if (currentStep === 0) {
      const name  = document.querySelector('input[name="fullname"]')?.value?.trim();
      const title = document.querySelector('input[name="title"]')?.value?.trim();
      if (!name)  { toast('Full Name is required');          return; }
      if (!title) { toast('Professional Title is required'); return; }
    }
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
  });
});

document.querySelectorAll('.prev-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });
});

/* =====================================================
   5.  PROFILE PHOTO PREVIEW
===================================================== */
const profileFile    = document.getElementById('profileFile');
const profilePreview = document.getElementById('profilePreview');
const profileName    = document.getElementById('profileName');

profileFile?.addEventListener('change', () => {
  const file = profileFile.files?.[0];
  if (!file || !profilePreview) return;
  profilePreview.src = URL.createObjectURL(file);
  profilePreview.hidden = false;
  document.querySelector('.file-ui')?.setAttribute('hidden', '');
  if (profileName) profileName.textContent = file.name;
});

/* =====================================================
   6.  RENDER HELPERS
===================================================== */
function rmBtn(attr, idx) {
  return `<button class="rm-btn" data-rm="${attr}" data-idx="${idx}" aria-label="Remove">✕</button>`;
}

function renderSkills() {
  const el = document.getElementById('skillsList');
  if (!el) return;
  if (!model.skills.length) { el.innerHTML = ''; return; }

  el.innerHTML = model.skills.map((s, i) => `
    <div class="skill-card">
      <div class="skill-head">
        <span class="skill-name">${esc(s.name)}</span>
        <span class="skill-level">${s.level ?? 0}%</span>
        ${rmBtn('skill', i)}
      </div>
      <div class="skill-bar">
        <div class="skill-progress" style="width:${s.level ?? 0}%"></div>
      </div>
      <div class="skill-footer">
        <span class="skill-category">${esc(s.category)}</span>
      </div>
    </div>
  `).join('');
}

function renderProjects() {
  const el = document.getElementById('projectsList');
  if (!el) return;
  if (!model.projects.length) { el.innerHTML = ''; return; }

  el.innerHTML = model.projects.map((p, i) => `
    <div class="project-card">
      ${p.image_base64 ? `<div class="project-img"><img src="${p.image_base64}" alt="${esc(p.title)}" loading="lazy"/></div>` : ''}
      <div class="project-body">
        <div class="project-head">
          <h4>${esc(p.title)}</h4>
          ${rmBtn('project', i)}
        </div>
        <p>${esc(p.description || '')}</p>
        <div class="project-tech">${(p.tech || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="project-links">
          ${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}
          ${p.live   ? `<a href="${esc(p.live)}"   target="_blank" rel="noopener">Live ↗</a>`   : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function renderExperience() {
  const el = document.getElementById('experienceList');
  if (!el) return;
  if (!model.experience.length) { el.innerHTML = ''; return; }

  el.innerHTML = model.experience.map((e, i) => `
    <div class="experience-card">
      <div class="experience-head">
        <div>
          <h4>${esc(e.jobTitle)}</h4>
          <div class="experience-company">${esc(e.company)}</div>
        </div>
        ${rmBtn('exp', i)}
      </div>
      <p class="experience-desc">${esc(e.description || '')}</p>
    </div>
  `).join('');
}

function renderEducation() {
  const el = document.getElementById('educationList');
  if (!el) return;
  if (!model.education.length) { el.innerHTML = ''; return; }

  el.innerHTML = model.education.map((e, i) => `
    <div class="education-card">
      <div class="education-head">
        <div>
          <h4>${esc(e.degree)}</h4>
          <div class="experience-company">${esc(e.institute)}</div>
        </div>
        ${rmBtn('edu', i)}
      </div>
      <p class="experience-desc">${esc(e.field || '')}</p>
    </div>
  `).join('');
}

/* initial render */
renderSkills(); renderProjects(); renderExperience(); renderEducation();

/* =====================================================
   7.  ADD HANDLERS
===================================================== */
document.getElementById('addSkillBtn')?.addEventListener('click', () => {
  const name     = document.getElementById('skillName')?.value?.trim();
  const level    = Math.min(100, Math.max(0, Number(document.getElementById('skillLevel')?.value || 0)));
  const category = document.getElementById('skillCategory')?.value || 'Frontend';
  if (!name) { toast('Enter a skill name'); return; }

  model.skills.push({ name, level, category });
  setPortfolio(model);
  document.getElementById('skillName').value  = '';
  document.getElementById('skillLevel').value = '';
  renderSkills();
});

document.getElementById('addProjectBtn')?.addEventListener('click', async () => {
  const title = document.getElementById('projectTitle')?.value?.trim();
  if (!title) { toast('Enter a project title'); return; }

  const description  = document.getElementById('projectDescription')?.value?.trim();
  const techRaw      = document.getElementById('projectTech')?.value?.trim();
  const github       = document.getElementById('projectGithub')?.value?.trim();
  const live         = document.getElementById('projectLive')?.value?.trim();
  const imgFile      = document.getElementById('projectImage')?.files?.[0] || null;
  const image_base64 = await fileToBase64(imgFile);
  const tech         = techRaw ? techRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  model.projects.push({ title, description, tech, github, live, image_base64 });
  setPortfolio(model);

  ['projectTitle','projectDescription','projectTech','projectGithub','projectLive'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const imgEl = document.getElementById('projectImage');
  if (imgEl) imgEl.value = '';
  renderProjects();
});

document.getElementById('addExperienceBtn')?.addEventListener('click', () => {
  const jobTitle    = document.getElementById('jobTitle')?.value?.trim();
  const company     = document.getElementById('companyName')?.value?.trim();
  const description = document.getElementById('jobDesc')?.value?.trim();
  if (!jobTitle || !company) { toast('Job title and company are required'); return; }

  model.experience.push({ jobTitle, company, description });
  setPortfolio(model);
  ['jobTitle','companyName','jobDesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderExperience();
});

document.getElementById('addEducationBtn')?.addEventListener('click', () => {
  const degree    = document.getElementById('degree')?.value?.trim();
  const institute = document.getElementById('institute')?.value?.trim();
  const field     = document.getElementById('field')?.value?.trim();
  if (!degree || !institute) { toast('Degree and institute are required'); return; }

  model.education.push({ degree, institute, field });
  setPortfolio(model);
  ['degree','institute','field'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderEducation();
});

/* =====================================================
   8.  REMOVE  (event delegation)
===================================================== */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-rm]');
  if (!btn) return;
  const { rm, idx } = btn.dataset;
  const i = Number(idx);

  if (rm === 'skill')   { model.skills.splice(i,1);     setPortfolio(model); renderSkills(); }
  if (rm === 'project') { model.projects.splice(i,1);   setPortfolio(model); renderProjects(); }
  if (rm === 'exp')     { model.experience.splice(i,1); setPortfolio(model); renderExperience(); }
  if (rm === 'edu')     { model.education.splice(i,1);  setPortfolio(model); renderEducation(); }
});

/* =====================================================
   9.  TEMPLATE SELECTION
===================================================== */
let selectedTemplate = model.selectedTemplate || 'modern-dark';

function markTemplate() {
  document.querySelectorAll('.tpl-card').forEach(card => {
    const sel = card.dataset.template === selectedTemplate;
    card.setAttribute('aria-checked', sel ? 'true' : 'false');
  });
}

document.querySelectorAll('.tpl-card').forEach(card => {
  function select() {
    selectedTemplate = card.dataset.template;
    model.selectedTemplate = selectedTemplate;
    localStorage.setItem('selectedTemplate', selectedTemplate);
    setPortfolio(model);
    markTemplate();
  }
  card.addEventListener('click', select);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
  });
});

markTemplate();

/* =====================================================
   10.  FINISH  →  save & redirect
===================================================== */
document.getElementById('finishBtn')?.addEventListener('click', async () => {
  const form = document.getElementById('portfolioForm');
  if (!form) return;

  // collect all named form fields
  const fd = new FormData(form);
  fd.forEach((val, key) => {
    if (val instanceof File) return;
    model[key] = typeof val === 'string' ? val.trim() : val;
  });

  // normalize keys (same as original)
  model.fullname      = String(model.fullname      || model.fullName || model.name    || '').trim();
  model.title         = String(model.title         || model.profession || model.role  || '').trim();
  model.bio           = String(model.bio           || '').trim();
  model.description   = String(model.description   || model.about  || '').trim();
  model.email         = String(model.email         || '').trim();
  model.linkedin      = String(model.linkedin      || '').trim();
  model.github_social = String(model.github_social || '').trim();
  model.instagram     = String(model.instagram     || '').trim();

  // profile image
  const profileRaw = document.getElementById('profileFile')
    || form.querySelector('input[name="profile"]');
  const profileFileObj = profileRaw?.files?.[0] || null;
  if (profileFileObj) {
    model.profile_base64 = await fileToBase64(profileFileObj);
  } else {
    model.profile_base64 = model.profile_base64 || '';
  }

  // ensure arrays
  model.skills     = Array.isArray(model.skills)     ? model.skills     : [];
  model.projects   = Array.isArray(model.projects)   ? model.projects   : [];
  model.experience = Array.isArray(model.experience) ? model.experience : [];
  model.education  = Array.isArray(model.education)  ? model.education  : [];

  // template
  model.selectedTemplate = selectedTemplate || localStorage.getItem('selectedTemplate') || 'modern-dark';

  // validate
  if (!model.fullname) { toast('Full Name is required (Step 1)'); showStep(0); return; }
  if (!model.title)    { toast('Professional Title is required (Step 1)'); showStep(0); return; }

  setPortfolio(model);
  // Cloud save
if (window.FolioAPI && window.FolioAPI.isLoggedIn()) {
  try {
    await window.FolioAPI.savePortfolio(portfolioData);
    console.log('Cloud mein save ho gaya!');
  } catch(e) {
    console.warn('Cloud save:', e.message);
  }
}
  toast('Saving your portfolio…', 'success');
  setTimeout(() => { window.location.href = './preview.html'; }, 800);
});

/* ---- MULTIPLE PORTFOLIOS ---- */
(async function() {
  if (!window.FolioAPI || !window.FolioAPI.isLoggedIn()) return;

  const selector    = document.getElementById('portfolioSelector');
  const list        = document.getElementById('portfolioList');
  const addBtn      = document.getElementById('addPortfolioBtn');

  if (!selector) return;

  // Selector dikhao
  selector.style.display = 'block';

  // Portfolios load karo
  async function loadPortfolios() {
    try {
      const portfolios = await window.FolioAPI.getAllPortfolios();
      const currentId  = localStorage.getItem('currentPortfolioId');

      list.innerHTML = portfolios.map(p => `
        <div class="ps-item ${p._id === currentId ? 'active' : ''}"
             data-id="${p._id}">
          <span>${p.portfolioName || 'My Portfolio'}</span>
          <button class="ps-item-delete" data-id="${p._id}" title="Delete">✕</button>
        </div>
      `).join('');

      // Portfolio select karo
      list.querySelectorAll('.ps-item').forEach(item => {
        item.addEventListener('click', async function(e) {
          if (e.target.classList.contains('ps-item-delete')) return;

          const id = this.dataset.id;
          await window.FolioAPI.loadPortfolioById(id);

          // Active class update karo
          list.querySelectorAll('.ps-item').forEach(i => i.classList.remove('active'));
          this.classList.add('active');

          // Page reload karo naya data load karne ke liye
          window.location.reload();
        });
      });

      // Delete buttons
      list.querySelectorAll('.ps-item-delete').forEach(btn => {
        btn.addEventListener('click', async function(e) {
          e.stopPropagation();
          if (!confirm('Do you want to delete this portfolio?')) return;

          const id = this.dataset.id;
          await window.FolioAPI.deletePortfolio(id);
          await loadPortfolios();
        });
      });

    } catch(err) {
      console.warn('Portfolios load error:', err.message);
    }
  }

  // Naya portfolio banao
  addBtn?.addEventListener('click', async function() {
    const name = prompt('New portfolio name:') || 'My Portfolio';
    try {
      const portfolio = await window.FolioAPI.createPortfolio(name);
      localStorage.setItem('currentPortfolioId', portfolio._id);
      localStorage.setItem('portfolioData', JSON.stringify(portfolio));
      window.location.reload();
    } catch(err) {
      alert(err.message);
    }
  });

  await loadPortfolios();
})();