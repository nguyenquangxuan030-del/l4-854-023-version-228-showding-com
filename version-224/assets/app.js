(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var prevButton = document.querySelector('.hero-arrow.prev');
    var nextButton = document.querySelector('.hero-arrow.next');
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startSlider() {
        if (timer) {
            clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showSlide(0);
        startSlider();

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(currentSlide - 1);
                startSlider();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(currentSlide + 1);
                startSlider();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startSlider();
            });
        });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
    var emptyState = document.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeChip = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.year,
            card.dataset.tags,
            card.textContent
        ].join(' '));
    }

    function applyFilter() {
        if (!filterCards.length) {
            return;
        }

        var query = filterInput ? normalize(filterInput.value) : '';
        var visibleCount = 0;

        filterCards.forEach(function (card) {
            var text = cardText(card);
            var matchesText = !query || text.indexOf(query) !== -1;
            var matchesChip = activeChip === 'all' || text.indexOf(activeChip) !== -1;
            var visible = matchesText && matchesChip;
            card.style.display = visible ? '' : 'none';

            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visibleCount === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeChip = normalize(chip.dataset.filterChip || 'all');

            chips.forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });

            applyFilter();
        });
    });
})();
