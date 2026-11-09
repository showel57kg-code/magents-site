/* MAGENTS v6 · Erklär-Strecke: aktive Szene nach Scroll-Position, Video je Figur einmal pro Auftritt */
(() => {
  'use strict';
  const root = document.getElementById('story');
  if (!root) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const steps = [...root.querySelectorAll('.step')];
  const actors = [...root.querySelectorAll('.actor')];
  const stage = root.querySelector('.story-stage');
  let current = -1;
  if (reduce.matches) root.querySelectorAll('video').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });

  const show = (i) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    actors.forEach((a) => {
      const on = (a.dataset.step || '').split(',').includes(String(i));
      a.classList.toggle('is-on', on);
      const v = a.querySelector('video');
      if (!v) return;
      if (on && !reduce.matches) { try { v.currentTime = 0; } catch (e) {} const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    });
  };

  let queued = false;
  const pick = () => {
    queued = false;
    const vh = window.innerHeight;
    const sb = stage.getBoundingClientRect();
    const mobile = window.matchMedia('(max-width: 900px)').matches;
    let best = 0;
    if (mobile) {
      // Text steht unter der Bühne: aktiv ist die letzte Szene, deren Kopf die Linie unter der Bühne erreicht hat
      const line = sb.bottom + 40;
      steps.forEach((s, k) => { if (s.getBoundingClientRect().top <= line) best = k; });
    } else {
      const line = vh * 0.5; let bd = Infinity;
      steps.forEach((s, k) => {
        const r = s.getBoundingClientRect();
        const d = line < r.top ? r.top - line : line > r.bottom ? line - r.bottom : 0;
        const score = d * 1000 + Math.abs((r.top + r.bottom) / 2 - line);
        if (score < bd) { bd = score; best = k; }
      });
    }
    show(best);
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(pick); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  pick();
})();
