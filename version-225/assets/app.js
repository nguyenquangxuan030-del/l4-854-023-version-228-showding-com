(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function applyFilters(root) {
    var queryInput = root.querySelector("[data-page-search]") || document.querySelector("[data-site-search]");
    var yearSelect = root.querySelector("[data-filter-year]");
    var typeSelect = root.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var empty = root.querySelector("[data-empty]");

    function update() {
      var query = normalize(queryInput ? queryInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var ok = true;

        if (query && text.indexOf(query) === -1) {
          ok = false;
        }

        if (year && cardYear !== year) {
          ok = false;
        }

        if (type && cardType !== type) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [queryInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    update();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    applyFilters(scope);
  });

  document.querySelectorAll("[data-site-search]").forEach(function (input) {
    input.addEventListener("input", function () {
      var value = normalize(input.value);
      document.querySelectorAll("[data-card]").forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        card.style.display = value && text.indexOf(value) === -1 ? "none" : "";
      });
    });
  });

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
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
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }
})();
