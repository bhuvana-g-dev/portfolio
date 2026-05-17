/**
 * main.js — Interactions, animations, scroll behaviors
 * Depends on: render.js (renderAll), carousel.js (initCertCarousel), data.js (PORTFOLIO)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── RENDER CONTENT ─────────────────────────────────── */
  renderAll();
  initCertCarousel();

  /* ── NAVBAR SCROLL ──────────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveNav();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── MOBILE MENU ────────────────────────────────────── */
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });

  // Close menu on nav link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('active');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      burger.classList.remove('active');
    }
  });

  /* ── ACTIVE NAV HIGHLIGHT ───────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  function highlightActiveNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const match = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }

  /* ── SMOOTH SCROLL ──────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── SCROLL REVEAL ──────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  const revealTargets = [
    '.skill-card', '.project-card', '.achievement-card',
    '.exp-card', '.contact-card', '.cert-card', '.about-card'
  ];

  function observeRevealTargets() {
    revealTargets.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => revealObserver.observe(el));
    });
  }

  // Call after a short delay to ensure cards are rendered
  setTimeout(observeRevealTargets, 50);

 /* ── TYPED HERO EFFECT ──────────────────────────────── */
const roles = PORTFOLIO.profile.typedRoles;

let roleIdx = 0;
let charIdx = 0;
let deleting = false;

const typedEl = document.querySelector('.hero-typed');

function typeEffect() {

  const current = roles[roleIdx];

  if (!deleting) {

    typedEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;

    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeEffect, 1400);
      return;
    }

  } else {

    typedEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;

    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }

  }

  setTimeout(typeEffect, deleting ? 50 : 90);
}

if (typedEl) {
  typeEffect();
}

  /* ── STAGGER ANIMATION DELAY (skill cards) ──────────── */
  document.querySelectorAll('.skill-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });

  /* ── CONTACT FORM — Web3Forms AJAX ──────────────────── */
  // Submits via fetch so user stays on the page.
  // Shows green success or red error message inline.
  const form = document.querySelector('.contact-form');
  const formResult = document.querySelector('.form-result');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // prevent full page redirect

      const btn = form.querySelector('.form-submit-btn');
      const originalText = btn.textContent;

      // Loading state
      btn.textContent = 'Sending…';
      btn.disabled = true;
      if (formResult) formResult.textContent = '';

      try {
        const formData = new FormData(form);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();

        if (data.success) {
          // ✅ Success
          form.reset();
          if (formResult) {
            formResult.textContent = '✓ Message sent! I\'ll get back to you soon.';
            formResult.className = 'form-result form-result--success';
          }
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        // ❌ Error
        if (formResult) {
          formResult.textContent = '✗ Something went wrong. Try emailing me directly.';
          formResult.className = 'form-result form-result--error';
        }
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
});