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

  // Clone original cards to create a true seamless infinite loop
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('cert-card-clone');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let cardW = 0;
  let singleSetWidth = 0;
  let baseSpeed = 0; // px per second
  const CYCLE_DURATION = 18; // ~18 seconds for full-track cycle (noticeably faster constant motion)

  let currentX = 0;
  let targetNudge = 0;
  let isPaused = false;
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
    if (!isPaused && !isDragging) {
      currentX += baseSpeed * dt;
    }

    // Smoothly absorb arrow / dot nudge adjustments
    if (Math.abs(targetNudge) > 0.5) {
      const step = targetNudge * 0.14;
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
    wrap.addEventListener('mouseenter', () => { isPaused = true; });
    wrap.addEventListener('mouseleave', () => { isPaused = false; });
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
