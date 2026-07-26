/* ============================================================
   fiche.html — bascule FR/EN, jalons du graphique, accordéon
   des expositions. Comme sur le reste du site, le français est
   dans le HTML et l'anglais dans les attributs data-en : la page
   reste lisible sans JavaScript.
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'pld-lang';   // partagé avec index.html : le choix suit d'une page à l'autre

  var TITLES = {
    fr: 'Pierre-Louis Divaris, CFA — Fiche',
    en: 'Pierre-Louis Divaris, CFA — Factsheet'
  };

  /* ---- Langue ---------------------------------------------------------- */

  var translatable = document.querySelectorAll('[data-en]');
  var langButtons = document.querySelectorAll('.lang-switch button');

  Array.prototype.forEach.call(translatable, function (el) {
    el.setAttribute('data-fr', el.innerHTML);
  });

  function setLang(lang, persist) {
    Array.prototype.forEach.call(translatable, function (el) {
      el.innerHTML = el.getAttribute(lang === 'en' ? 'data-en' : 'data-fr');
    });
    document.documentElement.lang = lang;
    document.title = TITLES[lang] || TITLES.fr;
    Array.prototype.forEach.call(langButtons, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* navigation privée */ }
    }
  }

  Array.prototype.forEach.call(langButtons, function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang, true); });
  });

  var requested = new URLSearchParams(location.search).get('lang');
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* navigation privée */ }
  var initial = requested === 'en' || requested === 'fr' ? requested : stored;
  if (initial === 'en') setLang('en', false);

  /* ---- Jalons du graphique --------------------------------------------- */

  var dots = document.querySelectorAll('.ms-dot');
  var panels = document.querySelectorAll('.ms-panel');

  function selectMilestone(key) {
    Array.prototype.forEach.call(panels, function (p) {
      p.hidden = p.dataset.panel !== key;
    });
    Array.prototype.forEach.call(dots, function (d) {
      if (d.dataset.ms === key) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  Array.prototype.forEach.call(dots, function (d) {
    var pick = function () { selectMilestone(d.dataset.ms); };
    d.addEventListener('click', pick);
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    });
  });
  if (dots.length) selectMilestone('y25');

  /* ---- Expositions factorielles ---------------------------------------- */

  Array.prototype.forEach.call(document.querySelectorAll('.factor'), function (f) {
    var row = f.querySelector('.factor-row');
    var detail = f.querySelector('.factor-detail');
    row.addEventListener('click', function () {
      var open = f.classList.toggle('is-open');
      row.setAttribute('aria-expanded', String(open));
      detail.hidden = !open;
    });
  });

  /* ---- Barres : on les laisse pousser une fois la page posée ----------- */

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('is-armed');
  } else {
    requestAnimationFrame(function () {
      setTimeout(function () { document.body.classList.add('is-armed'); }, 120);
    });
  }
})();
