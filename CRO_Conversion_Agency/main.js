/**
 * Christoph Klemtz – CRO & Conversion Engineering
 * main.js – Vanilla JS, no dependencies
 */

"use strict";

/* ═══════════════════════════════════════════════════════════════
   THEME – Dark / Light Mode
   Liest System-Preference, respektiert localStorage, toggle im Nav
   ═══════════════════════════════════════════════════════════════ */
(function initTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const announcement = document.getElementById("theme-announcement");
  const STORAGE_KEY = "ck-theme";

  // Aktuelles Theme ermitteln (Anti-FOUC-Script hat es bereits gesetzt)
  function getTheme() {
    return (
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark")
    );
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateButton(theme);
  }

  function updateButton(theme) {
    if (!toggleBtn) return;
    const isDark = theme !== "light";
    toggleBtn.setAttribute(
      "aria-label",
      isDark ? "Zu Light Mode wechseln" : "Zu Dark Mode wechseln",
    );
    // Screen-Reader-Ankündigung (aria-live)
    if (announcement) {
      announcement.textContent = isDark
        ? "Dark Mode aktiv"
        : "Light Mode aktiv";
    }
  }

  // Init: Sicherstellen dass das Theme korrekt gesetzt ist
  applyTheme(getTheme());

  // Toggle on click
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = getTheme();
      applyTheme(current === "light" ? "dark" : "light");
    });
  }

  // System-Preference-Änderungen beobachten (nur wenn kein manueller Override)
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "light" : "dark");
      }
    });
})();

/* ═══════════════════════════════════════════════════════════════
   NAV – Scroll State & Hamburger
   ═══════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById("nav");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (!nav || !hamburger || !navLinks) return;

  // Scroll: activate backdrop-filter
  function onScroll() {
    if (window.scrollY > 20) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on init

  // Hamburger toggle
  function openMenu() {
    navLinks.classList.add("open");
    hamburger.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Menü schließen");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    navLinks.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Menü öffnen");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("open") &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      closeMenu();
      hamburger.focus();
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   FAQ – Accordion
   ═══════════════════════════════════════════════════════════════ */
(function initFaq() {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!btn || !answer) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Close all others
      faqItems.forEach((other) => {
        if (other === item) return;
        const otherBtn = other.querySelector(".faq-question");
        const otherAnswer = other.querySelector(".faq-answer");
        if (otherBtn && otherAnswer) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherAnswer.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL – Fallback for browsers without CSS scroll timeline
   ═══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  // Only activate if CSS scroll-driven animations are NOT supported
  const supportsScrollTimeline = CSS.supports("animation-timeline", "scroll()");
  if (supportsScrollTimeline) return;

  const targets = document.querySelectorAll(
    ".problem-card, .step-card:not(.sticky-step), .bento-card, .service-card, .faq-item",
  );

  if (!targets.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  targets.forEach((el) => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   SMOOTH SCROLL for anchor links
   ═══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById("nav")?.offsetHeight ?? 80;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   COUNTER ANIMATION – Hero metrics
   ═══════════════════════════════════════════════════════════════ */
(function initCounters() {
  const metrics = document.querySelectorAll(".metric-number");
  if (!metrics.length || !("IntersectionObserver" in window)) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateValue(el, start, end, duration, prefix, suffix) {
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.floor(start + (end - start) * easedProgress);

      el.textContent = prefix + current.toLocaleString("de-DE") + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const counterData = [
    {
      selector: ".metric:nth-child(1) .metric-number",
      prefix: "+€",
      end: 1.2,
      suffix: "M",
      isFloat: true,
    },
    {
      selector: ".metric:nth-child(3) .metric-number",
      prefix: "",
      end: 34,
      suffix: "",
      isFloat: false,
    },
    {
      selector: ".metric:nth-child(5) .metric-number",
      prefix: "Ø +",
      end: 23,
      suffix: "%",
      isFloat: false,
    },
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const data = counterData.find((d) => el.matches(d.selector));

        if (!data) return;

        if (data.isFloat) {
          // Animate float: 0 → 1.2
          const startTime = performance.now();
          const duration = 1800;

          (function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = easeOutQuart(progress);
            const value = (0 + (data.end - 0) * eased).toFixed(1);
            el.textContent = data.prefix + value + data.suffix;
            if (progress < 1) requestAnimationFrame(step);
          })(performance.now());
        } else {
          animateValue(el, 0, data.end, 1600, data.prefix, data.suffix);
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );

  counterData.forEach((data) => {
    const el = document.querySelector(data.selector);
    if (el) observer.observe(el);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER REVEAL – IntersectionObserver für alle Browser
   ═══════════════════════════════════════════════════════════════ */
(function initSectionHeaders() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Alle Section-Header + CTA-Inner beobachten
  const targets = document.querySelectorAll(".section-header, .cta-inner");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -48px 0px" },
  );

  targets.forEach((el) => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   STICKY SCROLL – Der Prozess
   Section pinned im Viewport, Steps erscheinen beim Scrollen
   ═══════════════════════════════════════════════════════════════ */
(function initStickyScroll() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const wrapper = document.querySelector(".sticky-scroll-wrapper");
  if (!wrapper) return;

  const section  = wrapper.querySelector(".sticky-section");
  const header   = wrapper.querySelector(".section-header");
  const steps    = wrapper.querySelectorAll(".sticky-step");
  const dots     = wrapper.querySelectorAll(".sticky-dot");

  if (!section || !steps.length) return;

  // Auf Mobile deaktivieren (< 768px) – CSS zeigt alles direkt
  function isMobile() {
    return window.innerWidth < 768;
  }

  // Scroll-Fortschritt innerhalb des Wrappers berechnen (0 = Start, 1 = Ende)
  function getProgress() {
    const wRect   = wrapper.getBoundingClientRect();
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 1;
    const scrolled = -wRect.top;
    return Math.max(0, Math.min(1, scrolled / scrollable));
  }

  // Schwellenwerte: bei welchem Fortschritt erscheint Step 1/2/3?
  const thresholds = [0.04, 0.38, 0.68];

  let ticking = false;
  let headerShown = false;

  function update() {
    if (isMobile()) {
      ticking = false;
      return;
    }

    const p = getProgress();

    // Header einblenden sobald Wrapper sichtbar wird
    if (!headerShown && header && wrapper.getBoundingClientRect().top < window.innerHeight * 0.85) {
      header.classList.add("is-visible");
      headerShown = true;
    }

    // Steps + Dots aktivieren
    thresholds.forEach((t, i) => {
      if (p >= t) {
        steps[i]?.classList.add("is-active");
        dots[i]?.classList.add("is-active");
      }
    });

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Initial-Check
  update();

  // Bei Resize Mobile-State neu prüfen
  window.addEventListener("resize", update, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV LINK – Highlight based on scroll position
   ═══════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll("section[id], main > section");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + id,
          );
        });
      });
    },
    {
      rootMargin: "-40% 0px -55% 0px",
      threshold: 0,
    },
  );

  sections.forEach((s) => observer.observe(s));
})();
