// Scroll-spy active nav + BibTeX copy-to-clipboard.
(function () {
  'use strict';

  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav-sections a[href^="#"]')
    );
    if (!links.length) return;

    // Map each nav link to its target section element.
    var entries = links
      .map(function (link) {
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        return target ? { link: link, target: target } : null;
      })
      .filter(Boolean);
    if (!entries.length) return;

    var navHeight =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 58;

    function setActive(activeLink) {
      entries.forEach(function (e) {
        e.link.classList.toggle('is-active', e.link === activeLink);
      });
    }

    function onScroll() {
      // The section whose top is closest above the nav line is "current".
      var line = navHeight + 24;
      var current = entries[0];
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].target.getBoundingClientRect().top <= line) {
          current = entries[i];
        }
      }
      // At the very bottom, force the last section active.
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 2
      ) {
        current = entries[entries.length - 1];
      }
      setActive(current.link);
    }

    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
      },
      { passive: true }
    );
    onScroll();
  }

  function initBibtexCopy() {
    var btn = document.getElementById('bibtex-copy');
    var code = document.getElementById('bibtex-code');
    if (!btn || !code) return;
    var label = btn.querySelector('.bibtex-copy-label');

    btn.addEventListener('click', function () {
      var text = code.innerText;
      var done = function () {
        btn.classList.add('is-copied');
        if (label) label.textContent = 'Copied!';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          if (label) label.textContent = 'Copy';
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          done();
        } catch (e) {
          /* no-op */
        }
        document.body.removeChild(ta);
      }
    });
  }

  function init() {
    initScrollSpy();
    initBibtexCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
