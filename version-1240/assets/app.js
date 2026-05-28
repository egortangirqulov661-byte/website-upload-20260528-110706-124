(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.getElementById("mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function initHero() {
        var hero = document.getElementById("top-hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function createCard(item) {
        var tags = (item.tags || []).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class="movie-card">" +
            "<a href="./" + item.url + "" class="card-link">" +
            "<div class="poster-wrap">" +
            "<img src="" + item.cover + "" alt="" + escapeHtml(item.title) + "" loading="lazy">" +
            "<span class="type-badge">" + escapeHtml(item.type) + "</span>" +
            "<span class="year-badge">" + escapeHtml(item.year) + "</span>" +
            "<span class="card-play">▶</span>" +
            "</div>" +
            "<div class="card-copy">" +
            "<h2>" + escapeHtml(item.title) + "</h2>" +
            "<p>" + escapeHtml(item.line) + "</p>" +
            "<div class="mini-tags">" + tags + "</div>" +
            "</div>" +
            "</a>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;"
            }[char];
        });
    }

    function initSearch() {
        var results = document.getElementById("search-results");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        var input = document.getElementById("search-input");
        var title = document.getElementById("search-title");
        if (input) {
            input.value = q;
        }
        var list = window.SEARCH_INDEX;
        if (q) {
            var lower = q.toLowerCase();
            list = list.filter(function (item) {
                return [item.title, item.region, item.type, item.year, item.line, (item.tags || []).join(" ")].join(" ").toLowerCase().indexOf(lower) !== -1;
            });
            if (title) {
                title.textContent = "搜索结果";
            }
        } else {
            list = list.slice(0, 30);
        }
        results.innerHTML = list.slice(0, 100).map(createCard).join("");
    }

    function initPlayer() {
        var video = document.querySelector("[data-player]");
        var button = document.querySelector("[data-play-button]");
        var source = window.pageVideoUrl;
        if (!video || !button || !source) {
            return;
        }
        var hls = null;
        var attached = false;
        var pending = false;

        function hideButton() {
            button.classList.add("is-hidden");
        }

        function startNative() {
            if (!video.getAttribute("src")) {
                video.setAttribute("src", source);
            }
            hideButton();
            video.setAttribute("controls", "controls");
            video.play().catch(function () {});
        }

        function attachHls() {
            if (attached) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (pending) {
                        hideButton();
                        video.setAttribute("controls", "controls");
                        video.play().catch(function () {});
                    }
                });
                attached = true;
            } else {
                startNative();
            }
        }

        function start() {
            pending = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                startNative();
                return;
            }
            attachHls();
            if (attached && video.readyState > 0) {
                hideButton();
                video.setAttribute("controls", "controls");
                video.play().catch(function () {});
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", hideButton);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayer();
    });
}());
