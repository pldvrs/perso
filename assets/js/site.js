/* ============================================================
   pierrelouisdivaris.com
   Two behaviours: the FR/EN switch and the reveal-on-scroll.
   FR is what ships in the HTML; EN lives in data-en attributes,
   so the page reads fine with JavaScript off.
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'pld-lang';
  var EMAIL = 'pierrelouisdivaris@gmail.com';

  // Un site statique ne peut pas envoyer d'email tout seul : il faut un
  // service qui reçoit le formulaire et le relaie. Colle ici l'URL donnée
  // par Formspree ou Web3Forms et l'envoi devient silencieux, sans quitter
  // la page. Laissé vide, le formulaire bascule sur le client mail.
  var FORM_ENDPOINT = '';

  var META = {
    fr: {
      title: 'Pierre-Louis Divaris, CFA — Ventes complexes en analytics',
      description: "Vente complexe de solutions d'analytics pour investisseurs institutionnels et gérants de fonds. Risque factoriel, crédit, liquidité, attribution de performance. CFA charterholder, Paris.",
      courseSubject: 'Cours de finance',
      subjects: {
        opportunity: 'Une opportunité',
        portfolio: 'Une question sur un portefeuille',
        course: 'Des cours de finance',
        other: 'Prise de contact'
      },
      required: 'Merci de remplir votre nom, votre email et votre message.',
      badEmail: 'Cette adresse email ne semble pas valide.',
      failed: 'L\'envoi a échoué. Écrivez-moi directement à ' + EMAIL + '.',
      sending: 'Envoi…'
    },
    en: {
      title: 'Pierre-Louis Divaris, CFA — Complex sales in analytics',
      description: 'Complex sales of analytics solutions to institutional investors and asset managers. Factor risk, credit, liquidity, performance attribution. CFA charterholder, Paris.',
      courseSubject: 'Finance tutoring',
      subjects: {
        opportunity: 'An opportunity',
        portfolio: 'A portfolio question',
        course: 'Finance courses',
        other: 'Getting in touch'
      },
      required: 'Please fill in your name, your email and your message.',
      badEmail: 'That email address does not look valid.',
      failed: 'Sending failed. Write to me directly at ' + EMAIL + '.',
      sending: 'Sending…'
    }
  };

  var lang = 'fr';

  /* ---- Language ------------------------------------------------------- */

  var translatable = document.querySelectorAll('[data-en]');
  var buttons = document.querySelectorAll('.lang-switch button');

  // Stash the FR copy the first time round, so switching back is lossless.
  Array.prototype.forEach.call(translatable, function (el) {
    el.setAttribute('data-fr', el.innerHTML);
  });

  function setLang(next, persist) {
    lang = next;
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

  /* ---- Contact box ----------------------------------------------------- */

  var dialog = document.getElementById('contact-dialog');
  var form = document.getElementById('contact-form');
  var sent = document.getElementById('contact-sent');
  var errorBox = document.getElementById('cf-error');

  if (dialog && form) {
    var f = form.elements;                       // form.name renverrait l'attribut du <form>
    var submitBtn = form.querySelector('button[type="submit"]');

    var openDialog = function (subject) {
      form.hidden = false;
      sent.hidden = true;
      errorBox.hidden = true;
      if (subject) f.subject.value = subject;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');       // très vieux navigateurs
      f.name.focus();
    };

    Array.prototype.forEach.call(document.querySelectorAll('[data-open-contact]'), function (btn) {
      btn.addEventListener('click', function () { openDialog(btn.dataset.subject); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-close-contact]'), function (btn) {
      btn.addEventListener('click', function () { dialog.close(); });
    });

    // Clic sur le fond : le <dialog> lui-même occupe toute la fenêtre.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

    var fail = function (msg, field) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = META[lang] || META.fr;
      var name = f.name.value.trim();
      var email = f.email.value.trim();
      var message = f.message.value.trim();

      ['name', 'email', 'message'].forEach(function (k) { f[k].removeAttribute('aria-invalid'); });
      errorBox.hidden = true;

      if (f.company.value) return;                       // robot
      if (!name || !email || !message) {
        return fail(t.required, !name ? f.name : (!email ? f.email : f.message));
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail(t.badEmail, f.email);

      var subject = t.subjects[f.subject.value] || t.subjects.other;
      var showSent = function () { form.hidden = true; sent.hidden = false; sent.querySelector('button').focus(); };

      // Sans service configuré, on prépare le mail dans le client de l'auteur
      // du message : ça part quand même, mais il doit appuyer sur « envoyer ».
      if (!FORM_ENDPOINT) {
        window.location.href = 'mailto:' + EMAIL +
          '?subject=' + encodeURIComponent(subject + ' — ' + name) +
          '&body=' + encodeURIComponent(message + '\n\n— ' + name + '\n' + email);
        showSent();
        return;
      }

      var label = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = t.sending;

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        showSent();
      }).catch(function () {
        fail(t.failed);
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = label;
      });
    });
  }

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
