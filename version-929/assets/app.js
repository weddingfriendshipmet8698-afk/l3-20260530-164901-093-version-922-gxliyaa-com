(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (slides.length) {
      var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
      var index = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      }));
      var timer;

      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
          dot.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      document.querySelectorAll("[data-hero]").forEach(function (button) {
        button.addEventListener("click", function () {
          var action = button.getAttribute("data-hero");
          show(action === "prev" ? index - 1 : index + 1);
          start();
        });
      });

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      show(index);
      start();
    }

    var searchInput = document.querySelector("#searchInput");
    var searchResults = document.querySelector("#searchResults");
    if (searchInput && searchResults && window.movieSearchIndex) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;

      function render() {
        var query = searchInput.value.trim().toLowerCase();
        var items = window.movieSearchIndex.filter(function (item) {
          if (!query) {
            return true;
          }
          return [item.title, item.year, item.region, item.type, item.genre, item.tags, item.line]
            .join(" ")
            .toLowerCase()
            .indexOf(query) >= 0;
        }).slice(0, 96);

        if (!items.length) {
          searchResults.innerHTML = '<div class="search-empty">没有找到匹配内容，可以换一个关键词继续搜索。</div>';
          return;
        }

        searchResults.innerHTML = items.map(function (item) {
          return '<article class="movie-card dusk-card">' +
            '<a class="poster-link" href="' + item.href + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="play-dot">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<div class="movie-meta-row"><span class="score">★ ' + item.rating + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
            '<h3><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p>' + escapeHtml(item.line) + '</p>' +
            '<div class="tag-line"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
            '</div>' +
            '</article>';
        }).join("");
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
          }[char];
        });
      }

      searchInput.addEventListener("input", render);
      render();
    }
  });
})();

function setupMoviePlayer(playUrl, videoId, buttonId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !playUrl) {
    return;
  }

  var hlsInstance = null;
  var initialized = false;

  function attach() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = playUrl;
    }
  }

  function begin() {
    attach();
    if (button) {
      button.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", begin);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (button && video.currentTime === 0) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
