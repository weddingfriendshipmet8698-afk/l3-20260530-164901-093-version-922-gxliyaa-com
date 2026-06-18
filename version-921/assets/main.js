(function () {
  var header = document.getElementById('siteHeader');
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function setHeader() {
    if (!header || header.classList.contains('is-solid')) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  window.addEventListener('scroll', setHeader, { passive: true });
  setHeader();

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.textContent = open ? '×' : '☰';
    });
  }

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    startTimer();
  }

  var scopes = document.querySelectorAll('[data-filter-scope]');
  scopes.forEach(function (scope) {
    var main = scope.parentElement;
    var input = scope.querySelector('[data-filter-input]');
    var category = scope.querySelector('[data-filter-category]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var list = main ? main.querySelector('[data-card-list]') : document.querySelector('[data-card-list]');
    var status = main ? main.querySelector('[data-filter-status]') : null;
    var empty = main ? main.querySelector('[data-empty-state]') : null;
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      if (!list) {
        return;
      }
      var q = normalize(input ? input.value : '');
      var cat = category ? category.value : '';
      var yr = year ? year.value : '';
      var tp = type ? type.value : '';
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (cat && card.getAttribute('data-category') !== cat) {
          ok = false;
        }
        if (yr && card.getAttribute('data-year') !== yr) {
          ok = false;
        }
        if (tp && card.getAttribute('data-type') !== tp) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
      if (status) {
        status.textContent = q || cat || yr || tp ? '筛选结果已更新' : '输入关键词开始筛选';
      }
    }

    [input, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
