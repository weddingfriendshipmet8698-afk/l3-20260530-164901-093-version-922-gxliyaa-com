document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupHeroSlider();
  setupFiltering();
  setupPlayers();
});

function setupMenu() {
  var button = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function setupHeroSlider() {
  var hero = document.querySelector("[data-hero-slider]");

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-slide-dot]"));
  var current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle("active", position === current);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle("active", position === current);
    });
  }

  dots.forEach(function (dot, position) {
    dot.addEventListener("click", function () {
      showSlide(position);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }
}

function setupFiltering() {
  var input = document.querySelector("[data-filter-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
  var activeType = "全部";

  if (!cards.length) {
    return;
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type")
    ].join(" ").toLowerCase();
  }

  function applyFilter() {
    var keyword = input ? input.value.trim().toLowerCase() : "";

    cards.forEach(function (card) {
      var content = textOf(card);
      var type = (card.getAttribute("data-type") || "").toLowerCase();
      var matchesKeyword = !keyword || content.indexOf(keyword) !== -1;
      var matchesType = activeType === "全部" || type.indexOf(activeType.toLowerCase()) !== -1 || content.indexOf(activeType.toLowerCase()) !== -1;
      var visible = matchesKeyword && matchesType;

      if (visible) {
        card.removeAttribute("hidden-by-filter");
      } else {
        card.setAttribute("hidden-by-filter", "true");
      }
    });
  }

  if (input) {
    input.addEventListener("input", applyFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeType = chip.getAttribute("data-filter-button") || "全部";
      chips.forEach(function (item) {
        item.classList.toggle("active", item === chip);
      });
      applyFilter();
    });
  });
}

function setupPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (box) {
    var video = box.querySelector("video");
    var trigger = box.querySelector("[data-play-trigger]");
    var src = box.getAttribute("data-video-src");
    var loaded = false;

    if (!video || !trigger || !src) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      loadVideo();
      trigger.classList.add("hidden");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          trigger.classList.remove("hidden");
        });
      }
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      trigger.classList.add("hidden");
    });
  });
}
