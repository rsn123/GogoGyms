/* ============================================================
   GOGO GYMS — behaviour
   ============================================================ */
(function(){
  'use strict';

  /* ---------- nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, {passive:true});

  /* ---------- mobile drawer ---------- */
  const drawer = document.getElementById('drawer');
  const scrim  = document.getElementById('scrim');
  const openD = () => { drawer.classList.add('open'); scrim.classList.add('open'); };
  const closeD = () => { drawer.classList.remove('open'); scrim.classList.remove('open'); };
  document.getElementById('hamb').addEventListener('click', openD);
  document.getElementById('dclose').addEventListener('click', closeD);
  scrim.addEventListener('click', closeD);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeD));

  /* ---------- language toggle ---------- */
  let lang = localStorage.getItem('gg_lang') || 'bg';
  function applyLang(l){
    lang = l;
    localStorage.setItem('gg_lang', l);
    document.documentElement.lang = l;
    document.querySelectorAll('[data-bg]').forEach(el => {
      const val = el.getAttribute('data-' + l);
      if (val === null) return;
      if (el.hasAttribute('data-attr')) el.setAttribute(el.getAttribute('data-attr'), val);
      else el.textContent = val;
      if (el.classList.contains('electric-text')) el.setAttribute('data-text', val);
    });
    document.querySelectorAll('.lang button, .langm button').forEach(b =>
      b.classList.toggle('on', b.dataset.l === l));
  }
  document.querySelectorAll('.lang button, .langm button').forEach(b =>
    b.addEventListener('click', () => applyLang(b.dataset.l)));
  applyLang(lang);

  /* ---------- hero slideshow ---------- */
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots   = [...document.querySelectorAll('.hero-dots button')];
  let hi = 0, heroTimer;
  function showHero(i){
    slides[hi].classList.remove('on');
    if (dots[hi]) dots[hi].classList.remove('on');
    hi = (i + slides.length) % slides.length;
    slides[hi].classList.add('on');
    // restart ken-burns
    const bg = slides[hi].firstElementChild;
    if (bg){ bg.style.animation = 'none'; void bg.offsetWidth; bg.style.animation = ''; }
    if (dots[hi]) dots[hi].classList.add('on');
  }
  function startHero(){ heroTimer = setInterval(() => showHero(hi + 1), 5200); }
  function resetHero(){ clearInterval(heroTimer); startHero(); }
  dots.forEach((d,i) => d.addEventListener('click', () => { showHero(i); resetHero(); }));
  if (slides.length) startHero();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.16});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- facility cards → lightbox gallery ---------- */
  const zones = window.GG_FACILITY || [];
  const lb        = document.getElementById('lb');
  if (lb && zones.length){
    const lbImg    = document.getElementById('lbImg');
    const lbKind   = document.getElementById('lbKind');
    const lbTitle  = document.getElementById('lbTitle');
    const lbCount  = document.getElementById('lbCount');
    const lbThumbs = document.getElementById('lbThumbs');
    let zi = 0, pi = 0;

    function renderThumbs(){
      const photos = zones[zi].photos;
      lbThumbs.innerHTML = photos.map((src,k) =>
        `<img src="${src}" alt="" data-i="${k}" class="${k===pi?'on':''}" />`).join('');
    }
    function show(i){
      const photos = zones[zi].photos;
      pi = (i + photos.length) % photos.length;
      lbImg.src = photos[pi];
      lbCount.innerHTML = `<b>${String(pi+1).padStart(2,'0')}</b> / ${String(photos.length).padStart(2,'0')}`;
      lbThumbs.querySelectorAll('img').forEach((t,k) => t.classList.toggle('on', k === pi));
    }
    function open(zoneIdx){
      zi = zoneIdx; pi = 0;
      const z = zones[zi];
      lbKind.textContent  = z.kind[lang];
      lbTitle.textContent = z.title[lang];
      renderThumbs();
      show(0);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }
    function close(){
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.fac-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.fac-coach-btn, .fac-coach')) return; // coach controls handle themselves
        open(+card.dataset.zone);
      });
      card.addEventListener('keydown', e => {
        if (e.target.closest('.fac-coach-btn, .fac-coach')) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(+card.dataset.zone); }
      });
    });

    // group-classes coach info toggle (does not open the gallery)
    document.querySelectorAll('.fac-coach-btn').forEach(btn =>
      btn.addEventListener('click', e => {
        e.stopPropagation();
        btn.closest('.fac-card-coach').classList.toggle('coach-open');
      }));

    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', () => show(pi - 1));
    document.getElementById('lbNext').addEventListener('click', () => show(pi + 1));
    lb.querySelectorAll('[data-lb-close]').forEach(el => el.addEventListener('click', close));
    lbThumbs.addEventListener('click', e => {
      const t = e.target.closest('img'); if (t) show(+t.dataset.i);
    });

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(pi + 1);
      else if (e.key === 'ArrowLeft') show(pi - 1);
    });

    // swipe on touch
    let tx = 0;
    lb.querySelector('.lb-stage').addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
    lb.querySelector('.lb-stage').addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) show(pi + (dx < 0 ? 1 : -1));
    }, {passive:true});
  }

  /* ---------- TWEAKS ---------- */
  const TWEAKS = /*EDITMODE-BEGIN*/{
    "accent": "#4A90E2",
    "heroDim": 0.62,
    "energyLines": true
  }/*EDITMODE-END*/;
  const root = document.documentElement;
  const panel = document.getElementById('tweaks');
  const twDim = document.getElementById('twDim'), twDimV = document.getElementById('twDimV');
  const twEnergy = document.getElementById('twEnergy');
  const heroEnergy = document.querySelector('.hero-energy');

  function applyTweaks(){
    root.style.setProperty('--accent', TWEAKS.accent);
    root.style.setProperty('--blue', TWEAKS.accent);
    root.style.setProperty('--hero-dim', TWEAKS.heroDim);
    if (heroEnergy) heroEnergy.style.display = TWEAKS.energyLines ? '' : 'none';
    if (twDim){ twDim.value = TWEAKS.heroDim; twDimV.textContent = Math.round(TWEAKS.heroDim*100)+'%'; }
    if (twEnergy) twEnergy.checked = TWEAKS.energyLines;
    document.querySelectorAll('#twAccent button').forEach(b => b.classList.toggle('on', b.dataset.c === TWEAKS.accent));
  }
  function persist(edits){ try{ window.parent.postMessage({type:'__edit_mode_set_keys', edits}, '*'); }catch(e){} }
  applyTweaks();

  if (twDim) twDim.addEventListener('input', () => {
    TWEAKS.heroDim = parseFloat(twDim.value);
    root.style.setProperty('--hero-dim', TWEAKS.heroDim);
    twDimV.textContent = Math.round(TWEAKS.heroDim*100)+'%';
    persist({heroDim:TWEAKS.heroDim});
  });
  if (twEnergy) twEnergy.addEventListener('change', () => {
    TWEAKS.energyLines = twEnergy.checked;
    if (heroEnergy) heroEnergy.style.display = TWEAKS.energyLines ? '' : 'none';
    persist({energyLines:TWEAKS.energyLines});
  });
  document.querySelectorAll('#twAccent button').forEach(b => b.addEventListener('click', () => {
    TWEAKS.accent = b.dataset.c;
    root.style.setProperty('--accent', TWEAKS.accent);
    root.style.setProperty('--blue', TWEAKS.accent);
    document.querySelectorAll('#twAccent button').forEach(x => x.classList.toggle('on', x === b));
    persist({accent:TWEAKS.accent});
  }));

  // host protocol
  window.addEventListener('message', e => {
    const t = e.data && e.data.type;
    if (t === '__activate_edit_mode') panel.classList.add('open');
    else if (t === '__deactivate_edit_mode') panel.classList.remove('open');
  });
  const twClose = document.getElementById('twClose');
  if (twClose) twClose.addEventListener('click', () => {
    panel.classList.remove('open');
    try{ window.parent.postMessage({type:'__edit_mode_dismissed'}, '*'); }catch(e){}
  });
  try{ window.parent.postMessage({type:'__edit_mode_available'}, '*'); }catch(e){}

  window.GG_setLang = (l) => applyLang(l);
})();
