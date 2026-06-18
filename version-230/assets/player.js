var MoviePlayer = (function () {
  var hls = null;

  function boot(src) {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('movie-play-button');
    var cover = document.getElementById('movie-player-cover');
    var loaded = false;

    if (!video || !button || !cover || !src) {
      return;
    }

    function hideCover() {
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
      } else {
        video.src = src;
      }
    }

    function play() {
      hideCover();
      attach();
      video.play().catch(function () {});
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });

    cover.addEventListener('click', function () {
      play();
    });

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', hideCover);
  }

  return {
    boot: boot
  };
})();
