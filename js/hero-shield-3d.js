/* Nova Proteção — Emblema 3D Procedural em Three.js baseado em assets/images/logo.png. */
(() => {
  "use strict";

  const LOGO_SRC = "assets/images/logo.png";
  const LOGO_ASPECT = 448 / 430;

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

  function createSquircleShape(THREE, width, height, radius) {
    const hw = width / 2;
    const hh = height / 2;
    const r = Math.min(radius, hw, hh);
    const k = r * 0.55228475;
    const shape = new THREE.Shape();

    shape.moveTo(-hw + r, hh);
    shape.lineTo(hw - r, hh);
    shape.bezierCurveTo(hw - r + k, hh, hw, hh - r + k, hw, hh - r);
    shape.lineTo(hw, -hh + r);
    shape.bezierCurveTo(hw, -hh + r - k, hw - r + k, -hh, hw - r, -hh);
    shape.lineTo(-hw + r, -hh);
    shape.bezierCurveTo(-hw + r - k, -hh, -hw, -hh + r - k, -hw, -hh + r);
    shape.lineTo(-hw, hh - r);
    shape.bezierCurveTo(-hw, hh - r + k, -hw + r - k, hh, -hw + r, hh);
    return shape;
  }

  function createNormalizedFaceGeometry(THREE, shape, width, height) {
    const geo = new THREE.ShapeGeometry(shape, 36);
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      uvs[i * 2] = (x + width / 2) / width;
      uvs[i * 2 + 1] = (y + height / 2) / height;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geo;
  }

  function blurGrayscaleImageData(src, width, height) {
    const out = new Uint8ClampedArray(src.length);
    for (let y = 0; y < height; y += 1) {
      const y0 = Math.max(0, y - 1);
      const y2 = Math.min(height - 1, y + 1);
      for (let x = 0; x < width; x += 1) {
        const x0 = Math.max(0, x - 1);
        const x2 = Math.min(width - 1, x + 1);
        const sum =
          src[(y0 * width + x0) * 4] +
          src[(y0 * width + x) * 4] +
          src[(y0 * width + x2) * 4] +
          src[(y * width + x0) * 4] +
          src[(y * width + x) * 4] * 2 +
          src[(y * width + x2) * 4] +
          src[(y2 * width + x0) * 4] +
          src[(y2 * width + x) * 4] +
          src[(y2 * width + x2) * 4];
        const v = Math.round(sum / 10);
        const idx = (y * width + x) * 4;
        out[idx] = v;
        out[idx + 1] = v;
        out[idx + 2] = v;
        out[idx + 3] = 255;
      }
    }
    return out;
  }

  function buildLogoMaps(THREE, image, maxAnisotropy) {
    const width = image.naturalWidth || 448;
    const height = image.naturalHeight || 430;

    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = width;
    colorCanvas.height = height;
    const colorCtx = colorCanvas.getContext("2d");
    colorCtx.fillStyle = "#0083c7";
    colorCtx.fillRect(0, 0, width, height);
    colorCtx.drawImage(image, 0, 0, width, height);

    const colorMap = new THREE.CanvasTexture(colorCanvas);
    if ("SRGBColorSpace" in THREE) {
      colorMap.colorSpace = THREE.SRGBColorSpace;
    }
    colorMap.anisotropy = maxAnisotropy;
    colorMap.needsUpdate = true;

    const maps = { colorMap, bumpMap: null, emissiveMap: null, roughnessMap: null };

    try {
      const srcData = colorCtx.getImageData(0, 0, width, height);
      const data = srcData.data;

      const bumpCanvas = document.createElement("canvas");
      bumpCanvas.width = width;
      bumpCanvas.height = height;
      const bumpCtx = bumpCanvas.getContext("2d");

      const emissiveCanvas = document.createElement("canvas");
      emissiveCanvas.width = width;
      emissiveCanvas.height = height;
      const emissiveCtx = emissiveCanvas.getContext("2d");

      const roughCanvas = document.createElement("canvas");
      roughCanvas.width = width;
      roughCanvas.height = height;
      const roughCtx = roughCanvas.getContext("2d");

      const bumpImg = bumpCtx.createImageData(width, height);
      const emissiveImg = emissiveCtx.createImageData(width, height);
      const roughImg = roughCtx.createImageData(width, height);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const strokeMask = Math.max(0, Math.min(1, (r - 45) / 185));
        const bumpVal = Math.round(35 + strokeMask * 220);
        const emitVal = Math.round(strokeMask * 255);
        const roughVal = Math.round(76 - strokeMask * 48);

        bumpImg.data[i] = bumpVal;
        bumpImg.data[i + 1] = bumpVal;
        bumpImg.data[i + 2] = bumpVal;
        bumpImg.data[i + 3] = 255;

        emissiveImg.data[i] = Math.round(emitVal * 0.72);
        emissiveImg.data[i + 1] = Math.round(emitVal * 0.94);
        emissiveImg.data[i + 2] = emitVal;
        emissiveImg.data[i + 3] = 255;

        roughImg.data[i] = roughVal;
        roughImg.data[i + 1] = roughVal;
        roughImg.data[i + 2] = roughVal;
        roughImg.data[i + 3] = 255;
      }

      // Blur puro em JS (compatível com todas as versões do iOS Safari).
      const blurred = blurGrayscaleImageData(bumpImg.data, width, height);
      bumpImg.data.set(blurred);

      bumpCtx.putImageData(bumpImg, 0, 0);
      emissiveCtx.putImageData(emissiveImg, 0, 0);
      roughCtx.putImageData(roughImg, 0, 0);

      maps.bumpMap = new THREE.CanvasTexture(bumpCanvas);
      maps.bumpMap.anisotropy = maxAnisotropy;
      maps.bumpMap.needsUpdate = true;

      maps.emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
      maps.emissiveMap.anisotropy = maxAnisotropy;
      maps.emissiveMap.needsUpdate = true;

      maps.roughnessMap = new THREE.CanvasTexture(roughCanvas);
      maps.roughnessMap.anisotropy = maxAnisotropy;
      maps.roughnessMap.needsUpdate = true;
    } catch {
      // Fallback seguro quando getImageData não está disponível (ex.: file://).
    }

    return maps;
  }

  function createLogoMedallionModel(THREE) {
    const root = new THREE.Group();
    root.name = "novaLogoMedallion";

    const badgePivot = new THREE.Group();
    badgePivot.name = "badgePivot";
    root.add(badgePivot);

    const badgeWidth = 2.18;
    const badgeHeight = badgeWidth / LOGO_ASPECT;
    const cornerRadius = badgeWidth * 0.174;
    const extrudeDepth = 0.24;
    const bevelThickness = 0.08;
    const bevelSize = 0.055;
    const halfTotalZ = extrudeDepth / 2 + bevelThickness;

    const bodyShape = createSquircleShape(THREE, badgeWidth, badgeHeight, cornerRadius);
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: extrudeDepth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 8,
      curveSegments: 36,
    });
    bodyGeo.center();

    const chassisMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x045787,
      emissive: 0x022942,
      emissiveIntensity: 0.35,
      metalness: 0.82,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, chassisMaterial);
    bodyMesh.name = "logoChassis";
    badgePivot.add(bodyMesh);

    const faceShape = createSquircleShape(
      THREE,
      badgeWidth * 0.985,
      badgeHeight * 0.985,
      cornerRadius * 0.985,
    );
    const faceGeo = createNormalizedFaceGeometry(
      THREE,
      faceShape,
      badgeWidth * 0.985,
      badgeHeight * 0.985,
    );

    const faceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0083c7,
      emissive: 0x70dcff,
      emissiveIntensity: 0.22,
      metalness: 0.12,
      roughness: 0.24,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      bumpScale: 0.085,
    });

    const frontFace = new THREE.Mesh(faceGeo, faceMaterial);
    frontFace.position.z = halfTotalZ + 0.003;
    frontFace.name = "logoFrontFace";
    badgePivot.add(frontFace);

    const backFace = new THREE.Mesh(faceGeo, faceMaterial);
    backFace.position.z = -(halfTotalZ + 0.003);
    backFace.rotation.y = Math.PI;
    backFace.name = "logoBackFace";
    badgePivot.add(backFace);

    const rimShape = createSquircleShape(
      THREE,
      badgeWidth + bevelSize * 1.15,
      badgeHeight + bevelSize * 1.15,
      cornerRadius + bevelSize * 0.6,
    );
    const rimPoints = rimShape
      .getPoints(72)
      .map((p) => new THREE.Vector3(p.x, p.y, extrudeDepth / 2 + bevelThickness * 0.45));
    const rimCurve = new THREE.CatmullRomCurve3(rimPoints, true);
    const rimGeo = new THREE.TubeGeometry(rimCurve, 108, 0.022, 10, true);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x8ce5ff,
      emissive: 0x4dc8f5,
      emissiveIntensity: 1.25,
      metalness: 0.45,
      roughness: 0.18,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMaterial);
    rimMesh.name = "logoGlowRim";
    badgePivot.add(rimMesh);

    const orbitPivotA = new THREE.Group();
    orbitPivotA.rotation.set(0.54, -0.34, 0.24);
    root.add(orbitPivotA);

    const ringAMat = new THREE.MeshStandardMaterial({
      color: 0x4dc8f5,
      emissive: 0x1b96c8,
      emissiveIntensity: 0.85,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.017, 14, 96), ringAMat);
    orbitPivotA.add(ringA);

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x6fe0ff,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    const beaconA = new THREE.Mesh(new THREE.SphereGeometry(0.066, 16, 16), beaconMat);
    beaconA.position.set(1.9, 0, 0);
    orbitPivotA.add(beaconA);

    const beaconA2 = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 14), beaconMat);
    beaconA2.position.set(-1.9, 0, 0);
    orbitPivotA.add(beaconA2);

    const orbitPivotB = new THREE.Group();
    orbitPivotB.rotation.set(-0.66, 0.4, -0.38);
    root.add(orbitPivotB);

    const ringBMat = new THREE.MeshStandardMaterial({
      color: 0xa6e7ff,
      emissive: 0x2ca8de,
      emissiveIntensity: 0.6,
      metalness: 0.65,
      roughness: 0.25,
      transparent: true,
      opacity: 0.42,
    });
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.22, 0.012, 12, 96), ringBMat);
    orbitPivotB.add(ringB);

    const beaconB = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), beaconMat);
    beaconB.position.set(0, 2.22, 0);
    orbitPivotB.add(beaconB);

    const moteCount = 44;
    const positions = new Float32Array(moteCount * 3);
    const colors = new Float32Array(moteCount * 3);
    const cyanColor = new THREE.Color(0x63d8ff);
    const warmColor = new THREE.Color(0xffe1b0);

    for (let i = 0; i < moteCount; i += 1) {
      const radius = 1.75 + Math.random() * 1.45;
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
      pivots: { badgePivot, orbitPivotA, orbitPivotB },
      materials: { faceMaterial, rimMaterial, chassisMaterial },
      motes,
    };

    root.userData.applyLogoTexture = (maps) => {
      faceMaterial.color.setHex(0xffffff);
      faceMaterial.map = maps.colorMap;
      if (maps.bumpMap) faceMaterial.bumpMap = maps.bumpMap;
      if (maps.roughnessMap) faceMaterial.roughnessMap = maps.roughnessMap;
      if (maps.emissiveMap) {
        faceMaterial.emissiveMap = maps.emissiveMap;
      } else {
        faceMaterial.emissiveIntensity = 0.08;
      }
      faceMaterial.needsUpdate = true;
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

      badgePivot.position.y = floatY - state.scroll * 0.35;
      badgePivot.rotation.y =
        Math.sin(elapsed * 0.65) * 0.24 +
        state.pointerX * 0.45 +
        state.scroll * 1.05;
      badgePivot.rotation.x =
        Math.cos(elapsed * 0.5) * 0.065 -
        state.pointerY * 0.28 +
        state.scroll * 0.24;
      badgePivot.rotation.z = Math.sin(elapsed * 0.4) * 0.035;

      const scaleBreath = 1 + Math.sin(elapsed * 1.8) * 0.015 + state.boost * 0.055;
      badgePivot.scale.setScalar(scaleBreath);

      orbitPivotA.rotation.z += dt * 0.42 * speed;
      orbitPivotA.rotation.y = -0.34 + state.pointerX * 0.22 + state.scroll * 0.4;
      orbitPivotB.rotation.z -= dt * 0.28 * speed;
      orbitPivotB.rotation.x = -0.66 - state.pointerY * 0.2;

      motes.rotation.y = elapsed * 0.09 + state.pointerX * 0.16;
      motes.rotation.x = Math.sin(elapsed * 0.2) * 0.08 - state.pointerY * 0.12;

      rimMaterial.emissiveIntensity =
        1.15 + Math.sin(elapsed * 2.2) * 0.25 + state.boost * 0.9;
      if (faceMaterial.emissiveMap) {
        faceMaterial.emissiveIntensity =
          0.26 + Math.sin(elapsed * 2.2 + 0.5) * 0.1 + state.boost * 0.65;
      }
    };

    return root;
  }

  function mountFallbackLogo(container) {
    const img = document.createElement("img");
    img.src = LOGO_SRC;
    img.alt = "";
    img.className = "hero-3d-fallback";
    container.replaceChildren(img);
  }

  function initHeroLogo3D(container, { reducedMotion = false } = {}) {
    if (!container) return null;
    if (!window.THREE) {
      mountFallbackLogo(container);
      return null;
    }

    const THREE = window.THREE;
    try {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "default",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      container.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
      camera.position.set(0, 0, 6.4);

      const hemi = new THREE.HemisphereLight(0xb5ecff, 0x071b27, 1.45);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.35);
      keyLight.position.set(3.4, 4.4, 5.4);
      scene.add(keyLight);

      const warmFill = new THREE.DirectionalLight(0xffddb0, 1.05);
      warmFill.position.set(-4.0, -1.6, 3.2);
      scene.add(warmFill);

      const rimLight = new THREE.PointLight(0x4dc8f5, 5.8, 14);
      rimLight.position.set(-2.2, 2.4, -2.5);
      scene.add(rimLight);

      const model = createLogoMedallionModel(THREE);
      scene.add(model);

      const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      const logoImage = new Image();
      logoImage.decoding = "async";
      logoImage.onload = () => {
        const maps = buildLogoMaps(THREE, logoImage, maxAnisotropy);
        model.userData.applyLogoTexture(maps);
        renderer.render(scene, camera);
      };
      logoImage.src = LOGO_SRC;

      function resize() {
        const rect = container.getBoundingClientRect();
        const width = Math.max(120, Math.round(rect.width));
        const height = Math.max(120, Math.round(rect.height));
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderer.render(scene, camera);
      }

      if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
      }
      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("orientationchange", resize, { passive: true });
      window.addEventListener("load", resize);
      resize();
      requestAnimationFrame(resize);

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
        model.userData.tick(0.016, 0.4, 0, 0, 0, false);
        renderer.render(scene, camera);
      } else {
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
              if (visible) start();
              else stop();
            },
            { threshold: 0.01 },
          );
          observer.observe(container);
        }
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
    } catch {
      mountFallbackLogo(container);
      return null;
    }
  }

  window.NOVA_HERO_3D = { init: initHeroLogo3D };
})();
