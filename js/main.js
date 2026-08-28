(() => {
  'use strict';

  /* ---------- header state on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const toTopBtn = document.getElementById('toTop');

  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', scrolled);
    toTopBtn.classList.toggle('visible', window.scrollY > 700);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- active nav link on scroll (scroll-spy) ---------- */
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navSections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    navSections.forEach((section) => spy.observe(section));
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- courses accordion ---------- */
  const courseButtons = Array.from(document.querySelectorAll('.course-head'));

  const setCourseState = (button, open) => {
    const body = button.nextElementSibling;
    button.setAttribute('aria-expanded', String(open));
    body.style.maxHeight = open ? `${body.scrollHeight}px` : '0px';
  };

  courseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const alreadyOpen = button.getAttribute('aria-expanded') === 'true';
      courseButtons.forEach((btn) => setCourseState(btn, false));
      if (!alreadyOpen) setCourseState(button, true);
    });
  });

  // Open the first course by default so the interaction is discoverable.
  if (courseButtons[0]) setCourseState(courseButtons[0], true);

  // Recalculate open panel height on resize (font/layout reflow safety).
  window.addEventListener('resize', () => {
    courseButtons.forEach((button) => {
      if (button.getAttribute('aria-expanded') === 'true') {
        setCourseState(button, true);
      }
    });
  });

  /* ---------- menu progress bar ---------- */
  const menuSection = document.getElementById('menu');
  const progressBar = document.getElementById('menuProgressBar');

  if (menuSection && progressBar) {
    const updateProgress = () => {
      const rect = menuSection.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height + viewportH;
      const traveled = viewportH - rect.top;
      const pct = Math.min(100, Math.max(0, (traveled / total) * 100));
      progressBar.style.width = `${pct}%`;
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }
})();
