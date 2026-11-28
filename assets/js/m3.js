/* Mobile v3: scale each 300px design screen to the phone width, play its motion when it enters view, keep the tab bar in sync */
(() => {
  const mq = matchMedia('(max-width:760px)');
  if (!mq.matches) return;
  const secs = [...document.querySelectorAll('#m .m3s')];
  const fit = () => {
    const k = document.documentElement.clientWidth / 300;
    secs.forEach(s => { const z = s.firstElementChild; z.style.transform = `scale(${k})`; s.style.height = z.offsetHeight * k + 'px'; });
  };
  fit(); addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 200));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .25 });
  secs.forEach(s => io.observe(s));
  const tabs = [...document.querySelectorAll('.m-tab a')];
  const map = { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 3, 13: 3, 14: 3, 15: 4, 16: 4 };
  const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const k = map[+e.target.id.split('-')[1]]; tabs.forEach((t, i) => t.classList.toggle('on', i === k)); } }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => tio.observe(s));
})();
