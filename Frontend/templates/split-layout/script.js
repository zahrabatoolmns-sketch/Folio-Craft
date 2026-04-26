/* ═══════════════════════════════════════════════════
   SPLIT LAYOUT — script.js
   All wizard fields injected + scroll-spy + effects
═══════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── helpers ─── */
  const $ = id => document.getElementById(id);
  const setText  = (id, val) => { const e = $(id); if (e && val != null && val !== '') e.textContent = val; };
  const setHref  = (id, url) => { const e = $(id); if (e) { e.href = url || '#'; if (!url) e.style.display = 'none'; } };
  const hide     = id        => { const e = $(id); if (e) e.style.display = 'none'; };

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c])
    );
  }

  /* ─── load data ─── */
  let d = {};
  try { d = JSON.parse(localStorage.getItem('portfolioData') || '{}'); } catch(e) {}

  /* ════════════════════════════════════════
     STEP 1 — PERSONAL INFORMATION
  ════════════════════════════════════════ */
  const name  = d.fullname || d.fullName || d.name || 'Your Name';
  const title = d.title || d.profession || 'Professional Title';
  const bio   = d.bio   || '';
  const loc   = d.location || '';
  const email = d.email    || '';
  const phone = d.phone    || '';

  // page / browser title
  document.title = name + ' | Portfolio';

  // sidebar identity
  setText('sidebarName',  name);
  setText('sidebarTitle', title);
  setText('sbBottomName', name);

  // sidebar meta
  if (loc)   { setText('sbLocation', loc);   } else hide('sbLocationItem');
  if (email) { setText('sbEmail', email);     } else hide('sbEmailItem');
  if (phone) { setText('sbPhone', phone);     } else hide('sbPhoneItem');

  // footer
  setText('footerName', name);
  $('footerYear') && ($('footerYear').textContent = new Date().getFullYear());

  // mark year
  setText('markYear', new Date().getFullYear());

  // about hero bg watermark — first name
  const firstWord = name.split(' ')[0].toUpperCase();
  setText('bgName', firstWord);

  // about text
  setText('aboutDescription',   d.description    || '');
  setText('aboutSkillsSummary', d.skills_summary || '');

  /* ── profile image ── */
  if (d.profile_base64) {
    const img = $('sidebarProfileImage');
    const ph  = $('sbAvatarPh');
    if (img) { img.src = d.profile_base64; img.style.display = 'block'; }
    if (ph)  ph.style.display = 'none';
  }

  /* ════════════════════════════════════════
     ARRAYS
  ════════════════════════════════════════ */
  const skills     = Array.isArray(d.skills)     ? d.skills     : [];
  const projects   = Array.isArray(d.projects)   ? d.projects   : [];
  const experience = Array.isArray(d.experience) ? d.experience : [];
  const education  = Array.isArray(d.education)  ? d.education  : [];

  /* ── stats ── */
  setText('statProjects', projects.length);
  setText('statSkills',   skills.length);
  setText('statExp',      experience.length);
  setText('statEdu',      education.length);

  /* ════════════════════════════════════════
     STEP 4 — SOCIAL MEDIA
  ════════════════════════════════════════ */
  setHref('sbLinkedin',  d.linkedin);
  setHref('sbGithub',    d.github_social);
  setHref('sbInstagram', d.instagram);

  // contact cards
  if (email) {
    const ce = $('ctEmail');
    if (ce) ce.href = 'mailto:' + email;
    setText('ctEmailVal', email);
  } else {
    hide('ctEmail');
  }
  setHref('ctLinkedin',  d.linkedin);
  setHref('ctGithub',    d.github_social);
  setHref('ctInstagram', d.instagram);

  // footer socials
  setHref('footerLinkedin',  d.linkedin);
  setHref('footerGithub',    d.github_social);
  setHref('footerInstagram', d.instagram);

  /* ════════════════════════════════════════
     STEP 2 — SKILLS (grouped by category)
  ════════════════════════════════════════ */
  const skillsByCatEl = $('skillsByCategory');

  if (skillsByCatEl) {
    if (skills.length) {
      // group
      const groups = {};
      skills.forEach(s => {
        const cat = s.category || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(s);
      });

      skillsByCatEl.innerHTML = Object.entries(groups).map(([cat, list]) => `
        <div class="skill-category-group reveal">
          <div class="skill-cat-title">${esc(cat)}</div>
          <div class="skills-rows">
            ${list.map(s => `
              <div class="skill-row">
                <span class="skill-row-name">${esc(s.name)}</span>
                <div class="skill-bar-wrap">
                  <div class="skill-bar-fill" data-width="${Number(s.level) || 0}"></div>
                </div>
                <span class="skill-pct">${Number(s.level) || 0}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    } else {
      skillsByCatEl.innerHTML = `<p style="color:var(--text-light);font-size:14px;">No skills added yet.</p>`;
    }
  }

  /* ════════════════════════════════════════
     STEP 2 — PROJECTS
  ════════════════════════════════════════ */
  const projListEl = $('projectsList');

  if (projListEl) {
    if (projects.length) {
      projListEl.innerHTML = projects.map((p, i) => `
        <div class="project-item reveal">
          <div class="project-img-col">
            ${p.image_base64
              ? `<img src="${p.image_base64}" alt="${esc(p.title)}" loading="lazy"/>`
              : `<div class="project-img-empty">✦</div>`}
            <div class="project-num-badge">Project ${String(i+1).padStart(2,'0')}</div>
          </div>
          <div class="project-body-col">
            <div>
              <div class="project-title">${esc(p.title)}</div>
              <p class="project-desc">${esc(p.description || '')}</p>
              <div class="project-tech-row">
                ${(p.tech || []).map(t => `<span class="tech-chip">${esc(t)}</span>`).join('')}
              </div>
            </div>
            <div class="project-links-row">
              ${p.github ? `<a class="proj-btn proj-btn-primary" href="${esc(p.github)}" target="_blank">GitHub ↗</a>` : ''}
              ${p.live   ? `<a class="proj-btn proj-btn-ghost"   href="${esc(p.live)}"   target="_blank">Live Demo ↗</a>` : ''}
            </div>
          </div>
        </div>
      `).join('');
    } else {
      projListEl.innerHTML = `<p style="color:var(--text-light);font-size:14px;">No projects added yet.</p>`;
    }
  }

  /* ════════════════════════════════════════
     STEP 3 — EXPERIENCE
  ════════════════════════════════════════ */
  const expEl = $('experienceTimeline');

  if (expEl) {
    if (experience.length) {
      expEl.innerHTML = experience.map(e => `
        <div class="timeline-entry reveal">
          <div class="te-card">
            <div class="te-top">
              <div class="te-role">${esc(e.jobTitle)}</div>
            </div>
            <div class="te-company">${esc(e.company)}</div>
            <p class="te-desc">${esc(e.description || '')}</p>
          </div>
        </div>
      `).join('');
    } else {
      expEl.innerHTML = `<p style="color:var(--text-light);font-size:14px;padding:16px 0 0 28px;">No experience added yet.</p>`;
    }
  }

  /* ════════════════════════════════════════
     STEP 3 — EDUCATION
  ════════════════════════════════════════ */
  const eduEl = $('educationGrid');

  if (eduEl) {
    if (education.length) {
      eduEl.innerHTML = education.map(e => `
        <div class="edu-card reveal">
          <div class="edu-icon">
            <svg viewBox="0 0 20 20" fill="none"><path d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="edu-degree">${esc(e.degree)}</div>
          <div class="edu-institute">${esc(e.institute)}</div>
          <div class="edu-field">${esc(e.field || '')}</div>
        </div>
      `).join('');
    } else {
      eduEl.innerHTML = `<p style="color:var(--text-light);font-size:14px;">No education added yet.</p>`;
    }
  }

  /* ════════════════════════════════════════
     SCROLL SPY — highlight active nav link
  ════════════════════════════════════════ */
  const mainContent  = $('mainContent');
  const navLinks     = document.querySelectorAll('.sb-nav-link');
  const sections     = document.querySelectorAll('.content-section[data-section]');

  function updateNav() {
    if (!mainContent) return;
    const scrollTop = mainContent.scrollTop;
    const half      = mainContent.clientHeight / 2.5;

    let current = sections[0]?.dataset.section || '';

    sections.forEach(sec => {
      if (sec.offsetTop - half <= scrollTop) {
        current = sec.dataset.section;
      }
    });

    navLinks.forEach(link => {
      const active = link.dataset.section === current;
      link.classList.toggle('active', active);
    });
  }

  mainContent?.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ─ smooth scroll on nav click ─ */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.section;
      const sec = document.querySelector(`[data-section="${target}"]`);
      if (sec && mainContent) {
        mainContent.scrollTo({ top: sec.offsetTop, behavior: 'smooth' });
      }
      // close mobile menu
      $('sidebar')?.classList.remove('open');
      $('mobToggle')?.classList.remove('open');
    });
  });

  /* also handle href="#contact" from hire btn */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    if (a.classList.contains('sb-nav-link')) return;
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      if (sec && mainContent) {
        e.preventDefault();
        mainContent.scrollTo({ top: sec.offsetTop, behavior: 'smooth' });
      }
    });
  });

  /* ════════════════════════════════════════
     MOBILE SIDEBAR TOGGLE
  ════════════════════════════════════════ */
  const mobBtn  = $('mobToggle');
  const sidebar = $('sidebar');

  mobBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    mobBtn.classList.toggle('open');
  });

  /* ════════════════════════════════════════
     SCROLL REVEAL
  ════════════════════════════════════════ */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');

      // animate skill bars
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.transform = `scaleX(${(Number(bar.dataset.width) || 0) / 100})`;
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px', root: mainContent });

  setTimeout(() => {
    // make everything revealable
    document.querySelectorAll(
      '.about-hero, .stat-strip, .skill-category-group, .project-item, ' +
      '.timeline-entry, .edu-card, .contact-card, .cs-header'
    ).forEach((el, i) => {
      if (!el.classList.contains('reveal')) el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i * 0.05, 0.3) + 's';
      observer.observe(el);
    });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }, 100);

})();