(() => {
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];

  const header = $('.site-header');
  const menuBtn = $('.menu-btn');
  const mobile = $('.mobile-menu');
  const setHeader = () => header?.classList.toggle('scrolled', scrollY > 18);
  setHeader();
  addEventListener('scroll', setHeader, {passive:true});

  menuBtn?.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    mobile.setAttribute('aria-hidden', String(!open));
  });
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
    mobile.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded','false');
    mobile.setAttribute('aria-hidden','true');
  }));

  const revealIO = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealIO.unobserve(entry.target);
    }
  }), {threshold:.12});
  $$('.reveal').forEach(el => revealIO.observe(el));

  $$('.faq-item button').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    $$('.faq-item').forEach(x => { if (x !== item) x.classList.remove('open'); });
    item.classList.toggle('open');
  }));

  const stage = $('.hero-stage');
  const card = $('.tilt-card');
  const fine = matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (fine && stage && card) {
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width/2)) / r.width;
      const ny = (e.clientY - (r.top + r.height/2)) / r.height;
      card.style.transform = `rotateY(${(-3 + nx*7).toFixed(2)}deg) rotateX(${(1.5 - ny*6).toFixed(2)}deg) translate3d(${(nx*5).toFixed(1)}px,${(ny*5).toFixed(1)}px,0)`;
    });
    stage.addEventListener('pointerleave', () => card.style.transform = 'rotateY(-3deg) rotateX(1.5deg)');
  }

  const fmt0 = new Intl.NumberFormat('pl-PL', {style:'currency',currency:'PLN',maximumFractionDigits:0});
  const money = v => fmt0.format(Math.round(Number.isFinite(v) ? v : 0));
  const val = id => parseFloat(String($(id)?.value || 0).replace(',','.')) || 0;

  function annuity(principal, annualRate, months) {
    if (!(principal > 0) || !(months > 0)) return {payment:0, interest:0, total:0};
    const i = annualRate / 100 / 12;
    const payment = i === 0 ? principal / months : principal * i / (1 - Math.pow(1 + i, -months));
    const total = payment * months;
    return {payment, interest: total - principal, total};
  }

  const pairs = [
    ['#hcAmount','#hcAmountRange'],
    ['#hcCurrentRate','#hcCurrentRateRange'],
    ['#hcNewRate','#hcNewRateRange'],
    ['#hcYears','#hcYearsRange'],
    ['#hcCosts','#hcCostsRange']
  ];

  function calculateHome() {
    const amount = val('#hcAmount');
    const currentRate = val('#hcCurrentRate');
    const newRate = val('#hcNewRate');
    const years = Math.max(1, val('#hcYears'));
    const costs = Math.max(0, val('#hcCosts'));
    const months = Math.round(years * 12);
    const current = annuity(amount, currentRate, months);
    const next = annuity(amount, newRate, months);
    const monthly = current.payment - next.payment;
    const interestSave = current.interest - next.interest;
    const netSave = (current.total - next.total) - costs;

    $('#hcCurrentPayment').textContent = money(current.payment);
    $('#hcNewPayment').textContent = money(next.payment);
    $('#hcPaymentDiff').textContent = (monthly >= 0 ? '−' : '+') + money(Math.abs(monthly));
    $('#hcInterestSavings').textContent = (interestSave >= 0 ? '+' : '−') + money(Math.abs(interestSave));
    $('#hcNetSavings').textContent = (netSave >= 0 ? '+' : '−') + money(Math.abs(netSave));
    $('#hcNetSavings').style.color = netSave >= 0 ? '#dcc179' : '#e3a08e';
    $('#hcNetNote').textContent = netSave >= 0 ? 'po uwzględnieniu kosztów zmiany' : 'ten wariant nie daje oszczędności netto';
    const max = Math.max(current.interest, next.interest, 1);
    const percent = Math.max(5, Math.min(100, 100 - (next.interest / max * 100)));
    $('#hcBar').style.width = percent + '%';
  }

  pairs.forEach(([inputSel, rangeSel]) => {
    const input = $(inputSel), range = $(rangeSel);
    if (!input || !range) return;
    input.addEventListener('input', () => { range.value = input.value; calculateHome(); });
    range.addEventListener('input', () => { input.value = range.value; calculateHome(); });
  });
  calculateHome();
})();
