(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  if (slides.length) {
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    showSlide(0);
    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('select'));
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));

    function matchesYear(card, value) {
      if (!value) {
        return true;
      }
      var year = parseInt(card.getAttribute('data-year') || '0', 10);
      if (!year) {
        return false;
      }
      if (value === '2020-2023') {
        return year >= 2020 && year <= 2023;
      }
      if (value === '2010-2019') {
        return year >= 2010 && year <= 2019;
      }
      if (value === '2000-2009') {
        return year >= 2000 && year <= 2009;
      }
      if (value === 'before-2000') {
        return year < 2000;
      }
      return String(year) === value;
    }

    function update() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var filters = {};
      selects.forEach(function (select) {
        if (select.hasAttribute('data-filter-field')) {
          filters[select.getAttribute('data-filter-field')] = select.value;
        }
        if (select.hasAttribute('data-year-filter')) {
          filters.year = select.value;
        }
      });

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var ok = !query || haystack.indexOf(query) !== -1;
        if (ok && filters.region) {
          ok = (card.getAttribute('data-region') || '').indexOf(filters.region) !== -1;
        }
        if (ok && filters.type) {
          ok = (card.getAttribute('data-type') || '').indexOf(filters.type) !== -1;
        }
        if (ok && filters.year) {
          ok = matchesYear(card, filters.year);
        }
        card.classList.toggle('hidden', !ok);
      });
    }

    if (input) {
      input.addEventListener('input', update);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', update);
    });
  });
})();

function initMoviePlayer(videoId, streamUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }
  var box = video.closest('.player-box');
  var button = box ? box.querySelector('.player-start') : null;
  var loaded = false;
  var hls = null;

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }

  function play() {
    attach();
    if (box) {
      box.classList.add('is-playing');
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (!loaded) {
      play();
    }
  });
  video.addEventListener('play', function () {
    if (box) {
      box.classList.add('is-playing');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
