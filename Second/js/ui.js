// Simple UI for mobile hamburger menu
// - toggles body.mobile-open
// - manages aria-expanded
// - closes on link click or Escape

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('mobileNav');

  function setOpen(isOpen) {
    document.body.classList.toggle('mobile-open', isOpen);
    if (btn) btn.setAttribute('aria-expanded', String(isOpen));
  }

  if (btn && drawer) {
    btn.addEventListener('click', () => {
      const open = document.body.classList.contains('mobile-open');
      setOpen(!open);
    });

    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });

    // Close when clicking outside the drawer
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('mobile-open')) return;
      const t = e.target;
      if (drawer.contains(t) || btn.contains(t)) return;
      setOpen(false);
    });
  }
});
