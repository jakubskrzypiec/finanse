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


  // v10 — clean office/laptop intro that reveals the real hero underneath.
  const cinematic = $('#cinematicEntry');
  const world = $('#officeWorld');
  const laptop = $('#laptopWrap');
  const display = $('#laptopDisplay');
  const bezel = $('#laptopBezel');
  const deck = $('#laptopDeck');
  const screen = $('#laptopScreen');
  const screenBrand = $('#screenBrand');
  const screenPortal = $('#screenPortal');

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = t => t*t*(3 - 2*t);
  const easeOutCubic = t => 1 - Math.pow(1-t,3);

  let geom = null;
  function captureGeometry(){
    if(!laptop || !screen) return;
    const lr = laptop.getBoundingClientRect();
    const sr = screen.getBoundingClientRect();
    geom = {
      screenW:sr.width,
      screenH:sr.height,
      offsetX:(sr.left + sr.width/2) - (lr.left + lr.width/2),
      offsetY:(sr.top + sr.height/2) - (lr.top + lr.height/2)
    };
  }

  requestAnimationFrame(captureGeometry);

  function updateCinematic(){
    if(!cinematic || !world || !laptop || !screen) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!geom) captureGeometry();

    const r = cinematic.getBoundingClientRect();
    const max = Math.max(1,cinematic.offsetHeight-innerHeight);
    const p = clamp01((-r.top)/max);

    const roomP = smooth(clamp01((p-.04)/.55));
    world.style.transform = `scale(${1 + roomP*.035})`;

    const portalP = easeOutCubic(clamp01((p-.14)/.18));
    if(screenBrand){
      screenBrand.style.opacity = String(1-portalP);
      screenBrand.style.transform = `scale(${1-portalP*.02})`;
    }
    if(screenPortal){
      screenPortal.style.opacity = String(portalP);
      screenPortal.style.transform = `scale(${.985 + portalP*.015})`;
    }

    const targetScale = geom ? Math.max(innerWidth/geom.screenW,innerHeight/geom.screenH)*1.035 : 4.4;
    const zoomP = smooth(clamp01((p-.13)/.70));
    const scale = 1+(targetScale-1)*zoomP;

    const dx = geom ? -geom.offsetX*(scale-1)/scale : 0;
    const dy = geom ? -geom.offsetY*(scale-1)/scale : 0;
    laptop.style.transform = `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${scale})`;

    const hardwareP = smooth(clamp01((p-.64)/.18));
    if(display){
      display.style.background = `rgba(145,148,144,${1-hardwareP})`;
      display.style.boxShadow = `0 24px 48px rgba(0,0,0,${.26*(1-hardwareP)})`;
      display.style.padding = `${6*(1-hardwareP)}px`;
    }
    if(bezel){
      bezel.style.background = `rgba(16,21,18,${1-hardwareP})`;
      bezel.style.padding = `${7*(1-hardwareP)}px`;
      bezel.style.borderRadius = `${10*(1-hardwareP)}px`;
    }
    if(deck) deck.style.opacity = String(1-hardwareP);
    const hinge=laptop.querySelector('.laptop-hinge');
    const shadow=laptop.querySelector('.laptop-ground-shadow');
    if(hinge) hinge.style.opacity=String(1-hardwareP);
    if(shadow) shadow.style.opacity=String(1-hardwareP);

    const revealP = easeOutCubic(clamp01((p-.80)/.19));
    world.style.opacity = String(1-revealP);

    if(p>.88) document.body.classList.add('cinema-site-ready');
    else document.body.classList.remove('cinema-site-ready');
  }

  if(cinematic){
    document.body.classList.add('cinema-mode');
    addEventListener('scroll',updateCinematic,{passive:true});
    addEventListener('resize',()=>{
      const old=laptop?.style.transform;
      if(laptop) laptop.style.transform='';
      requestAnimationFrame(()=>{
        captureGeometry();
        if(laptop) laptop.style.transform=old||'';
        updateCinematic();
      });
    });
    updateCinematic();
  }

})();