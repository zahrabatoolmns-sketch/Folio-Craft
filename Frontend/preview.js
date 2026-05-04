(function () {
  'use strict';

  /* ─── DOM refs ─── */
  const frame         = document.getElementById('previewFrame');
  const templateLabel = document.getElementById('templateLabel');
  const pvName        = document.getElementById('pvName');
  const pvTitle       = document.getElementById('pvTitle');
  const pvTemplate    = document.getElementById('pvTemplate');
  const pvEmail       = document.getElementById('pvEmail');
  const pvProjects    = document.getElementById('pvProjects');
  const pvSkills      = document.getElementById('pvSkills');
  const noteBox       = document.getElementById('noteBox');
  const backBtn       = document.getElementById('backBtn');
  const downloadBtn   = document.getElementById('downloadBtn');
  const frameLoader   = document.getElementById('frameLoader');

  /* ─── Navigation ─── */
  backBtn?.addEventListener('click', () => { window.location.href = 'wizard.html'; });

  /* STEP 1 — Load & validate portfolio data */
  const raw = localStorage.getItem('portfolioData');

  if (!raw) {
    showNote('No portfolio data found. Please complete the wizard first.', 'error');
    disableDownload('Complete the wizard first');
    return;
  }

  let D;
  try { D = JSON.parse(raw); }
  catch {
    showNote(' Corrupted data. Please redo the wizard.', 'error');
    disableDownload('Invalid data');
    return;
  }

  /* ─── Resolve key fields ─── */
  const name     = D.fullname || D.fullName || D.name || 'Portfolio';
  const title    = D.title    || D.profession || D.role || '';
  const template = (D.selectedTemplate || localStorage.getItem('selectedTemplate') || 'modern-dark').trim();

  /* ─── Populate info panel ─── */
  if (pvName)        pvName.textContent     = name;
  if (pvTitle)       pvTitle.textContent    = title;
  if (pvTemplate)    pvTemplate.textContent = template;
  if (templateLabel) templateLabel.textContent = 'Template: ' + template;
  if (pvEmail)       pvEmail.textContent    = D.email || '—';
  if (pvProjects)    pvProjects.textContent = (D.projects || []).length + ' added';
  if (pvSkills)      pvSkills.textContent   = (D.skills   || []).length + ' added';

  /*  STEP 2 — Templates that are BUILT
     Add new template folder names here as you build them */
  const BUILT_TEMPLATES = [
    'modern-dark',
    'minimal-white',
    'cyber-neon',
    'creative-gradient',
    'split-layout',
    'corporate',
    'cv-single',
    'neumorphism',
    'terminal',
    'card-grid',
];
  /* STEP 3 — Guard: template not built yet */
  if (!BUILT_TEMPLATES.includes(template)) {
    showNote(
      ' Template "' + template + '" is not built yet.\n\n' +
      'Available templates:\n' + BUILT_TEMPLATES.map(t => '  • ' + t).join('\n') + '\n\n' +
      'Please go back and select one of the available templates.',
      'error'
    );
    disableDownload('Template not built yet');

    if (frame) {
      frame.srcdoc = makeIframePage(
        ' Template Not Ready',
        'The <strong>' + template + '</strong> template is not built yet.',
        'Available: ' + BUILT_TEMPLATES.join(', ')
      );
      if (frameLoader) frameLoader.classList.add('hidden');
    }
    return;
  }

  /* STEP 4 — Detect file:// protocol */
  const isFileProtocol = window.location.protocol === 'file:';

  if (isFileProtocol) {
    showNote(
      'You are opening this via file:// (double-clicking the HTML file).\n\n' +
      'This blocks iframes and fetch() for security — that\'s why you see 404 errors.\n\n' +
      'FIX — Use a local server:\n\n' +
      'Option 1 (VS Code):\n' +
      '  Install "Live Server" extension → Right-click preview.html → "Open with Live Server"\n\n' +
      'Option 2 (Terminal):\n' +
      '  npx serve .\n' +
      '  Then open: http://localhost:3000/preview.html\n\n' +
      'Option 3 (Python):\n' +
      '  python -m http.server 8080\n' +
      '  Then open: http://localhost:8080/preview.html',
      'error'
    );
    disableDownload('Use a local server first');

    if (frame) {
      frame.srcdoc = makeIframePage(
        ' Local Server Required',
        'You opened this file directly (file:// protocol).',
        'Use VS Code Live Server or run: <code>npx serve .</code>'
      );
      if (frameLoader) frameLoader.classList.add('hidden');
    }
    return;
  }

  /* STEP 5 — Load template in iframe */
  if (!frame) {
    showNote('Preview component not found. Please refresh the page.', 'error');
    return;
  }

  const templatePath = 'templates/' + template + '/index.html';
  console.log('[FolioCraft] Loading template:', templatePath);

  frame.src = templatePath;

  frame.addEventListener('load', () => {
    if (frameLoader) frameLoader.classList.add('hidden');

    /* Sync localStorage into iframe (same-origin) */
    try {
      frame.contentWindow.localStorage.setItem('portfolioData', raw);
      console.log('[FolioCraft] localStorage synced to iframe ✓');
    } catch (e) {
      console.warn('[FolioCraft] localStorage sync failed:', e.message);
    }

    /* postMessage as additional backup */
    try {
      frame.contentWindow.postMessage(
        { type: 'FOLIOCRAFT_DATA', payload: D },
        '*'
      );
      console.log('[FolioCraft] postMessage sent ✓');
    } catch (e) {
      console.warn('[FolioCraft] postMessage failed:', e.message);
    }
  });

  frame.addEventListener('error', () => {
    if (frameLoader) frameLoader.classList.add('hidden');
    showNote(
      '404: Template file not found at:\n' +
      '  templates/' + template + '/index.html\n\n' +
      'Check that your folder structure is:\n' +
      '  preview.html          ← this file\n' +
      '  templates/            ← this folder, SAME level\n' +
      '    ' + template + '/\n' +
      '      index.html\n' +
      '      style.css\n' +
      '      script.js',
      'error'
    );

    if (frame) {
      frame.srcdoc = makeIframePage(
        ' 404 - File Not Found',
        'Expected: <code>templates/' + template + '/index.html</code>',
        'Make sure the templates/ folder is next to preview.html'
      );
    }
  });

  /* ZIP DOWNLOAD */
  downloadBtn?.addEventListener('click', handleDownload);

  async function handleDownload() {
    const label = document.getElementById('downloadBtnLabel');
    downloadBtn.disabled = true;
    if (label) label.innerHTML = '<span class="spinner"></span> Building ZIP…';
    setStatus('Packaging your portfolio…', 'ready');

    try {
      const base = 'templates/' + template + '/';

      const [htmlSrc, cssSrc, jsSrc] = await Promise.all([
        fetchText(base + 'index.html'),
        fetchText(base + 'style.css'),
        fetchText(base + 'script.js'),
      ]);

      if (!htmlSrc) {
        showNote('Could not load template files. Please try again or refresh the page.', 'error');
        setStatus('Build failed', 'error');
        resetBtn();
        return;
      }

      const bakedJs   = bakeDataIntoScript(jsSrc || '', D);
      const finalHtml = buildStandaloneHtml(htmlSrc, cssSrc || '', bakedJs, name, title);

     const zip    = new JSZip();
     const folder = zip.folder(slug(name) + '-portfolio');


     folder.file('index.html', htmlSrc);
     folder.file('style.css',  cssSrc || '');
    folder.file('script.js',  bakedJs);
    folder.file('README.txt', buildReadme(name, title, template));

      if (D.profile_base64) {
        folder.file(
          'assets/profile.' + guessExt(D.profile_base64),
          D.profile_base64.split(',')[1] || '',
          { base64: true }
        );
      }

      (D.projects || []).forEach((p, i) => {
        if (p.image_base64) {
          folder.file(
            'assets/project-' + i + '.' + guessExt(p.image_base64),
            p.image_base64.split(',')[1] || '',
            { base64: true }
          );
        }
      });

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      saveAs(blob, slug(name) + '-portfolio.zip');

      showNote(
        'ZIP downloaded!\n\n' +
        '• Open index.html in any browser — no server needed.\n' +
        '• Drag folder to netlify.com/drop for instant hosting.\n' +
        '• All data & images are fully baked in.',
        'success'
      );
      setStatus('Downloaded ✓', 'ready');

    } catch (err) {
      console.error('[ZIP error]', err);
      showNote(' Build failed: ' + err.message, 'error');
      setStatus('Build failed', 'error');
    }

    resetBtn();
  }

  /* Utilities */

  function bakeDataIntoScript(originalJs, data) {
    const json = JSON.stringify(data)
      .replace(/<\/script>/gi, '<\\/script>')
      .replace(/<!--/g, '<\\!--');

    return `/* ── FolioCraft baked data ── */
(function(){
  var _d = ${json};
  try { localStorage.setItem('portfolioData', JSON.stringify(_d)); } catch(e) {
    var _o = localStorage.getItem.bind(localStorage);
    localStorage.getItem = function(k) {
      if (k === 'portfolioData') return JSON.stringify(_d);
      try { return _o(k); } catch(_){ return null; }
    };
  }
})();
/* ── End baked data ── */

` + originalJs;
  }

  function buildStandaloneHtml(html, css, js, pName, pTitle) {
    let out = html;
    out = out.replace(/<link[^>]+href=["']style\.css["'][^>]*\/?>/gi, '');
    out = out.replace(/<script[^>]+src=["']script\.js["'][^>]*><\/script>/gi, '');
    out = out.replace('</head>', '\n<style>\n' + css + '\n</style>\n</head>');
    out = out.replace('</body>', '\n<script>\n' + js + '\n<\/script>\n</body>');
    out = out.replace(/<title>[^<]*<\/title>/i, '<title>' + escHtml(pName) + ' | Portfolio</title>');
    if (!out.includes('name="description"')) {
      out = out.replace('<head>', '<head>\n<meta name="description" content="' + escHtml(pName) + ' — ' + escHtml(pTitle) + '">');
    }
    return out;
  }

  function makeIframePage(heading, body, sub) {
    return `<!DOCTYPE html><html><head>
    <style>
      *{box-sizing:border-box}
      body{margin:0;min-height:100vh;background:#0f172a;font-family:'Segoe UI',sans-serif;
           color:#94a3b8;display:flex;align-items:center;justify-content:center;padding:32px;}
      .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
            border-radius:20px;padding:48px 40px;max-width:520px;text-align:center;width:100%;}
      h2{color:#f1f5f9;font-size:22px;margin:0 0 14px;font-weight:600;}
      p{font-size:14px;line-height:1.7;margin:0 0 10px;color:#94a3b8;}
      code{background:rgba(255,255,255,.08);padding:2px 8px;border-radius:4px;
           font-size:12px;color:#a5b4fc;font-family:monospace;}
    </style></head><body>
    <div class="card">
      <h2>${heading}</h2>
      <p>${body}</p>
      ${sub ? '<p>' + sub + '</p>' : ''}
    </div>
    </body></html>`;
  }

  async function fetchText(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) { console.warn('[fetch]', r.status, url); return null; }
      return r.text();
    } catch(e) { console.warn('[fetch error]', url, e.message); return null; }
  }

  function guessExt(b64) {
    if (!b64) return 'png';
    if (/image\/(jpeg|jpg)/.test(b64)) return 'jpg';
    if (/image\/webp/.test(b64)) return 'webp';
    return 'png';
  }

  function slug(s) {
    return String(s||'portfolio').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')||'portfolio';
  }

  function escHtml(s) {
    return String(s??'').replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
    );
  }

  function showNote(msg, type) {
    if (!noteBox) return;
    noteBox.hidden    = false;
    noteBox.innerText = msg;
    noteBox.className = 'note' + (type ? ' ' + type : '');
  }

  function setStatus(text, type) {
    const b = document.getElementById('statusBadge');
    const t = document.getElementById('statusText');
    if (t) t.textContent = text;
    if (b) b.className   = 'status-badge ' + (type || 'ready');
  }

  function disableDownload(reason) {
    if (!downloadBtn) return;
    downloadBtn.disabled      = true;
    downloadBtn.style.opacity = '0.45';
    downloadBtn.title         = reason || 'Unavailable';
    setStatus(reason || 'Unavailable', 'error');
  }

  function resetBtn() {
    if (!downloadBtn) return;
    downloadBtn.disabled = false;
    const label = document.getElementById('downloadBtnLabel');
    if (label) label.innerHTML = ' Download ZIP';
  }

  function buildReadme(name, title, template) {
    return [
      
      ' FolioCraft — Your Portfolio ',

      '', 'Name     : ' + name, 'Title    : ' + title,
      'Template : ' + template, 'Built    : ' + new Date().toLocaleString(), '',
      '── HOW TO VIEW',
      '  Open index.html in any browser. No server needed.',
      '', 'HOW TO DEPLOY ', '',
      '   Netlify Drop: netlify.com/drop → drag this folder',
      '   GitHub Pages: Push → Settings → Pages → Deploy',
      '  Vercel: npm i -g vercel && vercel',
      '', '',
      'Generated by FolioCraft',
    ].join('\n');
  }
  
/* QR - CONTACT (vCard) */
document.getElementById('qrContactBtn')?.addEventListener('click', function() {
  const btn = this;

  const name     = D.fullname      || D.fullName || D.name || 'Portfolio';
  const title    = D.title         || D.profession || '';
  const email    = D.email         || '';
  const phone    = D.phone         || '';
  const linkedin = D.linkedin      || '';
  const github   = D.github_social || '';

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:'    + name,
    'TITLE:' + title,
    email    ? 'EMAIL:' + email    : '',
    phone    ? 'TEL:'   + phone    : '',
    linkedin ? 'URL:'   + linkedin : '',
    github   ? 'URL:'   + github   : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');

  generateAndDownloadQR(vcard, slug(name) + '-contact-qr.png', btn, ' QR Contact');
});


/*  QR - WEBSITE URL */
document.getElementById('qrWebsiteBtn')?.addEventListener('click', async function() {
  const btn = this;

  const url = await window.showInputModal(
    'Enter your portfolio website URL',
    'https://yourname.netlify.app'
  );
  if (!url) return;

  let finalUrl = url.trim();
  if (!finalUrl.startsWith('http')) {
    finalUrl = 'https://' + finalUrl;
  }

  const name = D.fullname || D.fullName || D.name || 'portfolio';
  generateAndDownloadQR(finalUrl, slug(name) + '-website-qr.png', btn, 'QR Website');
});

/* SHARED QR GENERATOR FUNCTION */
function generateAndDownloadQR(data, filename, btn, originalText) {
  btn.disabled    = true;
  btn.textContent = ' Generating...';

  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/'
    + '?size=400x400'
    + '&data='    + encodeURIComponent(data)
    + '&margin=15';

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = function() {
    const canvas  = document.createElement('canvas');
    canvas.width  = 400;
    canvas.height = 400;
    const ctx     = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    ctx.drawImage(img, 0, 0, 400, 400);

    const link    = document.createElement('a');
    link.download = filename;
    link.href     = canvas.toDataURL('image/png');
    link.click();

    btn.disabled    = false;
    btn.textContent = originalText;
  };

  img.onerror = function() {
    alert('QR code not generated. Kindly check your internet connection!');
    btn.disabled    = false;
    btn.textContent = originalText;
  };

  img.src = qrUrl;
}

/* ── Publish & Share ── */
const publishBtn = document.getElementById('publishBtn');

publishBtn?.addEventListener('click', async function() {
  if (!window.FolioAPI || !window.FolioAPI.isLoggedIn()) {
    showPublishAlert('Please login to publish your portfolio.');
    return;
  }

  const portfolioId = localStorage.getItem('currentPortfolioId');
  if (!portfolioId) {
    showPublishAlert('Please save your portfolio first.');
    return;
  }

  publishBtn.disabled = true;
  publishBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
         style="display:block;flex-shrink:0;animation:publishSpin 0.8s linear infinite;">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Publishing...
  `;

  try {
    const token = localStorage.getItem('fc_token');
    const API   = 'https://folio-craft-two.vercel.app/api';

    const res  = await fetch(`${API}/portfolio/${portfolioId}/publish`, {
      method:  'POST',
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    const shareUrl = data.shareUrl || `https://folio-craft-6frg.vercel.app/p/${portfolioId}`;
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    showShareModal(shareUrl);

  } catch(e) {
    showPublishAlert('Failed to publish: ' + e.message);
  }

  publishBtn.disabled = false;
  publishBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="white" stroke-width="2" style="display:block;flex-shrink:0;">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
      <polyline points="16,6 12,2 8,6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
    Publish & Share
  `;
});

// ── Theme detect ──
function getThemeVars() {
  const isDark = document.body.classList.contains('dark')
    || localStorage.getItem('fc_theme') === 'dark'
    || (!localStorage.getItem('fc_theme')
        && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return isDark ? {
    overlay:      'rgba(7,11,20,0.75)',
    card:         'rgba(15,20,35,0.97)',
    border:       'rgba(255,255,255,0.09)',
    borderErr:    'rgba(239,68,68,0.22)',
    inset:        'inset 0 1px 0 rgba(255,255,255,0.07)',
    shadow:       '0 32px 64px rgba(0,0,0,0.55)',
    title:        'rgba(255,255,255,0.92)',
    body:         'rgba(255,255,255,0.48)',
    urlBg:        'rgba(255,255,255,0.04)',
    urlBorder:    'rgba(255,255,255,0.09)',
    urlText:      'rgba(255,255,255,0.48)',
    closeBg:      'rgba(255,255,255,0.05)',
    closeBorder:  'rgba(255,255,255,0.09)',
    closeText:    'rgba(255,255,255,0.52)',
    closeHoverBg: 'rgba(255,255,255,0.09)',
    closeHoverTx: 'rgba(255,255,255,0.85)',
    closeHoverBr: 'rgba(255,255,255,0.16)',
    errIconBg:    'rgba(249,115,22,0.10)',
    errIconBr:    'rgba(249,115,22,0.25)',
  } : {
    overlay:      'rgba(15,20,35,0.45)',
    card:         'rgba(255,255,255,0.98)',
    border:       'rgba(0,0,0,0.08)',
    borderErr:    'rgba(249,115,22,0.25)',
    inset:        'inset 0 1px 0 rgba(255,255,255,0.90)',
    shadow:       '0 24px 48px rgba(0,0,0,0.12)',
    title:        'rgba(15,20,35,0.90)',
    body:         'rgba(15,20,35,0.50)',
    urlBg:        'rgba(15,20,35,0.04)',
    urlBorder:    'rgba(15,20,35,0.09)',
    urlText:      'rgba(15,20,35,0.50)',
    closeBg:      'rgba(15,20,35,0.04)',
    closeBorder:  'rgba(15,20,35,0.10)',
    closeText:    'rgba(15,20,35,0.50)',
    closeHoverBg: 'rgba(15,20,35,0.08)',
    closeHoverTx: 'rgba(15,20,35,0.85)',
    closeHoverBr: 'rgba(15,20,35,0.18)',
    errIconBg:    'rgba(249,115,22,0.08)',
    errIconBr:    'rgba(249,115,22,0.22)',
  };
}

// ── Alert helper ──
function showPublishAlert(message) {
  const existing = document.getElementById('publishAlert');
  if (existing) existing.remove();
  const t = getThemeVars();

  const el = document.createElement('div');
  el.id = 'publishAlert';
  el.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    display:flex; align-items:center; justify-content:center; padding:16px;
    background:${t.overlay};
    backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  `;

  el.innerHTML = `
    <div style="
      width:100%; max-width:380px;
      background:${t.card};
      border:1px solid ${t.borderErr};
      border-radius:20px; padding:32px 28px 28px;
      box-shadow:${t.shadow}, ${t.inset};
      position:relative; overflow:hidden;
    ">
      <div style="
        position:absolute; top:0; left:0; right:0; height:3px;
        background:linear-gradient(90deg,#f97316,#ef4444);
        border-radius:20px 20px 0 0;
      "></div>
      <div style="
        position:absolute; top:-80px; right:-80px;
        width:220px; height:220px;
        background:radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 65%);
        pointer-events:none;
      "></div>

      <div style="
        width:48px; height:48px;
        background:${t.errIconBg}; border:1px solid ${t.errIconBr};
        border-radius:14px;
        display:flex; align-items:center; justify-content:center;
        margin-bottom:16px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="#f97316" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <p style="
        font-size:15px; font-weight:700; color:${t.title};
        margin:0 0 8px; letter-spacing:-0.01em;
        font-family:ui-sans-serif,system-ui,sans-serif;
      ">Heads up</p>

      <p style="
        font-size:13px; line-height:1.65; color:${t.body};
        margin:0 0 24px;
        font-family:ui-sans-serif,system-ui,sans-serif;
      ">${message}</p>

      <button id="_alertOk" style="
        width:100%; padding:11px; border-radius:12px; border:none; cursor:pointer;
        background:linear-gradient(135deg,rgba(249,115,22,0.9),rgba(239,68,68,0.85));
        border-top:1px solid rgba(255,255,255,0.10);
        color:#fff; font-size:13px; font-weight:600; letter-spacing:0.01em;
        box-shadow:0 4px 16px rgba(249,115,22,0.25);
        font-family:ui-sans-serif,system-ui,sans-serif;
        transition:transform .15s ease, box-shadow .15s ease;
      "
      onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 24px rgba(249,115,22,0.35)'"
      onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 16px rgba(249,115,22,0.25)'"
      >Got it</button>
    </div>
  `;

  document.body.appendChild(el);
  el.querySelector('#_alertOk').onclick = () => el.remove();
}

// ── Share Modal ──
function showShareModal(url) {
  const existing = document.getElementById('shareModal');
  if (existing) existing.remove();
  const t = getThemeVars();

  const modal = document.createElement('div');
  modal.id = 'shareModal';
  modal.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    display:flex; align-items:center; justify-content:center; padding:16px;
    background:${t.overlay};
    backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  `;

  modal.innerHTML = `
    <div style="
      width:100%; max-width:460px;
      background:${t.card};
      border:1px solid ${t.border};
      border-radius:22px; padding:36px 32px 32px;
      box-shadow:${t.shadow}, ${t.inset};
      position:relative; overflow:hidden;
    ">
      <div style="
        position:absolute; top:0; left:0; right:0; height:3px;
        background:linear-gradient(90deg,#6366f1,#06b6d4);
        border-radius:22px 22px 0 0;
      "></div>
      <div style="
        position:absolute; top:-100px; right:-100px; width:280px; height:280px;
        background:radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%);
        pointer-events:none;
      "></div>
      <div style="
        position:absolute; bottom:-80px; left:-80px; width:220px; height:220px;
        background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 65%);
        pointer-events:none;
      "></div>

      <div style="
        width:52px; height:52px;
        background:rgba(99,102,241,0.10); border:1px solid rgba(99,102,241,0.25);
        border-radius:15px;
        display:flex; align-items:center; justify-content:center;
        margin-bottom:18px;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <defs>
            <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="100%" stop-color="#06b6d4"/>
            </linearGradient>
          </defs>
          <path stroke="url(#sg2)" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
          <polyline stroke="url(#sg2)" points="16,6 12,2 8,6"/>
          <line stroke="url(#sg2)" x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </div>

      <p style="
        font-size:20px; font-weight:800; color:${t.title};
        margin:0 0 6px; letter-spacing:-0.025em;
        font-family:ui-sans-serif,system-ui,sans-serif;
      ">Portfolio is Live 🎉</p>

      <p style="
        font-size:13px; line-height:1.6; color:${t.body};
        margin:0 0 24px;
        font-family:ui-sans-serif,system-ui,sans-serif;
      ">Share this link with recruiters, clients, or anyone.</p>

      <div style="
        background:${t.urlBg}; border:1px solid ${t.urlBorder};
        border-radius:12px; padding:11px 14px; margin-bottom:16px;
        display:flex; align-items:center; gap:10px;
      ">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="rgba(99,102,241,0.8)" stroke-width="2" style="flex-shrink:0;">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        <span style="
          font-size:12px; color:${t.urlText}; flex:1;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
          font-family:ui-monospace,monospace;
        ">${url}</span>
        <button id="_copyBtn" style="
          padding:6px 14px; border-radius:8px; cursor:pointer;
          border:1px solid rgba(99,102,241,0.35);
          background:rgba(99,102,241,0.12); color:rgba(99,102,241,0.9);
          font-size:11px; font-weight:600; white-space:nowrap;
          font-family:ui-sans-serif,system-ui,sans-serif;
          transition:all .15s ease;
        "
        onmouseover="this.style.background='rgba(99,102,241,0.22)';this.style.borderColor='rgba(99,102,241,0.5)'"
        onmouseout="this.style.background='rgba(99,102,241,0.12)';this.style.borderColor='rgba(99,102,241,0.35)'"
        >Copy</button>
      </div>

      <div style="display:flex; gap:8px;">
        <a href="${url}" target="_blank" style="
          flex:1; padding:12px; border-radius:12px; text-decoration:none;
          background:linear-gradient(135deg,rgba(99,102,241,0.9),rgba(6,182,212,0.85));
          border-top:1px solid rgba(255,255,255,0.10);
          color:#fff; font-size:13px; font-weight:600;
          display:inline-flex; align-items:center; justify-content:center; gap:6px;
          box-shadow:0 4px 18px rgba(99,102,241,0.28);
          font-family:ui-sans-serif,system-ui,sans-serif;
          transition:transform .15s ease, box-shadow .15s ease;
        "
        onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 28px rgba(99,102,241,0.38)'"
        onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 18px rgba(99,102,241,0.28)'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="white" stroke-width="2.2" stroke-linecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15,3 21,3 21,9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          View Live
        </a>

        <button id="_closeBtn" style="
          flex:1; padding:12px; border-radius:12px; cursor:pointer;
          border:1px solid ${t.closeBorder};
          background:${t.closeBg}; color:${t.closeText};
          font-size:13px; font-weight:500;
          font-family:ui-sans-serif,system-ui,sans-serif;
          transition:all .15s ease;
        "
        onmouseover="this.style.background='${t.closeHoverBg}';this.style.color='${t.closeHoverTx}';this.style.borderColor='${t.closeHoverBr}'"
        onmouseout="this.style.background='${t.closeBg}';this.style.color='${t.closeText}';this.style.borderColor='${t.closeBorder}'"
        >Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('#_copyBtn').onclick = function() {
    navigator.clipboard.writeText(url).catch(() => {});
    this.textContent = 'Copied!';
    this.style.background  = 'rgba(34,197,94,0.15)';
    this.style.borderColor = 'rgba(34,197,94,0.40)';
    this.style.color       = 'rgba(34,197,94,0.90)';
    setTimeout(() => {
      this.textContent       = 'Copy';
      this.style.background  = 'rgba(99,102,241,0.12)';
      this.style.borderColor = 'rgba(99,102,241,0.35)';
      this.style.color       = 'rgba(99,102,241,0.90)';
    }, 2000);
  };
  modal.querySelector('#_closeBtn').onclick = () => modal.remove();
}

})();