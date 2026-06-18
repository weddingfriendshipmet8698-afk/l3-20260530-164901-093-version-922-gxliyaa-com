(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("is-locked", panel.classList.contains("is-open"));
        });

        panel.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                panel.classList.remove("is-open");
                document.body.classList.remove("is-locked");
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function move(step) {
            show(active + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                move(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyCardFilters(root) {
        var scope = root || document;
        var input = scope.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var empty = scope.querySelector("[data-empty-state]");
        var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));

        if (!cards.length) {
            return;
        }

        function currentQuery() {
            return input ? normalize(input.value) : "";
        }

        function currentSelectValue(name) {
            var select = selects.find(function (item) {
                return item.getAttribute("data-filter-select") === name;
            });
            return select ? normalize(select.value) : "";
        }

        function currentButtonValue(name) {
            var active = buttons.find(function (item) {
                return item.getAttribute("data-filter-button") === name && item.classList.contains("is-active");
            });
            return active ? normalize(active.getAttribute("data-value")) : "";
        }

        function matches(card) {
            var query = currentQuery();
            var typeValue = currentSelectValue("type") || currentButtonValue("type");
            var yearValue = currentSelectValue("year") || currentButtonValue("year");
            var regionValue = currentSelectValue("region") || currentButtonValue("region");
            var haystack = normalize(card.getAttribute("data-search"));
            var type = normalize(card.getAttribute("data-type"));
            var year = normalize(card.getAttribute("data-year"));
            var region = normalize(card.getAttribute("data-region"));

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (typeValue && type !== typeValue) {
                return false;
            }
            if (yearValue && year !== yearValue) {
                return false;
            }
            if (regionValue && region !== regionValue) {
                return false;
            }
            return true;
        }

        function update() {
            var visible = 0;
            cards.forEach(function (card) {
                var show = matches(card);
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", update);
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
        }

        selects.forEach(function (select) {
            select.addEventListener("change", update);
        });

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var group = button.getAttribute("data-filter-button");
                buttons.forEach(function (item) {
                    if (item.getAttribute("data-filter-button") === group) {
                        item.classList.remove("is-active");
                    }
                });
                button.classList.add("is-active");
                update();
            });
        });

        update();
    }

    function initPlayers() {
        document.querySelectorAll("[data-video-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-play-overlay]");
            var message = player.querySelector("[data-player-message]");
            var source = player.getAttribute("data-source");
            var hlsInstance = null;
            var started = false;

            if (!video || !overlay || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setMessage("浏览器阻止了自动播放，请再次点击视频播放。");
                    });
                }
            }

            function attachSource() {
                if (started) {
                    playVideo();
                    return;
                }

                started = true;
                overlay.classList.add("is-hidden");
                video.controls = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    video.load();
                    setMessage("正在加载播放源。");
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                    } else {
                        video.addEventListener("loadedmetadata", playVideo, { once: true });
                    }
                    if (window.Hls.Events && window.Hls.Events.ERROR) {
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setMessage("播放源加载失败，请刷新页面后重试。");
                            }
                        });
                    }
                    setMessage("正在加载高清播放源。");
                    return;
                }

                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                setMessage("当前浏览器可能不支持 HLS 播放，请更换浏览器访问。");
            }

            overlay.addEventListener("click", attachSource);
            video.addEventListener("click", function () {
                if (!started) {
                    attachSource();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        applyCardFilters(document);
        initPlayers();
    });
})();
