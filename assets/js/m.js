/* Mobile app layer behaviour */
(() => {
  if (!matchMedia('(max-width:760px)').matches) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // reveal + counters + bars
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    $$('[data-mc]', e.target).concat(e.target.matches('[data-mc]') ? [e.target] : []).forEach(count);
  }), { threshold: .15 });
  $$('.m-r, .m-tg figure').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1; const to = +el.dataset.mc, t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  // swipe dots
  $$('.m-swipe[data-dots]').forEach(sw => {
    const dots = sw.nextElementSibling; if (!dots || !dots.classList.contains('m-dots')) return;
    const n = sw.children.length; dots.innerHTML = '<i class="on"></i>' + '<i></i>'.repeat(n - 1);
    sw.addEventListener('scroll', () => { const k = Math.round(sw.scrollLeft / (sw.children[0].offsetWidth + 12)); $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === k)); }, { passive: true });
  });
  // sheet
  const sheet = $('.m-sheet'), body = $('.m-sheet-body', sheet);
  const open = id => { const t = document.getElementById(id); if (!t) return; body.innerHTML = t.innerHTML; $('.m-sheet-card', sheet).scrollTop = 0; sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); document.body.classList.add('m-lock'); };
  const close = () => { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); document.body.classList.remove('m-lock'); };
  document.addEventListener('click', e => { const b = e.target.closest('[data-sheet]'); if (b) { e.preventDefault(); open(b.dataset.sheet); } });
  $$('[data-close]', sheet).forEach(b => b.addEventListener('click', close));
  let y0 = null; const card = $('.m-sheet-card', sheet);
  card.addEventListener('touchstart', e => { y0 = card.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  card.addEventListener('touchmove', e => { if (y0 === null) return; const d = e.touches[0].clientY - y0; if (d > 0) card.style.transform = `translateY(${d}px)`; }, { passive: true });
  card.addEventListener('touchend', e => { if (y0 === null) return; const d = e.changedTouches[0].clientY - y0; card.style.transform = ''; if (d > 110) close(); y0 = null; });
  // film
  const film = $('.m-film'), fv = $('video', film);
  $$('[data-film]').forEach(b => b.addEventListener('click', () => { film.classList.add('open'); document.body.classList.add('m-lock'); fv.play().catch(() => {}); }));
  $('[data-close]', film).addEventListener('click', () => { fv.pause(); film.classList.remove('open'); document.body.classList.remove('m-lock'); });
  // understand video
  const uv = $('.m-ut video'); if (uv) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? (uv.preload = 'auto', uv.play().catch(() => {})) : uv.pause()), { threshold: .4 }).observe(uv);
  // tab bar active state
  const tabs = $$('.m-tab a'), map = { 'm-home': 0, 'm-sides': 0, 'm-journey': 1, 'm-work': 2, 'm-und': 2, 'm-lessons': 2, 'm-teams': 2, 'm-ai': 3, 'm-skills': 3, 'm-ventures': 3, 'm-contact': 4 };
  const tabsIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const k = map[e.target.id]; tabs.forEach((t, i) => t.classList.toggle('on', i === k)); } }), { rootMargin: '-45% 0px -50% 0px' });
  $$('.m-sec').forEach(s => tabsIO.observe(s));
})();
