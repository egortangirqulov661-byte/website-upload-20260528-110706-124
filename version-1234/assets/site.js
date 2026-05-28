const navToggle = document.querySelector("[data-nav-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });
}

const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
  if (!heroSlides.length) {
    return;
  }
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === heroIndex);
  });
  heroDots.forEach((dot, i) => {
    dot.classList.toggle("is-active", i === heroIndex);
  });
}

function startHeroTimer() {
  if (heroSlides.length < 2) {
    return;
  }
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), 5200);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showHeroSlide(index);
    startHeroTimer();
  });
});

showHeroSlide(0);
startHeroTimer();

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

for (const scope of document.querySelectorAll("[data-catalog-scope]")) {
  const search = scope.querySelector(".site-search");
  const chips = Array.from(scope.querySelectorAll(".filter-chip"));
  const cards = Array.from(scope.querySelectorAll("[data-card]"));
  let filter = "all";

  function applyFilter() {
    const term = normalizeText(search ? search.value : "");
    cards.forEach((card) => {
      const haystack = normalizeText(card.dataset.search);
      const genre = normalizeText(card.dataset.genre);
      const matchesText = !term || haystack.includes(term);
      const matchesFilter = filter === "all" || genre.includes(filter) || haystack.includes(filter);
      card.hidden = !(matchesText && matchesFilter);
    });
  }

  if (search) {
    search.addEventListener("input", applyFilter);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filter = normalizeText(chip.dataset.filter || "all");
      chips.forEach((item) => item.classList.toggle("is-active", item === chip));
      applyFilter();
    });
  });
}
