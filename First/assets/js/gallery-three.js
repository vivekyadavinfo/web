/* Three.js shader slideshow: one image at a time with poetic displacement transition */
function initGalleryThree({ mount, jsonPath = 'assets/images/gallery.json' } = {}) {
  if (!mount || !window.THREE) return;

  const W = mount.clientWidth, H = mount.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const canvas = renderer.domElement; canvas.className = 'gallery-three__canvas';
  mount.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const loader = new THREE.TextureLoader();

  function fetchList() {
    const attr = mount.getAttribute('data-images');
    if (attr) {
      try {
        const arr = JSON.parse(attr);
        if (Array.isArray(arr) && arr.length) return Promise.resolve(arr);
      } catch {}
    }
    return fetch(jsonPath, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .catch(() => ['assets/images/Rajiv-Pic.jpg', 'assets/images/Banners/Banner.jpg']);
  }

  const norm = (p) => {
    if (!p) return p;
    p = String(p).replace(/\\\\/g, '/');
    if (/^https?:\/\//i.test(p)) return p; // not expected, but keep
    if (p.startsWith('assets/')) return p;
    if (p.startsWith('./')) return p.slice(2);
    if (p.startsWith('Banners/')) return `assets/images/${p}`;
    if (!p.includes('/')) return `assets/images/${p}`;
    return p;
  };

  // Fullscreen quad
  const geo = new THREE.PlaneGeometry(2, 2, 1, 1);
  const uniforms = {
    t1: { value: null },
    t2: { value: null },
    tex1Size: { value: new THREE.Vector2(1,1) },
    tex2Size: { value: new THREE.Vector2(1,1) },
    resolution: { value: new THREE.Vector2(W, H) },
    progress: { value: 0 },
    time: { value: 0 }
  };

  const vert = `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  // Displacement transition using value noise; poetic swirl
  const frag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D t1, t2;
    uniform vec2 tex1Size, tex2Size, resolution;
    uniform float progress, time;

    // value noise
    float hash(vec2 p){ return fract(1e4 * sin(17.0 * p.x + 0.1 * p.y) * (0.1 + abs(sin(13.0 * p.y + p.x)))); }
    float noise(vec2 x){
      vec2 i = floor(x);
      vec2 f = fract(x);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
    }

    vec2 coverUV(vec2 uv, vec2 img, vec2 canvas){
      float rImg = img.x / img.y;
      float rCanvas = canvas.x / canvas.y;
      if (rImg > rCanvas){
        float s = rCanvas / rImg;
        uv.y = (uv.y - 0.5) * s + 0.5;
      } else {
        float s = rImg / rCanvas;
        uv.x = (uv.x - 0.5) * s + 0.5;
      }
      return uv;
    }

    void main(){
      vec2 uv = vUv;
      // Poetic swirl direction
      vec2 dir = normalize(vec2(0.86, 0.5));
      float n = noise(uv * 6.0 + time * 0.05);
      float swirl = noise(uv * 2.0 + time * 0.1);
      float disp = (progress) * 0.35;

      vec2 uv1 = uv + (n - 0.5) * disp * dir + (swirl - 0.5) * 0.05 * (1.0 - progress);
      vec2 uv2 = uv - (n - 0.5) * (0.35 - disp) * dir - (swirl - 0.5) * 0.05 * progress;

      uv1 = coverUV(uv1, tex1Size, resolution);
      uv2 = coverUV(uv2, tex2Size, resolution);

      float mask = smoothstep(0.25, 0.75, progress + (n - 0.5) * 0.35);
      vec4 c1 = texture2D(t1, uv1);
      vec4 c2 = texture2D(t2, uv2);
      gl_FragColor = mix(c1, c2, mask);
    }
  `;

  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  function onResize(){
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h);
    uniforms.resolution.value.set(w, h);
  }
  window.addEventListener('resize', onResize);

  let textures = [];
  let idx = 0;
  let lastTime = performance.now();
  let transStart = 0;
  let inTransition = false;
  const hold = 2800;       // time each image stays (ms)
  const duration = 1600;   // transition duration (ms)

  function setTexSizes() {
    if (uniforms.t1.value?.image) uniforms.tex1Size.value.set(uniforms.t1.value.image.width, uniforms.t1.value.image.height);
    if (uniforms.t2.value?.image) uniforms.tex2Size.value.set(uniforms.t2.value.image.width, uniforms.t2.value.image.height);
  }

  function nextIndex(i){ return (i + 1) % textures.length; }

  function beginTransition(){
    inTransition = true;
    transStart = performance.now();
    uniforms.progress.value = 0;
  }

  function tick(){
    const now = performance.now();
    const dt = now - lastTime; lastTime = now;
    uniforms.time.value += dt * 0.001;

    if (textures.length >= 2){
      if (!inTransition){
        // hold current frame, then trigger transition
        if (now - transStart >= hold){
          uniforms.t2.value = textures[nextIndex(idx)];
          setTexSizes();
          beginTransition();
        }
      } else {
        const t = (now - transStart) / duration;
        uniforms.progress.value = Math.min(1, t);
        if (t >= 1){
          // complete transition: promote t2 to t1, advance index
          idx = nextIndex(idx);
          uniforms.t1.value = textures[idx];
          uniforms.progress.value = 0;
          inTransition = false;
          transStart = now; // restart hold timer
        }
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  function startShow(texList){
    textures = texList;
    if (!textures.length) return;
    idx = 0;
    uniforms.t1.value = textures[idx];
    uniforms.t2.value = textures[nextIndex(idx)] || textures[idx];
    setTexSizes();
    transStart = performance.now();
    inTransition = false;
    requestAnimationFrame(tick);
    // hide fallback grid
    const fallback = mount.parentElement?.querySelector('.masonry');
    if (fallback) fallback.style.display = 'none';
    // hint
    const hint = document.createElement('div');
    hint.className = 'gallery-three__hint';
    hint.textContent = 'क्लिक करें / ← → तस्वीर बदलें';
    mount.appendChild(hint);
    // controls
    window.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowRight' || e.key === ' ') { transStart = 0; inTransition = false; }
      if (e.key === 'ArrowLeft') {
        idx = (idx - 1 + textures.length) % textures.length;
        uniforms.t1.value = textures[idx];
        uniforms.t2.value = textures[nextIndex(idx)];
        setTexSizes();
        transStart = 0; inTransition = false;
      }
    });
    canvas.addEventListener('click', ()=>{ transStart = 0; inTransition = false; });
  }

  fetchList().then(list => {
    const listNorm = list.map(norm);
    return Promise.all(listNorm.map(src => new Promise(res => loader.load(src, res))));
  }).then(texArr => {
    texArr.forEach(t => { t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; });
    startShow(texArr);
  }).catch(() => {
    // leave fallback visible
  });
}
