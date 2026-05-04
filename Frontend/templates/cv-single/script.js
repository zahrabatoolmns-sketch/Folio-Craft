(function () {
  'use strict';

  /* 1. Load data */
  let D = {};
  try { D = JSON.parse(localStorage.getItem('portfolioData') || '{}'); } catch (_) {}

  /*  2. Helpers */
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

  /* 3. Page title  */
  document.title = (D.fullname || 'Portfolio') + ' | CV';

  /* 4. Nav + Sidebar identity */
  set('tnName',  D.fullname);
  set('sbName',  D.fullname);
  set('sbTitle', D.title);

  /* 5. Sidebar contact */
  set('sbEmail',    D.email);
  set('sbPhone',    D.phone);
  set('sbLocation', D.location);

  /* 6. Avatar */
  const sbImg = el('sbAvatar');
  const sbPh  = el('sbAvatarPh');
  if (D.profile_base64 && sbImg) {
    sbImg.src = D.profile_base64;
    sbImg.style.display = 'block';
    if (sbPh) sbPh.style.display = 'none';
  }

  /*  7. Social links */
  setHref('sbLinkedin',  D.linkedin);
  setHref('sbGithub',    D.github_social);
  setHref('sbInstagram', D.instagram);
  setHref('ccvLi', D.linkedin);
  setHref('ccvGh', D.github_social);
  setHref('ccvIg', D.instagram);

  /*  8. About section  */
  set('cvAboutDesc',    D.description);
  set('cvAboutSummary', D.skills_summary);

  /* 9. Quick stats */
  const pC = (D.projects  || []).length;
  const sC = (D.skills    || []).length;
  const eC = (D.experience|| []).length;
  const dC = (D.education || []).length;

  set('qsProj',  pC + '+');
  set('qsSkill', sC + '+');
  set('qsExp',   eC + '+');
  set('qsEdu',   dC + '+');

  /* 10. Contact section */
  set('ccvEmail',    D.email);
  set('ccvPhone',    D.phone);
  set('ccvLocation', D.location);

  /* 11. Footer */
  set('footerName', D.fullname);

  /*  12. Sidebar skill pills (top 8) */
  const pillsWrap = el('sbSkillPills');
  if (pillsWrap && D.skills?.length) {
    pillsWrap.innerHTML = D.skills
      .slice(0, 8)
      .map(s => `<span class="sb-pill">${esc(s.name)}</span>`)
      .join('');
  }

  /*  13. Sidebar Education */
  const sbEdu = el('sbEduList');
  if (sbEdu && D.education?.length) {
    sbEdu.innerHTML = D.education.map(e => `
      <div class="sb-edu-item">
        <div class="sbei-degree">${esc(e.degree)}</div>
        <div class="sbei-inst">${esc(e.institute)}</div>
        ${e.field ? `<div class="sbei-field">${esc(e.field)}</div>` : ''}
      </div>
    `).join('');
  }

  /* 14. Skills grid */
  const sg = el('skillsCvGrid');
  if (sg && D.skills?.length) {
    sg.innerHTML = D.skills.map(s => `
      <div class="scv-item reveal">
        <div class="scv-top">
          <span class="scv-name">${esc(s.name)}</span>
          <span class="scv-pct">${s.level || 0}%</span>
        </div>
        <div class="scv-bar">
          <div class="scv-fill" style="width:${s.level || 0}%"></div>
        </div>
        <div class="scv-cat">${esc(s.category || '')}</div>
      </div>
    `).join('');
  }

  /* 15. Projects */
  const pl = el('projectsCvList');
  if (pl && D.projects?.length) {
    pl.innerHTML = D.projects.map(p => `
      <div class="pcv-card reveal">
        <div class="pcv-img">
          ${p.image_base64
            ? `<img src="${p.image_base64}" alt="${esc(p.title)}"/>`
            : ''}
        </div>
        <div class="pcv-body">
          <div>
            <div class="pcv-tags">
              ${(p.tech || []).map(t => `<span class="pcv-tag">${esc(t)}</span>`).join('')}
            </div>
            <div class="pcv-title">${esc(p.title)}</div>
            <div class="pcv-desc">${esc(p.description || '')}</div>
          </div>
          <div class="pcv-links">
            ${p.github
              ? `<a class="pcv-link github" href="${esc(p.github)}" target="_blank">GitHub ↗</a>`
              : ''}
            ${p.live
              ? `<a class="pcv-link live" href="${esc(p.live)}" target="_blank">Live Demo ↗</a>`
              : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /* 16. Experience timeline */
  const tl = el('timelineCv');
  if (tl && D.experience?.length) {
    tl.innerHTML = D.experience.map((e, i) => `
      <div class="tcv-item reveal">
        <div class="tcv-dot">
          <div class="tcv-dot-circle"></div>
          <div class="tcv-dot-line"></div>
        </div>
        <div>
          <div class="tcv-content">
            <div class="tcv-title">${esc(e.jobTitle)}</div>
            <div class="tcv-company">${esc(e.company)}</div>
            ${e.description ? `<div class="tcv-desc">${esc(e.description)}</div>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /* 17. Scroll reveal */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /*  18. Animate quick-stats numbers  */
  function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el || !target) return;
    const num = parseInt(target) || 0;
    if (num === 0) return;
    let cur = 0;
    const step = Math.max(1, Math.floor(num / 30));
    const interval = setInterval(() => {
      cur = Math.min(cur + step, num);
      el.textContent = cur + '+';
      if (cur >= num) clearInterval(interval);
    }, 40);
  }

  /* Trigger count animation when stats section is visible */
  const statsSection = document.querySelector('.quick-stats');
  if (statsSection) {
    const statsObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCount('qsProj',  pC);
        animateCount('qsSkill', sC);
        animateCount('qsExp',   eC);
        animateCount('qsEdu',   dC);
        statsObs.disconnect();
      }
    }, { threshold: 0.5 });
    statsObs.observe(statsSection);
  }

  /* 19. Active nav link on scroll */
  const sections  = document.querySelectorAll('.cv-section');
  const navLinks  = document.querySelectorAll('.tn-links a');
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + e.target.id
            ? 'var(--ink)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => navObs.observe(s));

})();