(() => {
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  const fmt = new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0});
  const num = n => new Intl.NumberFormat('pl-PL',{maximumFractionDigits:0}).format(Math.round(n||0));
  const money = n => fmt.format(Math.round(n||0));

  const header=$('.site-header');
  const menuBtn=$('.menu-btn');
  const mobile=$('.mobile-menu');
  const headerState=()=>header?.classList.toggle('scrolled',scrollY>16);
  headerState(); addEventListener('scroll',headerState,{passive:true});
  menuBtn?.addEventListener('click',()=>{const open=mobile.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));mobile.setAttribute('aria-hidden',String(!open));});
  $$('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');mobile.setAttribute('aria-hidden','true');}));

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  function annuity(principal,annualRate,months){
    const i=annualRate/100/12;
    if(!(principal>0)||!(months>0)) return {payment:0,total:0,interest:0};
    const payment=i===0?principal/months:principal*i/(1-Math.pow(1+i,-months));
    const total=payment*months;
    return {payment,total,interest:total-principal};
  }

  const heroAmount=$('#heroAmount'), heroPeriod=$('#heroPeriod');
  function heroCalc(){
    if(!heroAmount||!heroPeriod)return;
    const a=+heroAmount.value,p=+heroPeriod.value;
    const r=annuity(a,9.9,p);
    $('#heroAmountVal').textContent=num(a)+' zł';
    $('#heroPeriodVal').textContent=p+' mies.';
    $('#heroResult').textContent=num(r.payment)+' zł / mies.';
  }
  heroAmount?.addEventListener('input',heroCalc); heroPeriod?.addEventListener('input',heroCalc); heroCalc();

  const stage=$('.hero-stage'), card=$('.tilt-card');
  if(stage&&card&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    stage.addEventListener('pointermove',e=>{
      const r=stage.getBoundingClientRect(), nx=(e.clientX-r.left-r.width/2)/r.width, ny=(e.clientY-r.top-r.height/2)/r.height;
      card.style.transform=`rotateY(${(-3+nx*7).toFixed(2)}deg) rotateX(${(1.5-ny*6).toFixed(2)}deg) translate3d(${(nx*5).toFixed(1)}px,${(ny*5).toFixed(1)}px,0)`;
    });
    stage.addEventListener('pointerleave',()=>card.style.transform='rotateY(-3deg) rotateX(1.5deg)');
  }

  let cashRate=9.9;
  function cashCalc(){
    const a=+($('#calcAmount')?.value||0), m=+($('#calcPeriod')?.value||0), r=annuity(a,cashRate,m);
    $('#calcAmountVal').textContent=num(a)+' zł';
    $('#calcPeriodVal').textContent=m+' mies.';
    $('#calcResult').textContent=num(r.payment)+' zł / mies.';
    $('#calcInterest').textContent=money(r.interest);
    $('#calcTotal').textContent=money(r.total);
  }
  $('#calcAmount')?.addEventListener('input',cashCalc); $('#calcPeriod')?.addEventListener('input',cashCalc);
  $$('.rate-picker button').forEach(b=>b.addEventListener('click',()=>{$$('.rate-picker button').forEach(x=>x.classList.remove('active'));b.classList.add('active');cashRate=+b.dataset.rate;cashCalc()}));
  cashCalc();

  function getVal(id){return parseFloat(String($(id)?.value||0).replace(',','.'))||0}
  function refiCalc(){
    const a=getVal('#refAmount'), years=Math.max(1,getVal('#refYears')), costs=Math.max(0,getVal('#refCosts'));
    const oldR=annuity(a,getVal('#refCurrent'),years*12), newR=annuity(a,getVal('#refNew'),years*12);
    const savings=oldR.total-newR.total-costs;
    $('#refSavings').textContent=(savings>=0?'+':'−')+money(Math.abs(savings));
    $('#refSavings').style.color=savings>=0?'#0F2C22':'#A8412B';
    $('#refOldPayment').textContent=money(oldR.payment);
    $('#refNewPayment').textContent=money(newR.payment);
  }
  ['#refAmount','#refCurrent','#refNew','#refYears','#refCosts'].forEach(id=>$(id)?.addEventListener('input',refiCalc)); refiCalc();

  $$('.faq-item button').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');$$('.faq-item').forEach(x=>{if(x!==item)x.classList.remove('open')});item.classList.toggle('open')}));
  $('#leadForm')?.addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.checkValidity()){e.currentTarget.reportValidity();return}e.currentTarget.classList.add('sent');$('.form-submit',e.currentTarget).textContent='Zgłoszenie wysłane';});
})();