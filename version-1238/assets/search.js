(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function card(movie) {
    var cover = "./" + movie.cover;
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class="movie-card" data-title="" + escapeHtml(movie.title) + "" data-year="" + escapeHtml(movie.year) + "" data-region="" + escapeHtml(movie.region) + "" data-genre="" + escapeHtml(movie.genre) + "">",
      "<a class="poster-link" href="./" + movie.url + "" aria-label="" + escapeHtml(movie.title) + "">",
      "<span class="poster" style="background-image: linear-gradient(145deg, rgba(15, 23, 42, .35), rgba(8, 47, 73, .88)), url('" + cover + "');">",
      "<span class="poster-badge">" + escapeHtml(movie.type) + "</span>",
      "<span class="poster-year">" + escapeHtml(movie.year) + "</span>",
      "</span>",
      "</a>",
      "<div class="movie-card-body">",
      "<div class="movie-card-meta"><span>" + escapeHtml(movie.region) + "</span><strong class="score">热度 " + escapeHtml(movie.score) + "</strong></div>",
      "<h3><a href="./" + movie.url + "">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine || movie.summary) + "</p>",
      "<div class="tag-row">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        """: "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  ready(function () {
    var form = document.querySelector("[data-search-form]");
    var input = form ? form.querySelector("input[name='q']") : null;
    var results = document.querySelector("[data-search-results]");
    var index = Array.isArray(globalThis.SEARCH_INDEX) ? globalThis.SEARCH_INDEX : [];

    if (!form || !input || !results) {
      return;
    }

    function render(query) {
      var q = normalize(query);
      var matches = index.filter(function (movie) {
        if (!q) {
          return true;
        }
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(" "),
          movie.oneLine,
          movie.summary
        ].join(" "));
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);

      results.innerHTML = matches.map(card).join("");
    }

    input.value = getQuery();
    render(input.value);

    input.addEventListener("input", function () {
      render(input.value);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render(input.value);
      var nextUrl = input.value.trim() ? "?q=" + encodeURIComponent(input.value.trim()) : window.location.pathname;
      window.history.replaceState(null, "", nextUrl);
    });
  });
})();
