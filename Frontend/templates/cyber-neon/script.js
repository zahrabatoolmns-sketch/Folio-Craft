

(function () {
/* Custom Cursor */
  const cursorRing = document.getElementById("cursorRing");
  const cursorDot  = document.getElementById("cursorDot");

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + "px";
    cursorDot.style.top  = my + "px";
  });

  // Ring follows with lag
  (function animCursor() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    cursorRing.style.left = rx + "px";
    cursorRing.style.top  = ry + "px";
    requestAnimationFrame(animCursor);
  })();

  document.querySelectorAll("a, button, .skill-cn-card, .project-cn-card, .social-cn-btn").forEach(el => {
    el.addEventListener("mouseenter", () => {
      if (cursorRing) {
        cursorRing.style.width  = "56px";
        cursorRing.style.height = "56px";
        cursorRing.style.borderColor = "var(--pink)";
      }
    });
    el.addEventListener("mouseleave", () => {
      if (cursorRing) {
        cursorRing.style.width  = "36px";
        cursorRing.style.height = "36px";
        cursorRing.style.borderColor = "var(--cyan)";
      }
    });
  });

  /* PERSPECTIVE GRID CANVAS */
  const canvas = document.getElementById("gridCanvas");
  const ctx    = canvas ? canvas.getContext("2d") : null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  let gridOffset = 0;

  function drawGrid() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;
    const horizon = H * 0.62;
    const vp = { x: W / 2, y: horizon };  // vanishing point

    /*  FLOOR GRID */
    const cols = 24;
    const rows = 28;

    ctx.strokeStyle = "rgba(0,220,255,0.12)";
    ctx.lineWidth = 0.5;

    // Vertical perspective lines
    for (let i = 0; i <= cols; i++) {
      const t    = i / cols;
      const xBot = t * W;
      ctx.beginPath();
      ctx.moveTo(vp.x, vp.y);
      ctx.lineTo(xBot, H);
      ctx.stroke();
    }

    // Horizontal lines (perspective foreshortening)
    for (let j = 1; j <= rows; j++) {
      const progress = (j / rows);
      const eased = Math.pow(progress, 2.2);
      const y = horizon + (H - horizon) * eased + (gridOffset * eased * 0.3);

      if (y > H) continue;

      const xLeft  = vp.x - (vp.x * progress * 1.05);
      const xRight = vp.x + ((W - vp.x) * progress * 1.05);

      const alpha = Math.min(0.18, progress * 0.25);
      ctx.strokeStyle = `rgba(0,220,255,${alpha})`;
      ctx.lineWidth = progress < 0.3 ? 0.3 : 0.6;

      ctx.beginPath();
      ctx.moveTo(xLeft, y);
      ctx.lineTo(xRight, y);
      ctx.stroke();
    }

    /*  HORIZON GLOW LINE  */
    const grad = ctx.createLinearGradient(0, horizon, W, horizon);
    grad.addColorStop(0,   "transparent");
    grad.addColorStop(0.3, "rgba(0,220,255,0.35)");
    grad.addColorStop(0.5, "rgba(0,220,255,0.6)");
    grad.addColorStop(0.7, "rgba(0,220,255,0.35)");
    grad.addColorStop(1,   "transparent");
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = "rgba(0,220,255,0.8)";
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(W, horizon);
    ctx.stroke();
    ctx.shadowBlur = 0;

    /*  PINK ACCENT GRID (thinner, offset)  */
    ctx.strokeStyle = "rgba(255,45,120,0.05)";
    ctx.lineWidth   = 0.3;
    const pinkCols  = 10;
    for (let i = 0; i <= pinkCols; i++) {
      const t    = i / pinkCols;
      const xBot = t * W;
      ctx.beginPath();
      ctx.moveTo(vp.x, vp.y);
      ctx.lineTo(xBot, H);
      ctx.stroke();
    }

    /*  FLOATING PARTICLES  */
    for (const p of particles) {
      p.y -= p.speed;
      if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
  }

  // Particles
  const particles = [];
  function initParticles() {
    if (!canvas) return;
    particles.length = 0;
    for (let i = 0; i < 60; i++) {
      particles.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.2,
        speed: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.6
          ? `rgba(0,220,255,${Math.random() * 0.4 + 0.1})`
          : `rgba(255,45,120,${Math.random() * 0.2 + 0.05})`
      });
    }
  }

  function animate() {
    gridOffset = (gridOffset + 0.5) % 60;
    drawGrid();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  initParticles();
  animate();
  window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });

  /* DATA INJECTION */
  let data = {};
  try {
    const raw = localStorage.getItem("portfolioData");
    if (raw) data = JSON.parse(raw);
  } catch (e) { console.warn("Data error:", e); }

  const skills    = Array.isArray(data.skills)    ? data.skills    : [];
  const projects  = Array.isArray(data.projects)  ? data.projects  : [];
  const exp       = Array.isArray(data.experience)? data.experience: [];
  const edu       = Array.isArray(data.education) ? data.education : [];

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }
  function set(id, val, fb = "—") {
    const el = document.getElementById(id);
    if (el) el.textContent = val || fb;
  }
  function padNum(n) { return String(n).padStart(2, "0"); }

  /* ── NAV & HERO ── */
  const nameUpper = (data.fullname || "UNKNOWN").toUpperCase();
  set("navBrand",  nameUpper);
  set("footerName", data.fullname);

  /* Glitch text name */
  const cnName = document.getElementById("heroName");
  if (cnName) {
    const g = cnName.querySelector(".glitch-text");
    if (g) {
      g.textContent = nameUpper;
      g.setAttribute("data-text", nameUpper);
    }
  }

  set("heroTitle",   (data.title   || "DEVELOPER").toUpperCase());
  set("heroBio",      data.bio);

  /* Profile image */
  const heroImg = document.getElementById("heroImg");
  const holoPh  = document.getElementById("holoPh");
  if (data.profile_base64 && heroImg) {
    heroImg.src = data.profile_base64;
    heroImg.style.display = "block";
    if (holoPh) holoPh.style.display = "none";
  }

  /* Data readout */
  const drEmail = document.getElementById("drEmail");
  if (drEmail) drEmail.querySelector(".dr-value").textContent = data.email || "—";

  const drPhone = document.getElementById("drPhone");
  if (drPhone) drPhone.querySelector(".dr-value").textContent = data.phone || "—";

  const drLoc = document.getElementById("drLocation");
  if (drLoc) drLoc.querySelector(".dr-value").textContent = data.location || "—";

  /* Metrics */
  const mcSkills = document.getElementById("mcSkills");
  if (mcSkills) mcSkills.querySelector(".mc-val").textContent = padNum(skills.length);

  const mcProjects = document.getElementById("mcProjects");
  if (mcProjects) mcProjects.querySelector(".mc-val").textContent = padNum(projects.length);

  const mcRoles = document.getElementById("mcRoles");
  if (mcRoles) mcRoles.querySelector(".mc-val").textContent = padNum(exp.length);

  /*  ABOUT */
  set("aboutDesc",          data.description);
  set("aboutSkillsSummary", data.skills_summary);

  /* CONTACT INFO  */
  set("cInfoEmail",    data.email);
  set("cInfoPhone",    data.phone);
  set("cInfoLocation", data.location);

  /*  SKILLS  */
  const skillsGrid = document.getElementById("skillsGrid");
  if (skillsGrid) {
    if (!skills.length) {
      skillsGrid.innerHTML = '<p style="color:var(--text-muted);font-family:var(--ff-head);font-size:11px;letter-spacing:0.1em">[ NO_SKILLS_LOADED ]</p>';
    } else {
      skillsGrid.innerHTML = skills.map(s => `
        <div class="skill-cn-card">
          <div class="skill-cn-top">
            <span class="skill-cn-name">${esc(s.name).toUpperCase()}</span>
            <span class="skill-cn-pct">${Number(s.level)||0}%</span>
          </div>
          <div class="skill-cn-track">
            <div class="skill-cn-fill" data-w="${Number(s.level)||0}"></div>
          </div>
          <div class="skill-cn-cat">[${esc(s.category).toUpperCase()}]</div>
        </div>
      `).join("");
    }
  }

  /* PROJECTS */
  const projectsGrid = document.getElementById("projectsGrid");
  if (projectsGrid) {
    if (!projects.length) {
      projectsGrid.innerHTML = '<p style="color:var(--text-muted);font-family:var(--ff-head);font-size:11px;letter-spacing:0.1em">[ NO_PROJECTS_LOADED ]</p>';
    } else {
      projectsGrid.innerHTML = projects.map((p, i) => `
        <div class="project-cn-card">
          ${p.image_base64
            ? `<img class="proj-cn-img" src="${p.image_base64}" alt="${esc(p.title)}"/>`
            : `<div class="proj-cn-img-ph">SYS_${String(i+1).padStart(2,"0")}</div>`}
          <div class="proj-cn-body">
            <div class="proj-cn-title">${esc(p.title).toUpperCase()}</div>
            <div class="proj-cn-desc">${esc(p.description)}</div>
            <div class="proj-cn-tech">
              ${(p.tech||[]).map(t=>`<span class="pct-tag">${esc(t).toUpperCase()}</span>`).join("")}
            </div>
            <div class="proj-cn-links">
              ${p.github ? `<a class="pcl-btn cyan" href="${esc(p.github)}" target="_blank">GITHUB ↗</a>` : ""}
              ${p.live   ? `<a class="pcl-btn pink" href="${esc(p.live)}"   target="_blank">LIVE ↗</a>`   : ""}
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  /* EXPERIENCE */
  const expList = document.getElementById("expList");
  if (expList) {
    if (!exp.length) {
      expList.innerHTML = '<p style="color:var(--text-muted);font-family:var(--ff-head);font-size:11px;letter-spacing:0.1em">[ NO_RECORDS_FOUND ]</p>';
    } else {
      expList.innerHTML = exp.map((e, i) => `
        <div class="exp-cn-card">
          <div class="exp-cn-num">${String(i+1).padStart(2,"0")}</div>
          <div>
            <div class="exp-cn-title">${esc(e.jobTitle).toUpperCase()}</div>
            <div class="exp-cn-co">${esc(e.company).toUpperCase()}</div>
            <div class="exp-cn-desc">${esc(e.description)}</div>
          </div>
        </div>
      `).join("");
    }
  }

  /* EDUCATION */
  const eduGrid = document.getElementById("eduGrid");
  if (eduGrid) {
    if (!edu.length) {
      eduGrid.innerHTML = '<p style="color:var(--text-muted);font-family:var(--ff-head);font-size:11px;letter-spacing:0.1em">[ NO_RECORDS_FOUND ]</p>';
    } else {
      eduGrid.innerHTML = edu.map(e => `
        <div class="edu-cn-card">
          <div class="edu-cn-deg">${esc(e.degree).toUpperCase()}</div>
          <div class="edu-cn-inst">${esc(e.institute).toUpperCase()}</div>
          <div class="edu-cn-field">${esc(e.field)}</div>
        </div>
      `).join("");
    }
  }

  /* SOCIAL */
  const socialRow = document.getElementById("socialRow");
  if (socialRow) {
    const links = [];
    if (data.linkedin)      links.push({href: data.linkedin,     icon:"🔗", label:"LINKEDIN"});
    if (data.github_social) links.push({href: data.github_social,icon:"🐙", label:"GITHUB"});
    if (data.instagram)     links.push({href: data.instagram,    icon:"📸", label:"INSTAGRAM"});

    if (!links.length) {
      socialRow.innerHTML = '<p style="color:var(--text-muted);font-family:var(--ff-head);font-size:11px;letter-spacing:0.1em">[ NO_LINKS_CONFIGURED ]</p>';
    } else {
      socialRow.innerHTML = links.map(l => `
        <a class="social-cn-btn" href="${esc(l.href)}" target="_blank">
          <span class="scb-icon">${l.icon}</span>
          <span>${l.label}</span>
          <span style="margin-left:auto;color:var(--cyan-dim);font-size:10px">↗</span>
        </a>
      `).join("");
    }
  }

  /*  CONTACT FORM */
  window.submitCyber = function (e) {
    e.preventDefault();
    const name  = document.getElementById("cName")?.value?.trim();
    const email = document.getElementById("cEmail")?.value?.trim();
    const msg   = document.getElementById("cMessage")?.value?.trim();
    const resp  = document.getElementById("formResp");
    if (!name || !email || !msg) {
      if (resp) { resp.style.color = "var(--pink)"; resp.textContent = "[ ERROR ] REQUIRED FIELDS EMPTY"; }
      return;
    }
    if (resp) {
      resp.style.color = "var(--lime)";
      resp.textContent = "[ OK 200 ] TRANSMISSION SUCCESSFUL";
      e.target.reset();
    }
  };

  /*  SKILL BAR SCROLL ANIMATION  */
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".skill-cn-fill").forEach(bar => {
          bar.style.width = bar.dataset.w + "%";
        });
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const skillSection = document.getElementById("skills");
  if (skillSection) skillObs.observe(skillSection);

  /*  ENTRANCE ANIMATION  */
  const entryObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll(
          ".skill-cn-card, .project-cn-card, .exp-cn-card, .edu-cn-card, .social-cn-btn, .cyber-panel"
        );
        items.forEach((el, i) => {
          el.style.opacity   = "0";
          el.style.transform = "translateY(18px)";
          el.style.transition = `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`;
          setTimeout(() => {
            el.style.opacity   = "1";
            el.style.transform = "translateY(0)";
          }, 40);
        });
        entryObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".cn-section").forEach(s => entryObs.observe(s));

  /*  HERO COUNTER ANIMATE  */
  function countUp(el, target, duration = 1200) {
    const start = performance.now();
    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(eased * target);
      el.textContent = String(val).padStart(2, "0");
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  setTimeout(() => {
    const sm = document.getElementById("mcSkills");
    const pm = document.getElementById("mcProjects");
    const rm = document.getElementById("mcRoles");
    if (sm) countUp(sm.querySelector(".mc-val"), skills.length);
    if (pm) countUp(pm.querySelector(".mc-val"), projects.length);
    if (rm) countUp(rm.querySelector(".mc-val"), exp.length);
  }, 600);

})();