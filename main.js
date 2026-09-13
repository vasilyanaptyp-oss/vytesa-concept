/* Vytesa, MB. Koncepcija. Be bibliotekų. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var PHONE = '+37063101202';
  var EMAIL = 'vytesa.mb@gmail.com';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. „Kas nutiko?“: paruoštos žinutės pagal situaciją */
  var MSG = {
    gedimas: {
      subject: 'Gedimas: dingo elektra arba išmuša automatą',
      body: 'Sveiki! Dingo elektra / išmuša automatą. Objektas: [butas ar namas], adresas: [miestas, gatvė]. Kada galėtumėte atvykti? [Vardas]'
    },
    sena: {
      subject: 'Senos elektros instaliacijos keitimas',
      body: 'Sveiki! Noriu keisti seną elektros instaliaciją. Objektas: [butas ar namas, plotas], miestas: [...]. Kada galėtume aptarti? [Vardas]'
    },
    iranga: {
      subject: 'Instaliacijos paruošimas įrangai',
      body: 'Sveiki! Reikia paruošti elektros instaliaciją: [šilumos siurbliui / kondicionieriui / elektromobilio įkrovimo stotelei]. Objektas: [namas ar butas], miestas: [...]. Kada galėtume aptarti? [Vardas]'
    },
    naujas: {
      subject: 'Nauja instaliacija: namas ar renovacija',
      body: 'Sveiki! Reikia elektros instaliacijos [naujam namui / renovacijai]. Objektas: [...], miestas: [...], statybos etapas: [...]. Kada galėtume aptarti? [Vardas]'
    },
    kita: {
      subject: 'Elektriko paslaugos',
      body: 'Sveiki! Reikia elektriko: [trumpai, kas reikalinga]. Miestas: [...]. Kada galėtume aptarti? [Vardas]'
    }
  };

  var picker = document.querySelector('.picker');
  if (picker) {
    var btns = Array.prototype.slice.call(picker.querySelectorAll('.brk'));
    var empty = picker.querySelector('.det-empty');
    var detOf = function (b) { return document.getElementById(b.getAttribute('aria-controls')); };

    btns.forEach(function (b) {
      var det = detOf(b), m = MSG[b.getAttribute('data-key')];
      if (!det || !m) return;
      var sms = det.querySelector('[data-act="sms"]');
      var mail = det.querySelector('[data-act="mail"]');
      /* „?&body=“ supranta ir iOS, ir Android */
      if (sms) sms.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(m.body);
      if (mail) mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body);
    });

    var select = function (btn) {
      var wasOpen = btn.getAttribute('aria-expanded') === 'true';
      btns.forEach(function (b) {
        var det = detOf(b), on = (b === btn) && !wasOpen;
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        if (!det) return;
        if (on) {
          det.hidden = false;
          det.classList.remove('show');
          void det.offsetWidth;
          det.classList.add('show');
        } else {
          det.hidden = true;
          det.classList.remove('show');
        }
      });
      if (empty) empty.hidden = btns.some(function (b) { return b.getAttribute('aria-expanded') === 'true'; });
      if (!wasOpen && window.innerWidth < 900) {
        var det = detOf(btn);
        if (det && det.getBoundingClientRect().bottom > window.innerHeight) {
          btn.parentNode.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
      }
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { select(b); }); });
    picker.addEventListener('keydown', function (e) {
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = btns[(i + 1) % btns.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = btns[(i - 1 + btns.length) % btns.length];
      if (e.key === 'Home') next = btns[0];
      if (e.key === 'End') next = btns[btns.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  }

  /* 2. Atsiskleidimas slenkant: be IntersectionObserver, su draudimu likti nematomam */
  var rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  var check = function () {
    var vh = window.innerHeight;
    for (var i = 0; i < rv.length; i++) {
      var el = rv[i];
      if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh) el.classList.add('in');
    }
  };
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  check();
  setTimeout(check, 1200);

  /* 3. Srovės linija: užsipildo pagal slinkimą */
  var spine = document.querySelector('.spine i');
  if (spine) {
    var fill = function () {
      var max = root.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 1;
      spine.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    };
    window.addEventListener('scroll', fill, { passive: true });
    window.addEventListener('resize', fill);
    window.addEventListener('load', fill);
    fill();
  }

  /* 4. Nuotraukų peržiūra */
  var lb = document.getElementById('lb');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap');
    Array.prototype.forEach.call(document.querySelectorAll('.ph'), function (btn) {
      btn.addEventListener('click', function () {
        var small = btn.querySelector('img');
        lbImg.src = btn.getAttribute('data-full');
        lbImg.alt = small ? small.alt : '';
        var cap = btn.parentNode.querySelector('figcaption');
        lbCap.textContent = cap ? cap.textContent : '';
        lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb-close')) lb.close();
    });
    lb.addEventListener('close', function () { lbImg.removeAttribute('src'); });
  }
})();
