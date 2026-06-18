(function () {
    window.setupPlayer = function (streamUrl) {
        var frame = document.querySelector('[data-player-root]');

        if (!frame) {
            return;
        }

        var video = frame.querySelector('video');
        var overlay = frame.querySelector('.player-overlay');
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function bindStream() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function showOverlay() {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        }

        function playVideo() {
            hideOverlay();
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        bindStream();

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('play', hideOverlay);
        video.addEventListener('pause', showOverlay);
        video.addEventListener('ended', showOverlay);
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
