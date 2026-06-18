(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      var expanded = nav.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length || !dots.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.getAttribute('data-filter-panel');
      var grid = document.querySelector('[data-grid="' + scope + '"]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      var input = panel.querySelector('[data-search-input]');
      var year = panel.querySelector('[data-year-select]');
      var sort = panel.querySelector('[data-sort-select]');
      var empty = document.querySelector('[data-empty="' + scope + '"]');
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchQuery = !q || haystack.indexOf(q) !== -1;
          var matchYear = !y || card.getAttribute('data-year') === y;
          var show = matchQuery && matchYear;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      function reorder() {
        if (!sort) {
          return;
        }
        var value = sort.value;
        var ordered = cards.slice().sort(function (a, b) {
          if (value === 'rating') {
            return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
          }
          if (value === 'year') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (value === 'views') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }
          return Number(a.getAttribute('data-index')) - Number(b.getAttribute('data-index'));
        });
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (sort) {
        sort.addEventListener('change', function () {
          reorder();
          apply();
        });
      }
      reorder();
      apply();
    });
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var message = player.querySelector('.player-error');
    var src = player.getAttribute('data-src');
    var attached = false;
    var hls = null;
    function attach() {
      if (attached || !video || !src) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (!video.seeking && video.currentTime === 0 && overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        if (message) {
          message.textContent = '播放加载失败，请稍后重试';
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
