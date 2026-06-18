(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video");
    var button = root.querySelector(".play-overlay");
    var stream = root.getAttribute("data-stream");
    var prepared = false;
    var hls = null;

    if (!video || !button || !stream) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
    }

    function start() {
      prepare();
      button.classList.add("is-hidden");
      video.controls = true;

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll(".movie-player").forEach(setupPlayer);
})();
