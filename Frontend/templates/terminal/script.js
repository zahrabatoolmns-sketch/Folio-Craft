/* =============================================
   CYBER NEON — script.js
   Boot sequence + data injection + cyber effects
============================================= */

(function () {
  "use strict";

  /* ---- LOAD DATA ---- */
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem("portfolioData") || "{}");
  } catch (e) {}

  function txt(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  }
  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, s =>
      ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[s])
    );
  }

  const fullName = data.fullname || data.fullName || data.name || "OPERATOR";
  const role = data.title || data.profession || "UNDEFINED_ROLE";
  const nameUpper = fullName.toUpperCase();

  /* ---- BOOT SEQUENCE ---- */
  const bootLog = document.getElementById("bootLog");
  const bootBar = document.getElementById("bootBar");
  const bootOverlay = document.getElementById("bootOverlay");

  const bootMessages = [
    `> INITIALIZING PORTFOLIO SYSTEM...`,
    `> LOADING USER IDENTITY: ${nameUpper}`,
    `> DECRYPTING CREDENTIALS...`,
    `> CHECKING SKILL MODULES... [OK]`,
    `> LOADING PROJECT ARCHIVE... [OK]`,
    `> ESTABLISHING NETWORK LINKS...`,
    `> MOUNTING EXPERIENCE DATABASE...`,
    `> RENDERING INTERFACE...`,
    `> SYSTEM READY.`,
  ];

  let msgIdx = 0;
  let progress = 0;

  function addBootLine() {
    if (!bootLog || !bootBar || !bootOverlay) return;
    if (msgIdx < bootMessages.length) {
      const line = document.createElement("div");
      line.textContent = bootMessages[msgIdx++];
      bootLog.appendChild(line);
      bootLog.scrollTop = bootLog.scrollHeight;
      progress = Math.min(100, Math.floor((msgIdx / bootMessages.length) * 100));
      bootBar.style.width = progress + "%";
      setTimeout(addBootLine, 160 + Math.random() * 180);
    } else {
      setTimeout(() => {
        bootOverlay.classList.add("fade-out");
        setTimeout(() => {
          bootOverlay.style.display = "none";
          injectData();
          startEffects();
        }, 500);
      }, 400);
    }
  }

  addBootLine();

  /* ---- INJECT DATA ---- */
  function injectData() {
    // name + glitch
    const nameEl = document.getElementById("name");
    if (nameEl) { nameEl.textContent = nameUpper; nameEl.setAttribute("data-text", nameUpper); }

    txt("title", role.toUpperCase());
    txt("bio", data.bio || "No bio data found.");
    txt("locationOut", data.location || "UNDISCLOSED");
    txt("emailOut", data.email || "ENCRYPTED");
    txt("navId", nameUpper + ".EXE");
    txt("footerName", nameUpper);
    txt("aId", nameUpper.split(" ")[0] + "_" + Math.floor(Math.random() * 9000 + 1000));
    document.title = nameUpper + " | SYS_PORTFOLIO";

    // Profile image
    if (data.profile_base64) {
      const img = document.getElementById("profileImage");
      const ph = document.getElementById("avatarPh");
      if (img) { img.src = data.profile_base64; img.style.display = "block"; }
      if (ph) ph.style.display = "none";
    }

    // About code block
    const desc = document.getElementById("description");
    if (desc) desc.textContent = `"${data.description || "No data."}"`;
    const ss = document.getElementById("skills_summary");
    if (ss) ss.textContent = `"${data.skills_summary || "No data."}"`;

    // Social links
    function setLink(id, url) {
      const el = document.getElementById(id);
      if (el) { el.href = url || "#"; if (!url) el.style.opacity = "0.3"; }
    }
    setLink("linkedinLink", data.linkedin);
    setLink("githubLink", data.github_social);
    setLink("instagramLink", data.instagram);

    // Contact
    txt("cEmail", data.email || "NO_EMAIL");
    const cEl = document.getElementById("cEmailLink");
    if (cEl) cEl.href = data.email ? "mailto:" + data.email : "#";
    const cLi = document.getElementById("cLinkedin");
    if (cLi) cLi.href = data.linkedin || "#";
    const cGh = document.getElementById("cGithub");
    if (cGh) cGh.href = data.github_social || "#";

    // Arrays
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const skills = Array.isArray(data.skills) ? data.skills : [];
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const education = Array.isArray(data.education) ? data.education : [];

    // Stats
    txt("aProjects", projects.length);
    txt("aSkills", skills.length);

    // Skills
    const sg = document.getElementById("skillsGrid");
    if (sg && skills.length) {
      sg.innerHTML = skills.map(s => `
        <div class="skill-card reveal">
          <div class="sc-header">
            <span class="sc-name">${esc(s.name)}</span>
            <span class="sc-pct">${s.level || 0}%</span>
          </div>
          <div class="sc-bar-bg">
            <div class="sc-bar-fill" data-width="${s.level || 0}"></div>
          </div>
          <div class="sc-cat">[ ${esc(s.category || "MISC")} ]</div>
        </div>
      `).join("");
    } else if (sg) {
      sg.innerHTML = `<div style="color:rgba(0,255,136,0.3);font-size:13px;">NO_SKILLS_FOUND</div>`;
    }

    // Projects
    const pg = document.getElementById("projectsGrid");
    if (pg && projects.length) {
      pg.innerHTML = projects.map((p, i) => `
        <div class="proj-card reveal">
          <div class="proj-img">
            ${p.image_base64
              ? `<img src="${p.image_base64}" alt="${esc(p.title)}"/>`
              : `<div class="proj-img-empty">// ${esc(p.title)}</div>`}
            <div class="proj-overlay"></div>
          </div>
          <div class="proj-body">
            <div class="proj-id">PROJECT_${String(i+1).padStart(3,'0')}</div>
            <div class="proj-title">${esc(p.title)}</div>
            <div class="proj-desc">${esc(p.description || "")}</div>
            <div class="proj-tags">
              ${(p.tech || []).map(t => `<span class="proj-tag">${esc(t)}</span>`).join("")}
            </div>
            <div class="proj-links">
              ${p.github ? `<a class="proj-link" href="${esc(p.github)}" target="_blank">[ GITHUB ] ↗</a>` : ""}
              ${p.live ? `<a class="proj-link" href="${esc(p.live)}" target="_blank">[ LIVE ] ↗</a>` : ""}
            </div>
          </div>
        </div>
      `).join("");
    } else if (pg) {
      pg.innerHTML = `<div style="color:rgba(0,255,136,0.3);font-size:13px;">NO_PROJECTS_FOUND</div>`;
    }

    // Experience
    const expList = document.getElementById("expList");
    if (expList && experience.length) {
      expList.innerHTML = experience.map(e => `
        <div class="tl-item reveal">
          <div class="tl-title">${esc(e.jobTitle)}</div>
          <div class="tl-sub">${esc(e.company)}</div>
          <div class="tl-desc">${esc(e.description || "")}</div>
        </div>
      `).join("");
    } else if (expList) {
      expList.innerHTML = `<div style="color:rgba(0,255,136,0.3);font-size:12px;padding:16px 0;">NO_RECORDS_FOUND</div>`;
    }

    // Education
    const eduList = document.getElementById("eduList");
    if (eduList && education.length) {
      eduList.innerHTML = education.map(e => `
        <div class="tl-item reveal">
          <div class="tl-title">${esc(e.degree)}</div>
          <div class="tl-sub">${esc(e.institute)}</div>
          <div class="tl-desc">${esc(e.field || "")}</div>
        </div>
      `).join("");
    } else if (eduList) {
      eduList.innerHTML = `<div style="color:rgba(0,255,136,0.3);font-size:12px;padding:16px 0;">NO_RECORDS_FOUND</div>`;
    }

    // Scroll reveal
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          e.target.querySelectorAll(".sc-bar-fill, .skill-row-bar-fill").forEach(bar => {
            bar.style.transform = `scaleX(${(bar.dataset.width || 0) / 100})`;
          });
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el, i) => {
        el.style.transitionDelay = (i * 0.04) + "s";
        observer.observe(el);
      });
      document.querySelectorAll(".section-title, .skill-card, .proj-card, .tl-item").forEach(el => {
        if (!el.classList.contains("reveal")) { el.classList.add("reveal"); observer.observe(el); }
      });
    }, 100);
  }

  /* ---- EFFECTS ---- */
  function startEffects() {
    // Background canvas (particle field)
    const canvas = document.getElementById("bgCanvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      let particles = [];

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      class Particle {
        constructor() { this.reset(); }
        reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.vx = (Math.random() - 0.5) * 0.3;
          this.vy = (Math.random() - 0.5) * 0.3;
          this.life = 1;
          this.decay = 0.003 + Math.random() * 0.005;
          this.size = Math.random() * 1.5;
          this.color = Math.random() > 0.7 ? "#00ff88" : Math.random() > 0.5 ? "#00c8ff" : "#ff0090";
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.life -= this.decay;
          if (this.life <= 0) this.reset();
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = this.life * 0.4;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      resize();
      window.addEventListener("resize", resize);
      particles = Array.from({ length: 150 }, () => new Particle());

      // Draw connections
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = "#00ff88";
              ctx.globalAlpha = (1 - dist / 100) * 0.08;
              ctx.lineWidth = 0.5;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
        requestAnimationFrame(draw);
      }
      draw();
    }

    // Custom cursor
    const dot = document.getElementById("cursorDot");
    const cross = document.getElementById("cursorCross");
    let mx = 0, my = 0;

    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
      setTimeout(() => {
        if (cross) { cross.style.left = mx + "px"; cross.style.top = my + "px"; }
      }, 60);
    });

    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", () => {
        if (dot) dot.style.transform = "translate(-50%,-50%) scale(2.5)";
        if (cross) { cross.style.width = "40px"; cross.style.height = "40px"; }
      });
      el.addEventListener("mouseleave", () => {
        if (dot) dot.style.transform = "translate(-50%,-50%) scale(1)";
        if (cross) { cross.style.width = "24px"; cross.style.height = "24px"; }
      });
    });

    // Random glitch effect on hero name
    const heroName = document.getElementById("name");
    if (heroName) {
      setInterval(() => {
        if (Math.random() > 0.85) {
          heroName.style.transform = `translateX(${(Math.random() - 0.5) * 4}px)`;
          setTimeout(() => { heroName.style.transform = "none"; }, 80);
        }
      }, 2000);
    }
  }

})();