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

// Reveal animations via IntersectionObserver
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
