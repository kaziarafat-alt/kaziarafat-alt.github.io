/* fx.js: site-wide "cool" effects layer. Light, GPU-only transforms; respects reduced motion. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* 1. 3D tilt + glare on cards (desktop) */
  if (fine) {
    $$('.t-card, .b-s, .und-t, .cre-c figure, .cs-card, .duo-card, .proj, .k-img, .zt, .haya-v .hy2 img').forEach(el => {
      el.classList.add('fx-tilt'); const g = document.createElement('i'); g.className = 'fx-glare'; el.appendChild(g);
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateY(-4px)`;
        el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* 2. magnetic buttons */
    $$('.btn, .nav-cta, .say, a[class*="btn"], .play, .c-ways a, .m-btn').forEach(b => {
      b.classList.add('fx-mag');
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });

    /* 3. spotlight that follows the cursor on dark sections */
    $$('.ai, .und, .video-sec, footer.contact').forEach(s => {
      s.classList.add('fx-spot');
      s.addEventListener('pointermove', e => { const r = s.getBoundingClientRect(); s.style.setProperty('--sx', e.clientX - r.left + 'px'); s.style.setProperty('--sy', e.clientY - r.top + 'px'); });
    });
  }

  /* 4. text scramble on eyebrows when they enter */
  const CH = '!<>-_/[]{}=+*^?#ABCDEFXYZ01';
  const scramble = el => {
    const final = el.textContent; let f = 0; const total = 22;
    const tick = () => { el.textContent = final.split('').map((c, i) => c === ' ' || i < (f / total) * final.length ? c : CH[(Math.random() * CH.length) | 0]).join(''); if (f++ < total) requestAnimationFrame(tick); else el.textContent = final; };
    tick();
  };
  const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { scramble(e.target); sio.unobserve(e.target); } }), { threshold: .6 });
  $$('.eyebrow, .m-ey, .cs-k').forEach(el => { if (el.children.length === 0) sio.observe(el); });

  /* 6. scroll parallax + velocity skew on marquees */
  const par = $$('.ai-banner img, .inspire img, .hero-punch img, .m-heroimg img, .cs-five img');
  const marq = $$('.mid-band .mb-row, .ticker, .m-marq div');
  let lastY = scrollY, vel = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY; vel = vel * .8 + (y - lastY) * .2; lastY = y;
    par.forEach(img => { const r = img.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; img.style.translate = `0 ${p * -24}px`; });
    const sk = Math.max(-8, Math.min(8, vel * .25)); marq.forEach(m => m.style.setProperty('--skew', sk + 'deg'));
    document.documentElement.style.setProperty('--scrollp', (y / Math.max(1, document.body.scrollHeight - innerHeight)).toFixed(4));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* 7. tap ripple (all devices) */
  document.addEventListener('pointerdown', e => {
    const t = e.target.closest('button, a, .t-card, .b-s, .m-ti, .m-wc, .m-lc, .m-side'); if (!t) return;
    const r = t.getBoundingClientRect(), d = document.createElement('span'); d.className = 'fx-ripple';
    d.style.left = e.clientX - r.left + 'px'; d.style.top = e.clientY - r.top + 'px';
    if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
    t.style.overflow = 'hidden'; t.appendChild(d); setTimeout(() => d.remove(), 650);
  }, { passive: true });

  /* 8. phone: tilt the hero photo with device motion (if allowed without a prompt) */
  if (!fine && 'DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    const h = document.querySelector('.m-heroimg');
    if (h) addEventListener('deviceorientation', e => { if (e.gamma == null) return; h.style.transform = `perspective(800px) rotateY(${Math.max(-8, Math.min(8, e.gamma / 4))}deg) rotateX(${Math.max(-6, Math.min(6, (e.beta - 45) / 6))}deg)`; }, { passive: true });
  }
})();
