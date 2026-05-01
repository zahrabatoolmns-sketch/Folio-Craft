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
    showNote('⚠️ No portfolio data found. Please complete the wizard first.', 'error');
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
    showNote(' iframe#previewFrame not found in HTML.', 'error');
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
        showNote(' Could not fetch template files. Make sure you are using a local server.', 'error');
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
      '╔══════════════════════════════════════════╗',
      '║        FolioCraft — Your Portfolio       ║',
      '╚══════════════════════════════════════════╝',
      '', 'Name     : ' + name, 'Title    : ' + title,
      'Template : ' + template, 'Built    : ' + new Date().toLocaleString(), '',
      '── HOW TO VIEW ──────────────────────────────',
      '  Open index.html in any browser. No server needed.',
      '', '── HOW TO DEPLOY ────────────────────────────', '',
      '   Netlify Drop: netlify.com/drop → drag this folder',
      '   GitHub Pages: Push → Settings → Pages → Deploy',
      '  Vercel: npm i -g vercel && vercel',
      '', '─────────────────────────────────────────────',
      'Generated by FolioCraft',
    ].join('\n');
  }
  
/* QR — CONTACT (vCard) */
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


/*  QR — WEBSITE URL */

document.getElementById('qrWebsiteBtn')?.addEventListener('click', function() {
  const btn = this;

  // User se URL lo
  const url = prompt(
    ' Enter your portfolio website URL:\n\n' +
    'Example:\n' +
    '  https://yourname.netlify.app\n' +
    '  https://yourname.github.io\n\n' +
    '(First host the portfolio then paste URL here)'
  );

  if (!url || !url.trim()) return;

  // Basic URL validation
  let finalUrl = url.trim();
  if (!finalUrl.startsWith('http')) {
    finalUrl = 'https://' + finalUrl;
  }

  const name = D.fullname || D.fullName || D.name || 'portfolio';
  generateAndDownloadQR(finalUrl, slug(name) + '-website-qr.png', btn, '🔗 QR Website');
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
})();