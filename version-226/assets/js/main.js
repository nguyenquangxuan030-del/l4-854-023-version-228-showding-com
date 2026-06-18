(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCatalog() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-catalog-search]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
    var empty = document.querySelector(".empty-state");
    if (!cards.length || !search) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var activeFilter = "all";
    if (initialQuery) {
      search.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function update() {
      var query = normalize(search.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var filterText = normalize(card.getAttribute("data-filter"));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchFilter = activeFilter === "all" || filterText.indexOf(normalize(activeFilter)) !== -1;
        var match = matchQuery && matchFilter;
        card.classList.toggle("hidden-by-filter", !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    search.addEventListener("input", update);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter-value") || "all";
        update();
      });
    });
    update();
  }

  window.initializeMoviePlayer = function (videoAddress, posterAddress) {
    var holder = document.querySelector("[data-player]");
    if (!holder) {
      return;
    }
    var video = holder.querySelector("video");
    var cover = holder.querySelector(".player-cover");
    var hlsInstance = null;
    var started = false;

    function attach() {
      if (started) {
        return;
      }
      started = true;
      holder.classList.add("is-started");
      if (posterAddress) {
        video.setAttribute("poster", posterAddress);
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoAddress;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(videoAddress);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoAddress;
      }
    }

    function play() {
      attach();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initCatalog();
  });
})();
