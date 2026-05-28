(function () {
  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      button.textContent = open ? "×" : "☰";
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
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
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initHorizontalScroll() {
    document.querySelectorAll("[data-scroll-section]").forEach(function (section) {
      var track = section.querySelector("[data-scroll-track]");
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (!track) {
        return;
      }
      function move(direction) {
        track.scrollBy({
          left: direction * Math.min(460, track.clientWidth * 0.85),
          behavior: "smooth"
        });
      }
      if (left) {
        left.addEventListener("click", function () {
          move(-1);
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          move(1);
        });
      }
    });
  }

  function initPageFilters() {
    document.querySelectorAll("[data-page-filter]").forEach(function (section) {
      var input = section.querySelector("[data-filter-input]");
      var clear = section.querySelector("[data-filter-clear]");
      var chips = Array.prototype.slice.call(section.querySelectorAll("[data-filter-chip]"));
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
      var activeChip = "";

      function matches(card, keyword) {
        var haystack = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        return (!keyword || haystack.indexOf(keyword) !== -1) && (!activeChip || haystack.indexOf(normalizeText(activeChip)) !== -1);
      }

      function apply() {
        var keyword = input ? normalizeText(input.value) : "";
        cards.forEach(function (card) {
          card.classList.toggle("hidden-card", !matches(card, keyword));
        });
        chips.forEach(function (chip) {
          chip.classList.toggle("active", chip.getAttribute("data-filter-chip") === activeChip);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (clear) {
        clear.addEventListener("click", function () {
          activeChip = "";
          if (input) {
            input.value = "";
          }
          apply();
        });
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var value = chip.getAttribute("data-filter-chip") || "";
          activeChip = activeChip === value ? "" : value;
          apply();
        });
      });
    });
  }

  function renderSearchCard(movie) {
    return [
      '<a class="video-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="video-card-media">',
      '    <img class="video-card-cover" src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '  </div>',
      '  <div class="video-card-content">',
      '    <h3 class="video-card-title">' + escapeHtml(movie.title) + '</h3>',
      '    <p class="video-card-description">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="video-card-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var input = document.querySelector("[data-search-page-input]");
    if (!results || !status || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    var keyword = normalizeText(query);
    var data = window.MOVIE_SEARCH_INDEX;
    var matches = keyword ? data.filter(function (movie) {
      var haystack = normalizeText([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(" "));
      return haystack.indexOf(keyword) !== -1;
    }) : data.slice(0, 24);
    status.textContent = keyword ? "搜索：" + query : "热门影片";
    results.innerHTML = matches.slice(0, 120).map(renderSearchCard).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initHorizontalScroll();
    initPageFilters();
    initSearchPage();
  });
})();
