/* City-Besuch: Szenen-Videos spielen, solange sie im Bild sind (nicht bei "weniger Bewegung") */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vids = [...document.querySelectorAll('.scene video')];
  if (!vids.length || reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { const p = e.target.play(); if (p && p.catch) p.catch(() => {}); } else e.target.pause();
  }), { threshold: 0.4 });
  vids.forEach((v) => io.observe(v));
})();
