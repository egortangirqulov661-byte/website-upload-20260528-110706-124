(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll(".hero-slide", slider);
    var dots = selectAll(".hero-dot", slider);
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = selectAll(".movie-card", list);
    var search = document.querySelector(".page-search");
    var type = document.querySelector(".type-filter");
    var year = document.querySelector(".year-filter");
    function apply() {
      var q = normalize(search && search.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.type,
          card.dataset.year
        ].join(" "));
        var matchedText = !q || text.indexOf(q) !== -1;
        var matchedType = !selectedType || normalize(card.dataset.type).indexOf(selectedType) !== -1;
        var matchedYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        card.classList.toggle("is-hidden", !(matchedText && matchedType && matchedYear));
      });
    }
    [search, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
      '  <a href="' + escapeHtml(movie.url) + '" class="card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
      '      <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '      <span class="poster-play">▶</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <span class="card-type">' + escapeHtml(movie.type) + '</span>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.getElementById("search-page-input");
    if (input) {
      input.value = query;
    }
    var q = normalize(query);
    var items = window.MOVIES.filter(function (movie) {
      if (!q) {
        return true;
      }
      return normalize([
        movie.title,
        movie.type,
        movie.region,
        movie.year,
        movie.genre,
        movie.tags,
        movie.category,
        movie.oneLine
      ].join(" ")).indexOf(q) !== -1;
    });
    results.innerHTML = items.map(movieCard).join("");
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    if (!video || !button) {
      return;
    }
    var cover = button.closest(".play-cover");
    var attached = false;
    function attach() {
      if (!attached) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = config.source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(config.source);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = config.source;
        }
        attached = true;
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add("hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    button.addEventListener("click", play);
    if (cover) {
      cover.addEventListener("click", function (event) {
        if (event.target !== button && !button.contains(event.target)) {
          play();
        }
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initSearchPage();
  });
})();
