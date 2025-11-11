// Main orchestrator: nav, year, reveal, slider, gallery, three hero bg

// Nav toggle
const toggle = document.querySelector('.nav__toggle');
const list = document.querySelector('.nav__list');
if (toggle && list) {
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  list.addEventListener('click', e => {
    if (e.target instanceof Element && e.target.tagName === 'A') {
      list.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Reveal animations
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });
for (const el of document.querySelectorAll('.section, .card, .video, .shot, .portrait, .section__title')) {
  el.classList.add('reveal');
  observer.observe(el);
}

// Init hero slider
if (typeof initHeroSlider === 'function') {
  initHeroSlider({
    el: document.getElementById('hero-slider'),
    jsonPath: 'assets/images/slider.json',
    interval: 5000
  });
}

// Init gallery (Three.js) — removed if no gallery element
if (typeof initGalleryThree === 'function') {
  const mount = document.getElementById('gallery-three');
  if (mount) initGalleryThree({ mount, jsonPath: 'assets/images/gallery.json' });
}

// Theme toggle (dark/light)
(function initTheme(){
  const key = 'theme';
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const apply = (mode) => {
    const dark = mode === 'dark';
    root.classList.toggle('theme-dark', dark);
    if (btn){
      btn.setAttribute('aria-pressed', String(dark));
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    // Notify listeners (e.g., hero stardust color)
    window.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
  };
  const saved = localStorage.getItem(key);
  if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    apply('dark');
  } else {
    apply('light');
  }
  if (btn){
    btn.addEventListener('click', () => {
      const dark = !root.classList.contains('theme-dark');
      apply(dark ? 'dark' : 'light');
      localStorage.setItem(key, dark ? 'dark' : 'light');
    });
  }
})();

// Booking form mailto handler
(function initBooking(){
  const form = document.getElementById('booking-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = (form.getAttribute('data-email') || '').trim();
    const subject = `Booking Inquiry: ${fd.get('eventType') || ''} ${fd.get('date') ? '— '+fd.get('date') : ''}`;
    const lines = [
      `Name: ${fd.get('name') || ''}`,
      `Email: ${fd.get('email') || ''}`,
      `Phone: ${fd.get('phone') || ''}`,
      `City/Venue: ${fd.get('city') || ''}`,
      `Event Type: ${fd.get('eventType') || ''}`,
      `Date: ${fd.get('date') || ''}`,
      '',
      (fd.get('message') || '')
    ];
    const body = encodeURIComponent(lines.join('\n'));
    const to = encodeURIComponent(email);
    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = href;
  });
})();

// Init hero background particles
if (typeof initHeroBG === 'function') {
  const canvas = document.getElementById('hero-bg');
  if (canvas) initHeroBG(canvas);
}
