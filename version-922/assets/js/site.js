(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    }

    function setupCatalogs() {
        var catalogs = Array.prototype.slice.call(document.querySelectorAll("[data-catalog]"));

        catalogs.forEach(function (catalog) {
            var grid = catalog.querySelector("[data-catalog-grid]");
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
            var search = catalog.querySelector("[data-catalog-search]");
            var year = catalog.querySelector("[data-catalog-year]");
            var type = catalog.querySelector("[data-catalog-type]");
            var sort = catalog.querySelector("[data-catalog-sort]");
            var count = catalog.querySelector("[data-catalog-count]");

            function cardText(card) {
                return [
                    card.dataset.title || "",
                    card.dataset.year || "",
                    card.dataset.type || "",
                    card.dataset.tags || ""
                ].join(" ").toLowerCase();
            }

            function applyFilters() {
                var keyword = search ? search.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var visible = [];

                cards.forEach(function (card) {
                    var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
                    var matchesYear = !yearValue || card.dataset.year === yearValue;
                    var matchesType = !typeValue || card.dataset.type === typeValue;
                    var shouldShow = matchesKeyword && matchesYear && matchesType;

                    card.classList.toggle("is-hidden", !shouldShow);

                    if (shouldShow) {
                        visible.push(card);
                    }
                });

                if (count) {
                    count.textContent = "共 " + visible.length + " 部影片";
                }
            }

            function applySort() {
                if (!grid || !sort) {
                    applyFilters();
                    return;
                }

                var value = sort.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (value === "title-asc") {
                        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                    }

                    if (value === "score-desc") {
                        return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                    }

                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });

                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });

                cards = sorted;
                applyFilters();
            }

            [search, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            if (sort) {
                sort.addEventListener("change", applySort);
            }

            applySort();
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupCatalogs();
    });
})();
