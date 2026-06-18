(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs(".nav-toggle");
  var panel = qs(".nav-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  qsa(".nav-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = qs("input[name='q']", form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
    });
  });

  qsa("[data-hero]").forEach(function (hero) {
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  });

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function filterScope(scope) {
    var input = qs("[data-filter-input]", scope);
    var year = qs("[data-filter-year]", scope);
    var region = qs("[data-filter-region]", scope);
    var cards = qsa(".filter-card", scope);

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
        card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchRegion));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (region) {
      region.addEventListener("change", apply);
    }

    qsa("[data-search-term]", scope).forEach(function (button) {
      button.addEventListener("click", function () {
        if (input) {
          input.value = button.getAttribute("data-search-term") || "";
          apply();
          input.focus();
        }
      });
    });

    if (scope.hasAttribute("data-search-page")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (input && q) {
        input.value = q;
      }
    }

    apply();
  }

  qsa("[data-filter-scope]").forEach(filterScope);
})();
