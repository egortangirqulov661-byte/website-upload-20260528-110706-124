document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === activeSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setSlide(index);
      });
    });
    setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var typeSelect = document.querySelector("[data-filter-type]");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!filterCards.length) {
      return;
    }
    var keyword = normalize(filterInput && filterInput.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);

    filterCards.forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.regionGroup,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      var ok = true;
      if (keyword && text.indexOf(keyword) === -1) {
        ok = false;
      }
      if (region && normalize(card.dataset.regionGroup) !== region && normalize(card.dataset.region).indexOf(region) === -1) {
        ok = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        ok = false;
      }
      if (type && normalize(card.dataset.type).indexOf(type) === -1) {
        ok = false;
      }
      card.style.display = ok ? "" : "none";
    });
  }

  [filterInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  var searchRoot = document.querySelector("[data-search-page]");
  if (searchRoot && Array.isArray(window.SITE_MOVIES)) {
    var searchInput = searchRoot.querySelector("[data-search-input]");
    var searchResults = searchRoot.querySelector("[data-search-results]");
    var searchForm = searchRoot.querySelector("[data-search-form]");
    var params = new URLSearchParams(window.location.search);
    var currentQuery = params.get("q") || "";

    function makeNode(tag, className, text) {
      var node = document.createElement(tag);
      if (className) {
        node.className = className;
      }
      if (text) {
        node.textContent = text;
      }
      return node;
    }

    function renderSearch(query) {
      var q = normalize(query);
      searchResults.innerHTML = "";
      var results = window.SITE_MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.regionGroup,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 160);

      if (!results.length) {
        searchResults.appendChild(makeNode("div", "empty-state", "没有找到匹配的影片"));
        return;
      }

      results.forEach(function (movie) {
        var article = makeNode("article", "movie-card");
        article.dataset.title = movie.title;
        article.dataset.region = movie.region;
        article.dataset.regionGroup = movie.regionGroup;
        article.dataset.year = movie.year;
        article.dataset.type = movie.type;
        article.dataset.genre = movie.genre;
        article.dataset.tags = movie.tags.join(" ");

        var link = makeNode("a", "card-link");
        link.href = "./" + movie.file;

        var poster = makeNode("div", "card-poster");
        var img = document.createElement("img");
        img.src = movie.cover;
        img.alt = movie.title;
        img.loading = "lazy";
        poster.appendChild(img);
        poster.appendChild(makeNode("span", "poster-badge", movie.regionGroup));
        poster.appendChild(makeNode("span", "poster-year", movie.year));
        poster.appendChild(makeNode("span", "poster-play", "▶"));

        var body = makeNode("div", "card-body");
        body.appendChild(makeNode("div", "card-type", movie.type));
        body.appendChild(makeNode("h3", "", movie.title));
        body.appendChild(makeNode("p", "", movie.oneLine));
        var meta = makeNode("div", "card-meta");
        meta.appendChild(makeNode("span", "", movie.primaryGenre));
        meta.appendChild(makeNode("span", "", movie.categoryName));
        body.appendChild(meta);

        link.appendChild(poster);
        link.appendChild(body);
        article.appendChild(link);
        searchResults.appendChild(article);
      });
    }

    if (searchInput) {
      searchInput.value = currentQuery;
    }
    renderSearch(currentQuery);

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = searchInput ? searchInput.value : "";
        var url = new URL(window.location.href);
        if (value.trim()) {
          url.searchParams.set("q", value.trim());
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url.toString());
        renderSearch(value);
      });
    }
  }
});
