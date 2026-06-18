(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    ready(function () {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
            });
        });

        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-form]").forEach(function (form) {
            var list = document.querySelector("[data-filter-list]");
            var emptyState = document.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var queryInput = form.querySelector("input[name='q']");
            var yearSelect = form.querySelector("select[name='year']");

            if (queryInput && params.get("q")) {
                queryInput.value = params.get("q");
            }
            if (yearSelect && params.get("year")) {
                yearSelect.value = params.get("year");
            }

            function applyFilter() {
                var query = normalize(queryInput ? queryInput.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year);
                    card.classList.toggle("hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("show", visible === 0);
                }
            }

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilter();
            });
            if (queryInput) {
                queryInput.addEventListener("input", applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilter);
            }
            applyFilter();
        });

        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var playButton = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-video-src");
            var hlsInstance = null;
            var initialized = false;

            function setStatus(text) {
                if (status) {
                    status.textContent = text || "";
                }
            }

            function initialize() {
                if (!video || !source || initialized) {
                    return;
                }
                initialized = true;
                setStatus("正在加载影片...");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("");
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setStatus("播放加载异常，正在尝试恢复");
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            }
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("");
                    }, { once: true });
                } else {
                    video.src = source;
                    setStatus("当前浏览器暂不支持在线播放");
                }
            }

            function playOrPause() {
                initialize();
                if (!video) {
                    return;
                }
                if (video.paused) {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            setStatus("点击播放器后可继续播放");
                        });
                    }
                } else {
                    video.pause();
                }
            }

            if (playButton) {
                playButton.addEventListener("click", playOrPause);
            }
            if (video) {
                video.addEventListener("click", playOrPause);
                video.addEventListener("play", function () {
                    if (playButton) {
                        playButton.classList.add("hidden");
                    }
                    setStatus("");
                });
                video.addEventListener("pause", function () {
                    if (playButton) {
                        playButton.classList.remove("hidden");
                    }
                });
                video.addEventListener("ended", function () {
                    if (playButton) {
                        playButton.classList.remove("hidden");
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    });
})();
