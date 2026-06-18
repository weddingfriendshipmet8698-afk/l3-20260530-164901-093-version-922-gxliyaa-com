(function() {
  function initMoviePlayer(source) {
    var video = document.querySelector("[data-movie-video]");
    var cover = document.querySelector("[data-video-cover]");
    var trigger = document.querySelector("[data-play-trigger]");
    var started = false;
    var hls = null;
    if (!video || !source) return;
    function playVideo() {
      if (cover) cover.classList.add("is-hidden");
      var p = video.play();
      if (p && typeof p.catch === "function") p.catch(function() {});
    }
    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        playVideo();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() { playVideo(); });
      } else {
        video.src = source;
        playVideo();
      }
    }
    if (trigger) trigger.addEventListener("click", start);
    if (cover) cover.addEventListener("click", start);
    video.addEventListener("click", function() { if (video.paused) start(); });
    window.addEventListener("pagehide", function() { if (hls) hls.destroy(); });
  }
  window.initMoviePlayer = initMoviePlayer;
})();
