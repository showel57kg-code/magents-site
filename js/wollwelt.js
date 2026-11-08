// MAGENTS Wollwelt: Staub, Mensch/Maschine-Schalter, echte Maschinendateien laden, Kopieren, Rollen-Vorwahl, Mail-Formular.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Staubteilchen im Nachthimmel (bei reduzierter Bewegung stehen sie still, siehe CSS)
  $$('[data-dust]').forEach(box => {
    const n = +box.dataset.dust || 24, cols = ['#ffffff', '#B6FF00', '#ff6ad5', '#7dffe6', '#c9b2ff'];
    let seed = 7;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i');
      const size = 1.5 + r() * 3.5;
      d.style.cssText = `left:${(r() * 100).toFixed(1)}%;top:${(10 + r() * 80).toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
        `--c:${cols[i % cols.length]};--d:${(10 + r() * 14).toFixed(1)}s;--delay:${(-r() * 20).toFixed(1)}s;--o:${(0.35 + r() * 0.5).toFixed(2)}`;
      box.appendChild(d);
    }
  });

  // Maschinendateien: echte Dateien laden, keine Kopie
  const loaded = {};
  async function load(src) {
    if (loaded[src]) return loaded[src];
    if (src.startsWith('#')) {
      const el = $(src);
      return (loaded[src] = el ? JSON.stringify(JSON.parse(el.textContent), null, 2) : 'not found');
    }
    try {
      const res = await fetch(src, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status);
      let t = await res.text();
      if (src.endsWith('.json')) t = JSON.stringify(JSON.parse(t), null, 2);
      return (loaded[src] = t);
    } catch (e) {
      return `Could not load ${src} here. Open it directly: ${src}`;
    }
  }
  const card = $('#card-live');
  if (card) {
    const io = new IntersectionObserver(async ents => {
      if (ents.some(e => e.isIntersecting)) { io.disconnect(); card.textContent = await load('.well-known/agent-card.json'); }
    }, { rootMargin: '400px' });
    io.observe(card);
  }

  // Mensch / Maschine
  const human = $('#human-view'), machine = $('#machine-view');
  async function setView(v, push) {
    const isM = v === 'machine';
    human.hidden = isM; machine.hidden = !isM;
    document.body.classList.toggle('is-machine', isM);
    $$('.view-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    if (push) { const u = new URL(location.href); u.searchParams.set('view', v); u.hash = ''; history.replaceState(null, '', u); }
    if (isM) {
      for (const pre of $$('pre[data-src]', machine)) pre.textContent = await load(pre.dataset.src);
      window.scrollTo(0, 0);
      $('#mv-title').focus({ preventScroll: true });
    }
  }
  $('#mv-title')?.setAttribute('tabindex', '-1');
  $$('.view-switch button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view, true)));
  $$('[data-view-link]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); setView(a.dataset.viewLink, true); }));
  if (new URLSearchParams(location.search).get('view') === 'machine') setView('machine', false);

  // Kopieren
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const t = $(b.dataset.copy)?.textContent || '';
    try { await navigator.clipboard.writeText(t); b.textContent = 'Copied'; } catch (e) { b.textContent = 'Select & copy'; }
    setTimeout(() => (b.textContent = 'Copy'), 1600);
  }));

  // Rollen-Vorwahl: Knopf waehlt die passende Rolle im Formular
  $$('[data-role-pick]').forEach(a => a.addEventListener('click', () => {
    const r = $(`#join-form input[name=role][value="${a.dataset.rolePick}"]`);
    if (r) r.checked = true;
    if (document.body.classList.contains('is-machine')) setView('human', true);
  }));

  // Formular: oeffnet das Mailprogramm, sendet selbst nichts
  const form = $('#join-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), mail = String(f.get('email') || '').trim(), err = $('#email-err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { err.textContent = 'Please enter a valid email address.'; form.email.focus(); return; }
    err.textContent = '';
    const roles = { shop: 'shop', builder: 'builder', buyer: 'buyer agent' };
    const role = roles[f.get('role')] || 'shop';
    const body = `Role: ${role}\nEmail: ${mail}\nWebsite: ${f.get('website') || '-'}\n\n${f.get('note') || ''}`;
    location.href = `mailto:contact@ordosphere.com?subject=${encodeURIComponent('MAGENTS – ' + role)}&body=${encodeURIComponent(body)}`;
    $('#form-note').innerHTML = 'Your mail app should open now with the message ready. If nothing happens, write to <a href="mailto:contact@ordosphere.com">contact@ordosphere.com</a>.';
  });
})();
