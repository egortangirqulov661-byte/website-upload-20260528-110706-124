(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var index = 0;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }

    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === index);
    });
  }

  dots.forEach(function (dot, current) {
    dot.addEventListener('click', function () {
      showSlide(current);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-text]'));
  var emptyState = document.querySelector('.empty-state');

  function applyFilter(value) {
    var query = String(value || '').trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-text') || '';
      var match = !query || text.indexOf(query) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (initial) {
      filterInput.value = initial;
      applyFilter(initial);
    }

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  var video = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play-button]');
  var hlsInstance = null;

  function startPlayer() {
    if (!video || !playButton) {
      return;
    }

    var url = playButton.getAttribute('data-url');

    if (!url) {
      return;
    }

    playButton.classList.add('hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== url) {
        video.src = url;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      }

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = url;
    video.play().catch(function () {});
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayer);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!video.src) {
        startPlayer();
      }
    });
  }
})();
