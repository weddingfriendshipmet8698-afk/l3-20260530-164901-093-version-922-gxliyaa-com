
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function attachVideo(video, url, onReady) {
    if (video.dataset.ready === "1") {
      onReady();
      return;
    }
    video.dataset.ready = "1";
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          video.src = url;
          video.load();
        }
      });
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", onReady, { once: true });
      return;
    }
    video.src = url;
    video.addEventListener("loadedmetadata", onReady, { once: true });
  }

  ready(function () {
    document.querySelectorAll(".video-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute("data-src");
      var start = function () {
        if (!url) {
          return;
        }
        attachVideo(video, url, function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        });
      };
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
    });
  });
})();
