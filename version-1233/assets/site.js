(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    var first = select.querySelector("option");
    var label = first ? first.textContent : "全部";
    select.innerHTML = "";
    var option = document.createElement("option");
    option.value = "";
    option.textContent = label;
    select.appendChild(option);

    values.forEach(function (value) {
      var item = document.createElement("option");
      item.value = value;
      item.textContent = value;
      select.appendChild(item);
    });
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length < 2) {
      return;
    }

    var index = 0;

    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        setSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      setSlide(index + 1);
    }, 5600);
  }

  function setupFilters() {
    var forms = Array.from(document.querySelectorAll("[data-movie-filter]"));

    forms.forEach(function (form) {
      var target = form.getAttribute("data-filter-target");
      var scope = target ? document.querySelector(target) : document.querySelector("[data-filter-scope]");

      if (!scope) {
        return;
      }

      var cards = Array.from(scope.querySelectorAll(".movie-card, .rank-row"));
      var textInput = form.querySelector("[data-filter-text]");
      var regionSelect = form.querySelector("[data-filter-region]");
      var typeSelect = form.querySelector("[data-filter-type]");
      var yearSelect = form.querySelector("[data-filter-year]");
      var empty = document.querySelector(form.getAttribute("data-empty-target") || "");

      fillSelect(regionSelect, unique(cards.map(function (card) {
        return card.getAttribute("data-region");
      })).sort());

      fillSelect(typeSelect, unique(cards.map(function (card) {
        return card.getAttribute("data-type");
      })).sort());

      fillSelect(yearSelect, unique(cards.map(function (card) {
        return card.getAttribute("data-year");
      })).sort().reverse());

      function applyFilter() {
        var query = normalize(textInput ? textInput.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));

          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (region && normalize(card.getAttribute("data-region")) !== region) {
            matched = false;
          }

          if (type && normalize(card.getAttribute("data-type")) !== type) {
            matched = false;
          }

          if (year && normalize(card.getAttribute("data-year")) !== year) {
            matched = false;
          }

          card.classList.toggle("is-filtered-out", !matched);

          if (matched) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });

  window.MoviePlayer = {
    init: function (streamUrl) {
      ready(function () {
        var video = document.getElementById("main-video");
        var cover = document.getElementById("player-cover");

        if (!video || !cover || !streamUrl) {
          return;
        }

        var loaded = false;
        var hlsInstance = null;

        function load() {
          if (loaded) {
            return;
          }

          loaded = true;

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
          }

          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
          }

          video.src = streamUrl;
        }

        function play() {
          load();
          cover.classList.add("is-hidden");
          var result = video.play();

          if (result && typeof result.catch === "function") {
            result.catch(function () {
              cover.classList.remove("is-hidden");
            });
          }
        }

        cover.addEventListener("click", play);

        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });

        window.addEventListener("pagehide", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      });
    }
  };
})();
