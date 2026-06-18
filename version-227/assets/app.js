(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const sliders = document.querySelectorAll('[data-hero-slider]');

    sliders.forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });

        show(0);
        restart();
    });

    const filterPanel = document.querySelector('[data-filter-panel]');
    const cards = Array.from(document.querySelectorAll('.filter-card'));
    const emptyState = document.querySelector('[data-empty-state]');

    if (filterPanel && cards.length) {
        const keywordInput = filterPanel.querySelector('[data-filter-keyword]');
        const regionSelect = filterPanel.querySelector('[data-filter-region]');
        const typeSelect = filterPanel.querySelector('[data-filter-type]');
        const yearSelect = filterPanel.querySelector('[data-filter-year]');
        const resetButton = filterPanel.querySelector('[data-filter-reset]');
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            const keyword = normalize(keywordInput ? keywordInput.value : '');
            const region = normalize(regionSelect ? regionSelect.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const text = normalize(card.dataset.search);
                const cardRegion = normalize(card.dataset.region);
                const cardType = normalize(card.dataset.type);
                const cardYear = normalize(card.dataset.year);
                const matchesKeyword = !keyword || text.includes(keyword);
                const matchesRegion = !region || cardRegion === region;
                const matchesType = !type || cardType === type;
                const matchesYear = !year || cardYear === year;
                const shouldShow = matchesKeyword && matchesRegion && matchesType && matchesYear;

                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilters();
            });
        }

        applyFilters();
    }
})();
