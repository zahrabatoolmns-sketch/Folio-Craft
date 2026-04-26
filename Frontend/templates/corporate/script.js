/* ═══════════════════════════════════════════
   CORPORATE PORTFOLIO — script.js
═══════════════════════════════════════════ */

(function () {

  /* ── LOAD DATA ── */
  let data = {};
  try {
    const raw = localStorage.getItem("portfolioData");
    if (raw) data = JSON.parse(raw);
  } catch (e) { console.warn("Portfolio data error:", e); }

  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }
  function setText(id, val, fb = "—") {
    const el = document.getElementById(id);
    if (el) el.textContent = val || fb;
  }

  const skills   = Array.isArray(data.skills)     ? data.skills     : [];
  const projects = Array.isArray(data.projects)   ? data.projects   : [];
  const experience= Array.isArray(data.experience)? data.experience : [];
  const education= Array.isArray(data.education)  ? data.education  : [];

  /* ── MONOGRAM ── */
  function initials(name) {
    const parts = (name || "").trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return (parts[0] || "?")[0].toUpperCase();
  }
  const mono = initials(data.fullname);
  setText("brandMonogram", mono);
  setText("footerMonogram", mono);

  /* ── TOP RIBBON ── */
  setText("ribbonEmail",    data.email);
  setText("ribbonPhone",    data.phone);
  setText("ribbonLocation", data.location);

  /* ── HEADER / HERO ── */
  setText("brandName",    data.fullname);
  setText("brandTitle",   data.title);
  setText("heroNameMain", data.fullname);
  setText("heroBioMain",  data.bio);

  /* Stats */
  setText("statSkills",   skills.length   || "0", "0");
  setText("statProjects", projects.length || "0", "0");
  setText("statExp",      experience.length|| "0","0");

  /* Profile image */
  const heroImg = document.getElementById("heroImg");
  const photoPh = document.getElementById("photoPlaceholder");
  if (data.profile_base64 && heroImg) {
    heroImg.src = data.profile_base64;
    heroImg.style.display = "block";
    if (photoPh) photoPh.style.display = "none";
  }

  /* Footer */
  setText("footerName", data.fullname);
  setText("footerYear", new Date().getFullYear());

  /* ── ABOUT ── */
  setText("aboutDesc",          data.description);
  setText("aboutSkillsSummary", data.skills_summary);
  setText("aboutEmail",         data.email);
  setText("aboutPhone",         data.phone);
  setText("aboutLocation",      data.location);

  /* ── EXPERTISE / SKILLS ── */
  const expertiseTable = document.getElementById("expertiseTable");
  if (expertiseTable) {
    if (skills.length === 0) {
      expertiseTable.innerHTML = '<p style="color:var(--muted);font-style:italic;">No skills added yet.</p>';
    } else {
      expertiseTable.innerHTML = skills.map(s => `
        <div class="expertise-row">
          <div>
            <div class="exp-name-c">${esc(s.name)}</div>
            <div class="exp-cat-c">${esc(s.category)}</div>
          </div>
          <div class="exp-bar-wrap">
            <div class="exp-bar-fill" data-width="${Number(s.level) || 0}"></div>
          </div>
          <div class="exp-pct-c">${Number(s.level) || 0}%</div>
        </div>
      `).join("");
    }
  }

  /* ── WORK / PROJECTS ── */
  const workGrid = document.getElementById("workGrid");
  if (workGrid) {
    if (projects.length === 0) {
      workGrid.innerHTML = '<p style="color:var(--muted);font-style:italic;">No projects added yet.</p>';
    } else {
      workGrid.innerHTML = projects.map((p, i) => `
        <div class="work-card">
          ${p.image_base64
            ? `<img class="work-card-img" src="${p.image_base64}" alt="${esc(p.title)}"/>`
            : `<div class="work-card-img-ph">0${i+1}</div>`}
          <div class="work-card-body">
            <div class="work-card-label">Project · ${esc((p.tech || [])[0] || "Work")}</div>
            <div class="work-card-title">${esc(p.title)}</div>
            <div class="work-card-desc">${esc(p.description)}</div>
            <div class="work-tech-row">
              ${(p.tech || []).map(t => `<span class="wt-tag">${esc(t)}</span>`).join("")}
            </div>
            <div class="work-links">
              ${p.github ? `<a class="wl-btn navy" href="${esc(p.github)}" target="_blank">GitHub</a>` : ""}
              ${p.live   ? `<a class="wl-btn" href="${esc(p.live)}" target="_blank">Live Demo</a>` : ""}
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  /* ── EXPERIENCE ── */
  const expTable = document.getElementById("expTable");
  if (expTable) {
    if (experience.length === 0) {
      expTable.innerHTML = '<p style="color:var(--muted);font-style:italic;">No experience added yet.</p>';
    } else {
      expTable.innerHTML = experience.map(e => `
        <div class="career-row">
          <div class="cr-title">${esc(e.jobTitle)}</div>
          <div class="cr-org">${esc(e.company)}</div>
          <div class="cr-desc">${esc(e.description)}</div>
        </div>
      `).join("");
    }
  }

  /* ── EDUCATION ── */
  const eduTable = document.getElementById("eduTable");
  if (eduTable) {
    if (education.length === 0) {
      eduTable.innerHTML = '<p style="color:var(--muted);font-style:italic;">No education added yet.</p>';
    } else {
      eduTable.innerHTML = education.map(e => `
        <div class="career-row">
          <div class="cr-title">${esc(e.degree)}</div>
          <div class="cr-org">${esc(e.institute)}</div>
          <div class="cr-desc">${esc(e.field)}</div>
        </div>
      `).join("");
    }
  }

  /* ── SOCIAL ── */
  const socialRow = document.getElementById("socialRow");
  if (socialRow) {
    const links = [];
    if (data.linkedin)     links.push({ href: data.linkedin,     icon: "🔗", label: "LinkedIn",  sub: "Professional Network" });
    if (data.github_social)links.push({ href: data.github_social,icon: "🐙", label: "GitHub",    sub: "Code Repository" });
    if (data.instagram)    links.push({ href: data.instagram,    icon: "📸", label: "Instagram", sub: "Creative Feed" });

    if (links.length === 0) {
      socialRow.innerHTML = '<p style="color:var(--muted);font-style:italic;">No social links added.</p>';
    } else {
      socialRow.innerHTML = links.map(l => `
        <a class="social-card" href="${esc(l.href)}" target="_blank">
          <span class="sc-icon">${l.icon}</span>
          <div>
            <div class="sc-label">${l.label}</div>
            <div class="sc-sub">${l.sub}</div>
          </div>
        </a>
      `).join("");
    }
  }

  /* ── CONTACT FORM ── */
  window.sendMessage = function (e) {
    e.preventDefault();
    const name    = document.getElementById("cName")?.value?.trim();
    const email   = document.getElementById("cEmail")?.value?.trim();
    const message = document.getElementById("cMessage")?.value?.trim();
    const resp    = document.getElementById("formResp");
    if (!name || !email || !message) {
      if (resp) { resp.style.color = "#8b1a1a"; resp.textContent = "Please complete all required fields."; }
      return;
    }
    if (resp) {
      resp.style.color = "var(--navy)";
      resp.textContent = "Thank you for your message. I will respond promptly.";
      e.target.reset();
    }
  };

  /* ── SCROLL — animate skill bars ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".exp-bar-fill").forEach(bar => {
          bar.style.width = bar.dataset.width + "%";
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const expertiseSection = document.getElementById("expertise");
  if (expertiseSection) observer.observe(expertiseSection);

  /* ── REVEAL ANIMATION ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const rows = entry.target.querySelectorAll(
          ".expertise-row, .work-card, .career-row, .social-card"
        );
        rows.forEach((el, i) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(16px)";
          el.style.transition = `opacity 0.45s ease ${i * 0.06}s, transform 0.45s ease ${i * 0.06}s`;
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, 40);
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".section").forEach(s => revealObserver.observe(s));

})();