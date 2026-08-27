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
      $$('.visual-satellite',visual).forEach((card,i)=>{const power=(i+1)*1.6;card.style.translate=`${x*power}px ${y*power}px`});
    });
    visual.addEventListener('pointerleave',()=>{stack.style.transform='';$$('.visual-satellite',visual).forEach(c=>c.style.translate='')});
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


  // v17 — ultra clean cinematic: one dolly-in, one fade, direct hero reveal.
  const cinematic = $('#cinematicEntry');
  const world = $('#officeWorld');
  const laptop = $('#laptopWrap');
  const display = $('#laptopDisplay');
  const bezel = $('#laptopBezel');
  const deck = $('#laptopDeck');
  const screen = $('#laptopScreen');
  const screenBrand = $('#screenBrand');

  const clamp01 = v => Math.max(0,Math.min(1,v));
  const smooth = t => t*t*(3-2*t);
  const smoother = t => t*t*t*(t*(t*6-15)+10);
  const easeOut = t => 1-Math.pow(1-t,3);

  let geom=null;
  function captureGeometry(){
    if(!laptop || !screen) return;
    const lr=laptop.getBoundingClientRect();
    const sr=screen.getBoundingClientRect();
    geom={
      screenW:sr.width,
      screenH:sr.height,
      offsetX:(sr.left+sr.width/2)-(lr.left+lr.width/2),
      offsetY:(sr.top+sr.height/2)-(lr.top+lr.height/2)
    };
  }

  requestAnimationFrame(captureGeometry);

  function updateCinematic(){
    if(!cinematic || !world || !laptop || !screen) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!geom) captureGeometry();

    const r=cinematic.getBoundingClientRect();
    const max=Math.max(1,cinematic.offsetHeight-innerHeight);
    const p=clamp01((-r.top)/max);

    // 1) Scene stays almost perfectly still.
    const room=smooth(clamp01(p/.34));
    world.style.transform=`scale(${1+room*.006})`;

    // 2) One continuous camera move into the screen.
    const zoom=smoother(clamp01((p-.10)/.68));
    const targetScale=geom
      ? Math.max(innerWidth/geom.screenW,innerHeight/geom.screenH)*1.015
      : 4.1;
    const scale=1+(targetScale-1)*zoom;

    const dx=geom ? -geom.offsetX*(scale-1)/scale : 0;
    const dy=geom ? -geom.offsetY*(scale-1)/scale : 0;

    laptop.style.transform=
      `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${scale})`;

    // 3) Logo quietly disappears before the handoff.
    const logoFade=easeOut(clamp01((p-.47)/.15));
    if(screenBrand){
      screenBrand.style.setProperty('--screen-logo-opacity',String(1-logoFade));
    }

    // 4) Screen becomes exactly the hero cream.
    const wash=easeOut(clamp01((p-.56)/.16));
    if(screenBrand){
      screenBrand.style.setProperty('--screen-wash',String(wash));
    }

    // 5) Hardware fades only at the very end.
    const hardware=smooth(clamp01((p-.68)/.12));
    if(display){
      display.style.background=`rgba(145,148,144,${1-hardware})`;
      display.style.boxShadow=`0 18px 34px rgba(0,0,0,${.20*(1-hardware)})`;
      display.style.padding=`${5*(1-hardware)}px`;
    }
    if(bezel){
      bezel.style.background=`rgba(17,22,19,${1-hardware})`;
      bezel.style.padding=`${6*(1-hardware)}px`;
      bezel.style.borderRadius=`${8*(1-hardware)}px`;
    }
    if(deck) deck.style.opacity=String(1-hardware);
    const hinge=laptop.querySelector('.laptop-hinge');
    const shadow=laptop.querySelector('.laptop-ground-shadow');
    if(hinge) hinge.style.opacity=String(1-hardware);
    if(shadow) shadow.style.opacity=String(1-hardware);

    // 6) Real hero fades in underneath with almost zero movement.
    const reveal=easeOut(clamp01((p-.74)/.22));
    world.style.opacity=String(1-reveal);
    const realHero=$('.hero-after-cinematic');
    if(realHero) realHero.style.setProperty('--hero-reveal',String(reveal));

    if(p>.82) document.body.classList.add('cinema-site-ready');
    else document.body.classList.remove('cinema-site-ready');
  }

  if(cinematic){
    document.body.classList.add('cinema-mode');
    if(scrollY > cinematic.offsetHeight - innerHeight - 20){
      $('.hero-after-cinematic')?.style.setProperty('--hero-reveal','1');
    }

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
  } else {
    $('.hero-after-cinematic')?.style.setProperty('--hero-reveal','1');
  }

  // Sticky nav + section state
  const header=$('.header');
  const navLinks=$$('.nav-links a[href^="#"]');
  const navTargets=navLinks
    .map(a=>({a,id:a.getAttribute('href').slice(1),el:document.getElementById(a.getAttribute('href').slice(1))}))
    .filter(x=>x.el);

  const updateHeader=()=>header?.classList.toggle('is-sticky',scrollY>innerHeight*.72);
  addEventListener('scroll',updateHeader,{passive:true});
  updateHeader();

  const navObserver=new IntersectionObserver(entries=>{
    const visible=entries
      .filter(e=>e.isIntersecting)
      .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+visible.target.id));
  },{rootMargin:'-22% 0px -58% 0px',threshold:[0,.2,.5]});
  navTargets.forEach(x=>navObserver.observe(x.el));


  // Meeting version: guided decision navigator
  const decisionData = {
    home:{
      label:'Nieruchomość',
      title:'Kredyt hipoteczny + analiza zdolności',
      text:'Najpierw sprawdzamy budżet i zdolność, później porównujemy warianty finansowania i koszty, które naprawdę wpływają na całe zobowiązanie.',
      points:['zdolność i bezpieczny budżet','porównanie wariantów','wsparcie przy dokumentach'],
      next:'Krótka rozmowa → analiza → porównanie'
    },
    lower:{
      label:'Obecne zobowiązania',
      title:'Konsolidacja lub refinansowanie',
      text:'Porządkujemy obecne raty i sprawdzamy, czy istnieje realna przestrzeń do obniżenia miesięcznych obciążeń lub całkowitego kosztu.',
      points:['lista obecnych zobowiązań','symulacja nowej raty','porównanie całkowitego kosztu'],
      next:'Zobowiązania → symulacja → realne warianty'
    },
    cash:{
      label:'Finanse osobiste',
      title:'Kredyt gotówkowy dopasowany do planu',
      text:'Zaczynamy od kwoty i komfortowej raty, a dopiero później sprawdzamy, jakie warunki są dostępne i sensowne przy danym okresie spłaty.',
      points:['kwota i cel','komfortowa rata','porównanie warunków'],
      next:'Cel → budżet → porównanie ofert'
    },
    business:{
      label:'Finansowanie firmy',
      title:'Kredyt, leasing lub faktoring',
      text:'Najpierw ustalamy, czego firma potrzebuje: kapitału, środka trwałego czy płynności. Dzięki temu nie wciskamy każdego celu w jeden produkt.',
      points:['cel biznesowy','forma finansowania','wpływ na płynność'],
      next:'Potrzeba → struktura finansowania → wybór'
    }
  };

  $$('.decision-tab').forEach(tab=>tab.addEventListener('click',()=>{
    const d=decisionData[tab.dataset.choice];
    if(!d) return;
    $$('.decision-tab').forEach(t=>{
      t.classList.toggle('active',t===tab);
      t.setAttribute('aria-selected',String(t===tab));
    });
    const result=$('.decision-result');
    result?.animate(
      [{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:280,easing:'cubic-bezier(.16,1,.3,1)'}
    );
    $('#decisionLabel').textContent=d.label;
    $('#decisionTitle').textContent=d.title;
    $('#decisionText').textContent=d.text;
    $('#decisionNext').textContent=d.next;
    const points=$('#decisionPoints');
    if(points) points.innerHTML=d.points.map(p=>`<span>${p}</span>`).join('');
  }));

  // Demonstrative comparison console
  $$('.compare-toggle button').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.compare-toggle button').forEach(b=>b.classList.toggle('active',b===btn));
    $$('.compare-row').forEach(row=>row.classList.remove('active-metric'));
    $(`.metric-${btn.dataset.metric}`)?.classList.add('active-metric');
  }));

})();