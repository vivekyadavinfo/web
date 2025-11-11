/* Simple crossfade slider that loads images from JSON (fallback demo images) */
function initHeroSlider({ el, jsonPath = 'assets/images/slider.json', interval = 5000 } = {}) {
  if (!el) return;

  const state = { idx: 0, timer: null, slides: [] };

  function createSlide(src) {
    const d = document.createElement('div');
    d.className = 'slider__slide';
    d.style.backgroundImage = `url("${src}")`;
    return d;
  }

  async function loadList() {
    // 1) Try data-images attribute (works even on file://)
    const attr = el.getAttribute('data-images');
    if (attr) {
      try {
        const arr = JSON.parse(attr);
        if (Array.isArray(arr) && arr.length) return arr;
      } catch {}
    }
    // 2) Try JSON manifest
    try {
      const res = await fetch(jsonPath, { cache: 'no-store' });
      if (!res.ok) throw new Error('no json');
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) throw new Error('empty');
      return arr;
    } catch (e) {
      // 3) Fallback to local banners only (no external URLs)
      return [
        'assets/images/Banners/Banner.jpg'
      ];
    }
  }

  function start() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(next, interval);
  }

  function show(i) {
    state.slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
  }

  function next() { state.idx = (state.idx + 1) % state.slides.length; show(state.idx); }
  function prev() { state.idx = (state.idx - 1 + state.slides.length) % state.slides.length; show(state.idx); }

  function enableSwipe() {
    let x0 = null;
    el.addEventListener('pointerdown', e => { x0 = e.clientX; });
    window.addEventListener('pointerup', e => {
      if (x0 == null) return; const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 30) { dx > 0 ? prev() : next(); start(); }
    });
  }

  (async () => {
    const list = await loadList();
    el.innerHTML = '';
    // Normalize to assets/images if user provided bare filenames
    const norm = (p) => {
      if (!p) return p;
      if (/^https?:\/\//i.test(p)) return p;
      if (p.startsWith('assets/')) return p;
      if (p.startsWith('./')) return p.slice(2);
      if (p.startsWith('Banners/')) return `assets/images/${p}`;
      if (!p.includes('/')) return `assets/images/${p}`;
      return p;
    };
    const listNorm = list.map(src => norm(String(src).replace(/\\\\/g, '/')));
    state.slides = listNorm.map(src => createSlide(src));
    state.slides.forEach(s => el.appendChild(s));
    if (state.slides.length) { state.idx = 0; show(0); start(); enableSwipe(); }
  })();
}
