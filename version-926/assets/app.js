(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var heroTimer = null;

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

    function startHero() {
        if (heroTimer || slides.length < 2) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            window.clearInterval(heroTimer);
            heroTimer = null;
            startHero();
        });
    });

    startHero();

    var localFilter = document.querySelector('[data-local-filter]');
    if (localFilter) {
        localFilter.addEventListener('input', function () {
            var keyword = localFilter.value.trim().toLowerCase();
            document.querySelectorAll('[data-card]').forEach(function (card) {
                var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
                card.style.display = text.indexOf(keyword) === -1 ? 'none' : '';
            });
        });
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('[data-player-cover]');
        var stream = player.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function attachStream() {
            if (!video || ready || !stream) {
                return;
            }

            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
        }

        function playVideo() {
            attachStream();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (cover && video.currentTime === 0) {
                cover.classList.remove('is-hidden');
            }
        });

        attachStream();

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.SEARCH_ITEMS) {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var regionSelect = document.querySelector('[data-search-region]');
        var typeSelect = document.querySelector('[data-search-type]');
        var results = document.querySelector('[data-search-results]');
        var title = document.querySelector('[data-search-title]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var regions = [];
        var types = [];

        window.SEARCH_ITEMS.forEach(function (item) {
            if (item.region && regions.indexOf(item.region) === -1) {
                regions.push(item.region);
            }
            if (item.type && types.indexOf(item.type) === -1) {
                types.push(item.type);
            }
        });

        regions.sort().forEach(function (region) {
            var option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

        types.sort().forEach(function (type) {
            var option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        input.value = initialQuery;

        function makeCard(item) {
            var tags = item.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card" data-card>',
                '<a class="movie-cover" href="./' + escapeHtml(item.file) + '">',
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="movie-year">' + escapeHtml(item.year) + '</span>',
                '</a>',
                '<div class="movie-info">',
                '<a class="movie-title" href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a>',
                '<p>' + escapeHtml(item.oneLine) + '</p>',
                '<div class="movie-tags">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function renderSearch() {
            var query = input.value.trim().toLowerCase();
            var region = regionSelect.value;
            var type = typeSelect.value;
            var matched = window.SEARCH_ITEMS.filter(function (item) {
                var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase();
                var queryOk = !query || text.indexOf(query) !== -1;
                var regionOk = !region || item.region === region;
                var typeOk = !type || item.type === type;
                return queryOk && regionOk && typeOk;
            }).slice(0, 120);

            title.textContent = query ? '搜索结果' : '热门影片';
            results.innerHTML = matched.map(makeCard).join('');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearch();
        });
        input.addEventListener('input', renderSearch);
        regionSelect.addEventListener('change', renderSearch);
        typeSelect.addEventListener('change', renderSearch);
        renderSearch();
    }
})();
