/* MAGENTS v4 · Figuren, Filzflicken, Formular, Mensch/Maschine */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MAIL = 'contact@magents.store';

  /* ---------- Naht in jeden Filzflicken nähen ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('.patch').forEach((p) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'seam');
    svg.setAttribute('aria-hidden', 'true');
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', '1'); r.setAttribute('y', '1');
    r.setAttribute('width', '0'); r.setAttribute('height', '0');
    r.setAttribute('rx', '9');
    svg.appendChild(r);
    p.appendChild(svg);
    const fit = () => {
      const w = svg.clientWidth, h = svg.clientHeight;
      if (w && h) { r.setAttribute('width', String(w - 2)); r.setAttribute('height', String(h - 2)); }
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(p);
    p.addEventListener('click', () => {
      if (reduce.matches) return;
      p.classList.remove('squish'); void p.offsetWidth; p.classList.add('squish');
    });
  });

  /* ---------- Bilder je Zustand: <name>_hover.webp / <name>_klick.webp werden benutzt, sobald sie liegen ---------- */
  const variants = {};
  const probe = (name, state) => new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img.src);
    img.onerror = () => res(null);
    img.src = `img/figuren/${name}_${state}.webp`;
  });
  const figs = Array.from(document.querySelectorAll('.fig'));
  const names = [...new Set(figs.map((f) => f.dataset.fig))];
  // Leise prüfen, ohne Fehler in die Konsole zu schreiben: Liste aus img/figuren/zustaende.json
  fetch('img/figuren/zustaende.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then(async (list) => {
      for (const n of names) {
        variants[n] = { rest: `img/figuren/${n}.webp` };
        for (const s of ['hover', 'klick']) {
          if (list && Array.isArray(list[n]) && list[n].includes(s)) {
            const src = await probe(n, s);
            if (src) variants[n][s] = src;
          }
        }
      }
    });
  const setImg = (fig, state) => {
    const v = variants[fig.dataset.fig];
    const img = fig.querySelector('.fig-img');
    if (!v || !img) return;
    const src = v[state] || v.rest;
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  };
  const restState = (fig) => (fig.getAttribute('aria-expanded') === 'true' ? 'klick' : 'rest');

  /* ---------- Figuren: Zeigen, Fokus, Klick ---------- */
  const dealCard = document.getElementById('deal-card');
  const dealBody = dealCard ? dealCard.querySelector('.card-body') : null;
  const notch = dealCard ? dealCard.querySelector('.card-notch') : null;

  const closeAll = (except) => {
    figs.forEach((f) => {
      if (f === except || f.getAttribute('aria-expanded') !== 'true') return;
      f.setAttribute('aria-expanded', 'false');
      setImg(f, 'rest');
      if (!except || except.dataset.card !== f.dataset.card) {
        const c = document.getElementById(f.dataset.card);
        if (c) { c.hidden = true; c.classList.remove('open'); }
      }
    });
  };

  const placeNotch = (fig) => {
    if (!notch) return;
    const cr = dealCard.getBoundingClientRect();
    const fr = fig.getBoundingClientRect();
    const x = Math.min(Math.max(fr.left + fr.width / 2 - cr.left, 24), cr.width - 24);
    dealCard.style.setProperty('--notch', `${x}px`);
  };

  const open = (fig) => {
    closeAll(fig);
    const card = document.getElementById(fig.dataset.card);
    if (!card) return;
    fig.setAttribute('aria-expanded', 'true');
    setImg(fig, 'klick');
    if (card === dealCard) {
      const tpl = document.getElementById(`tpl-${fig.dataset.fig}`);
      dealBody.replaceChildren(tpl.content.cloneNode(true));
      dealCard.setAttribute('aria-label', fig.querySelector('.fig-name').textContent);
    }
    card.hidden = false;
    card.classList.remove('open'); void card.offsetWidth; card.classList.add('open');
    if (card === dealCard) placeNotch(fig);
    if (!reduce.matches) {
      const cls = fig.dataset.fig === 'dash' ? 'run' : 'hop';
      fig.classList.remove('hop', 'run'); void fig.offsetWidth; fig.classList.add(cls);
      setTimeout(() => fig.classList.remove(cls), 1200);
    }
  };

  const close = (fig) => {
    fig.setAttribute('aria-expanded', 'false');
    setImg(fig, 'rest');
    const card = document.getElementById(fig.dataset.card);
    if (card) { card.hidden = true; card.classList.remove('open'); }
  };

  figs.forEach((fig) => {
    // <button> löst bei Enter und Leertaste von selbst "click" aus
    fig.addEventListener('click', () => {
      if (fig.getAttribute('aria-expanded') === 'true') close(fig); else open(fig);
    });
    fig.addEventListener('pointerenter', () => setImg(fig, fig.getAttribute('aria-expanded') === 'true' ? 'klick' : 'hover'));
    fig.addEventListener('pointerleave', () => setImg(fig, restState(fig)));
    fig.addEventListener('focus', () => { if (fig.matches(':focus-visible')) setImg(fig, restState(fig) === 'klick' ? 'klick' : 'hover'); });
    fig.addEventListener('blur', () => setImg(fig, restState(fig)));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openFig = figs.find((f) => f.getAttribute('aria-expanded') === 'true');
    if (openFig) { close(openFig); openFig.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('.fig, .card')) return;
    figs.filter((f) => f.getAttribute('aria-expanded') === 'true').forEach(close);
  });
  window.addEventListener('resize', () => {
    const f = figs.find((x) => x.getAttribute('aria-expanded') === 'true' && x.dataset.card === 'deal-card');
    if (f) placeNotch(f);
  });

  /* ---------- Knöpfe wählen die Rolle im Formular vor ---------- */
  const form = document.getElementById('join-form');
  document.querySelectorAll('[data-role-pick]').forEach((a) => {
    a.addEventListener('click', () => {
      const radio = form && form.querySelector(`input[name="role"][value="${a.dataset.rolePick}"]`);
      if (radio) radio.checked = true;
      const email = document.getElementById('f-email');
      if (email) setTimeout(() => email.focus({ preventScroll: true }), reduce.matches ? 0 : 650);
    });
  });

  /* ---------- Formular: prüft, öffnet eine fertige Mail an contact@magents.store ---------- */
  if (form) {
    const email = form.querySelector('#f-email');
    const err = form.querySelector('#err-email');
    const done = form.querySelector('#form-done');
    const roleText = { shop: 'a shop', builder: 'a developer', buyer: 'running a buyer agent' };
    const subj = { shop: 'Put my shop on MAGENTS', builder: 'Connect my own agent', buyer: 'Test with my buyer agent' };
    const check = () => {
      const v = email.value.trim();
      let msg = '';
      if (!v) msg = 'Please enter your email, so we can write back.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'This email looks incomplete. Please check it.';
      err.textContent = msg;
      email.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    email.addEventListener('blur', () => { if (email.value) check(); });
    email.addEventListener('input', () => { if (email.getAttribute('aria-invalid') === 'true') check(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!check()) { email.focus(); return; }
      const fd = new FormData(form);
      const role = fd.get('role') || 'shop';
      const body = [
        `I am ${roleText[role]}.`,
        `Email: ${fd.get('email')}`,
        fd.get('site') ? `Shop or website: ${fd.get('site')}` : '',
        fd.get('note') ? `\n${fd.get('note')}` : '',
      ].filter(Boolean).join('\n');
      const href = `mailto:${MAIL}?subject=${encodeURIComponent('MAGENTS: ' + subj[role])}&body=${encodeURIComponent(body)}`;
      done.textContent = `Your mail app opens with your request to ${MAIL}. Send it there and we write back.`;
      window.location.href = href;
    });
  }

  /* ---------- Kopieren ---------- */
  document.querySelectorAll('[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      const src = document.querySelector(b.dataset.copy);
      if (!src) return;
      try { await navigator.clipboard.writeText(src.textContent); b.textContent = 'Copied'; }
      catch { b.textContent = 'Select and copy'; }
      setTimeout(() => { b.textContent = 'Copy'; }, 1800);
    });
  });

  /* ---------- Zwei Eingänge: Human / Machine ---------- */
  const human = document.getElementById('human-view');
  const machine = document.getElementById('machine-view');
  const ld = document.getElementById('jsonld');
  const ldView = document.getElementById('jsonld-view');
  if (ld && ldView) {
    try { ldView.textContent = JSON.stringify(JSON.parse(ld.textContent), null, 2); } catch { ldView.textContent = ld.textContent.trim(); }
  }
  const setView = (view, scroll) => {
    const m = view === 'machine';
    machine.hidden = !m; human.hidden = m;
    document.querySelectorAll('.entry-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    const url = new URL(window.location.href);
    if (m) url.searchParams.set('view', 'machine'); else url.searchParams.delete('view');
    history.replaceState(null, '', url);
    if (scroll === 'deal' && !m) document.getElementById('deal').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
    if (m) window.scrollTo({ top: 0 });
  };
  document.querySelectorAll('.entry-btn').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view, b.dataset.view === 'human' ? 'deal' : null)));
  document.querySelectorAll('[data-view-link]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); setView(a.dataset.viewLink); }));
  if (new URLSearchParams(window.location.search).get('view') === 'machine') setView('machine');
})();
