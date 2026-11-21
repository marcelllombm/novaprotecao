/* Nova Proteção — Escudo 3D Procedural em Three.js (arquitetura code-only). */
(() => {
  "use strict";

  function createGlowTexture(THREE) {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(180, 240, 255, 1)");
    gradient.addColorStop(0.35, "rgba(77, 200, 245, 0.55)");
    gradient.addColorStop(1, "rgba(77, 200, 245, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createShieldShape(THREE, scale = 1) {
    const s = scale;
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.38 * s);
    shape.bezierCurveTo(
      0.42 * s,
      1.36 * s,
      0.92 * s,
      1.16 * s,
      1.08 * s,
      0.98 * s,
    );
    shape.bezierCurveTo(
      1.11 * s,
      0.34 * s,
      0.96 * s,
      -0.36 * s,
      0.56 * s,
      -0.88 * s,
    );
    shape.bezierCurveTo(
      0.34 * s,
      -1.15 * s,
      0.14 * s,
      -1.32 * s,
      0,
      -1.42 * s,
    );
    shape.bezierCurveTo(
      -0.14 * s,
      -1.32 * s,
      -0.34 * s,
      -1.15 * s,
      -0.56 * s,
      -0.88 * s,
    );
    shape.bezierCurveTo(
      -0.96 * s,
      -0.36 * s,
      -1.11 * s,
      0.34 * s,
      -1.08 * s,
      0.98 * s,
    );
    shape.bezierCurveTo(
      -0.92 * s,
      1.16 * s,
      -0.42 * s,
      1.36 * s,
      0,
      1.38 * s,
    );
    return shape;
  }

  function createCheckShape(THREE) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.46, 0.04);
    shape.lineTo(-0.34, 0.16);
    shape.lineTo(-0.1, -0.09);
    shape.lineTo(0.4, 0.42);
    shape.lineTo(0.52, 0.3);
    shape.lineTo(-0.1, -0.33);
    shape.closePath();
    return shape;
  }

  function createProtectionShieldModel(THREE) {
    const root = new THREE.Group();
    root.name = "novaProtectionShield";

    const shieldPivot = new THREE.Group();
    shieldPivot.name = "shieldPivot";
    root.add(shieldPivot);

    // 1. Moldura externa metálica chanfrada (titânio oceânico).
    const outerShape = createShieldShape(THREE, 1.0);
    const outerGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 6,
      curveSegments: 32,
    });
    outerGeo.center();

    const frameMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0d3d56,
      metalness: 0.82,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    });
    const outerMesh = new THREE.Mesh(outerGeo, frameMaterial);
    outerMesh.name = "shieldFrame";
    shieldPivot.add(outerMesh);

    // 2. Núcleo interno translúcido com brilho ciano de proteção.
    const innerShape = createShieldShape(THREE, 0.84);
    const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.035,
      bevelSegments: 5,
      curveSegments: 28,
    });
    innerGeo.center();

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0b6fa4,
      emissive: 0x054f7a,
      emissiveIntensity: 0.65,
      metalness: 0.2,
      roughness: 0.12,
      transmission: 0.35,
      transparent: true,
      opacity: 0.94,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
    const innerMesh = new THREE.Mesh(innerGeo, coreMaterial);
    innerMesh.position.z = 0.06;
    innerMesh.name = "shieldGlassCore";
    shieldPivot.add(innerMesh);

    // 3. Filete luminoso acompanhando o contorno do escudo.
    const rimPoints = outerShape.getPoints(64).map((p) => new THREE.Vector3(p.x * 1.02, p.y * 1.02, 0.16));
    const rimCurve = new THREE.CatmullRomCurve3(rimPoints, true);
    const rimGeo = new THREE.TubeGeometry(rimCurve, 96, 0.024, 10, true);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x7ce0ff,
      emissive: 0x4dc8f5,
      emissiveIntensity: 1.3,
      metalness: 0.4,
      roughness: 0.18,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMaterial);
    rimMesh.name = "shieldGlowRim";
    shieldPivot.add(rimMesh);

    // 4. Emblema checkmark 3D em destaque frontal.
    const checkGeo = new THREE.ExtrudeGeometry(createCheckShape(THREE), {
      depth: 0.11,
      bevelEnabled: true,
      bevelThickness: 0.028,
      bevelSize: 0.022,
      bevelSegments: 4,
    });
    checkGeo.center();
    const checkMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4fcff,
      emissive: 0x6cd8ff,
      emissiveIntensity: 0.9,
      metalness: 0.25,
      roughness: 0.15,
    });
    const checkMesh = new THREE.Mesh(checkGeo, checkMaterial);
    checkMesh.position.set(0.02, -0.02, 0.23);
    checkMesh.name = "shieldCheckmark";
    shieldPivot.add(checkMesh);

    // 5. Anéis orbitais giroscópicos + satélites luminosos (proteção 24h).
    const orbitPivotA = new THREE.Group();
    orbitPivotA.rotation.set(0.52, -0.35, 0.25);
    root.add(orbitPivotA);

    const ringAMat = new THREE.MeshStandardMaterial({
      color: 0x4dc8f5,
      emissive: 0x1b96c8,
      emissiveIntensity: 0.85,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.72,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.018, 14, 96), ringAMat);
    orbitPivotA.add(ringA);

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x6fe0ff,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    const beaconA = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 16), beaconMat);
    beaconA.position.set(1.78, 0, 0);
    orbitPivotA.add(beaconA);

    const beaconA2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), beaconMat);
    beaconA2.position.set(-1.78, 0, 0);
    orbitPivotA.add(beaconA2);

    const orbitPivotB = new THREE.Group();
    orbitPivotB.rotation.set(-0.68, 0.42, -0.4);
    root.add(orbitPivotB);

    const ringBMat = new THREE.MeshStandardMaterial({
      color: 0xa6e7ff,
      emissive: 0x2ca8de,
      emissiveIntensity: 0.6,
      metalness: 0.65,
      roughness: 0.25,
      transparent: true,
      opacity: 0.45,
    });
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.012, 12, 96), ringBMat);
    orbitPivotB.add(ringB);

    const beaconB = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), beaconMat);
    beaconB.position.set(0, 2.12, 0);
    orbitPivotB.add(beaconB);

    // 6. Partículas atmosféricas luminosas (camada ambiente em profundidade).
    const moteCount = 44;
    const positions = new Float32Array(moteCount * 3);
    const colors = new Float32Array(moteCount * 3);
    const cyanColor = new THREE.Color(0x63d8ff);
    const warmColor = new THREE.Color(0xffe1b0);

    for (let i = 0; i < moteCount; i += 1) {
      const radius = 1.65 + Math.random() * 1.45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.9;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) * 0.7;

      const c = i % 5 === 0 ? warmColor : cyanColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const motesGeo = new THREE.BufferGeometry();
    motesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    motesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const motesMat = new THREE.PointsMaterial({
      size: 0.14,
      map: createGlowTexture(THREE),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const motes = new THREE.Points(motesGeo, motesMat);
    root.add(motes);

    const state = {
      pointerX: 0,
      pointerY: 0,
      scroll: 0,
      boost: 0,
      targetBoost: 0,
    };

    root.userData.sculptRuntime = {
      pivots: { shieldPivot, orbitPivotA, orbitPivotB },
      materials: { rimMaterial, checkMaterial, coreMaterial },
      motes,
    };

    root.userData.tick = (dt, elapsed, targetX, targetY, scrollProgress, boostActive) => {
      const smooth = 1 - Math.exp(-dt * 5.5);
      state.pointerX += (targetX - state.pointerX) * smooth;
      state.pointerY += (targetY - state.pointerY) * smooth;
      state.scroll += (scrollProgress - state.scroll) * smooth;
      state.targetBoost = boostActive ? 1 : 0;
      state.boost += (state.targetBoost - state.boost) * (1 - Math.exp(-dt * 6));

      const speed = 1 + state.boost * 1.45;
      const floatY = Math.sin(elapsed * 1.35) * 0.11;

      shieldPivot.position.y = floatY - state.scroll * 0.35;
      shieldPivot.rotation.y =
        Math.sin(elapsed * 0.65) * 0.18 +
        state.pointerX * 0.42 +
        state.scroll * 0.9;
      shieldPivot.rotation.x =
        Math.cos(elapsed * 0.5) * 0.06 -
        state.pointerY * 0.28 +
        state.scroll * 0.25;
      shieldPivot.rotation.z = Math.sin(elapsed * 0.4) * 0.04;

      const scaleBreath = 1 + Math.sin(elapsed * 1.8) * 0.015 + state.boost * 0.05;
      shieldPivot.scale.setScalar(scaleBreath);

      orbitPivotA.rotation.z += dt * 0.42 * speed;
      orbitPivotA.rotation.y = -0.35 + state.pointerX * 0.22 + state.scroll * 0.4;
      orbitPivotB.rotation.z -= dt * 0.28 * speed;
      orbitPivotB.rotation.x = -0.68 - state.pointerY * 0.2;

      motes.rotation.y = elapsed * 0.09 + state.pointerX * 0.16;
      motes.rotation.x = Math.sin(elapsed * 0.2) * 0.08 - state.pointerY * 0.12;

      rimMaterial.emissiveIntensity = 1.2 + Math.sin(elapsed * 2.2) * 0.25 + state.boost * 0.9;
      checkMaterial.emissiveIntensity = 0.85 + Math.sin(elapsed * 2.2 + 0.6) * 0.2 + state.boost * 0.7;
    };

    return root;
  }

  function initHeroShield3D(container, { reducedMotion = false } = {}) {
    if (!container || !window.THREE) return null;
    const THREE = window.THREE;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      container.hidden = true;
      return null;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);

    // Iluminação de estúdio harmonizada com a paleta costeira da hero.
    const hemi = new THREE.HemisphereLight(0x9be5ff, 0x071b27, 1.35);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3.5, 4.5, 5.2);
    scene.add(keyLight);

    const warmFill = new THREE.DirectionalLight(0xffd7a3, 1.1);
    warmFill.position.set(-4.2, -1.8, 3.2);
    scene.add(warmFill);

    const rimLight = new THREE.PointLight(0x4dc8f5, 5.5, 14);
    rimLight.position.set(-2.2, 2.4, -2.5);
    scene.add(rimLight);

    const model = createProtectionShieldModel(THREE);
    scene.add(model);

    let width = 1;
    let height = 1;
    function resize() {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let pointerX = 0;
    let pointerY = 0;
    let scrollProgress = 0;
    let boostActive = false;
    let visible = true;
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    function frame(now) {
      if (!visible || document.hidden) {
        rafId = 0;
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      model.userData.tick(dt, elapsed, pointerX, pointerY, scrollProgress, boostActive);
      rimLight.position.x = Math.cos(elapsed * 0.9) * 3.0;
      rimLight.position.y = Math.sin(elapsed * 0.7) * 2.2;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (reducedMotion || rafId || !visible || document.hidden) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      if (!rafId) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    if (reducedMotion) {
      model.userData.tick(0.016, 0.6, 0, 0, 0, false);
      renderer.render(scene, camera);
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          if (visible) start();
          else stop();
        },
        { threshold: 0.02 },
      );
      observer.observe(container);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
      });
      start();
    }

    return {
      setPointer(nx, ny) {
        pointerX = Math.max(-1, Math.min(1, nx));
        pointerY = Math.max(-1, Math.min(1, ny));
      },
      setScroll(progress) {
        scrollProgress = Math.max(0, Math.min(1, progress));
      },
      setBoost(active) {
        boostActive = Boolean(active);
      },
      setReducedMotion(isReduced) {
        reducedMotion = Boolean(isReduced);
        if (reducedMotion) {
          stop();
          renderer.render(scene, camera);
        } else {
          start();
        }
      },
    };
  }

  window.NOVA_HERO_3D = { init: initHeroShield3D };
})();
