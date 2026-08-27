(() => {
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];
  const header = $('.nav-shell');
  const menuBtn = $('.menu-btn');
  const mobile = $('.mobile-menu');

  const onScroll = () => header.classList.toggle('scrolled', scrollY > 18);
  onScroll(); addEventListener('scroll', onScroll, {passive:true});

  menuBtn?.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    mobile.setAttribute('aria-hidden', String(!open));
  });
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
    mobile.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); mobile.setAttribute('aria-hidden','true');
  }));

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
  }), {threshold:.13});
  $$('.reveal').forEach(el => io.observe(el));

  const counters = $$('[data-count]');
  const counterIO = new IntersectionObserver(entries => entries.forEach(e => {
    if(!e.isIntersecting) return;
    const el=e.target, end=+el.dataset.count, suffix=el.dataset.suffix||''; let start=0; const t0=performance.now();
    const tick=t=>{ const p=Math.min(1,(t-t0)/900); el.textContent=Math.round(end*(1-Math.pow(1-p,3)))+suffix; if(p<1)requestAnimationFrame(tick); };
    requestAnimationFrame(tick); counterIO.unobserve(el);
  }),{threshold:.5});
  counters.forEach(el=>counterIO.observe(el));

  $$('.faq-item button').forEach(btn => btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item');
    $$('.faq-item').forEach(x=>{if(x!==item)x.classList.remove('open')});
    item.classList.toggle('open');
  }));

  const hero=$('.hero'), glow=$('.cursor-glow'), stage=$('.hero-stage'), card=$('.tilt-card');
  const fine = matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(fine && hero){
    hero.addEventListener('pointermove', e => {
      const r=hero.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top;
      glow.style.left=x+'px'; glow.style.top=y+'px';
      const sr=stage.getBoundingClientRect(); const nx=(e.clientX-(sr.left+sr.width/2))/sr.width; const ny=(e.clientY-(sr.top+sr.height/2))/sr.height;
      card.style.transform=`rotateY(${(-4 + nx*8).toFixed(2)}deg) rotateX(${(2 - ny*7).toFixed(2)}deg) translate3d(${(nx*5).toFixed(1)}px,${(ny*5).toFixed(1)}px,0)`;
    });
    hero.addEventListener('pointerleave',()=>{card.style.transform='rotateY(-4deg) rotateX(2deg)'});
  }

  $$('.magnetic').forEach(el=>{
    if(!fine)return;
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });
})();
