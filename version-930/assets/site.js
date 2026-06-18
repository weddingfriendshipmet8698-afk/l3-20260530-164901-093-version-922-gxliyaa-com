
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function runSearch(form) {
    var input = form.querySelector('input[name="q"]');
    var query = input ? input.value.trim() : "";
    var base = form.getAttribute("data-base") || "";
    if (query) {
      window.location.href = base + "search.html?q=" + encodeURIComponent(query);
    }
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '  <span class="poster-frame">',
      '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '    <span class="poster-gradient"></span>',
      '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="score-badge">★ ' + escapeHtml(movie.rating) + '</span>',
      '    <span class="card-meta">' + escapeHtml(movie.duration) + ' · ' + Number(movie.views).toLocaleString() + '观看</span>',
      '  </span>',
      '  <span class="card-title">' + escapeHtml(movie.title) + '</span>',
      '  <span class="card-desc">' + escapeHtml(movie.description) + '</span>',
      '  <span class="card-tags">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span>',
      '</a>'
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.textContent = open ? "×" : "☰";
      });
    }

    document.querySelectorAll(".search-form, .mobile-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch(form);
      });
    });

    var results = document.getElementById("search-results");
    var note = document.getElementById("search-note");
    if (results && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim().toLowerCase();
      var list = window.SEARCH_MOVIES;
      var matched = query
        ? list.filter(function (movie) {
            var haystack = [movie.title, movie.description, movie.region, movie.year, movie.genre, movie.tags, movie.category].join(" ").toLowerCase();
            return haystack.indexOf(query) !== -1;
          })
        : list.slice(0, 96);
      if (note) {
        note.textContent = query ? "搜索到 " + matched.length + " 部相关影片" : "输入关键词可搜索完整片库，下面展示热门影片";
      }
      results.innerHTML = matched.slice(0, 240).map(movieCard).join("\n");
    }
  });
})();
