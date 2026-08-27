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


  // v8 cinematic: standing laptop -> live screen -> page
  const cinematic = $('#cinematicEntry');
  const world = $('#officeWorld');
  const laptop = $('#laptopWrap');
  const bezel = $('#laptopBezel');
  const display = $('#laptopDisplay');
  const deck = $('#laptopDeck');
  const screenBrand = $('#screenBrand');
  const screenPreview = $('#screenPreview');
  const caption = $('#officeCaption');
  const indicator = $('#scrollIndicator');
  const curtain = $('#cinematicCurtain');

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = t => t*t*(3 - 2*t);
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function updateCinematic(){
    if(!cinematic || !world || !laptop) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const r = cinematic.getBoundingClientRect();
    const scrollable = Math.max(1, cinematic.offsetHeight - innerHeight);
    const p = clamp01((-r.top) / scrollable);

    // Hold a clean office establishing shot, then gently dolly toward the laptop.
    const roomP = smooth(clamp01((p - .04) / .42));
    const roomScale = 1 + roomP * .13;
    world.style.transform = `scale(${roomScale}) translateY(${roomP * 1.8}%)`;

    // Fade peripheral copy early so the laptop becomes the only focus.
    const peripheral = 1 - easeOutCubic(clamp01((p - .14) / .22));
    if(caption) caption.style.opacity = peripheral;
    if(indicator) indicator.style.opacity = peripheral;

    // Standing laptop zoom. It stays upright throughout the whole camera move.
    const zoomP = smooth(clamp01((p - .14) / .68));
    const zoom = 1 + zoomP * 3.28;
    const lift = zoomP * -5.5;
    laptop.style.transform = `translate(-50%,-50%) translateY(${lift}%) scale(${zoom})`;

    // Logo crossfades into the actual site preview while approaching the screen.
    const previewP = easeOutCubic(clamp01((p - .31) / .20));
    if(screenBrand){
      screenBrand.style.opacity = String(1 - previewP);
      screenBrand.style.transform = `scale(${1 - previewP*.045})`;
    }
    if(screenPreview){
      screenPreview.style.opacity = String(previewP);
      screenPreview.style.transform = `scale(${.965 + previewP*.035})`;
    }

    // As the screen fills the camera, the physical laptop disappears.
    const enterP = smooth(clamp01((p - .72) / .22));
    if(display){
      display.style.background = `rgba(150,153,149,${1-enterP})`;
      display.style.boxShadow = `0 26px 52px rgba(0,0,0,${.31*(1-enterP)})`;
      display.style.padding = `${9*(1-enterP)}px`;
    }
    if(bezel){
      bezel.style.background = `rgba(17,23,20,${1-enterP})`;
      bezel.style.padding = `${11*(1-enterP)}px`;
      bezel.style.borderRadius = `${11*(1-enterP)}px`;
    }
    if(deck) deck.style.opacity = String(1-enterP);
    const hinge = laptop.querySelector('.laptop-hinge');
    const shadow = laptop.querySelector('.laptop-shadow');
    if(hinge) hinge.style.opacity = String(1-enterP);
    if(shadow) shadow.style.opacity = String(1-enterP);

    // Background falls away only at the very end.
    world.style.filter = `brightness(${1 - enterP*.07}) saturate(${1 - enterP*.14})`;

    const handoff = easeOutCubic(clamp01((p - .90) / .10));
    if(curtain) curtain.style.opacity = String(handoff);

    if(p > .965){
      document.body.classList.add('cinema-site-ready');
    }else{
      document.body.classList.remove('cinema-site-ready');
    }
  }

  if(cinematic){
    document.body.classList.add('cinema-mode');
    addEventListener('scroll', updateCinematic, {passive:true});
    addEventListener('resize', updateCinematic);
    updateCinematic();
  }

})();