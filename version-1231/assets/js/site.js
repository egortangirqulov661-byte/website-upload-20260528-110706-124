(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('hidden');
            button.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
        });
    }

    function initSearchFilters() {
        var panels = document.querySelectorAll('[data-search-panel]');
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var buttons = panel.querySelectorAll('[data-filter]');
            var scopeSelector = panel.getAttribute('data-search-scope') || 'body';
            var scope = document.querySelector(scopeSelector) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var empty = scope.querySelector('[data-no-results]');
            var activeFilter = 'all';

            function textOf(card) {
                return [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
            }

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = textOf(card);
                    var matchesText = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesFilter = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                    var show = matchesText && matchesFilter;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    button.classList.add('active');
                    activeFilter = button.getAttribute('data-filter') || 'all';
                    applyFilter();
                });
            });
            applyFilter();
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll('[data-video-player]');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var overlay = player.querySelector('[data-player-overlay]');
            var status = player.querySelector('[data-player-status]');
            if (!video) {
                return;
            }
            var src = video.getAttribute('data-src');
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }

            function attachSource() {
                if (!src || video.getAttribute('data-source-ready') === 'true') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.setAttribute('data-source-ready', 'true');
                        setStatus('');
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('视频加载失败，请稍后重试');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.setAttribute('data-source-ready', 'true');
                    setStatus('');
                } else {
                    video.src = src;
                    video.setAttribute('data-source-ready', 'true');
                    setStatus('正在尝试使用浏览器原生播放');
                }
            }

            function playVideo() {
                attachSource();
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setStatus('点击播放器即可开始播放');
                    });
                }
            }

            attachSource();

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (video.paused) {
                        playVideo();
                    } else {
                        video.pause();
                    }
                });
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('hidden-overlay');
                }
                setStatus('');
            });

            video.addEventListener('pause', function () {
                if (overlay) {
                    overlay.classList.remove('hidden-overlay');
                }
            });

            video.addEventListener('error', function () {
                setStatus('视频加载失败，请稍后重试');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initSearchFilters();
        initPlayers();
    });
})();
