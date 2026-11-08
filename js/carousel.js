/**
 * carousel.js — Seamless Infinite Auto-Scrolling Certificate Carousel
 * High-performance, constant-speed, GPU-accelerated marquee with
 * infinite wrapping, touch/drag support, hover pause, and manual navigation.
 */

function initCertCarousel() {
  const wrap = document.querySelector('.cert-carousel-wrap');
  const inner = document.querySelector('.cert-carousel-inner');
  const track = document.querySelector('.cert-track');
  const dotsEl = document.querySelector('.cert-dots');
  const prevBtn = document.querySelector('.cert-prev');
  const nextBtn = document.querySelector('.cert-next');

  if (!track || !inner) return;

  // Track original cards before cloning
  const originalCards = Array.from(track.children);
  const totalOriginal = originalCards.length;
  if (!totalOriginal) return;

  // Clone original cards to create a true seamless infinite loop.
  // Clones are hidden from screen readers, so their links must not be
  // reachable with Tab either.
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('cert-card-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
    track.appendChild(clone);
  });

  let cardW = 0;
  let singleSetWidth = 0;
  let baseSpeed = 0; // px per second
  const CYCLE_DURATION = 18; // ~18 seconds for full-track cycle (noticeably faster constant motion)

  let currentX = 0;
  let targetNudge = 0;
  // The carousel moves only when none of these are true.
  let hoverPaused = false;  // mouse is over it
  let focusPaused = false;  // keyboard focus is inside it
  let userPaused = false;   // the pause button was pressed (or reduced motion is on)
  let isDragging = false;
  let dragStartX = 0;
  let dragStartPos = 0;
  let animId = null;
  let lastTimestamp = performance.now();

  const numDots = Math.min(6, totalOriginal);

  function resize() {
    const w = inner.clientWidth;
    const visible = w < 600 ? 1 : w < 840 ? 2 : 3;
    cardW = w / visible;

    // Apply uniform width to all cards (originals + clones)
    track.querySelectorAll('.cert-card').forEach(c => {
      c.style.minWidth = cardW + 'px';
      c.style.maxWidth = cardW + 'px';
      c.style.flexShrink = '0';
    });

    singleSetWidth = totalOriginal * cardW;
    // Set constant speed so one full cycle of certificates takes ~18 seconds
    baseSpeed = singleSetWidth / CYCLE_DURATION;

    // Keep current offset in bounds
    if (singleSetWidth > 0) {
      currentX = currentX % singleSetWidth;
    }
  }

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = Array.from({ length: numDots })
      .map((_, i) => `<button class="cert-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Go to certificate group ${i + 1}"></button>`)
      .join('');

    dotsEl.querySelectorAll('.cert-dot').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.i, 10);
        const targetX = (i / numDots) * singleSetWidth;
        let diff = targetX - (currentX % singleSetWidth);
        if (diff > singleSetWidth / 2) diff -= singleSetWidth;
        if (diff < -singleSetWidth / 2) diff += singleSetWidth;
        targetNudge += diff;
      });
    });
  }

  function updateDots() {
    if (!dotsEl || singleSetWidth <= 0) return;
    const normX = ((currentX % singleSetWidth) + singleSetWidth) % singleSetWidth;
    const activeIndex = Math.floor((normX / singleSetWidth) * numDots) % numDots;
    const dots = dotsEl.querySelectorAll('.cert-dot');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === activeIndex);
    });
  }

  function tick(now) {
    const dt = Math.min((now - lastTimestamp) / 1000, 0.05); // Clamp dt to prevent tab-switching jumps
    lastTimestamp = now;

    // Constant-speed automatic continuous scrolling from right to left
    if (!hoverPaused && !focusPaused && !userPaused && !isDragging) {
      currentX += baseSpeed * dt;
    }

    // Absorb arrow / dot nudges: glide normally, jump instantly under reduced motion
    if (Math.abs(targetNudge) > 0.5) {
      const step = reduceMotion ? targetNudge : targetNudge * 0.14;
      currentX += step;
      targetNudge -= step;
    } else {
      currentX += targetNudge;
      targetNudge = 0;
    }

    // True seamless infinite loop:
    // When currentX reaches singleSetWidth, wrap back with zero jump or flicker
    if (singleSetWidth > 0) {
      while (currentX >= singleSetWidth) {
        currentX -= singleSetWidth;
      }
      while (currentX < 0) {
        currentX += singleSetWidth;
      }
    }

    track.style.transform = `translate3d(-${currentX.toFixed(2)}px, 0, 0)`;

    updateDots();
    animId = requestAnimationFrame(tick);
  }

  // Navigation Arrows: smoothly glide forward or backward by 1 card without breaking loop
  if (nextBtn) {
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      targetNudge += cardW;
    });
  }

  if (prevBtn) {
    prevBtn.style.opacity = '1';
    prevBtn.style.cursor = 'pointer';
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      targetNudge -= cardW;
    });
  }

  // Hover to pause so users can easily read or click "Verify / View"
  if (wrap) {
    // Real mouse only. A tap on a phone fires a "hover" that never ends,
    // which would leave the carousel stuck.
    wrap.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse') hoverPaused = true;
    });
    wrap.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse') hoverPaused = false;
    });

    // Keyboard users: hold still while Tab focus is inside the carousel.
    // Clicking a button also focuses it, so only count keyboard focus.
    wrap.addEventListener('focusin', e => {
      let keyboard = true;
      try { keyboard = e.target.matches(':focus-visible'); } catch (err) { /* old browser */ }
      focusPaused = keyboard;
    });
    wrap.addEventListener('focusout', e => {
      if (!wrap.contains(e.relatedTarget)) focusPaused = false;
    });
  }

  // Pause / play button (works for mouse, keyboard and touch)
  const pauseBtn = document.querySelector('.cert-pause');
  const PAUSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const PLAY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';

  function setUserPaused(paused) {
    userPaused = paused;
    if (!pauseBtn) return;
    pauseBtn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
    pauseBtn.setAttribute('aria-label', paused ? 'Play certificate carousel' : 'Pause certificate carousel');
    pauseBtn.title = paused ? 'Play' : 'Pause';
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', e => {
      e.preventDefault();
      const nowPaused = !userPaused;
      setUserPaused(nowPaused);
      // Pressing Play is an explicit request to move, even though the
      // mouse is over the carousel and the button has focus.
      if (!nowPaused) {
        hoverPaused = false;
        focusPaused = false;
      }
    });
  }

  // Respect "reduce motion": start paused, and follow the setting if it changes
  const motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reduceMotion = !!(motionQuery && motionQuery.matches);
  setUserPaused(reduceMotion);

  if (motionQuery) {
    const onMotionChange = e => {
      reduceMotion = e.matches;
      setUserPaused(e.matches);
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
  }

  // Touch and drag support
  inner.addEventListener('touchstart', e => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartPos = currentX;
  }, { passive: true });

  inner.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const diff = dragStartX - e.touches[0].clientX;
    currentX = dragStartPos + diff;
  }, { passive: true });

  inner.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Handle visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    lastTimestamp = performance.now();
  });

  // Handle window resizing with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });

  // Initial setup
  resize();
  renderDots();
  lastTimestamp = performance.now();
  animId = requestAnimationFrame(tick);
}
