/* ============================================================
   pierrelouisdivaris.com
   Two behaviours: the FR/EN switch and the reveal-on-scroll.
   FR is what ships in the HTML; EN lives in data-en attributes,
   so the page reads fine with JavaScript off.
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'pld-lang';

  var META = {
    fr: {
      title: 'Pierre-Louis Divaris, CFA — Ventes complexes en analytics',
      description: "Vente complexe de solutions d'analytics pour investisseurs institutionnels et gérants de fonds. Risque factoriel, crédit, liquidité, attribution de performance. CFA charterholder, Paris."
    },
    en: {
      title: 'Pierre-Louis Divaris, CFA — Complex sales in analytics',
      description: 'Complex sales of analytics solutions to institutional investors and asset managers. Factor risk, credit, liquidity, performance attribution. CFA charterholder, Paris.'
    }
  };

  /* ---- Language ------------------------------------------------------- */

  var translatable = document.querySelectorAll('[data-en]');
  var buttons = document.querySelectorAll('.lang-switch button');

  // Stash the FR copy the first time round, so switching back is lossless.
  Array.prototype.forEach.call(translatable, function (el) {
    el.setAttribute('data-fr', el.innerHTML);
  });

  function setLang(next, persist) {
    var lang = next;
    var meta = META[lang] || META.fr;

    Array.prototype.forEach.call(translatable, function (el) {
      el.innerHTML = el.getAttribute(lang === 'en' ? 'data-en' : 'data-fr');
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-en-aria]'), function (el) {
      if (!el.hasAttribute('data-fr-aria')) el.setAttribute('data-fr-aria', el.getAttribute('aria-label'));
      el.setAttribute('aria-label', el.getAttribute(lang === 'en' ? 'data-en-aria' : 'data-fr-aria'));
    });

    document.documentElement.lang = lang;
    document.title = meta.title;

    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.description);

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
    }
  }

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () { setLang(btn.dataset.lang, true); });
  });

  // ?lang=en wins over the stored preference, so a link can force a language.
  var requested = new URLSearchParams(location.search).get('lang');
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }

  var initial = requested === 'en' || requested === 'fr' ? requested : stored;
  if (initial === 'en') setLang('en', false);

  /* ---- Reveal on scroll ----------------------------------------------- */

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var els = Array.prototype.slice.call(
    document.querySelectorAll('section > div > h2, section [data-cols] > *, section [data-split] > *')
  );
  var show = function (el) { el.style.opacity = '1'; el.style.transform = 'none'; };
  var fired = false;

  var io = new IntersectionObserver(function (entries) {
    fired = true;
    entries.forEach(function (e) {
      if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    });
  });

  els.forEach(function (el, i) {
    var delay = (i % 4) * 0.05;
    el.style.transition =
      'opacity .45s cubic-bezier(.16,1,.3,1) ' + delay + 's, ' +
      'transform .45s cubic-bezier(.16,1,.3,1) ' + delay + 's';

    // Already in view: leave it visible rather than fading it in on load.
    if (el.getBoundingClientRect().top < (window.innerHeight || 800)) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    io.observe(el);
  });

  // Safety net if the observer never fires.
  setTimeout(function () { if (!fired) els.forEach(show); }, 1200);
})();
