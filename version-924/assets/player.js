(function () {
  "use strict";

  var url = window.__CURRENT_PLAYLIST__;
  var video = document.getElementById("movie-video");
  var cover = document.querySelector("[data-player-start]");
  var hls = null;
  var attached = false;

  function attach() {
    if (!video || !url || attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  function start() {
    if (!video) {
      return;
    }
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
      hls = null;
    }
  });
})();
