(() => {
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const fmt=n=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(Math.round(n||0));

  const intro=$('#intro');
  if(intro && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    setTimeout(()=>document.body.classList.add('intro-reveal'),1050);
    setTimeout(()=>{document.body.classList.remove('intro-lock','intro-reveal');document.body.classList.add('intro-done')},2050);
  } else document.body.classList.remove('intro-lock');

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


  // Cinematic office -> laptop -> website transition
  const cinematic = $('#cinematicEntry');
  const world = $('#officeWorld');
  const laptop = $('#laptopWrap');
  const bezel = $('#laptopBezel');
  const screenBrand = $('#screenBrand');
  const screenPreview = $('#screenPreview');
  const screenEnter = $('#screenEnterLabel');
  const caption = $('#officeCaption');
  const indicator = $('#scrollIndicator');
  const curtain = $('#cinematicCurtain');

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const easeInOut = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;
  const easeOut = t => 1 - Math.pow(1-t,3);

  function updateCinematic(){
    if(!cinematic || !world || !laptop) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const r = cinematic.getBoundingClientRect();
    const scrollable = cinematic.offsetHeight - innerHeight;
    const p = clamp01((-r.top) / Math.max(1, scrollable));

    // Phase 1: establish office and approach desk
    const approach = easeInOut(clamp01(p / .54));
    const worldScale = 1 + approach * 1.42;
    const worldY = approach * 7;
    const worldX = approach * -1.2;
    world.style.transform = `scale(${worldScale}) translate(${worldX}%, ${worldY}%)`;

    // Office UI fades as camera gets close
    const uiFade = 1 - easeOut(clamp01((p - .24) / .24));
    if(caption) caption.style.opacity = uiFade;
    if(indicator) indicator.style.opacity = uiFade;

    // Phase 2: laptop becomes camera target
    const focus = easeInOut(clamp01((p - .30) / .46));
    const laptopScale = 1 + focus * 2.55;
    const laptopY = focus * 3.2;
    laptop.style.transform = `translate(-50%,-50%) perspective(1200px) rotateX(${-2 + focus*2}deg) scale(${laptopScale}) translateY(${laptopY}%)`;

    // Logo -> live page preview on the laptop
    const previewP = easeOut(clamp01((p - .36) / .22));
    if(screenBrand){
      screenBrand.style.opacity = String(1 - previewP);
      screenBrand.style.transform = `scale(${1 - previewP*.07})`;
    }
    if(screenPreview){
      screenPreview.style.opacity = String(previewP);
      screenPreview.style.transform = `scale(${.93 + previewP*.07})`;
    }
    if(screenEnter) screenEnter.style.opacity = String(1 - clamp01((p - .20)/.18));

    // Phase 3: laptop bezel disappears and screen becomes the page
    const enter = easeInOut(clamp01((p - .68) / .30));
    if(bezel){
      bezel.style.background = `rgba(17,24,21,${1-enter})`;
      bezel.style.padding = `${9*(1-enter)}px`;
      bezel.style.borderRadius = `${11*(1-enter)}px`;
    }
    const lid = laptop.querySelector('.laptop-lid');
    const base = laptop.querySelector('.laptop-base');
    if(lid){
      lid.style.background = `rgba(150,152,148,${1-enter})`;
      lid.style.boxShadow = `0 30px 55px rgba(0,0,0,${.33*(1-enter)})`;
      lid.style.padding = `${9*(1-enter)}px`;
    }
    if(base) base.style.opacity = String(1-enter);

    // Fade into the exact cream of the real hero
    if(curtain) curtain.style.opacity = String(easeOut(clamp01((p - .86) / .14)));

    // small cinematic depth
    world.style.filter = `saturate(${1 - enter*.12}) brightness(${1 + enter*.04})`;
  }

  if(cinematic){
    addEventListener('scroll', updateCinematic, {passive:true});
    addEventListener('resize', updateCinematic);
    updateCinematic();
  }

})();