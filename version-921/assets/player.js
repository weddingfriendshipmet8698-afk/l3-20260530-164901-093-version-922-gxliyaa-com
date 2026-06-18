(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-trigger');
    var url = shell.getAttribute('data-play');
    var hls = null;
    var loaded = false;

    if (!video || !url) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      shell.classList.add('is-ready');
    }

    function start() {
      loadVideo();
      shell.classList.add('is-playing');
      if (button) {
        button.hidden = true;
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          shell.classList.remove('is-playing');
          if (button) {
            button.hidden = false;
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video || event.target.closest('.player-trigger')) {
        return;
      }
      start();
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      if (button) {
        button.hidden = true;
      }
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        return;
      }
      shell.classList.remove('is-playing');
      if (button) {
        button.hidden = false;
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.querySelectorAll('.player-shell').forEach(initPlayer);
})();
