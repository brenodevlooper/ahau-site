/* =========================================================
   AHAU — animação controlada por scroll
   Receita do protótipo da Moulin: pin + scrub, parallax,
   máscara circular, texto escalonado e Lenis.
   Pin e trilho travado só acima de 820px.
   ========================================================= */
(function () {
  var nav = document.querySelector('.nav');
  function navState() { nav.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', navState, { passive: true });
  navState();

  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!hasGSAP) return;                 // fallback do CSS assume
  document.body.classList.remove('no-gsap');
  gsap.registerPlugin(ScrollTrigger);

  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 820px)').matches;

  /* ---------- scroll suavizado ---------- */
  if (typeof window.Lenis !== 'undefined' && !isMobile) {
    var lenis = new Lenis({ lerp: reduced ? 1 : 0.09 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', navState);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var alvo = document.querySelector(a.getAttribute('href'));
        if (!alvo) return;
        e.preventDefault();
        lenis.scrollTo(alvo, { offset: 0 });
      });
    });
  }

  /* ---------- barra de progresso ---------- */
  gsap.to('.progress span', {
    width: '100%', ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true }
  });

  /* ---------- HERO ---------- */
  var stage = document.querySelector('.hero__stage');
  if (!isMobile) {
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=170%', pin: stage, scrub: 0.6, anticipatePin: 1 }
    })
      .fromTo(stage, { '--ringScale': 0.62 }, { '--ringScale': 6, ease: 'power2.in' }, 0)
      .fromTo(stage, { '--ringOpacity': 0.9 }, { '--ringOpacity': 0, ease: 'power2.in' }, 0.05)
      .fromTo(stage, { '--r': '0%' }, { '--r': '145%', ease: 'power2.inOut' }, 0.08)
      .fromTo(stage, { '--imgScale': 1.4 }, { '--imgScale': 1, ease: 'none' }, 0)
      .fromTo(stage, { '--typeY': '0px' }, { '--typeY': '-90px', ease: 'none' }, 0)
      .fromTo(stage, { '--typeScale': 1 }, { '--typeScale': 1.2, ease: 'none' }, 0)
      .fromTo(stage, { '--typeOpacity': 1 }, { '--typeOpacity': 0, ease: 'power2.in' }, 0.12)
      .fromTo('.hero__caption', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.7);
    gsap.to('.hero__hint', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=20%', scrub: true }
    });
  } else {
    gsap.set(stage, { '--r': '145%', '--ringOpacity': 0, '--typeOpacity': 0 });
    gsap.set('.hero__hint', { display: 'none' });
    gsap.fromTo(stage, { '--imgScale': 1.2 }, {
      '--imgScale': 1, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- texto entrando linha a linha ---------- */
  document.querySelectorAll('.reveal').forEach(function (el) {
    gsap.to(el.querySelectorAll('span'), {
      y: '0%', opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  /* ---------- blocos que sobem (pilares, galerias, passos) ---------- */
  gsap.utils.toArray('.pillars, .gallery figure, .feats li, .uses__grid, .steps__list li, .split__img').forEach(function (el) {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* ---------- foto larga abrindo por máscara ---------- */
  gsap.utils.toArray('.wide').forEach(function (el) {
    gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: true }
    });
    gsap.fromTo(el.querySelector('img'), { scale: 1.18 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- parallax ---------- */
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var f = parseFloat(el.dataset.parallax) || 0.12;
    gsap.fromTo(el, { yPercent: -f * 100 }, {
      yPercent: f * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- título do projeto subindo sobre a capa ---------- */
  gsap.utils.toArray('.project__title').forEach(function (el) {
    gsap.from(el.children, {
      y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- FÁBRICA: trilho horizontal travado (desktop) ---------- */
  if (!isMobile) {
    var track = document.querySelector('.factory__track');
    var dist = function () { return track.scrollWidth - (window.innerWidth - track.getBoundingClientRect().left) + 40; };
    // título e fotos andam juntos: o título sai pela esquerda em vez de ficar aparecendo entre as fotos
    gsap.to(['.factory__intro', track], {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: '.factory', start: 'top top', end: function () { return '+=' + dist(); },
        pin: '.factory__stage', scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
  }
})();

/* remede depois que fontes e imagens carregam (evita pin desalinhado) */
if (window.ScrollTrigger) {
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
}
