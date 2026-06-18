(function() {
  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) { slide.classList.toggle("is-active", i === active); });
      dots.forEach(function(dot, i) { dot.classList.toggle("is-active", i === active); });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function() { show(active + 1); }, 5000);
    }
    dots.forEach(function(dot, i) { dot.addEventListener("click", function() { show(i); start(); }); });
    if (slides.length) { show(0); start(); }
  }
  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var search = scope.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var reset = scope.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      if (search && params.get("q")) search.value = params.get("q");
      function selected(name) {
        var el = scope.querySelector('[data-filter-select="' + name + '"]');
        return el ? el.value.trim().toLowerCase() : "";
      }
      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var region = selected("region");
        var year = selected("year");
        var type = selected("type");
        var visible = 0;
        cards.forEach(function(card) {
          var ok = true;
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          if (q && text.indexOf(q) === -1) ok = false;
          if (region && (card.getAttribute("data-region") || "").toLowerCase() !== region) ok = false;
          if (year && (card.getAttribute("data-year") || "").toLowerCase() !== year) ok = false;
          if (type && (card.getAttribute("data-type") || "").toLowerCase() !== type) ok = false;
          card.classList.toggle("is-hidden", !ok);
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle("is-visible", visible === 0);
      }
      if (search) search.addEventListener("input", apply);
      selects.forEach(function(el) { el.addEventListener("change", apply); });
      if (reset) reset.addEventListener("click", function() {
        if (search) search.value = "";
        selects.forEach(function(el) { el.value = ""; });
        apply();
      });
      apply();
    });
  }
  document.addEventListener("DOMContentLoaded", function() {
    setupHero();
    setupFilters();
  });
})();
