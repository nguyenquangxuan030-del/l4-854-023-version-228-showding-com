async function setupHlsPlayer() {
    const shell = document.querySelector('[data-player-shell]');
    const video = document.querySelector('video[data-hls-src]');
    const startButton = document.querySelector('[data-player-start]');
    const status = document.querySelector('[data-player-status]');

    if (!shell || !video || !startButton) {
        return;
    }

    let initialized = false;
    let hlsInstance = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message || '';
        }
    }

    async function initializeAndPlay() {
        const source = video.dataset.hlsSrc;

        if (!source || initialized) {
            if (initialized) {
                try {
                    await video.play();
                } catch (error) {
                    setStatus('请再次点击播放器开始播放');
                }
            }
            return;
        }

        initialized = true;
        shell.classList.add('is-playing');
        video.controls = true;
        setStatus('正在加载播放源...');

        try {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                const module = await import('./video-vendor-dru42stk.js');
                const Hls = module.H;

                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            await video.play();
            setStatus('');
        } catch (error) {
            initialized = false;
            shell.classList.remove('is-playing');
            setStatus('播放源加载失败，请刷新页面后重试');
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        }
    }

    startButton.addEventListener('click', function (event) {
        event.preventDefault();
        initializeAndPlay();
    });

    shell.addEventListener('click', function (event) {
        if (event.target === startButton || startButton.contains(event.target)) {
            return;
        }
        if (!initialized) {
            initializeAndPlay();
        }
    });
}

setupHlsPlayer();
