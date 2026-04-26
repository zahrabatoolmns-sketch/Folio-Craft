/* =============================================
   MINIMAL WHITE — script.js
   Data injection + Swiss editorial interactions
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

  /* ---- BASIC INFO ---- */
  const fullName = data.fullname || data.fullName || data.name || "Your Name";
  const role = data.title || data.profession || "Professional Title";
  const initials = fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  txt("name", fullName);
  txt("title", role);
  txt("bio", data.bio || "");
  txt("location", data.location || "—");
  txt("email", data.email || "—");
  txt("description", data.description || "");
  txt("skills_summary", data.skills_summary || "");
  txt("navInitials", initials);
  txt("navName", fullName);
  txt("footerName", fullName);
  txt("frameLabel", fullName);
  document.title = fullName + " | Portfolio";
  document.getElementById("pageTitle") && (document.getElementById("pageTitle").textContent = fullName + " | Portfolio");

  /* ---- PROFILE IMAGE ---- */
  if (data.profile_base64) {
    const img = document.getElementById("profileImage");
    const ph = document.getElementById("imgPlaceholder");
    if (img) { img.src = data.profile_base64; img.style.display = "block"; }
    if (ph) ph.style.display = "none";
  }

  /* ---- SOCIAL LINKS ---- */
  function setLink(id, url) {
    const el = document.getElementById(id);
    if (el) { el.href = url || "#"; if (!url) el.style.display = "none"; }
  }
  setLink("linkedinLink", data.linkedin);
  setLink("githubLink", data.github_social);
  setLink("instagramLink", data.instagram);
  setLink("fLinkedin", data.linkedin);
  setLink("fGithub", data.github_social);
  setLink("fInstagram", data.instagram);

  /* ---- CONTACT ---- */
  txt("cEmail", data.email || "");
  setLink("emailCard", data.email ? "mailto:" + data.email : "");
  setLink("linkedinCard", data.linkedin);
  setLink("githubCard", data.github_social);

  /* ---- ARRAYS ---- */
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];

  /* ---- STATS ---- */
  txt("hProjectCount", projects.length);
  txt("hSkillCount", skills.length);
  txt("hExpCount", experience.length);

  /* ---- MARQUEE ---- */
  const marqueeTrack = document.getElementById("marqueeTrack");
  if (marqueeTrack) {
    const items = skills.length
      ? skills.map(s => s.name)
      : ["Design", "Development", "Creativity", "Innovation", "Strategy", "Excellence", "Passion", "Quality"];

    const doubled = [...items, ...items, ...items, ...items];
    marqueeTrack.innerHTML = doubled.map(item =>
      `<span class="marquee-item"><span class="marquee-dot"></span>${esc(item)}</span>`
    ).join("");
  }

  /* ---- SKILLS ---- */
  const skillsTable = document.getElementById("skillsTable");
  if (skillsTable && skills.length) {
    skillsTable.innerHTML = skills.map(s => `
      <div class="skill-row reveal">
        <span class="skill-row-name">${esc(s.name)}</span>
        <div class="skill-row-bar-wrap">
          <div class="skill-row-bar-fill" data-width="${s.level || 0}"></div>
        </div>
        <span class="skill-row-pct">${s.level || 0}%</span>
      </div>
    `).join("");
  } else if (skillsTable) {
    skillsTable.innerHTML = `<p style="font-size:14px;color:#9a9890;">No skills listed yet.</p>`;
  }

  /* ---- PROJECTS ---- */
  const projectsList = document.getElementById("projectsList");
  if (projectsList && projects.length) {
    projectsList.innerHTML = projects.map((p, i) => `
      <div class="work-item reveal">
        <span class="work-num">0${i + 1}</span>
        <div class="work-content">
          <div class="work-title">${esc(p.title)}</div>
          <p class="work-desc">${esc(p.description || "")}</p>
          <div class="work-tags">
            ${(p.tech || []).map(t => `<span class="work-tag">${esc(t)}</span>`).join("")}
          </div>
          <div class="work-links">
            ${p.github ? `<a class="work-link" href="${esc(p.github)}" target="_blank">GitHub ↗</a>` : ""}
            ${p.live ? `<a class="work-link" href="${esc(p.live)}" target="_blank">Live ↗</a>` : ""}
          </div>
        </div>
        <div class="work-right">
          <div class="work-img-thumb">
            ${p.image_base64
              ? `<img src="${p.image_base64}" alt="${esc(p.title)}"/>`
              : `<div class="work-img-thumb-empty">💻</div>`}
          </div>
        </div>
      </div>
    `).join("");
  } else if (projectsList) {
    projectsList.innerHTML = `<p style="font-size:14px;color:#9a9890;padding:24px 0;">No projects added yet.</p>`;
  }

  /* ---- EXPERIENCE ---- */
  const expList = document.getElementById("expList");
  if (expList && experience.length) {
    expList.innerHTML = experience.map(e => `
      <div class="journey-item reveal">
        <div class="j-title">${esc(e.jobTitle)}</div>
        <div class="j-sub">${esc(e.company)}</div>
        <div class="j-desc">${esc(e.description || "")}</div>
      </div>
    `).join("");
  } else if (expList) {
    expList.innerHTML = `<p style="font-size:13px;color:#9a9890;padding:16px 0;">No experience added.</p>`;
  }

  /* ---- EDUCATION ---- */
  const eduList = document.getElementById("eduList");
  if (eduList && education.length) {
    eduList.innerHTML = education.map(e => `
      <div class="journey-item reveal">
        <div class="j-title">${esc(e.degree)}</div>
        <div class="j-sub">${esc(e.institute)}</div>
        <div class="j-desc">${esc(e.field || "")}</div>
      </div>
    `).join("");
  } else if (eduList) {
    eduList.innerHTML = `<p style="font-size:13px;color:#9a9890;padding:16px 0;">No education added.</p>`;
  }

  /* ---- NAV SCROLL ---- */
  window.addEventListener("scroll", () => {
    document.getElementById("nav")?.classList.toggle("scrolled", window.scrollY > 60);
  });

  /* ---- SCROLL REVEAL + SKILL BARS ---- */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        e.target.querySelectorAll(".skill-row-bar-fill").forEach(bar => {
          bar.style.transform = `scaleX(${(bar.dataset.width || 0) / 100})`;
        });
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

  setTimeout(() => {
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = (i * 0.05) + "s";
      observer.observe(el);
    });
    document.querySelectorAll(".section-heading, .work-item, .skill-row, .journey-item").forEach(el => {
      if (!el.classList.contains("reveal")) {
        el.classList.add("reveal");
        observer.observe(el);
      }
    });
  }, 100);

  /* ---- STAT COUNTER ANIMATION ---- */
  function animateCount(el, target) {
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 40);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const els = [
          { id: "hProjectCount", val: projects.length },
          { id: "hSkillCount", val: skills.length },
          { id: "hExpCount", val: experience.length },
        ];
        els.forEach(item => {
          const el = document.getElementById(item.id);
          if (el) animateCount(el, item.val);
        });
        statsObserver.disconnect();
      }
    });
  });

  const statRow = document.querySelector(".hero-stat-row");
  if (statRow) statsObserver.observe(statRow);

})();