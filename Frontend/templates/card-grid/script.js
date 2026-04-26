/* ══════════════════════════════════
   CARD-GRID  ·  script.js
   ══════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Data ── */
  let D = {};
  try { D = JSON.parse(localStorage.getItem('portfolioData') || '{}'); } catch (_) {}

  /* ── 2. Utils ── */
  const el  = id => document.getElementById(id);
  const set = (id, val) => { const e = el(id); if (e && val) e.textContent = val; };
  const setHref = (id, href) => {
    const e = el(id);
    if (!e) return;
    if (href) { e.href = href; e.style.display = ''; }
    else e.style.display = 'none';
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );

  /* ── 3. Simple fields ── */
  document.title = (D.fullname || 'Portfolio') + ' | Portfolio';
  set('navName',      D.fullname);
  set('heroName',     D.fullname);
  set('heroTitle',    D.title);
  set('heroBio',      D.bio);
  set('hcName',       D.fullname);
  set('hcRole',       D.title);
  set('footerName',   D.fullname);

  if (el('heroLocation'))  el('heroLocation').textContent = D.location || 'Open to Work';
  if (el('heroEmailTag'))  el('heroEmailTag').textContent = D.email  ? '📧 ' + D.email  : '';
  if (el('heroPhoneTag'))  el('heroPhoneTag').textContent = D.phone  ? '📞 ' + D.phone  : '';
  if (el('fcLocation'))    el('fcLocation').querySelector('.fc-txt').textContent = D.location || '—';

  set('aboutDescription',  D.description);
  set('aboutSkillsSummary',D.skills_summary);
  set('ciEmail',    D.email);
  set('ciPhone',    D.phone);
  set('ciLocation', D.location);

  set('ctEmail',    D.email);
  set('ctPhone',    D.phone);
  set('ctLocation', D.location);

  /* Stats */
  const proj = (D.projects  || []).length;
  const skil = (D.skills    || []).length;
  const expN = (D.experience|| []).length;
  const eduN = (D.education || []).length;

  set('hcsProj',   proj + '+');
  set('hcsSkills', skil + '+');
  set('hcsExp',    expN + '+');
  set('sgProjects',proj + '+');
  set('sgSkills',  skil + '+');
  set('sgExp',     expN + '+');
  set('sgEdu',     eduN + '+');

  /* ── 4. Avatar ── */
  if (D.profile_base64) {
    const img = el('heroAvatar'), ph = el('avatarPh');
    if (img) { img.src = D.profile_base64; img.style.display = 'block'; }
    if (ph)  ph.style.display = 'none';
  }

  /* ── 5. Socials ── */
  setHref('hLinkedin',  D.linkedin);
  setHref('hGithub',    D.github_social);
  setHref('hInstagram', D.instagram);
  setHref('aLi', D.linkedin);
  setHref('aGh', D.github_social);
  setHref('aIg', D.instagram);
  setHref('ctLi', D.linkedin);
  setHref('ctGh', D.github_social);
  setHref('ctIg', D.instagram);

  /* ── 6. Hero card skill tags (top 5) ── */
  const hcTags = el('hcTags');
  if (hcTags && D.skills?.length) {
    hcTags.innerHTML = D.skills.slice(0, 5).map(s =>
      `<span class="hc-tag">${esc(s.name)}</span>`
    ).join('');
  }

  /* ── 7. Skills ── */
  const sg = el('skillsCardGrid');
  if (sg && D.skills?.length) {
    sg.innerHTML = D.skills.map(s => `
      <div class="skill-card reveal">
        <div class="sk-top">
          <span class="sk-name">${esc(s.name)}</span>
          <span class="sk-pct">${s.level || 0}%</span>
        </div>
        <div class="sk-bar">
          <div class="sk-fill" style="width:${s.level || 0}%"></div>
        </div>
        <div class="sk-cat">${esc(s.category || '')}</div>
      </div>
    `).join('');
  }

  /* ── 8. Projects ── */
  const pm = el('projectsMasonry');
  if (pm && D.projects?.length) {
    pm.innerHTML = D.projects.map(p => `
      <div class="project-card-item reveal">
        <div class="pci-img">
          ${p.image_base64 ? `<img src="${p.image_base64}" alt="${esc(p.title)}"/>` : ''}
        </div>
        <div class="pci-body">
          <div class="pci-tags">
            ${(p.tech || []).map(t => `<span class="pci-tag">${esc(t)}</span>`).join('')}
          </div>
          <div class="pci-title">${esc(p.title)}</div>
          <div class="pci-desc">${esc(p.description || '')}</div>
          <div class="pci-links">
            ${p.github ? `<a class="pci-link github" href="${esc(p.github)}" target="_blank">GitHub ↗</a>` : ''}
            ${p.live   ? `<a class="pci-link live"   href="${esc(p.live)}"   target="_blank">Live Demo ↗</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ── 9. Experience ── */
  const expEl = el('expCards');
  if (expEl && D.experience?.length) {
    expEl.innerHTML = D.experience.map(e => `
      <div class="exp-card reveal">
        <div class="ec-title">${esc(e.jobTitle)}</div>
        <div class="ec-sub">${esc(e.company)}</div>
        <div class="ec-desc">${esc(e.description || '')}</div>
      </div>
    `).join('');
  }

  /* ── 10. Education ── */
  const eduEl = el('eduCards');
  if (eduEl && D.education?.length) {
    eduEl.innerHTML = D.education.map(e => `
      <div class="exp-card reveal">
        <div class="ec-title">${esc(e.degree)}</div>
        <div class="ec-sub">${esc(e.institute)}</div>
        <div class="ec-desc">${esc(e.field || '')}</div>
      </div>
    `).join('');
  }

  /* ── 11. Scroll reveal ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(e => obs.observe(e));

  /* ── 12. Canvas Background ── */
  const canvas = el('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); init(); });

    const COLORS = ['rgba(91,110,245,', 'rgba(240,89,138,', 'rgba(56,232,200,'];

    class P {
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.r  = Math.random() * 1.8 + 0.3;
        this.sx = (Math.random() - .5) * .35;
        this.sy = (Math.random() - .5) * .35;
        this.a  = Math.random() * .35 + .05;
        this.c  = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      constructor() { this.reset(); }
      tick() {
        this.x += this.sx; this.y += this.sy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + this.a + ')';
        ctx.fill();
      }
    }

    function init() { particles = []; for (let i = 0; i < 90; i++) particles.push(new P()); }
    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => p.tick());
      requestAnimationFrame(loop);
    }
    init(); loop();
  }

  /* ── 13. Tilt on hero card ── */
  const card = el('heroCard');
  if (card) {
    const wrap = card.closest('.hero-card-wrap');
    wrap?.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateY(-8px)`;
    });
    wrap?.addEventListener('mouseleave', () => { card.style.transform = ''; });
  }

  /* ── 14. Nav scroll glass ── */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.style.background = scrollY > 80
      ? 'rgba(8,9,13,0.92)'
      : 'rgba(8,9,13,0.7)';
  });

})();