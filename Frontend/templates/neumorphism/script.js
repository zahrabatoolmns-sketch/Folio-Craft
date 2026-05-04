(function () {

  /* ── DATA ── */
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

  /* INITIALS */
  function initials(name) {
    const p = (name || "").trim().split(/\s+/);
    if (p.length >= 2) return (p[0][0] + p[p.length-1][0]).toUpperCase();
    return (p[0] || "?")[0].toUpperCase();
  }
  set("sidebarInitials", initials(data.fullname));

  /* HERO */
  set("heroName",     data.fullname);
  set("heroTitle",    data.title);
  set("heroBio",      data.bio);
  set("footerName",   data.fullname);

  /* Email */
  const emailEl = document.getElementById("heroEmail");
  if (emailEl) emailEl.querySelector("span").textContent = data.email || "—";

  const phoneEl = document.getElementById("heroPhone");
  if (phoneEl) phoneEl.querySelector("span").textContent = data.phone || "—";

  const locEl = document.getElementById("heroLocation");
  if (locEl) locEl.querySelector("span").textContent = data.location || "—";

  /* Stats */
  set("statProj",  ""); // will be set below
  set("statSkill", "");
  set("statExp",   "");
  document.getElementById("statProj" )?.querySelector(".stat-n") && (document.getElementById("statProj").querySelector(".stat-n").textContent  = projects.length);
  document.getElementById("statSkill")?.querySelector(".stat-n") && (document.getElementById("statSkill").querySelector(".stat-n").textContent = skills.length);
  document.getElementById("statExp"  )?.querySelector(".stat-n") && (document.getElementById("statExp").querySelector(".stat-n").textContent   = exp.length);

  /* Profile image */
  const heroImg = document.getElementById("heroImg");
  const avatarPh = document.getElementById("avatarPh");
  if (data.profile_base64 && heroImg) {
    heroImg.src = data.profile_base64;
    heroImg.style.display = "block";
    if (avatarPh) avatarPh.style.display = "none";
  }

  /* ABOUT  */
  set("aboutDesc",          data.description);
  set("aboutSkillsSummary", data.skills_summary);

  /*  CONTACT INFO  */
  set("cInfoEmail",    data.email);
  set("cInfoPhone",    data.phone);
  set("cInfoLocation", data.location);

  /* SKILLS */
  const skillsGrid = document.getElementById("skillsGrid");
  if (skillsGrid) {
    if (!skills.length) {
      skillsGrid.innerHTML = '<p style="color:var(--text-muted)">No skills added yet.</p>';
    } else {
      skillsGrid.innerHTML = skills.map(s => `
        <div class="skill-nm-card">
          <div class="skill-nm-top">
            <span class="skill-nm-name">${esc(s.name)}</span>
            <span class="skill-nm-pct">${Number(s.level)||0}%</span>
          </div>
          <div class="skill-nm-track">
            <div class="skill-nm-fill" data-w="${Number(s.level)||0}"></div>
          </div>
          <div class="skill-nm-cat">${esc(s.category)}</div>
        </div>
      `).join("");
    }
  }

  /*  PROJECTS */
  const projectsGrid = document.getElementById("projectsGrid");
  if (projectsGrid) {
    if (!projects.length) {
      projectsGrid.innerHTML = '<p style="color:var(--text-muted)">No projects added yet.</p>';
    } else {
      projectsGrid.innerHTML = projects.map((p, i) => `
        <div class="project-nm-card">
          ${p.image_base64
            ? `<img class="proj-img-nm" src="${p.image_base64}" alt="${esc(p.title)}"/>`
            : `<div class="proj-img-ph-nm">0${i+1}</div>`}
          <div class="proj-body-nm">
            <div class="proj-title-nm">${esc(p.title)}</div>
            <div class="proj-desc-nm">${esc(p.description)}</div>
            <div class="proj-tech-nm">
              ${(p.tech||[]).map(t=>`<span class="p-tag-nm">${esc(t)}</span>`).join("")}
            </div>
            <div class="proj-links-nm">
              ${p.github ? `<a class="pl-btn-nm primary" href="${esc(p.github)}" target="_blank">GitHub ↗</a>` : ""}
              ${p.live   ? `<a class="pl-btn-nm"         href="${esc(p.live)}"   target="_blank">Live Demo</a>` : ""}
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  /*  EXPERIENCE  */
  const expList = document.getElementById("expList");
  const icons = ["💼","🚀","⚡","🎯","🔧","🌟","💡","🎨"];
  if (expList) {
    if (!exp.length) {
      expList.innerHTML = '<p style="color:var(--text-muted)">No experience added yet.</p>';
    } else {
      expList.innerHTML = exp.map((e, i) => `
        <div class="exp-nm-card">
          <div class="exp-nm-icon">${icons[i % icons.length]}</div>
          <div>
            <div class="exp-nm-title">${esc(e.jobTitle)}</div>
            <div class="exp-nm-company">${esc(e.company)}</div>
            <div class="exp-nm-desc">${esc(e.description)}</div>
          </div>
        </div>
      `).join("");
    }
  }

  /*  EDUCATION  */
  const eduGrid = document.getElementById("eduGrid");
  if (eduGrid) {
    if (!edu.length) {
      eduGrid.innerHTML = '<p style="color:var(--text-muted)">No education added yet.</p>';
    } else {
      eduGrid.innerHTML = edu.map(e => `
        <div class="edu-nm-card">
          <div class="edu-degree-nm">${esc(e.degree)}</div>
          <div class="edu-inst-nm">${esc(e.institute)}</div>
          <div class="edu-field-nm">${esc(e.field)}</div>
        </div>
      `).join("");
    }
  }

  /*  SOCIAL */
  const socialRow = document.getElementById("socialRow");
  if (socialRow) {
    const links = [];
    if (data.linkedin)      links.push({href: data.linkedin,     icon:"🔗", label:"LinkedIn"});
    if (data.github_social) links.push({href: data.github_social,icon:"🐙", label:"GitHub"});
    if (data.instagram)     links.push({href: data.instagram,    icon:"📸", label:"Instagram"});

    if (!links.length) {
      socialRow.innerHTML = '<p style="color:var(--text-muted)">No social links added.</p>';
    } else {
      socialRow.innerHTML = links.map(l => `
        <a class="social-nm-btn" href="${esc(l.href)}" target="_blank">
          <span class="social-nm-icon">${l.icon}</span>
          <span>${l.label}</span>
        </a>
      `).join("");
    }
  }

  /* CONTACT FORM  */
  window.submitNm = function (e) {
    e.preventDefault();
    const name  = document.getElementById("cName")?.value?.trim();
    const email = document.getElementById("cEmail")?.value?.trim();
    const msg   = document.getElementById("cMessage")?.value?.trim();
    const resp  = document.getElementById("formResp");
    if (!name || !email || !msg) {
      if (resp) { resp.style.color = "#ff6b9d"; resp.textContent = "Please fill in all required fields."; }
      return;
    }
    if (resp) {
      resp.style.color = "var(--accent)";
      resp.textContent = "✓ Message sent! I'll be in touch soon.";
      e.target.reset();
    }
  };

  /* SIDEBAR ACTIVE STATE */
  const sections = document.querySelectorAll(".page-section");
  const navLinks = document.querySelectorAll(".snav-link");

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle("active", l.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));

  /* SKILL BAR ANIMATION */
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".skill-nm-fill").forEach(bar => {
          bar.style.width = bar.dataset.w + "%";
        });
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const skillSection = document.getElementById("skills");
  if (skillSection) skillObs.observe(skillSection);

  /*ENTR ANCE ANIMATION */
  const entryObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll(
          ".skill-nm-card, .project-nm-card, .exp-nm-card, .edu-nm-card, .social-nm-btn, .nm-card"
        );
        cards.forEach((el, i) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(20px)";
          el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, 40);
        });
        entryObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".page-section").forEach(s => entryObs.observe(s));

})();