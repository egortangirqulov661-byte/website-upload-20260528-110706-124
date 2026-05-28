const select = (selector, root = document) => root.querySelector(selector);
const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const toggle = select('[data-menu-toggle]');
  const menu = select('[data-mobile-nav]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function setupSiteSearch() {
  selectAll('[data-site-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="search"]');
      const keyword = input ? input.value.trim() : '';
      const url = keyword ? `movies.html?search=${encodeURIComponent(keyword)}` : 'movies.html';
      window.location.href = url;
    });
  });
}

function setupHero() {
  const hero = select('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = selectAll('[data-hero-slide]', hero);
  const dots = selectAll('[data-hero-dot]', hero);
  const previous = select('[data-hero-prev]', hero);
  const next = select('[data-hero-next]', hero);
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(active + 1), 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  if (previous) {
    previous.addEventListener('click', () => {
      show(active - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(active + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupMovieFilters() {
  const form = select('[data-movie-filter-form]');

  if (!form) {
    return;
  }

  const cards = selectAll('.movie-card');
  const searchInput = select('[data-filter-search]', form);
  const categoryInput = select('[data-filter-category]', form);
  const yearInput = select('[data-filter-year]', form);
  const typeInput = select('[data-filter-type]', form);
  const resetButton = select('[data-filter-reset]', form);
  const countTarget = select('[data-filter-count]');
  const empty = select('[data-filter-empty]');
  const params = new URLSearchParams(window.location.search);

  const fillFromQuery = () => {
    if (searchInput && params.get('search')) {
      searchInput.value = params.get('search');
    }

    if (categoryInput && params.get('category')) {
      categoryInput.value = params.get('category');
    }

    if (yearInput && params.get('year')) {
      yearInput.value = params.get('year');
    }

    if (typeInput && params.get('type')) {
      typeInput.value = params.get('type');
    }
  };

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  const updateUrl = () => {
    const next = new URLSearchParams();

    if (searchInput && searchInput.value.trim()) {
      next.set('search', searchInput.value.trim());
    }

    if (categoryInput && categoryInput.value) {
      next.set('category', categoryInput.value);
    }

    if (yearInput && yearInput.value) {
      next.set('year', yearInput.value);
    }

    if (typeInput && typeInput.value) {
      next.set('type', typeInput.value);
    }

    const query = next.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
  };

  const apply = () => {
    const keyword = normalize(searchInput ? searchInput.value : '');
    const category = categoryInput ? categoryInput.value : '';
    const year = yearInput ? yearInput.value : '';
    const type = typeInput ? typeInput.value : '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags,
      ].join(' '));
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesCategory = !category || card.dataset.category === category;
      const matchesYear = !year || card.dataset.year === year;
      const matchesType = !type || card.dataset.type === type;
      const shouldShow = matchesKeyword && matchesCategory && matchesYear && matchesType;

      card.classList.toggle('is-hidden', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (countTarget) {
      countTarget.textContent = visible.toString();
    }

    if (empty) {
      empty.hidden = visible !== 0;
    }

    updateUrl();
  };

  fillFromQuery();
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    apply();
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      form.reset();
      apply();
    });
  }

  apply();
}

async function loadHls() {
  const module = await import('./hls.js');
  return module.H;
}

function setupPlayers() {
  selectAll('[data-player]').forEach((player) => {
    const video = select('video[data-video-src]', player);
    const playButton = select('[data-player-play]', player);
    const toggleButton = select('[data-player-toggle]', player);
    const muteButton = select('[data-player-mute]', player);
    const fullscreenButton = select('[data-player-fullscreen]', player);
    const message = select('[data-player-message]', player);
    let isLoaded = false;
    let hlsInstance = null;

    if (!video) {
      return;
    }

    const source = video.dataset.videoSrc;

    const showMessage = (text) => {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.add('is-visible');
    };

    const hideMessage = () => {
      if (message) {
        message.textContent = '';
        message.classList.remove('is-visible');
      }
    };

    const attachSource = async () => {
      if (isLoaded) {
        return true;
      }

      if (!source) {
        showMessage('当前影片暂无可用播放源');
        return false;
      }

      try {
        const Hls = await loadHls();

        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, hideMessage);
          hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              showMessage('网络错误，正在重新加载视频');
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              showMessage('媒体错误，正在尝试恢复播放');
              hlsInstance.recoverMediaError();
            } else {
              showMessage('视频加载失败，请稍后重试');
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          showMessage('当前浏览器不支持 HLS 播放');
          return false;
        }

        isLoaded = true;
        return true;
      } catch (error) {
        showMessage('播放器初始化失败，请确认页面通过网站环境打开');
        return false;
      }
    };

    const play = async () => {
      const ready = await attachSource();

      if (!ready) {
        return;
      }

      try {
        await video.play();
        player.classList.add('is-playing');
        hideMessage();
      } catch (error) {
        showMessage('请再次点击播放按钮开始播放');
      }
    };

    const toggle = async () => {
      if (video.paused) {
        await play();
      } else {
        video.pause();
      }
    };

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    if (toggleButton) {
      toggleButton.addEventListener('click', toggle);
    }

    video.addEventListener('click', toggle);
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));

    if (muteButton) {
      muteButton.addEventListener('click', () => {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          player.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

setupMobileMenu();
setupSiteSearch();
setupHero();
setupMovieFilters();
setupPlayers();
