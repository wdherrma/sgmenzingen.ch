/**
 * main.js
 * Zentrale JavaScript-Datei für:
 * - mobile Navigation (Burger-Menü)
 * - Slider/Carousel auf der Startseite
 * - Termine-Filter auf termine.html
 * - Formularvalidierung auf kontakt.html
 *
 * Hinweis:
 * Dieser Code ist bewusst einfach und kommentiert gehalten,
 * damit Anpassungen leicht möglich sind.
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initHeroSlider();
  initTermineFilter();
  initContactFormValidation();
  initFooterYear();
});

/**
 * Setzt das aktuelle Jahr im Footer ein.
 * So muss das Copyright-Datum nicht jedes Jahr angepasst werden.
 */
function initFooterYear() {
  const yearSpan = document.getElementById("footer-year");
  if (!yearSpan) return;
  const year = new Date().getFullYear();
  yearSpan.textContent = year;
}

/**
 * Mobile Navigation (Burger-Menü)
 * - Öffnet und schliesst die Navigation auf kleinen Bildschirmen.
 */
function initMobileNavigation() {
  const toggleButton = document.querySelector(".js-nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggleButton || !nav) return;

  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Navigation schliessen, wenn ein Link geklickt wird (auf kleinen Screens)
  nav.addEventListener("click", (event) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.classList.contains("nav-link") &&
      nav.classList.contains("is-open")
    ) {
      nav.classList.remove("is-open");
      toggleButton.setAttribute("aria-expanded", "false");
    }
  });
}

/**
 * Hero-Slider (Startseite)
 * - Automatisches Rotieren
 * - Manuelle Navigation über Pfeile und Punkte
 *
 * Strukturvoraussetzung (vereinfacht):
 * <div data-slider>
 *   <div class="slider-track">
 *     <article data-slide>...</article>
 *     ...
 *   </div>
 *   <button data-slider-prev>...</button>
 *   <button data-slider-next>...</button>
 *   <div data-slider-dots></div>
 * </div>
 */
function initHeroSlider() {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return; // Nur auf index.html vorhanden

  const slides = slider.querySelectorAll("[data-slide]");
  const prevBtn = slider.querySelector("[data-slider-prev]");
  const nextBtn = slider.querySelector("[data-slider-next]");
  const dotsContainer = slider.querySelector("[data-slider-dots]");

  if (!slides.length || !prevBtn || !nextBtn || !dotsContainer) return;

  let currentIndex = 0;
  let autoSlideInterval = null;
  const AUTO_SLIDE_MS = 7000;

  // Punkte (Dots) dynamisch generieren
  const dots = [];
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Slide ${index + 1} anzeigen`);
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoSlide();
    });
    dotsContainer.appendChild(dot);
    dots.push(dot);
  });

  function goToSlide(index) {
    const maxIndex = slides.length - 1;
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;

    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add("is-active");
        slide.setAttribute("aria-hidden", "false");
      } else {
        slide.classList.remove("is-active");
        slide.setAttribute("aria-hidden", "true");
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });

    currentIndex = index;
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoSlide() {
    autoSlideInterval = window.setInterval(nextSlide, AUTO_SLIDE_MS);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      window.clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  function restartAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // Pfeil-Buttons
  nextBtn.addEventListener("click", () => {
    nextSlide();
    restartAutoSlide();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    restartAutoSlide();
  });

  // Automatisch starten
  goToSlide(0);
  startAutoSlide();

  // Optional: Autoplay pausieren, wenn Maus über Slider ist
  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);
}

/**
 * Termine-Filter (termine.html)
 * - Filtert Termin-Karten anhand von data-category
 * - Kategorien: all, training, wettkampf, anlass
 */
function initTermineFilter() {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const terminCards = document.querySelectorAll(".termin-card");
  if (!filterButtons.length || !terminCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      // Aktiven Button hervorheben
      filterButtons.forEach((btn) => {
        btn.classList.toggle("btn--filter-active", btn === button);
      });

      // Karten filtern
      terminCards.forEach((card) => {
        const category = card.getAttribute("data-category") || "all";
        const matches = filter === "all" || category === filter;
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });
}

/**
 * Kontaktformular-Validierung (kontakt.html)
 * - Prüft Pflichtfelder und E-Mail-Format
 * - Zeigt Fehlermeldungen an
 * - Sendet das Formular NICHT ab, sondern zeigt eine Erfolgsmeldung
 */
function initContactFormValidation() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const subjectInput = form.querySelector("#subject");
  const messageInput = form.querySelector("#message");
  const successMessage = document.getElementById("form-success");

  const errorName = document.getElementById("error-name");
  const errorEmail = document.getElementById("error-email");
  const errorSubject = document.getElementById("error-subject");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Echte Übermittlung verhindern

    // Frühere Fehler zurücksetzen
    [errorName, errorEmail, errorSubject, errorMessage].forEach((el) => {
      if (el) el.textContent = "";
    });
    if (successMessage) {
      successMessage.hidden = true;
    }

    let isValid = true;

    // Name (Pflicht)
    const nameValue = (nameInput.value || "").trim();
    if (!nameValue) {
      errorName.textContent = "Bitte geben Sie Ihren Namen ein.";
      isValid = false;
    }

    // E-Mail (Pflicht + grobe Formatprüfung)
    const emailValue = (emailInput.value || "").trim();
    if (!emailValue) {
      errorEmail.textContent = "Bitte geben Sie Ihre E-Mail-Adresse ein.";
      isValid = false;
    } else if (!isValidEmail(emailValue)) {
      errorEmail.textContent = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
      isValid = false;
    }

    // Betreff (optional – hier könnte bei Bedarf eine Mindestlänge geprüft werden)
    const subjectValue = (subjectInput.value || "").trim();
    if (subjectValue.length > 0 && subjectValue.length < 3) {
      errorSubject.textContent = "Bitte geben Sie einen aussagekräftigen Betreff ein (mind. 3 Zeichen).";
      isValid = false;
    }

    // Nachricht (Pflicht)
    const messageValue = (messageInput.value || "").trim();
    if (!messageValue) {
      errorMessage.textContent = "Bitte schreiben Sie eine kurze Nachricht.";
      isValid = false;
    }

    // Wenn alles gültig ist, Erfolgsmeldung anzeigen
    if (isValid) {
      if (successMessage) {
        successMessage.hidden = false;
      }
      form.reset();
    }
  });
}

/**
 * Einfache E-Mail-Validierung (Regex bewusst einfach gehalten)
 */
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.toLowerCase());
}
