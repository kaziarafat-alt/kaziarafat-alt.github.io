(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const qs = new URLSearchParams(location.search);
  const shot = qs.has('shot');

  /* Screenshot mode (?shot&s=#section): skip intro + reveal everything */
  if (shot) {
    document.documentElement.style.scrollBehavior = 'auto';
    const st = document.createElement('style'); st.textContent = '*{transition:none!important}'; document.head.appendChild(st);
    $('.loader').remove();
    document.body.classList.add('ready');
    $$('.reveal').forEach(el => el.classList.add('in'));
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count + (el.dataset.suffix || ''));
    addEventListener('load', () => {
      const s = qs.get('s'); if (s) { const t = $(s); if (t) t.scrollIntoView({ block: qs.get('b') || 'start' }); }
      setTimeout(() => {
        $('.nav').classList.toggle('scrolled', !!s && s !== '#top');
        const mid = innerHeight / 2, ch = $$('.chapter').find(c => { const r = c.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
        if (ch) setStage(+ch.dataset.ch, ch.dataset.year);
      }, 50);
    });
  } else {
    /* Preloader */
    const words = $$('.loader-words span');
    let wi = 0;
    const show = () => words.forEach((w, i) => w.classList.toggle('on', i === wi));
    show();
    const wt = setInterval(() => { wi++; if (wi >= words.length) { clearInterval(wt); return; } show(); }, reduce ? 40 : 160);
    setTimeout(() => { $('.loader').classList.add('done'); document.body.classList.add('ready'); }, reduce ? 150 : 900);
  }

  /* Nav + mobile menu */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menuBtn = $('.menu-btn');
  const toggleMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    $('.menu').setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* Dhaka clock */
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true });
  const tick = () => { const t = fmt.format(new Date()).toUpperCase(); $$('[data-clock]').forEach(el => el.textContent = t); };
  tick(); setInterval(tick, 15000);

  /* Hero word rotator */
  const rw = $$('.rot-w');
  if (rw.length && !reduce && !shot) {
    let ri = 0;
    setInterval(() => {
      const cur = rw[ri]; cur.classList.remove('on'); cur.classList.add('out');
      setTimeout(() => cur.classList.remove('out'), 700);
      ri = (ri + 1) % rw.length; rw[ri].classList.add('on');
    }, 2200);
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => {
    const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
    if (!shot) io.observe(el);
  });

  /* Counters */
  const cio = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      const t0 = performance.now(), dur = reduce ? 1 : 1500;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suf; if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step); cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  if (!shot) $$('[data-count]').forEach(el => cio.observe(el));

  /* Video film */
  const vf = $('.video-frame'), cv = $('#cv'), playBtn = $('.play'), prog = $('.vprog i');
  const startVideo = (t) => {
    if (typeof t === 'number') { try { cv.currentTime = t; } catch (e) {} }
    cv.controls = true; vf.classList.add('playing');
    const p = cv.play(); if (p && p.catch) p.catch(() => {});
  };
  playBtn.addEventListener('click', () => startVideo());
  const chBtns = $$('.chapters button');
  chBtns.forEach(b => b.addEventListener('click', () => {
    const t = +b.dataset.t;
    if (cv.readyState < 1) { cv.preload = 'auto'; cv.addEventListener('loadedmetadata', () => startVideo(t), { once: true }); cv.load(); vf.classList.add('playing'); cv.controls = true; }
    else startVideo(t);
    if (innerWidth < 861) vf.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }));
  cv.addEventListener('timeupdate', () => {
    let on = 0; chBtns.forEach((b, i) => { if (cv.currentTime >= +b.dataset.t) on = i; });
    chBtns.forEach((b, i) => b.classList.toggle('on', i === on));
    if (cv.duration) prog.style.width = (cv.currentTime / cv.duration * 100) + '%';
  });

  /* Story: sticky outfit stage (desktop) */
  const stageImgs = $$('[data-stage]'), dots = $$('.stage-dots i'), yearEl = $('[data-stage-year]');
  function setStage(n, year) {
    stageImgs.forEach(img => img.classList.toggle('is-on', +img.dataset.stage === n));
    $$('.chapter').forEach(c => c.classList.toggle('active', +c.dataset.ch === n));
    dots.forEach((d, i) => d.classList.toggle('on', i === n));
    if (yearEl && yearEl.textContent !== year) { yearEl.style.opacity = 0; setTimeout(() => { yearEl.textContent = year; yearEl.style.opacity = 1; }, 200); }
  }
  const sio = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) setStage(+e.target.dataset.ch, e.target.dataset.year); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  $$('.chapter').forEach(c => sio.observe(c));
  setStage(0, '2020');

  /* Galleries: drag to scroll on desktop, lightbox on click */
  const lb = $('.lightbox'), lbImg = $('img', lb);
  const openLB = (src, alt) => { lbImg.src = src; lbImg.alt = alt || ''; lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); };
  const closeLB = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); };
  lb.addEventListener('click', closeLB);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });
  $$('.gallery').forEach(g => {
    let down = false, sx = 0, sl = 0, moved = 0;
    if (finePointer) {
      g.addEventListener('pointerdown', e => { down = true; moved = 0; sx = e.clientX; sl = g.scrollLeft; g.classList.add('dragging'); });
      addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); g.scrollLeft = sl - dx; });
      addEventListener('pointerup', () => { if (down) { down = false; g.classList.remove('dragging'); } });
    }
    $$('.g-item', g).forEach(it => it.addEventListener('click', () => {
      if (moved > 6) return;
      const img = $('img', it); if (img && !it.classList.contains('logo-tile')) openLB(img.currentSrc || img.src, img.alt);
    }));
  });

  /* Magnetic buttons */
  if (finePointer) {
    $$('.magnetic, .play-ring').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
    $('.big-btn').style.transition = 'transform .5s cubic-bezier(.22,1,.36,1), background .3s';
  }

  /* Copy email */
  const toast = $('.toast');
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast.textContent = 'Email copied ✓'; }
    catch (e) { location.href = 'mailto:' + b.dataset.copy; return; }
    toast.classList.add('on'); setTimeout(() => toast.classList.remove('on'), 1800);
  }));

  /* ---------- Motion layer ---------- */
  const bar = $('.progress-bar i');
  const vis = $('.hero-visual');
  const speedEls = $$('[data-speed]');
  const htl = $('.htl'), htlTrack = $('.htl-track'), htlProg = $('.htl-progress i');
  const wide = () => innerWidth > 860;
  let ticking = false;
  const onFrame = () => {
    ticking = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    if (reduce) return;
    if (vis && y < innerHeight && finePointer) vis.style.transform = `translateY(${y * .08}px)`;
    speedEls.forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const c = (r.top + r.height / 2 - innerHeight / 2) * -(+el.dataset.speed);
      el.style.transform = `translateY(${c}px) scale(1.08)`;
    });
    if (htl && htlTrack && wide()) {
      const r = htl.getBoundingClientRect();
      const total = htl.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const dist = htlTrack.scrollWidth - innerWidth;
      htlTrack.style.transform = `translateX(${-p * dist}px)`;
      if (htlProg) htlProg.style.transform = `scaleX(${p})`;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
  addEventListener('resize', onFrame);
  onFrame();

  /* Split headings into words that rise in */
  $$('.split').forEach(el => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('i'); inner.style.setProperty('--i', i++); inner.textContent = part;
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    if (shot) el.classList.add('in'); else io.observe(el);
  });

  /* Cursor dot + card tilt (desktop) */
  if (finePointer && !reduce) {
    const dot = $('.cursor-dot');
    let mx = 0, my = 0, dx = 0, dy = 0;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.classList.add('on'); });
    const follow = () => { dx += (mx - dx) * .2; dy += (my - dy) * .2; dot.style.transform = `translate(${dx}px,${dy}px)`; requestAnimationFrame(follow); };
    follow();
    $$('a, button, .g-item, .tilt').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('big'));
      el.addEventListener('mouseleave', () => dot.classList.remove('big'));
    });
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- v6: rotator pill width + slide-in panels ---------- */
  const rot = $('.hero-role .rot');
  const fitRot = () => { if (!rot) return; const on = $('.rot-w.on', rot) || $('.rot-w', rot); rot.style.width = (on.offsetWidth + 24) + 'px'; };
  fitRot(); addEventListener('resize', fitRot);
  if (rot) new MutationObserver(fitRot).observe(rot, { subtree: true, attributes: true, attributeFilter: ['class'] });
  if (document.fonts) document.fonts.ready.then(fitRot);

  const slides = $$('[data-slide]');
  const slideFrame = () => {
    if (reduce || shot) return;
    slides.forEach(el => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .75)));
      const sc = .9 + .1 * p, y = (1 - p) * 60, rad = 48 - 24 * p;
      el.style.transform = `translateY(${y}px) scale(${sc})`;
      el.style.borderRadius = `${rad}px ${rad}px 24px 24px`;
    });
  };
  let slideTick = false;
  addEventListener('scroll', () => { if (!slideTick) { slideTick = true; requestAnimationFrame(() => { slideTick = false; slideFrame(); }); } }, { passive: true });
  slideFrame();

  /* ---------- v7: teams pinned horizontal track ---------- */
  const tPin = $('.t-pin'), tTrack = $('.t-track');
  if (tPin && tTrack) {
    const tCards = $$('.t-card', tTrack), tCount = $('.t-count b'), tLine = $('.t-line i');
    const wide = () => matchMedia('(min-width:861px)').matches && !reduce && !shot;
    const tSize = () => {
      if (!wide()) { tPin.style.height = ''; tTrack.style.transform = ''; return; }
      const dist = tTrack.scrollWidth - document.documentElement.clientWidth;
      tPin.style.height = (innerHeight + Math.max(0, dist)) + 'px';
      tFrame();
    };
    const tSet = (p) => {
      const n = Math.min(tCards.length, Math.floor(p * tCards.length) + 1);
      if (tCount) tCount.textContent = String(n).padStart(2, '0');
      if (tLine) tLine.style.transform = `scaleX(${Math.max(.04, p)})`;
      tCards.forEach((c, k) => c.classList.toggle('on', k === n - 1));
    };
    const tFrame = () => {
      if (!wide()) {
        const p = tTrack.scrollLeft / Math.max(1, tTrack.scrollWidth - tTrack.clientWidth);
        tSet(Math.min(.999, p)); return;
      }
      const r = tPin.getBoundingClientRect();
      const span = tPin.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
      tTrack.style.transform = `translate3d(${-p * (tTrack.scrollWidth - document.documentElement.clientWidth)}px,0,0)`;
      tSet(Math.min(.999, p));
    };
    let tTick = false;
    const tOnScroll = () => { if (!tTick) { tTick = true; requestAnimationFrame(() => { tTick = false; tFrame(); }); } };
    addEventListener('scroll', tOnScroll, { passive: true });
    tTrack.addEventListener('scroll', tOnScroll, { passive: true });
    addEventListener('resize', tSize);
    addEventListener('load', tSize);
    tSize(); tFrame();
  }
})();
