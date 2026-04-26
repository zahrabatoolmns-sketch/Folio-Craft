/* ═══════════════════════════════════════════════════════════
   CREATIVE GRADIENT PORTFOLIO — script.js
   Reads localStorage "portfolioData" and populates all sections
═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── 1. LOAD DATA ──────────────────────────────────────── */
  let data = {};
  try {
    const raw = localStorage.getItem("portfolioData");
    if (raw) data = JSON.parse(raw);
  } catch (e) {
    console.warn("[Portfolio] Could not parse portfolioData:", e);
  }

  /* ── helpers ── */
  const $ = (id) => document.getElementById(id);
  const esc = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (s) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#039;",
    }[s]));

  /* ── 2. NAVBAR SCROLL ──────────────────────────────────── */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 50);
  });

  /* ── 3. MOBILE MENU ────────────────────────────────────── */
  const menuToggle = $("menuToggle");
  const mobileMenu = $("mobileMenu");
  menuToggle?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("open");
  });
  document.querySelectorAll(".m-link").forEach((link) => {
    link.addEventListener("click", () => mobileMenu?.classList.remove("open"));
  });

  /* ── 4. CUSTOM CURSOR ──────────────────────────────────── */
  const dot  = $("cursorDot");
  const ring = $("cursorRing");
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
  });

  function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll("a, button, .skill-card, .project-card, .edu-card, .timeline-card").forEach((el) => {
    el.addEventListener("mouseenter", () => ring?.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring?.classList.remove("hover"));
  });

  /* ── 5. NOISE CANVAS ───────────────────────────────────── */
  (function initNoise() {
    const canvas = $("noiseCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 300; canvas.height = 300;
    const img = ctx.createImageData(300, 300);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    canvas.style.backgroundImage = `url(${canvas.toDataURL()})`;
    canvas.style.backgroundSize = "200px 200px";
  })();

  /* ── 6. REVEAL ON SCROLL ───────────────────────────────── */
  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach((el) => io.observe(el));
  }

  /* ── 7. PAGE TITLE & LOGO ──────────────────────────────── */
  const name  = data.fullname || data.fullName || data.name || "Portfolio";
  const title = data.title || data.profession || data.role || "";

  document.title = name + (title ? " — " + title : "");
  const logoName = $("navLogoName");
  if (logoName) logoName.textContent = (name.split(" ")[0] || "Portfolio");
  const footerName = $("footerName");
  if (footerName) footerName.textContent = name;

  /* ── 8. HERO SECTION ───────────────────────────────────── */
  function buildHero() {
    // Name
    const heroName = $("heroName");
    if (heroName) heroName.textContent = name;

    // Title
    const heroTitle = $("heroTitle");
    if (heroTitle) heroTitle.textContent = title || "Creative Professional";

    // Bio
    const heroBio = $("heroBio");
    if (heroBio) heroBio.textContent = data.bio || "Welcome to my portfolio.";

    // Location badge
    const heroLoc = $("heroLocation");
    if (heroLoc && data.location) heroLoc.textContent = "📍 " + data.location;

    // Avatar
    const avatarImg   = $("heroAvatar");
    const avatarPlac  = $("avatarPlaceholder");
    if (data.profile_base64 && data.profile_base64.startsWith("data:")) {
      if (avatarImg)  { avatarImg.src = data.profile_base64; avatarImg.style.display = "block"; }
      if (avatarPlac) avatarPlac.style.display = "none";
    } else {
      if (avatarImg)  avatarImg.style.display = "none";
      if (avatarPlac) avatarPlac.style.display = "flex";
    }

    // Floating badges
    const skills   = Array.isArray(data.skills)   ? data.skills   : [];
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const b1 = $("badgeSkillCount"),   b2 = $("badgeProjectCount");
    if (b1) b1.textContent = skills.length + " Skills";
    if (b2) b2.textContent = projects.length + " Projects";

    // Social chips in hero
    buildHeroSocials();
  }

  function buildHeroSocials() {
    const el = $("heroSocials");
    if (!el) return;
    const socials = [
      { key: "linkedin",      label: "LinkedIn",   icon: "in" },
      { key: "github_social", label: "GitHub",     icon: "gh" },
      { key: "instagram",     label: "Instagram",  icon: "ig" },
    ];
    let html = "";
    socials.forEach(({ key, label, icon }) => {
      if (data[key]) {
        html += `<a class="social-chip" href="${esc(data[key])}" target="_blank" rel="noopener">
          <span>${icon}</span><span>${label}</span>
        </a>`;
      }
    });
    el.innerHTML = html;
  }

  /* ── 9. ABOUT SECTION ──────────────────────────────────── */
  function buildAbout() {
    const desc = $("aboutDesc");
    if (desc) desc.textContent = data.description || data.bio || "";

    const summary = $("aboutSkillsSummary");
    if (summary && data.skills_summary) {
      summary.textContent = data.skills_summary;
    } else if (summary) {
      summary.style.display = "none";
    }

    // Meta chips
    const meta = $("aboutMeta");
    if (meta) {
      let chips = "";
      if (data.location)   chips += metaChip("📍", data.location);
      if (data.email)      chips += metaChip("✉️", data.email);
      if (data.phone)      chips += metaChip("📞", data.phone);
      meta.innerHTML = chips;
    }

    // Stats
    const statsEl = $("aboutStats");
    if (statsEl) {
      const skills   = Array.isArray(data.skills)     ? data.skills.length     : 0;
      const projects = Array.isArray(data.projects)   ? data.projects.length   : 0;
      const exp      = Array.isArray(data.experience) ? data.experience.length : 0;
      const edu      = Array.isArray(data.education)  ? data.education.length  : 0;
      statsEl.innerHTML = [
        skills   > 0 ? statCard(skills,   "Skills")      : "",
        projects > 0 ? statCard(projects, "Projects")    : "",
        exp      > 0 ? statCard(exp,      "Experiences") : "",
        edu      > 0 ? statCard(edu,      "Degrees")     : "",
      ].join("");
    }
  }

  function metaChip(icon, text) {
    return `<span class="meta-chip"><span class="meta-icon">${icon}</span>${esc(text)}</span>`;
  }
  function statCard(n, lbl) {
    return `<div class="stat-card reveal">
      <div class="stat-number">${n}+</div>
      <div class="stat-label">${lbl}</div>
    </div>`;
  }

  /* ── 10. SKILLS SECTION ────────────────────────────────── */
  function buildSkills() {
    const grid = $("skillsGrid");
    if (!grid) return;

    const skills = Array.isArray(data.skills) ? data.skills : [];
    if (skills.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-subtle);font-size:14px;">No skills added.</p>';
      return;
    }

    grid.innerHTML = skills.map((s) => {
      const pct = Math.max(0, Math.min(100, Number(s.level) || 0));
      return `<div class="skill-card reveal" style="--pct:${pct}%">
        <div class="skill-top">
          <span class="skill-name">${esc(s.name)}</span>
          <span class="skill-pct">${pct}%</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" data-pct="${pct}"></div>
        </div>
        <span class="skill-category">${esc(s.category || "General")}</span>
      </div>`;
    }).join("");

    // Animate bars when visible
    animateSkillBars();
  }

  function animateSkillBars() {
    const bars = document.querySelectorAll(".skill-bar-fill");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const pct = e.target.getAttribute("data-pct") || "0";
          e.target.style.width = pct + "%";
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    bars.forEach((b) => io.observe(b));
  }

  /* ── 11. PROJECTS SECTION ──────────────────────────────── */
  function buildProjects() {
    const grid  = $("projectsGrid");
    const empty = $("projectsEmpty");
    if (!grid) return;

    const projects = Array.isArray(data.projects) ? data.projects : [];
    if (projects.length === 0) {
      if (empty) empty.style.display = "block";
      return;
    }

    grid.innerHTML = projects.map((p) => {
      const tech = Array.isArray(p.tech) ? p.tech : [];
      const tags = tech.map((t) => `<span class="project-tag">${esc(t)}</span>`).join("");
      const img  = p.image_base64 && p.image_base64.startsWith("data:")
        ? `<img src="${p.image_base64}" alt="${esc(p.title)}" />`
        : `<div class="project-thumb-placeholder">◈</div>`;
      const links = [
        p.github ? `<a class="project-link" href="${esc(p.github)}" target="_blank" rel="noopener">↗ GitHub</a>` : "",
        p.live   ? `<a class="project-link" href="${esc(p.live)}"   target="_blank" rel="noopener">↗ Live</a>`   : "",
      ].join("");

      return `<div class="project-card reveal">
        <div class="project-thumb">${img}</div>
        <div class="project-body">
          <div class="project-title">${esc(p.title)}</div>
          <p class="project-desc">${esc(p.description || "")}</p>
          ${tags ? `<div class="project-tags">${tags}</div>` : ""}
          ${links ? `<div class="project-links">${links}</div>` : ""}
        </div>
      </div>`;
    }).join("");
  }

  /* ── 12. EXPERIENCE SECTION ────────────────────────────── */
  function buildExperience() {
    const tl    = $("experienceTimeline");
    const empty = $("expEmpty");
    if (!tl) return;

    const exp = Array.isArray(data.experience) ? data.experience : [];
    if (exp.length === 0) {
      if (empty) empty.style.display = "block";
      return;
    }

    tl.innerHTML = exp.map((e) => `
      <div class="timeline-item reveal">
        <div class="timeline-card">
          <div class="tl-job">${esc(e.jobTitle)}</div>
          <div class="tl-company">@ ${esc(e.company)}</div>
          ${e.description ? `<p class="tl-desc">${esc(e.description)}</p>` : ""}
        </div>
      </div>`
    ).join("");
  }

  /* ── 13. EDUCATION SECTION ─────────────────────────────── */
  function buildEducation() {
    const grid  = $("educationGrid");
    const empty = $("eduEmpty");
    if (!grid) return;

    const edu = Array.isArray(data.education) ? data.education : [];
    if (edu.length === 0) {
      if (empty) empty.style.display = "block";
      return;
    }

    grid.innerHTML = edu.map((e) => `
      <div class="edu-card reveal">
        <div class="edu-icon">🎓</div>
        <div class="edu-degree">${esc(e.degree)}</div>
        <div class="edu-institute">${esc(e.institute)}</div>
        ${e.field ? `<div class="edu-field">${esc(e.field)}</div>` : ""}
      </div>`
    ).join("");
  }

  /* ── 14. CONTACT SECTION ───────────────────────────────── */
  function buildContact() {
    // Info rows
    const info = $("contactInfo");
    if (info) {
      let rows = "";
      if (data.email)    rows += contactRow("✉️", data.email, "mailto:" + data.email);
      if (data.phone)    rows += contactRow("📞", data.phone, "tel:" + data.phone);
      if (data.location) rows += contactRow("📍", data.location, null);
      info.innerHTML = rows;
    }

    // Social buttons
    const soc = $("contactSocials");
    if (soc) {
      let btns = "";
      if (data.linkedin)      btns += socBtn(data.linkedin,      "LinkedIn",  "in");
      if (data.github_social) btns += socBtn(data.github_social, "GitHub",    "gh");
      if (data.instagram)     btns += socBtn(data.instagram,     "Instagram", "ig");
      soc.innerHTML = btns;
    }
  }

  function contactRow(icon, text, href) {
    const inner = `<div class="contact-icon">${icon}</div><span>${esc(text)}</span>`;
    return href
      ? `<a class="contact-row" href="${esc(href)}">${inner}</a>`
      : `<div class="contact-row">${inner}</div>`;
  }
  function socBtn(href, label, icon) {
    return `<a class="soc-btn" href="${esc(href)}" target="_blank" rel="noopener">
      <span>${icon}</span><span>${label}</span>
    </a>`;
  }

  /* ── 15. CONTACT FORM ──────────────────────────────────── */
  function setupContactForm() {
    const form    = $("contactForm");
    const success = $("formSuccess");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal    = $("cfName")?.value?.trim();
      const emailVal   = $("cfEmail")?.value?.trim();
      const msgVal     = $("cfMessage")?.value?.trim();
      if (!nameVal || !emailVal || !msgVal) return;

      // Simulate send (replace with actual backend if needed)
      if (success) { success.style.display = "block"; }
      form.reset();
      setTimeout(() => { if (success) success.style.display = "none"; }, 5000);
    });
  }

  /* ── 16. ACTIVE NAV LINK ───────────────────────────────── */
  function setupActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
          active?.classList.add("active");
        }
      });
    }, { threshold: 0.4 });

    sections.forEach((s) => io.observe(s));
  }

  /* ── 17. PARALLAX ORBS ON MOUSE ────────────────────────── */
  document.addEventListener("mousemove", (e) => {
    const cx = e.clientX / window.innerWidth  - 0.5;
    const cy = e.clientY / window.innerHeight - 0.5;
    document.querySelectorAll(".floating-orb").forEach((orb, i) => {
      const factor = (i + 1) * 18;
      orb.style.transform = `translate(${cx * factor}px, ${cy * factor}px)`;
    });
  });

  /* ── 18. STAGGER REVEAL DELAYS ─────────────────────────── */
  function staggerDelays() {
    // Hero children
    document.querySelectorAll(".hero .reveal").forEach((el, i) => {
      el.style.transitionDelay = (i * 0.12) + "s";
    });
  }

  /* ── 19. INIT ───────────────────────────────────────────── */
  function init() {
    buildHero();
    buildAbout();
    buildSkills();
    buildProjects();
    buildExperience();
    buildEducation();
    buildContact();
    setupContactForm();
    staggerDelays();
    setupReveal();
    setupActiveNav();

    // Trigger initial reveal check
    setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add("visible");
        }
      });
    }, 80);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();