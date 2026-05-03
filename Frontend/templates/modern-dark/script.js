/* =============================================
   MODERN DARK — script.js
   Single IIFE · render() pattern · zero blink
   postMessage → direct DOM update, NO reload()
============================================= */
(function () {
  "use strict";

  /* ══════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════ */
  function txt(id, val) {
    const el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  }
  function attr(id, attrName, val) {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attrName, val);
  }
  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, s =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[s])
    );
  }
  function setSocial(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    if (url) { el.href = url; el.style.display = "flex"; }
    else el.style.display = "none";
  }

  /* ══════════════════════════════════════════
     RENDER — called on load AND on postMessage
  ══════════════════════════════════════════ */
  function render(d) {
    const name  = d.fullname || d.fullName || d.name || "Your Name";
    const title = d.title || d.profession || "Professional Title";

    txt("name",           name);
    txt("title",          title);
    txt("bio",            d.bio            || "");
    txt("description",    d.description    || "");
    txt("skills_summary", d.skills_summary || "");
    txt("navName",        name);
    txt("footerName",     name);
    document.title = name + " | Portfolio";

    const locEl = document.getElementById("location");
    if (locEl) locEl.textContent = d.location ? "📍 " + d.location : "";

    const emailHeroEl = document.getElementById("email");
    if (emailHeroEl) emailHeroEl.textContent = d.email ? "✉ " + d.email : "";

    if (d.profile_base64) {
      const img = document.getElementById("profileImage");
      const ph  = document.getElementById("avatarPlaceholder");
      if (img) { img.src = d.profile_base64; img.style.display = "block"; }
      if (ph)  ph.style.display = "none";
    }

    setSocial("linkedinLink",  d.linkedin);
    setSocial("githubLink",    d.github_social);
    setSocial("instagramLink", d.instagram);

    txt("contactEmail", d.email || "");
    attr("emailCard",    "href", d.email        ? "mailto:" + d.email : "#");
    attr("linkedinCard", "href", d.linkedin      || "#");
    attr("githubCard",   "href", d.github_social || "#");

    const projects   = Array.isArray(d.projects)   ? d.projects   : [];
    const skills     = Array.isArray(d.skills)      ? d.skills     : [];
    const experience = Array.isArray(d.experience)  ? d.experience : [];
    const education  = Array.isArray(d.education)   ? d.education  : [];

    txt("projectCount", projects.length   + "+");
    txt("skillCount",   skills.length     + "+");
    txt("expCount",     experience.length + "+");
    txt("eduCount",     education.length);

    /* ── Skills ── */
    const skillsGrid = document.getElementById("skillsGrid");
    if (skillsGrid) {
      skillsGrid.innerHTML = skills.length
        ? skills.map(s => `
            <div class="skill-item reveal">
              <div class="skill-header">
                <span class="skill-name-txt">${esc(s.name)}</span>
                <span class="skill-pct">${s.level || 0}%</span>
              </div>
              <div class="skill-bar-bg">
                <div class="skill-bar-fill" data-width="${s.level || 0}"></div>
              </div>
              <div class="skill-category-tag">${esc(s.category || "")}</div>
            </div>
          `).join("")
        : `<p style="color:rgba(255,255,255,0.4);font-size:14px">No skills added yet.</p>`;
    }

    /* ── Projects ── */
    const projectsGrid = document.getElementById("projectsGrid");
    if (projectsGrid) {
      projectsGrid.innerHTML = projects.length
        ? projects.map(p => `
            <div class="project-card reveal">
              <div class="project-img-wrap">
                ${p.image_base64
                  ? `<img src="${p.image_base64}" alt="${esc(p.title)}"/>`
                  : `<div class="project-no-img">💻</div>`}
              </div>
              <div class="project-body">
                <div class="project-title-txt">${esc(p.title)}</div>
                <p class="project-desc">${esc(p.description || "")}</p>
                <div class="project-tech-tags">
                  ${(p.tech || []).map(t => `<span class="tech-tag">${esc(t)}</span>`).join("")}
                </div>
                <div class="project-actions">
                  ${p.github ? `<a class="proj-link proj-link-primary" href="${esc(p.github)}" target="_blank">GitHub ↗</a>` : ""}
                  ${p.live   ? `<a class="proj-link proj-link-ghost"   href="${esc(p.live)}"   target="_blank">Live Demo ↗</a>` : ""}
                </div>
              </div>
            </div>
          `).join("")
        : `<p style="color:rgba(255,255,255,0.4);font-size:14px">No projects added yet.</p>`;
    }

    /* ── Experience ── */
    const expTl = document.getElementById("experienceTimeline");
    if (expTl) {
      expTl.innerHTML = experience.length
        ? experience.map(e => `
            <div class="timeline-item reveal">
              <div class="tl-title">${esc(e.jobTitle)}</div>
              <div class="tl-sub">${esc(e.company)}</div>
              <div class="tl-desc">${esc(e.description || "")}</div>
            </div>
          `).join("")
        : `<p style="color:rgba(255,255,255,0.4);font-size:14px">No experience added.</p>`;
    }

    /* ── Education ── */
    const eduTl = document.getElementById("educationTimeline");
    if (eduTl) {
      eduTl.innerHTML = education.length
        ? education.map(e => `
            <div class="timeline-item reveal">
              <div class="tl-title">${esc(e.degree)}</div>
              <div class="tl-sub">${esc(e.institute)}</div>
              <div class="tl-desc">${esc(e.field || "")}</div>
            </div>
          `).join("")
        : `<p style="color:rgba(255,255,255,0.4);font-size:14px">No education added.</p>`;
    }

    attachReveal();
  }

  /* ══════════════════════════════════════════
     SCROLL REVEAL + SKILL BAR ANIMATION
  ══════════════════════════════════════════ */
  function attachReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        e.target.querySelectorAll(".skill-bar-fill").forEach(bar => {
          bar.style.transform = `scaleX(${(bar.dataset.width || 0) / 100})`;
        });
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    document.querySelectorAll(".section-title, .stat-card, .timeline-item").forEach(el => {
      el.classList.add("reveal");
      io.observe(el);
    });

    setTimeout(() => {
      document.querySelectorAll(".skill-bar-fill").forEach(bar => {
        if (bar.getBoundingClientRect().top < window.innerHeight)
          bar.style.transform = `scaleX(${(bar.dataset.width || 0) / 100})`;
      });
    }, 400);
  }

  /* ══════════════════════════════════════════
     BACKGROUND CANVAS — animated star field
  ══════════════════════════════════════════ */
  function initCanvas() {
    const canvas = document.getElementById("bgCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 120 }, () => ({
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        r:      Math.random() * 1.4,
        speed:  0.002 + Math.random() * 0.005,
        offset: Math.random() * Math.PI * 2
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const alpha = 0.2 + 0.5 * Math.sin(t * s.speed + s.offset);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
  }

  /* ══════════════════════════════════════════
     NAV SCROLL EFFECT
  ══════════════════════════════════════════ */
  function initNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    });
  }

  /* ══════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════ */
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem("portfolioData") || "{}");
  } catch (e) {
    console.warn("Portfolio data parse error:", e);
  }

  render(data);
  initCanvas();
  initNav();
  // NOTE: initCursor() removed — custom cursor is disabled in CSS,
  // system cursor is used instead. No function needed.

  /* ══════════════════════════════════════════
     postMessage RECEIVER — live preview sync
  ══════════════════════════════════════════ */
  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "FOLIOCRAFT_DATA") return;
    try {
      const incoming = event.data.payload;
      localStorage.setItem("portfolioData", JSON.stringify(incoming));
      render(incoming);
    } catch (e) {
      console.warn("[FolioCraft] postMessage render error:", e.message);
    }
  }, false);

})();