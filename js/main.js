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

  /* ---------- chef badges carousel: drag/swipe with momentum snap ---------- */
  const badgesViewport = document.getElementById('badgesViewport');
  const badgesTrack = document.getElementById('badgesTrack');
  const badgesDots = document.getElementById('badgesDots');

  if (badgesViewport && badgesTrack && badgesDots) {
    const dots = Array.from(badgesDots.querySelectorAll('.dot'));
    const cards = Array.from(badgesTrack.children);

    let activeIndex = 0;
    let currentOffset = 0;
    let isDragging = false;
    let startX = 0;
    let startOffset = 0;
    let velocitySamples = [];
    let activePointerId = null;

    const offsetForIndex = (i) => {
      const card = cards[i];
      return badgesViewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
    };

    const clampIndex = (i) => Math.max(0, Math.min(cards.length - 1, i));

    const nearestIndexToOffset = (offset) => {
      let nearest = 0;
      let nearestDist = Infinity;
      cards.forEach((_, i) => {
        const dist = Math.abs(offsetForIndex(i) - offset);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      });
      return nearest;
    };

    const setTransform = (offset, animate) => {
      badgesTrack.style.transition = animate
        ? 'transform .5s cubic-bezier(.22,.61,.36,1)'
        : 'none';
      badgesTrack.style.transform = `translateX(${offset}px)`;
      currentOffset = offset;
    };

    const setActiveClasses = (index) => {
      cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const goToIndex = (i, animate) => {
      activeIndex = clampIndex(i);
      setTransform(offsetForIndex(activeIndex), animate);
      setActiveClasses(activeIndex);
    };

    // Initial centering (no animation on load).
    goToIndex(0, false);

    window.addEventListener('resize', () => goToIndex(activeIndex, false));

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true;
      activePointerId = e.pointerId;
      badgesTrack.setPointerCapture(e.pointerId);
      badgesTrack.classList.add('is-dragging');
      badgesTrack.style.transition = 'none';
      startX = e.clientX;
      startOffset = currentOffset;
      velocitySamples = [{ x: startX, t: performance.now() }];
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const x = e.clientX;
      const dx = x - startX;
      currentOffset = startOffset + dx;
      badgesTrack.style.transform = `translateX(${currentOffset}px)`;

      velocitySamples.push({ x, t: performance.now() });
      if (velocitySamples.length > 6) velocitySamples.shift();

      setActiveClasses(nearestIndexToOffset(currentOffset));
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      badgesTrack.classList.remove('is-dragging');

      let velocity = 0;
      if (velocitySamples.length >= 2) {
        const first = velocitySamples[0];
        const last = velocitySamples[velocitySamples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) velocity = (last.x - first.x) / dt; // px/ms
      }

      const momentum = velocity * 160;
      const target = nearestIndexToOffset(currentOffset + momentum);
      goToIndex(target, true);
    };

    const onPointerUp = (e) => {
      if (activePointerId !== null && badgesTrack.hasPointerCapture(activePointerId)) {
        badgesTrack.releasePointerCapture(activePointerId);
      }
      activePointerId = null;
      endDrag();
    };

    badgesTrack.addEventListener('pointerdown', onPointerDown);
    badgesTrack.addEventListener('pointermove', onPointerMove);
    badgesTrack.addEventListener('pointerup', onPointerUp);
    badgesTrack.addEventListener('pointercancel', onPointerUp);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToIndex(i, true));
    });
  }
})();
