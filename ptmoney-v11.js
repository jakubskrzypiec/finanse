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


  // v11 — photoreal office/laptop zoom. The real hero is directly underneath.
  const cinematic = $('#cinematicEntry');
  const photoWrap = $('#cinematicPhotoWrap');
  const photo = $('#cinematicPhoto');
  const vignette = $('.cinematic-vignette');

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = t => t*t*(3 - 2*t);
  const easeOutCubic = t => 1 - Math.pow(1-t,3);

  function updateCinematic(){
    if(!cinematic || !photoWrap || !photo) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const r = cinematic.getBoundingClientRect();
    const max = Math.max(1, cinematic.offsetHeight - innerHeight);
    const p = clamp01((-r.top) / max);

    // The laptop screen in the photograph is centered. Slow dolly at first,
    // then a stronger move into the screen in the final half.
    const zoomP = smooth(clamp01((p - .04) / .76));
    const scale = 1 + zoomP * 3.55;

    // Slight vertical correction keeps the screen center locked while zooming.
    const yShift = zoomP * 4.2;

    photo.style.transform =
      `translate(-50%,-50%) translateY(${yShift}%) scale(${scale})`;

    // Slowly clean up the photographic image while getting closer to screen.
    photo.style.filter =
      `saturate(${.90 + zoomP*.06}) contrast(${1.02 + zoomP*.03}) brightness(${.93 + zoomP*.05})`;

    if(vignette) vignette.style.opacity = String(1 - zoomP*.72);

    // No intermediate green panel, clone or second hero:
    // the office image simply dissolves and the real hero is already underneath.
    const revealP = easeOutCubic(clamp01((p - .76) / .23));
    photoWrap.style.opacity = String(1 - revealP);

    if(p > .84) document.body.classList.add('cinema-site-ready');
    else document.body.classList.remove('cinema-site-ready');
  }

  if(cinematic){
    document.body.classList.add('cinema-mode');
    addEventListener('scroll', updateCinematic, {passive:true});
    addEventListener('resize', updateCinematic);
    updateCinematic();
  }

})();