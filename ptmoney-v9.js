(() => {
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const fmt=n=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(Math.round(n||0));
const progress=$('.scroll-progress span');
  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    if(progress) progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;
  };
  addEventListener('scroll',updateProgress,{passive:true});updateProgress();

  const menu=$('.menu'), mobile=$('.mobile-nav');
  menu?.addEventListener('click',()=>{const open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));mobile.setAttribute('aria-hidden',String(!open))});
  $$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');menu?.setAttribute('aria-expanded','false');mobile.setAttribute('aria-hidden','true')}));

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.1});
  $$('.reveal').forEach(el=>io.observe(el));

  const visual=$('#financeVisual'), stack=$('#recommendStack');
  if(visual&&stack&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    visual.addEventListener('pointermove',e=>{
      const r=visual.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      stack.style.transform=`rotateY(${x*7}deg) rotateX(${-y*6}deg) translate3d(${x*7}px,${y*5}px,0)`;
      $$('.floating-card',visual).forEach((card,i)=>{const p=(i+1)*1.2;card.style.translate=`${x*p}px ${y*p}px`});
    });
    visual.addEventListener('pointerleave',()=>{stack.style.transform='';$$('.floating-card',visual).forEach(c=>c.style.translate='')});
  }

  if(matchMedia('(pointer:fine)').matches){
    $$('.magnetic').forEach(btn=>{
      btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});
      btn.addEventListener('pointerleave',()=>btn.style.transform='');
    });
  }

  function annuity(P,annual,months){
    const i=annual/100/12;
    if(!(P>0)||!(months>0)) return {payment:0,total:0,interest:0};
    const payment=i===0?P/months:P*i/(1-Math.pow(1+i,-months));
    const total=payment*months;
    return {payment,total,interest:total-P};
  }

  let cashRate=9.9;
  const cashAmount=$('#cashAmount'),cashMonths=$('#cashMonths');
  const updateCash=()=>{
    if(!cashAmount||!cashMonths)return;
    const P=+cashAmount.value,m=+cashMonths.value,r=annuity(P,cashRate,m);
    $('#cashAmountValue').textContent=new Intl.NumberFormat('pl-PL').format(P)+' zł';
    $('#cashMonthsValue').textContent=m+' mies.';
    $('#cashPayment').textContent=fmt(r.payment)+' / mies.';
    $('#cashInterest').textContent=fmt(r.interest);
    $('#cashTotal').textContent=fmt(r.total);
  };
  cashAmount?.addEventListener('input',updateCash);cashMonths?.addEventListener('input',updateCash);
  $$('.rate-choice button').forEach(b=>b.addEventListener('click',()=>{$$('.rate-choice button').forEach(x=>x.classList.remove('active'));b.classList.add('active');cashRate=+b.dataset.rate;updateCash()}));
  updateCash();

  const val=id=>parseFloat(String($(id)?.value||0).replace(',','.'))||0;
  const updateRefi=()=>{
    const P=val('#refAmount'),m=Math.max(12,val('#refYears')*12);
    const oldR=annuity(P,val('#refOldRate'),m),newR=annuity(P,val('#refNewRate'),m);
    const saving=oldR.total-newR.total;
    $('#refSaving').textContent=(saving>=0?'+':'−')+fmt(Math.abs(saving));
    $('#refOldPayment').textContent=fmt(oldR.payment);
    $('#refNewPayment').textContent=fmt(newR.payment);
    $('#refMonthlyDiff').textContent=fmt(oldR.payment-newR.payment);
  };
  ['#refAmount','#refYears','#refOldRate','#refNewRate'].forEach(id=>$(id)?.addEventListener('input',updateRefi));updateRefi();

  $$('.faq-item-new button').forEach(btn=>btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item-new');
    $$('.faq-item-new').forEach(x=>{if(x!==item)x.classList.remove('open')});
    item.classList.toggle('open');
  }));

  $('#leadForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    if(!e.currentTarget.checkValidity()){e.currentTarget.reportValidity();return}
    e.currentTarget.classList.add('sent');
  });


  // v9 cinematic — exact hero is cloned into the laptop and into the final handoff.
  const cinematic = $('#cinematicEntry');
  const world = $('#officeWorld');
  const laptop = $('#laptopWrap');
  const bezel = $('#laptopBezel');
  const display = $('#laptopDisplay');
  const deck = $('#laptopDeck');
  const screen = $('#laptopScreen');
  const screenBrand = $('#screenBrand');
  const screenPreview = $('#screenPreview');
  const screenCloneHost = $('#screenHeroClone');
  const handoff = $('#heroHandoff');
  const realHero = $('.hero-after-cinematic');

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = t => t*t*(3 - 2*t);
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function stripIds(node){
    if(node.nodeType !== 1) return;
    node.removeAttribute('id');
    node.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    node.querySelectorAll('a,button,input,select,textarea').forEach(el => {
      el.setAttribute('tabindex','-1');
      el.setAttribute('aria-hidden','true');
    });
  }

  function buildHeroClones(){
    if(!realHero || !screenCloneHost || !handoff) return;

    const mini = realHero.cloneNode(true);
    stripIds(mini);
    mini.classList.add('hero-clone-mini');
    screenCloneHost.replaceChildren(mini);

    const full = realHero.cloneNode(true);
    stripIds(full);
    full.classList.add('hero-clone-full');
    handoff.replaceChildren(full);
  }

  function sizeMiniHero(){
    if(!screen || !screenCloneHost) return;
    const designW = Math.max(innerWidth, 1180);
    screenCloneHost.style.width = `${designW}px`;
    const scale = screen.clientWidth / designW;
    screenCloneHost.style.transform = `scale(${scale})`;
  }

  let initial = null;
  function captureInitialGeometry(){
    if(!laptop || !screen) return;
    const lr = laptop.getBoundingClientRect();
    const sr = screen.getBoundingClientRect();
    initial = {
      laptopW: lr.width,
      laptopH: lr.height,
      screenW: sr.width,
      screenH: sr.height,
      screenCxOffset: (sr.left + sr.width/2) - (lr.left + lr.width/2),
      screenCyOffset: (sr.top + sr.height/2) - (lr.top + lr.height/2)
    };
  }

  buildHeroClones();
  requestAnimationFrame(() => {
    sizeMiniHero();
    captureInitialGeometry();
  });

  function updateCinematic(){
    if(!cinematic || !world || !laptop || !screen) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!initial) captureInitialGeometry();

    const r = cinematic.getBoundingClientRect();
    const scrollable = Math.max(1, cinematic.offsetHeight - innerHeight);
    const p = clamp01((-r.top) / scrollable);

    // Calm room movement — no unnecessary motion.
    const roomP = smooth(clamp01((p - .03) / .55));
    world.style.transform = `scale(${1 + roomP*.055})`;

    // The screen switches from logo to the exact real hero before the zoom becomes dramatic.
    const previewP = easeOutCubic(clamp01((p - .15) / .19));
    if(screenBrand){
      screenBrand.style.opacity = String(1 - previewP);
      screenBrand.style.transform = `scale(${1 - previewP*.025})`;
    }
    if(screenPreview){
      screenPreview.style.opacity = String(previewP);
    }

    // Compute the scale needed for the actual SCREEN (not the laptop) to cover the viewport.
    const targetScale = initial
      ? Math.max(innerWidth / initial.screenW, innerHeight / initial.screenH) * 1.035
      : 4;

    const zoomP = smooth(clamp01((p - .11) / .72));
    const currentScale = 1 + (targetScale - 1) * zoomP;

    // Because the display sits above the stage center, compensate while scaling
    // so the center of the screen lands exactly in the center of the viewport.
    const cx = initial ? initial.screenCxOffset : 0;
    const cy = initial ? initial.screenCyOffset : -80;
    const compensateX = -cx * (currentScale - 1);
    const compensateY = -cy * (currentScale - 1);

    laptop.style.transform =
      `translate(-50%,-50%) translate(${compensateX/currentScale}px,${compensateY/currentScale}px) scale(${currentScale})`;

    // Physical computer softly dissolves once the screen is already almost the entire viewport.
    const dissolveP = smooth(clamp01((p - .67) / .19));
    if(display){
      display.style.background = `rgba(151,154,150,${1-dissolveP})`;
      display.style.boxShadow = `0 27px 52px rgba(0,0,0,${.28*(1-dissolveP)})`;
      display.style.padding = `${8*(1-dissolveP)}px`;
    }
    if(bezel){
      bezel.style.background = `rgba(16,23,20,${1-dissolveP})`;
      bezel.style.padding = `${10*(1-dissolveP)}px`;
      bezel.style.borderRadius = `${10*(1-dissolveP)}px`;
    }
    if(deck) deck.style.opacity = String(1-dissolveP);
    const hinge = laptop.querySelector('.laptop-hinge');
    const shadow = laptop.querySelector('.laptop-shadow');
    if(hinge) hinge.style.opacity = String(1-dissolveP);
    if(shadow) shadow.style.opacity = String(1-dissolveP);

    // Exact cloned hero overlays the zoomed laptop screen.
    // Since both contain the same DOM, the crossfade is visually invisible.
    const handoffP = easeOutCubic(clamp01((p - .78) / .16));
    if(handoff) handoff.style.opacity = String(handoffP);

    // Room goes away behind the identical hero.
    world.style.opacity = String(1 - easeOutCubic(clamp01((p - .80) / .15)));

    if(p > .90){
      document.body.classList.add('cinema-site-ready');
    }else{
      document.body.classList.remove('cinema-site-ready');
    }
  }

  if(cinematic){
    document.body.classList.add('cinema-mode');
    addEventListener('scroll', updateCinematic, {passive:true});
    addEventListener('resize', () => {
      sizeMiniHero();
      // Reset transform briefly to obtain fresh base geometry.
      const old = laptop.style.transform;
      laptop.style.transform = '';
      requestAnimationFrame(() => {
        captureInitialGeometry();
        laptop.style.transform = old;
        updateCinematic();
      });
    });
    updateCinematic();
  }

})();