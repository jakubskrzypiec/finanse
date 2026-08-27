(() => {
  const $ = (s,c=document) => c.querySelector(s);
  const $$ = (s,c=document) => [...c.querySelectorAll(s)];

  // intro
  const intro = $('#intro');
  if (intro && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(() => document.body.classList.add('intro-reveal'), 1050);
    setTimeout(() => {
      document.body.classList.remove('intro-lock','intro-reveal');
      document.body.classList.add('intro-done');
    }, 2050);
  } else {
    document.body.classList.remove('intro-lock');
  }

  // progress
  const progress = $('.scroll-progress span');
  function onScroll(){
    if(progress){
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    }
  }
  addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // mobile menu
  const menu = $('.menu');
  const mobile = $('.mobile-nav');
  menu?.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    mobile.setAttribute('aria-hidden', String(!open));
  });
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', () => {
    mobile.classList.remove('open');
    menu?.setAttribute('aria-expanded','false');
    mobile.setAttribute('aria-hidden','true');
  }));

  // reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.12});
  $$('.reveal').forEach(el => io.observe(el));

  // hero parallax/tilt
  const visual = $('#financeVisual');
  const stack = $('#recommendStack');
  if(visual && stack && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    visual.addEventListener('pointermove', e => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      stack.style.transform = `rotateY(${x*7}deg) rotateX(${-y*6}deg) translate3d(${x*7}px,${y*5}px,0)`;
      $$('.floating-card', visual).forEach((card, i) => {
        const power = (i + 1) * 1.2;
        card.style.translate = `${x*power}px ${y*power}px`;
      });
    });
    visual.addEventListener('pointerleave', () => {
      stack.style.transform = '';
      $$('.floating-card', visual).forEach(card => card.style.translate = '');
    });
  }

  // magnetic buttons, subtle only
  if(matchMedia('(pointer:fine)').matches){
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * .08;
        const y = (e.clientY - r.top - r.height/2) * .08;
        btn.style.transform = `translate(${x}px,${y}px)`;
      });
      btn.addEventListener('pointerleave', () => btn.style.transform = '');
    });
  }
})();