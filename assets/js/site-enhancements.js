(function () {
  'use strict';

  const STORAGE_KEY = 'swh-motion-enabled';

  function setupModeToggle() {
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'motion-toggle';
    toggleButton.setAttribute('aria-label', '動きのある背景を切り替える');

    const stored = localStorage.getItem(STORAGE_KEY);
    const motionEnabled = stored !== 'off';
    document.body.classList.toggle('motion-enabled', motionEnabled);

    function updateLabel() {
      const enabled = document.body.classList.contains('motion-enabled');
      toggleButton.textContent = enabled ? '演出: ON' : '演出: OFF';
    }

    toggleButton.addEventListener('click', function () {
      const enabled = document.body.classList.toggle('motion-enabled');
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
      updateLabel();
    });

    updateLabel();
    navContainer.appendChild(toggleButton);
  }

  function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    function updateProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      bar.style.setProperty('--progress-width', Math.min(100, Math.max(0, progress)) + '%');
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  function setupRevealAnimation() {
    const targets = document.querySelectorAll('.section, .card, .blog-post, .category-hero, .hero-stat, .article-index-card');
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('reveal-ready');
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function setupCounterAnimation() {
    const counters = document.querySelectorAll('[data-countup]');
    counters.forEach(function (counter) {
      const target = Number(counter.getAttribute('data-countup'));
      if (!Number.isFinite(target)) return;

      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 900;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const ratio = Math.min(1, elapsed / duration);
        const value = Math.floor(target * (0.2 + 0.8 * ratio));
        counter.textContent = value + suffix;

        if (ratio < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target + suffix;
        }
      }

      requestAnimationFrame(tick);
    });
  }

  function setupHomeInteractions() {
    document.querySelectorAll('.project-modal').forEach(function (dialog) {
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) {
          dialog.close();
        }
      });
    });

    const filterChips = document.querySelectorAll('.filter-chip');
    const projectCards = document.querySelectorAll('.card-project');
    const filterStatus = document.querySelector('.filter-status');

    if (!filterChips.length || !projectCards.length) return;

    function updateProjectVisibility(tag) {
      let visibleCount = 0;

      projectCards.forEach(function (card) {
        const tags = (card.dataset.tags || '').split(' ');
        const showCard = tag === 'all' || tags.includes(tag);
        card.hidden = !showCard;

        if (showCard) {
          visibleCount += 1;
        }
      });

      if (filterStatus) {
        filterStatus.textContent = visibleCount + '件のプロジェクトを表示中';
      }
    }

    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filterChips.forEach(function (button) {
          button.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        updateProjectVisibility(chip.dataset.filter || 'all');
      });
    });
  }

  function updateCurrentYear() {
    const currentYear = String(new Date().getFullYear());
    document.querySelectorAll('.js-current-year').forEach(function (element) {
      element.textContent = currentYear;
    });
  }

  setupModeToggle();
  setupScrollProgress();
  setupRevealAnimation();
  setupCounterAnimation();
  setupHomeInteractions();
  updateCurrentYear();
})();
