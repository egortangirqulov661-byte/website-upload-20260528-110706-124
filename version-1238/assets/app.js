(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var navLinks = document.querySelector("[data-nav-links]");

    if (menuButton && navLinks) {
      menuButton.addEventListener("click", function () {
        navLinks.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dots] button"));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    document.querySelectorAll("[data-card-filter]").forEach(function (form) {
      var input = form.querySelector("input");
      var reset = form.querySelector("button[type='reset']");
      var list = document.querySelector("[data-filter-list]");

      if (!input || !list) {
        return;
      }

      function applyFilter() {
        var query = input.value.trim().toLowerCase();
        list.querySelectorAll(".movie-card").forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", query.length > 0 && haystack.indexOf(query) === -1);
        });
      }

      input.addEventListener("input", applyFilter);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });
      if (reset) {
        reset.addEventListener("click", function () {
          window.setTimeout(applyFilter, 0);
        });
      }
    });
  });
})();
