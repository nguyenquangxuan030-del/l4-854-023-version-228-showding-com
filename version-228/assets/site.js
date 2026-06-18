(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    var current = select.value;
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = current;
  }

  function setupCardFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var grid = scope.parentElement.querySelector('[data-card-grid]');
      var empty = scope.parentElement.querySelector('[data-empty-state]');
      if (!grid) {
        return;
      }
      var input = scope.querySelector('[data-card-search]');
      var regionSelect = scope.querySelector('[data-filter-region]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var channelSelect = scope.querySelector('[data-filter-channel]');
      var sortSelect = scope.querySelector('[data-card-sort]');
      var cards = selectAll('[data-card]', grid);
      var regions = Array.from(new Set(cards.map(function (card) {
        return card.dataset.region || '';
      }))).sort();
      var types = Array.from(new Set(cards.map(function (card) {
        return card.dataset.type || '';
      }))).sort();
      fillSelect(regionSelect, regions);
      fillSelect(typeSelect, types);

      function applySort(visibleCards) {
        var mode = sortSelect ? sortSelect.value : 'default';
        var ordered = visibleCards.slice();
        if (mode === 'rating') {
          ordered.sort(function (a, b) {
            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
          });
        }
        if (mode === 'views') {
          ordered.sort(function (a, b) {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          });
        }
        if (mode === 'year') {
          ordered.sort(function (a, b) {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          });
        }
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function update() {
        var keyword = normalize(input ? input.value : '');
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var channel = channelSelect ? channelSelect.value : '';
        var visibleCards = [];
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags,
            card.dataset.channel
          ].join(' '));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && card.dataset.region !== region) {
            matched = false;
          }
          if (type && card.dataset.type !== type) {
            matched = false;
          }
          if (channel && card.dataset.channel !== channel) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visibleCards.push(card);
          }
        });
        applySort(visibleCards);
        if (empty) {
          empty.classList.toggle('is-visible', visibleCards.length === 0);
        }
      }

      [input, regionSelect, typeSelect, channelSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) {
        input.value = query;
      }
      update();
    });
  }

  window.initMoviePlayer = function (videoUrl) {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var ready = false;
    var hlsInstance = null;

    function attachSource() {
      if (ready || !videoUrl) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function startPlayback() {
      attachSource();
      var promise = video.play();
      player.classList.add('is-playing');
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupCardFilters();
  });
}());
