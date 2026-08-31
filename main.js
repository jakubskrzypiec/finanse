(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatInt = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });

  /* ---------- Intro: raz na sesję + twardy timeout ---------- */
  const html = document.documentElement;
  const intro = $('#siteIntro');
  let introDone = false;

  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    html.classList.remove('intro-pending', 'intro-running', 'intro-leaving');
    if (intro) intro.remove();
    try { sessionStorage.setItem('ptm-intro-seen', '1'); } catch (e) {}
  };

  if (html.classList.contains('intro-pending') && intro && !reduceMotion) {
    html.classList.add('intro-running');
    window.setTimeout(() => html.classList.add('intro-leaving'), 920);
    window.setTimeout(finishIntro, 1180);
    window.setTimeout(finishIntro, 1500);
  } else {
    finishIntro();
  }

  /* ---------- Mobile nav ---------- */
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');

  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Otwórz menu');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-open');
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Otwórz menu' : 'Zamknij menu');
      mobileNav.hidden = open;
      document.body.classList.toggle('menu-open', !open);
    });

    $$('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth >= 900) closeMenu(); }, { passive: true });
  }

  /* ---------- Reveal + stagger ---------- */
  $$('.reveal-grid').forEach(grid => {
    $$('.reveal', grid).forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index, 6) * 60}ms`;
    });
  });

  const revealEls = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
    // Ukrywamy elementy dopiero po poprawnym uruchomieniu obserwatora.
    // Gdy JS nie załaduje się lub wcześniej zgłosi błąd, treść pozostaje widoczna.
    html.classList.add('reveal-ready');

    // Bezpieczny fallback dla agresywnego przewijania / nietypowych WebView:
    // IntersectionObserver pozostaje mechanizmem głównym, a scroll tylko dopina elementy,
    // które znalazły się już w oknie, ale obserwator nie zdążył ich zgłosić.
    const revealInViewport = () => {
      revealEls.forEach(el => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * .96 && rect.bottom > 0) {
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    };
    window.addEventListener('scroll', revealInViewport, { passive: true });
    window.addEventListener('resize', revealInViewport, { passive: true });
    requestAnimationFrame(revealInViewport);
  }

  /* ---------- Helpers ---------- */
  const fmtPLN = n => `${formatInt.format(Math.round(Number(n) || 0))} zł`;
  const fmtNumber = n => formatInt.format(Math.round(Number(n) || 0));

  function annuityPayment(principal, annualRatePct, months) {
    const p = Number(principal) || 0;
    const n = Math.max(1, Number(months) || 1);
    const r = (Number(annualRatePct) / 100) / 12;
    if (r === 0) return p / n;
    return p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }

  function setRangeProgress(input) {
    if (!input) return;
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const value = Number(input.value) || 0;
    const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
    input.style.setProperty('--range-progress', `${Math.max(0, Math.min(100, pct))}%`);
  }

  $$('input[type="range"]').forEach(input => {
    setRangeProgress(input);
    input.addEventListener('input', () => setRangeProgress(input));
  });

  /* ---------- Hero quick calculator ---------- */
  const heroAmount = $('#heroAmount');
  const heroPeriod = $('#heroPeriod');
  const heroAmountVal = $('#heroAmountVal');
  const heroPeriodVal = $('#heroPeriodVal');
  const heroResult = $('#heroResult');
  const HERO_RATE = 9.9;

  function updateHeroCalculator() {
    if (!heroAmount || !heroPeriod) return;
    const amount = Number(heroAmount.value);
    const months = Number(heroPeriod.value);
    const payment = annuityPayment(amount, HERO_RATE, months);
    heroAmountVal.textContent = fmtPLN(amount);
    heroPeriodVal.textContent = `${months} mies.`;
    heroResult.innerHTML = `${fmtNumber(payment)} <small>zł / mies.</small>`;
  }

  [heroAmount, heroPeriod].forEach(el => el && el.addEventListener('input', updateHeroCalculator));
  updateHeroCalculator();

  /* ---------- Full loan calculator ---------- */
  const calcAmount = $('#calcAmount');
  const calcPeriod = $('#calcPeriod');
  const calcRate = $('#calcRate');
  const calcAmountVal = $('#calcAmountVal');
  const calcPeriodVal = $('#calcPeriodVal');
  const calcRateVal = $('#calcRateVal');
  const calcResult = $('#calcResult');
  const calcInterest = $('#calcInterest');
  const calcTotal = $('#calcTotal');

  function updateMainCalculator() {
    if (!calcAmount || !calcPeriod || !calcRate) return;
    const amount = Number(calcAmount.value);
    const months = Number(calcPeriod.value);
    const rate = Number(calcRate.value);
    const payment = annuityPayment(amount, rate, months);
    const total = payment * months;
    const interest = total - amount;

    calcAmountVal.textContent = fmtPLN(amount);
    calcPeriodVal.textContent = `${months} mies.`;
    calcRateVal.textContent = `${rate.toFixed(1).replace('.', ',')}%`;
    calcResult.innerHTML = `${fmtNumber(payment)} <small>zł / mies.</small>`;
    calcInterest.textContent = fmtPLN(interest);
    calcTotal.textContent = fmtPLN(total);
  }

  [calcAmount, calcPeriod, calcRate].forEach(el => el && el.addEventListener('input', updateMainCalculator));
  updateMainCalculator();

  /* ---------- Product -> form ---------- */
  const contactSection = $('#kontakt');
  const productSelect = $('#fProduct');
  const amountField = $('#fAmount');
  const nameField = $('#fName');

  function goToForm(product) {
    if (product && productSelect) productSelect.value = product;
    if (contactSection) contactSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => nameField?.focus({ preventScroll: true }), reduceMotion ? 0 : 500);
  }

  $$('.product-select').forEach(button => {
    button.addEventListener('click', () => goToForm(button.dataset.product));
  });

  const calcCta = $('#calcCta');
  if (calcCta) {
    calcCta.addEventListener('click', () => {
      if (productSelect) productSelect.value = 'Kredyt gotówkowy';
      if (amountField && calcAmount) amountField.value = fmtPLN(calcAmount.value);
    });
  }

  /* ---------- Count-up ---------- */
  const statsGrid = $('#statsGrid');
  let statsAnimated = false;

  function showFinalStats() {
    $$('[data-count]', statsGrid || document).forEach(el => {
      const value = Number(el.dataset.count) || 0;
      el.textContent = `${formatInt.format(value)}${el.dataset.suffix || ''}`;
    });
  }

  function animateStats() {
    if (statsAnimated || !statsGrid) return;
    statsAnimated = true;
    const duration = 900;
    const start = performance.now();
    const els = $$('[data-count]', statsGrid);

    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      els.forEach(el => {
        const target = Number(el.dataset.count) || 0;
        const value = Math.round(target * eased);
        el.textContent = `${formatInt.format(value)}${el.dataset.suffix || ''}`;
      });
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  if (statsGrid) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      showFinalStats();
    } else {
      const statsObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          animateStats();
          statsObserver.disconnect();
        }
      }, { threshold: 0.35 });
      statsObserver.observe(statsGrid);
      const statsFallback = () => {
        if (statsAnimated) return;
        const rect = statsGrid.getBoundingClientRect();
        if (rect.top < window.innerHeight * .9 && rect.bottom > 0) {
          animateStats();
          statsObserver.disconnect();
        }
      };
      window.addEventListener('scroll', statsFallback, { passive: true });
      requestAnimationFrame(statsFallback);
    }
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-button').forEach(button => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      $$('.faq-button[aria-expanded="true"]').forEach(openButton => {
        if (openButton === button) return;
        openButton.setAttribute('aria-expanded', 'false');
        const openPanel = document.getElementById(openButton.getAttribute('aria-controls'));
        if (openPanel) openPanel.hidden = true;
      });

      button.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });

  /* ---------- Form ---------- */
  const form = $('#leadForm');
  const success = $('#formSuccess');
  const phoneField = $('#fPhone');
  const emailField = $('#fEmail');
  const consentField = $('#fConsent');

  function phoneDigits(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('48') && digits.length > 9) digits = digits.slice(2);
    return digits.slice(0, 9);
  }

  function formatPhone(value) {
    const digits = phoneDigits(value);
    if (!digits) return '';
    const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean);
    return `+48 ${groups.join(' ')}`;
  }

  if (phoneField) {
    phoneField.addEventListener('input', () => { phoneField.value = formatPhone(phoneField.value); });
  }

  function setFieldValidity(input, valid) {
    if (!input) return valid;
    const field = input.closest('.field');
    field?.classList.toggle('is-invalid', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  function validateForm() {
    const nameOk = (nameField?.value.trim().length || 0) >= 2;
    const phoneOk = phoneDigits(phoneField?.value).length === 9;
    const email = emailField?.value.trim() || '';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const consentOk = Boolean(consentField?.checked);

    setFieldValidity(nameField, nameOk);
    setFieldValidity(phoneField, phoneOk);
    setFieldValidity(emailField, emailOk);
    const consentWrap = consentField?.closest('.consent-wrap');
    consentWrap?.classList.toggle('is-invalid', !consentOk);
    consentField?.setAttribute('aria-invalid', String(!consentOk));

    return nameOk && phoneOk && emailOk && consentOk;
  }

  [nameField, phoneField, emailField].forEach(input => {
    input?.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateForm();
    });
  });
  consentField?.addEventListener('change', () => {
    consentField.closest('.consent-wrap')?.classList.remove('is-invalid');
    consentField.setAttribute('aria-invalid', 'false');
  });

  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!validateForm()) {
        const invalid = $('[aria-invalid="true"]', form);
        invalid?.focus();
        return;
      }

      const submit = $('button[type="submit"]', form);
      const originalText = submit?.textContent;
      if (submit) { submit.disabled = true; submit.textContent = 'Wysyłanie…'; }

      const endpoint = (form.dataset.endpoint || form.getAttribute('action') || '').trim();
      let sent = true;

      if (endpoint && endpoint !== '#') {
        try {
          const response = await fetch(endpoint, {
            method: form.method || 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          sent = response.ok;
        } catch (e) {
          sent = false;
        }
      } else {
        await new Promise(resolve => window.setTimeout(resolve, 280));
      }

      if (submit) { submit.disabled = false; submit.textContent = originalText; }

      if (!sent) {
        window.alert('Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub skontaktuj się telefonicznie.');
        return;
      }

      form.reset();
      $$('.field.is-invalid', form).forEach(field => field.classList.remove('is-invalid'));
      $('.consent-wrap', form)?.classList.remove('is-invalid');
      if (success) success.hidden = false;
    });
  }
})();
