(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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

    function step(direction) {
      show(active + direction);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        step(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        step(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        step(1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
  var searchPanels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
  var pool = window.MovieSearchIndex || [];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderSearch(value) {
    var query = normalize(value);
    searchPanels.forEach(function (panel) {
      panel.innerHTML = '';
      panel.classList.remove('is-open');
    });

    if (!query) {
      return;
    }

    var results = pool.filter(function (item) {
      return normalize(item.text).indexOf(query) !== -1;
    }).slice(0, 10);

    var html = results.map(function (item) {
      return '<a class="search-result" href="' + item.href + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.meta) + '</small></span>' +
        '</a>';
    }).join('');

    searchPanels.forEach(function (panel) {
      panel.innerHTML = html || '<div class="search-result"><span><strong>暂无匹配影片</strong><small>可更换关键词继续搜索</small></span></div>';
      panel.classList.add('is-open');
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input.value);
    });
    input.addEventListener('focus', function () {
      renderSearch(input.value);
    });
  });

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target.closest('[data-global-search]') && !target.closest('[data-search-panel]')) {
      searchPanels.forEach(function (panel) {
        panel.classList.remove('is-open');
      });
    }
  });

  var containers = Array.prototype.slice.call(document.querySelectorAll('[data-card-container]'));
  containers.forEach(function (container) {
    var area = container.closest('section') || document;
    var input = area.querySelector('[data-filter-input]');
    var region = area.querySelector('[data-filter-select="region"]');
    var type = area.querySelector('[data-filter-select="type"]');
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var selectedRegion = normalize(region ? region.value : '');
      var selectedType = normalize(type ? type.value : '');

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
          ok = false;
        }
        if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
