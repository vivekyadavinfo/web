/* Three.js soft particles background for the hero */
function initHeroBG(canvas) {
  if (!window.THREE || !canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(DPR);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Particles
  const count = 500;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i=0;i<count;i++){
    positions[i*3+0] = (Math.random()-0.5) * 20;
    positions[i*3+1] = (Math.random()-0.2) * 10;
    positions[i*3+2] = - (Math.random() * 10 + 2);
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent:true, opacity:0.8 });
  const pts = new THREE.Points(geom, mat);
  scene.add(pts);

  function cssVar(name){
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || '#ffffff';
  }
  function setStardustColor(){
    const col = cssVar('--stardust');
    try { mat.color = new THREE.Color(col); }
    catch { mat.color = new THREE.Color(0xffffff); }
  }
  setStardustColor();
  window.addEventListener('themechange', setStardustColor);

  camera.position.z = 4.5;

  function animate(){
    pts.rotation.z += 0.0007;
    pts.position.y = Math.sin(performance.now()*0.0006)*0.3;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
