import * as THREE from "three";

/**
 * Mount the autumn planet scene into `container` and return a function that stops it and frees its GPU resources.
 * With `options.mode === "gait"` it shows one cat walking side-on at `options.control.speed`, read every frame.
 * With `options.view`, the scene leaves vertical swipes and the wheel to the page until `options.view.active` is true.
 */
export function createAutumnPlanet(container, options = {}) {
  const R = 6;
  const GAIT_MODE = options.mode === "gait";
  const gaitControl = options.control ?? { speed: 0.3 };
  const view = options.view;
  const takesAllInput = () => !view || view.active;
  const UP = new THREE.Vector3(0, 1, 0);
  const ZAXIS = new THREE.Vector3(0, 0, 1);
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function hash3(x, y, z) {
    const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return h - Math.floor(h);
  }
  function vnoise3(x, y, z) {
    const xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z);
    const xf = x - xi,
      yf = y - yi,
      zf = z - zi;
    const u = xf * xf * (3 - 2 * xf),
      v = yf * yf * (3 - 2 * yf),
      w = zf * zf * (3 - 2 * zf);
    const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
    const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u),
      x10 = lerp(c(0, 1, 0), c(1, 1, 0), u);
    const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u),
      x11 = lerp(c(0, 1, 1), c(1, 1, 1), u);
    return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
  }
  function fbm3(x, y, z) {
    let v = 0,
      a = 0.5;
    for (let i = 0; i < 4; i++) {
      v += a * vnoise3(x, y, z);
      x *= 2.02;
      y *= 2.02;
      z *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  // render below screen resolution on purpose: the soft upscale suits the painted look
  renderer.setPixelRatio(0.75);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    32,
    container.clientWidth / container.clientHeight,
    0.1,
    200
  );

  const sun = new THREE.DirectionalLight(0xfff0d8, 2.6);
  sun.position.set(-8, 14, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -8,
    right: 8,
    top: 8,
    bottom: -8,
    near: 1,
    far: 40,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0xa65a35, 1.3));

  const gradientMap = new THREE.DataTexture(
    new Uint8Array([
      95, 95, 95, 255, 100, 100, 100, 255, 165, 165, 165, 255, 172, 172, 172,
      255, 245, 245, 245, 255, 255, 255, 255, 255,
    ]),
    6,
    1,
    THREE.RGBAFormat
  );
  gradientMap.minFilter = gradientMap.magFilter = THREE.LinearFilter;
  gradientMap.needsUpdate = true;
  const toon = (color, extra = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap, ...extra });

  const planet = new THREE.Group();
  planet.quaternion.setFromEuler(new THREE.Euler(0.3, 0, 0));
  scene.add(planet);

  const W = new THREE.Vector3(1, 0.12, 0.3).normalize();
  const WC = new THREE.Vector3().crossVectors(W, UP).normalize();
  let windStrength = 0.6;
  function gust(p, t) {
    const a = p.dot(W) * 1.1 - t * 2.0;
    const b = p.dot(WC) * 0.7 + t * 0.3;
    let g = 0.5 + 0.5 * Math.sin(a + 1.5 * Math.sin(b));
    g *= g;
    return windStrength * (0.25 + 0.95 * g);
  }
  const _wn = new THREE.Vector3();
  function windVec(p, t, out) {
    _wn.copy(p).normalize();
    out.copy(W).addScaledVector(_wn, -W.dot(_wn));
    return out.multiplyScalar(gust(p, t));
  }

  // Recent points the cats passed through (planet-local xyz, w = time). The first slots follow each
  // cat live; the rest are a ring buffer, so crops bend away and slowly stand back up.
  const TRAIL_N = 96,
    TRAIL_LIVE = 4;
  const trail = Array.from(
    { length: TRAIL_N },
    () => new THREE.Vector4(0, 0, 0, -1000)
  );
  const windUniforms = {
    uTrail: { value: trail },
    uTime: { value: 0 },
    uWindDir: { value: W },
    uWindCross: { value: WC },
    uStrength: { value: windStrength },
  };
  const WIND_GLSL = /* glsl */ `
  uniform float uTime; uniform vec3 uWindDir; uniform vec3 uWindCross; uniform float uStrength;
  #define TRAIL_N 96
  uniform vec4 uTrail[TRAIL_N];
  varying float vSheen;
  float windGust(vec3 p, float t) {
    float a = dot(p, uWindDir) * 1.1 - t * 2.0;
    float b = dot(p, uWindCross) * 0.7 + t * 0.3;
    float g = 0.5 + 0.5 * sin(a + 1.5 * sin(b));
    g *= g;
    return uStrength * (0.25 + 0.95 * g);
  }`;
  function windMaterial() {
    const m = new THREE.MeshToonMaterial({
      gradientMap,
      vertexColors: true,
      side: THREE.DoubleSide,
    });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, windUniforms);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\n" + WIND_GLSL)
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
          vSheen = 0.0;
          #ifdef USE_INSTANCING
          {
            vec3 bp = instanceMatrix[3].xyz;
            float s = length(instanceMatrix[0].xyz);
            vec3 nr = normalize(bp);
            vec3 tw = uWindDir - dot(uWindDir, nr) * nr;
            float g = windGust(bp, uTime);
            vec3 side = cross(nr, tw);
            float hn = clamp(position.y, 0.0, 1.0);
            // nearby trail points each push the stalk away from them; summing keeps the lean smooth
            vec3 push = vec3(0.0);
            for (int i = 0; i < TRAIL_N; i++) {
              vec4 tp = uTrail[i];
              float age = uTime - tp.w;
              if (age < 0.0 || age > 3.5) continue;
              vec3 dv = bp - tp.xyz;
              dv -= nr * dot(dv, nr);
              float dl = length(dv);
              if (dl > 0.2 || dl < 1e-4) continue;
              float k = 1.0 - dl / 0.2;
              push += dv / dl * k * k * (1.0 - smoothstep(0.6, 3.5, age));
            }
            float pl = length(push);
            if (pl > 1.0) push /= pl;
            vec3 disp = (tw * g * 0.6 + side * sin(uTime * 3.1 + bp.x * 7.0 + bp.z * 5.0) * 0.08 * (0.3 + g)
              + push * 0.45) * hn * hn * s;
            vec3 lw = transpose(mat3(instanceMatrix)) * disp / (s * s);
            transformed += lw;
            transformed.y -= length(lw) * 0.35 * hn;
            vSheen = g * hn;
          }
          #endif`
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying float vSheen;"
        )
        .replace(
          "#include <color_fragment>",
          "#include <color_fragment>\n diffuseColor.rgb *= 1.0 + vSheen * 0.45;"
        );
    };
    return m;
  }

  const ROW_DIR = new THREE.Vector3(1, 0, 0.15).normalize();
  function patchField(n) {
    return (
      fbm3(n.x * 1.7 + 11, n.y * 1.7 + 3, n.z * 1.7 - 5) +
      0.3 * Math.exp(-(1 - n.y) * 12)
    );
  }
  function pathField(n) {
    return Math.abs(fbm3(n.x * 1.25 - 7, n.y * 1.25 + 2, n.z * 1.25 + 9) - 0.5);
  }
  function groundAt(n) {
    const patch = smoothstep(0.56, 0.61, patchField(n));
    const path = smoothstep(0.04, 0.026, pathField(n)) * (1 - patch);
    return { patch, path, field: 1 - Math.max(patch, path) };
  }
  function heightAt(n) {
    return (fbm3(n.x * 2.2 + 5, n.y * 2.2, n.z * 2.2) - 0.47) * 0.12;
  }
  function rowWave(n) {
    return Math.sin(n.dot(ROW_DIR) * R * 11);
  }
  function clearingDir(x, z) {
    return new THREE.Vector3(x, R, z).normalize();
  }
  function surfacePoint(n, lift = 0) {
    return n.clone().multiplyScalar(R + heightAt(n) + lift);
  }

  {
    const geo = new THREE.IcosahedronGeometry(R, 64);
    const pos = geo.attributes.position,
      nor = geo.attributes.normal;
    const colors = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3(),
      c = new THREE.Color();
    const soilA = new THREE.Color("#a9542a"),
      soilB = new THREE.Color("#d0843c");
    const strawA = new THREE.Color("#e7c283"),
      strawB = new THREE.Color("#d6a764");
    const dirtA = new THREE.Color("#a8784a"),
      dirtB = new THREE.Color("#c29563");
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      nor.setXYZ(i, v.x, v.y, v.z);
      const f = fbm3(v.x * 4 + 1, v.y * 4, v.z * 4);
      const g = groundAt(v);
      c.copy(soilA).lerp(soilB, smoothstep(0.3, 0.7, f));
      c.multiplyScalar(0.88 + 0.12 * (0.5 + 0.5 * rowWave(v)));
      c.lerp(tmp.copy(strawA).lerp(strawB, smoothstep(0.3, 0.7, f)), g.patch);
      c.lerp(
        tmp.copy(dirtA).lerp(dirtB, fbm3(v.x * 30, v.y * 30, v.z * 30)),
        g.path
      );
      colors.set([c.r, c.g, c.b], i * 3);
      const h = heightAt(v);
      pos.setXYZ(i, v.x * (R + h), v.y * (R + h), v.z * (R + h));
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const ground = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true }));
    ground.receiveShadow = true;
    planet.add(ground);
  }
  const firstPropIndex = planet.children.length;

  function randomDir(out) {
    const z = rand(-1, 1),
      phi = rand(0, Math.PI * 2),
      r = Math.sqrt(1 - z * z);
    return out.set(r * Math.cos(phi), z, r * Math.sin(phi));
  }

  const keepOut = [];
  // obstacles: `{ p, r }`, the planet-local base point and footprint radius of each solid prop
  const obstacles = [];
  function reserve(n, radiusWorld) {
    keepOut.push({ n: n.clone(), cos: Math.cos(radiusWorld / R) });
  }
  function isReserved(n) {
    return keepOut.some((k) => n.dot(k.n) > k.cos);
  }

  function plant(obj, n, yaw = Math.random() * Math.PI * 2, lift = -0.02) {
    obj.position.copy(surfacePoint(n, lift));
    obj.quaternion
      .setFromUnitVectors(UP, n)
      .multiply(new THREE.Quaternion().setFromAxisAngle(UP, yaw));
    obj.userData.baseQuat = obj.quaternion.clone();
    obj.userData.baseQuatInv = obj.quaternion.clone().invert();
    planet.add(obj);
    return obj;
  }
  function shadowAll(obj) {
    obj.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return obj;
  }

  function blobGeo(r, seed, ws = 18, hs = 14) {
    const g = new THREE.SphereGeometry(r, ws, hs);
    const p = g.attributes.position,
      v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = v.clone().normalize();
      v.multiplyScalar(
        1 + (fbm3(n.x * 2 + seed, n.y * 2, n.z * 2) - 0.47) * 0.55
      );
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }

  const LEAF_COLORS = ["#d8572a", "#e8a33d", "#c2402a", "#f0c05a", "#b8452d"];
  const trees = [];
  function makeTree(scale) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.08, 0.8, 7),
      toon("#6b4430")
    );
    trunk.position.y = 0.4;
    g.add(trunk);
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.035, 0.35, 5),
      toon("#6b4430")
    );
    branch.position.set(0.1, 0.62, 0);
    branch.rotation.z = -0.8;
    g.add(branch);
    const crown = new THREE.Group();
    crown.position.y = 0.92;
    g.add(crown);
    const tones = [pick(LEAF_COLORS), pick(LEAF_COLORS)];
    const blobs = [];
    for (const [x, y, z, r] of [
      [0, 0, 0, 0.32],
      [0.22, 0.06, 0.06, 0.23],
      [-0.2, 0.08, -0.06, 0.24],
      [0.02, 0.25, 0.03, 0.21],
      [0.05, -0.06, 0.22, 0.2],
      [-0.06, -0.04, -0.2, 0.2],
    ]) {
      const b = new THREE.Mesh(
        blobGeo(r, Math.random() * 50),
        toon(tones[blobs.length % 2])
      );
      b.position.set(x, y, z);
      b.userData.base = b.position.clone();
      crown.add(b);
      blobs.push(b);
    }
    g.scale.setScalar(scale);
    g.userData = { crown, blobs, phase: Math.random() * 10 };
    return shadowAll(g);
  }
  for (const [n, s] of [
    [clearingDir(-2.5, -2.7), 1.25],
    [clearingDir(3.1, 0.9), 1.0],
    [clearingDir(-3.4, 0.9), 0.9],
    [new THREE.Vector3(-0.8, -0.2, 0.5), 1.2],
    [new THREE.Vector3(0.5, -0.5, -0.7), 1.1],
    [new THREE.Vector3(0.1, -0.9, 0.4), 1.3],
    [new THREE.Vector3(-0.6, 0.3, -0.75), 1.0],
    [new THREE.Vector3(0.9, -0.3, -0.2), 1.15],
    [new THREE.Vector3(0.75, 0.2, 0.62), 0.95],
  ]) {
    n.normalize();
    const t = plant(makeTree(s), n);
    obstacles.push({ p: t.position.clone(), r: 0.2 * s });
    trees.push(t);
    reserve(n, 0.3 * s);
  }

  function beam(a, b, r, mat) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, a.distanceTo(b), 6),
      mat
    );
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
    return m;
  }
  const windmill = (() => {
    const g = new THREE.Group();
    const wood = toon("#8a5a3c"),
      metal = toon("#d9d2c3"),
      red = toon("#b4473a");
    const H = 1.9,
      B = 0.26,
      T = 0.05;
    const corner = (sx, sz, y) => {
      const w = lerp(B, T, y / H);
      return new THREE.Vector3(sx * w, y, sz * w);
    };
    const sides = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];
    for (const [sx, sz] of sides)
      g.add(beam(corner(sx, sz, 0), corner(sx, sz, H), 0.022, wood));
    for (const y of [0.55, 1.15, 1.6]) {
      for (let i = 0; i < 4; i++)
        g.add(
          beam(
            corner(...sides[i], y),
            corner(...sides[(i + 1) % 4], y),
            0.012,
            wood
          )
        );
    }
    const head = new THREE.Group();
    head.position.y = H + 0.04;
    g.add(head);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 0.16, 10),
      metal
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.06;
    head.add(hub);
    const rotor = new THREE.Group();
    rotor.position.z = 0.15;
    head.add(rotor);
    for (let i = 0; i < 12; i++) {
      const arm = new THREE.Group();
      arm.rotation.z = (i / 12) * Math.PI * 2;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.075, 0.3, 0.012),
        i % 3 === 0 ? red : metal
      );
      blade.position.y = 0.22;
      blade.rotation.y = 0.4;
      arm.add(blade);
      rotor.add(arm);
    }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.008, 6, 32),
      metal
    );
    rotor.add(ring);
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.025, 0.55),
      wood
    );
    tail.position.z = -0.28;
    head.add(tail);
    const vane = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.2, 0.28), red);
    vane.position.z = -0.6;
    head.add(vane);
    g.userData = { head, rotor, spin: 0 };
    return shadowAll(g);
  })();
  {
    const n = clearingDir(1.9, -2.5);
    plant(windmill, n, 0);
    obstacles.push({ p: windmill.position.clone(), r: 0.3 });
    reserve(n, 0.35);
  }

  const flag = (() => {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.024, 0.95, 6),
      toon("#7a5238")
    );
    pole.position.y = 0.475;
    g.add(pole);
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 6),
      toon("#e2c27a")
    );
    knob.position.y = 0.96;
    g.add(knob);
    const swivel = new THREE.Group();
    swivel.position.y = 0.8;
    g.add(swivel);
    const geo = new THREE.PlaneGeometry(0.42, 0.26, 14, 6);
    geo.translate(0.21, -0.13, 0);
    const cloth = new THREE.Mesh(
      geo,
      toon("#3f7f8c", { side: THREE.DoubleSide })
    );
    swivel.add(cloth);
    g.userData = {
      swivel,
      cloth,
      base: geo.attributes.position.array.slice(),
      yaw: 0,
    };
    return shadowAll(g);
  })();
  {
    const n = clearingDir(-1.75, -1.25);
    plant(flag, n, 0);
    obstacles.push({ p: flag.position.clone(), r: 0.06 });
    reserve(n, 0.15);
  }

  {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 1.1),
      toon("#b5523b")
    );
    body.position.y = 0.3;
    g.add(body);
    const shape = new THREE.Shape();
    shape.moveTo(-0.53, 0);
    shape.lineTo(0.53, 0);
    shape.lineTo(0, 0.42);
    shape.closePath();
    const roofGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.2,
      bevelEnabled: false,
    });
    roofGeo.translate(0, 0, -0.6);
    const roof = new THREE.Mesh(roofGeo, toon("#6a4a3a"));
    roof.position.y = 0.6;
    g.add(roof);
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.42, 0.02),
      toon("#f2e6cc")
    );
    door.position.set(0, 0.21, 0.555);
    g.add(door);
    const doorIn = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.36, 0.022),
      toon("#8f3a2a")
    );
    doorIn.position.set(0, 0.2, 0.556);
    g.add(doorIn);
    const n = new THREE.Vector3(-0.35, -0.55, -0.76).normalize();
    plant(shadowAll(g), n, 0.4);
    obstacles.push({ p: g.position.clone(), r: 0.75 });
    reserve(n, 1.0);
  }

  function makePumpkin(s) {
    const g = new THREE.Group();
    const mat = toon("#cf4f1c");
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), mat);
      lobe.scale.set(0.8, 1, 1.2);
      lobe.position.set(Math.cos(a) * 0.06, 0.08, Math.sin(a) * 0.06);
      lobe.rotation.y = -a;
      g.add(lobe);
    }
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.02, 0.07, 6),
      toon("#5c6b3a")
    );
    stem.position.y = 0.17;
    stem.rotation.z = 0.3;
    g.add(stem);
    g.scale.setScalar(s);
    return shadowAll(g);
  }
  /** Return a random point on a cleared patch within `maxAngle` of `near`, at least 0.6 from earlier spots. */
  const propSpots = [];
  function patchSpot(near, maxAngle) {
    const n = new THREE.Vector3();
    for (let i = 0; i < 4000; i++) {
      randomDir(n);
      if (
        n.angleTo(near) > maxAngle ||
        groundAt(n).patch < 0.8 ||
        isReserved(n)
      )
        continue;
      if (propSpots.some((q) => q.angleTo(n) * R < 0.6)) continue;
      propSpots.push(n.clone());
      return n;
    }
    return near.clone();
  }
  for (let i = 0; i < 9; i++) {
    const n = patchSpot(UP, i < 2 ? 0.7 : Math.PI);
    const pumpkin = plant(
      makePumpkin(rand(0.8, 1.25)),
      n,
      Math.random() * 6,
      -0.01
    );
    obstacles.push({ p: pumpkin.position.clone(), r: 0.13 * pumpkin.scale.x });
    reserve(n, 0.15);
  }
  function makeBale() {
    const g = new THREE.Group();
    const bale = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.3, 18),
      toon("#e4bd68")
    );
    bale.rotation.z = Math.PI / 2;
    bale.position.y = 0.16;
    g.add(bale);
    for (const sx of [-1, 1]) {
      const end = new THREE.Mesh(
        new THREE.CircleGeometry(0.16, 18),
        toon("#cf9f4c")
      );
      end.position.set(sx * 0.151, 0.16, 0);
      end.rotation.y = (sx * Math.PI) / 2;
      g.add(end);
    }
    return shadowAll(g);
  }
  for (let i = 0; i < 7; i++) {
    const n = patchSpot(UP, i < 1 ? 0.8 : Math.PI);
    const bale = plant(makeBale(), n, Math.random() * 6, -0.01);
    obstacles.push({ p: bale.position.clone(), r: 0.24 });
    reserve(n, 0.25);
  }

  function cropGeometry() {
    const profile = [
      [0, 0.03],
      [0.3, 0.026],
      [0.62, 0.02],
      [0.74, 0.042],
      [0.88, 0.038],
      [1.0, 0.0],
    ];
    const P = [],
      C = [],
      N = [],
      I = [];
    for (let b = 0; b < 2; b++) {
      const ang = (b * Math.PI) / 2 + 0.3,
        dx = Math.cos(ang),
        dz = Math.sin(ang);
      const start = P.length / 3;
      for (const [y, w] of profile) {
        const lean = 0.05 * y * y;
        for (const s of [-1, 1]) {
          P.push(s * w * dx + lean, y, s * w * dz);
          N.push(0, 1, 0);
          const k = lerp(0.55, 1.12, y);
          C.push(k, k, k);
        }
      }
      for (let i = 0; i < profile.length - 1; i++) {
        const a = start + i * 2;
        I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
    g.setIndex(I);
    return g;
  }
  const cropMat = windMaterial();
  if (GAIT_MODE) {
    for (const prop of planet.children.slice(firstPropIndex))
      prop.visible = false;
    obstacles.length = 0;
  }
  const cropGeo = cropGeometry();
  if (!GAIT_MODE) {
    const MAX = 42000;
    const crops = new THREE.InstancedMesh(cropGeo, cropMat, MAX);
    const palette = [
      "#e07b2c",
      "#ec9a3f",
      "#d4652a",
      "#f2b155",
      "#c95a24",
      "#e98f35",
    ].map((c) => new THREE.Color(c));
    const n = new THREE.Vector3(),
      q = new THREE.Quaternion(),
      qy = new THREE.Quaternion(),
      qt = new THREE.Quaternion();
    const m4 = new THREE.Matrix4(),
      sc = new THREE.Vector3(),
      col = new THREE.Color();
    let k = 0;
    for (let tries = 0; k < MAX && tries < 260000; tries++) {
      randomDir(n);
      const fm = groundAt(n).field;
      if (Math.random() > fm) continue;
      if (rowWave(n) < -0.6) continue;
      if (isReserved(n)) continue;
      q.setFromUnitVectors(UP, n);
      qy.setFromAxisAngle(UP, Math.random() * Math.PI * 2);
      qt.setFromAxisAngle(
        new THREE.Vector3(rand(-1, 1), 0, rand(-1, 1)).normalize(),
        rand(0, 0.15)
      );
      q.multiply(qt).multiply(qy);
      const s = rand(0.38, 0.58) * lerp(0.5, 1, fm);
      m4.compose(surfacePoint(n, -0.01), q, sc.set(s, s, s));
      crops.setMatrixAt(k, m4);
      col.copy(pick(palette)).multiplyScalar(rand(0.9, 1.08));
      crops.setColorAt(k, col);
      k++;
    }
    crops.count = k;
    crops.frustumCulled = false;
    crops.receiveShadow = true;
    planet.add(crops);

    const STUB = 4000;
    const stubble = new THREE.InstancedMesh(cropGeo, cropMat, STUB);
    const strawPal = ["#e9c98e", "#d9ae6d", "#f0d59f", "#c99a5a"].map(
      (c) => new THREE.Color(c)
    );
    let j = 0;
    for (let tries = 0; j < STUB && tries < 200000; tries++) {
      randomDir(n);
      if (groundAt(n).patch < 0.6) continue;
      q.setFromUnitVectors(UP, n).multiply(
        qy.setFromAxisAngle(UP, Math.random() * 6.28)
      );
      const s = rand(0.06, 0.12);
      m4.compose(surfacePoint(n, -0.005), q, sc.set(s, s, s));
      stubble.setMatrixAt(j, m4);
      stubble.setColorAt(j, col.copy(pick(strawPal)));
      j++;
    }
    stubble.count = j;
    stubble.frustumCulled = false;
    stubble.receiveShadow = true;
    planet.add(stubble);
  }

  const LEAF_N = 160;
  const leafGeo = new THREE.CircleGeometry(0.035, 7);
  leafGeo.scale(1, 0.62, 1);
  const leaves = new THREE.InstancedMesh(
    leafGeo,
    toon(0xffffff, { side: THREE.DoubleSide }),
    LEAF_N
  );
  leaves.frustumCulled = false;
  leaves.visible = !GAIT_MODE;
  planet.add(leaves);
  const leafState = [];
  const tmpV = new THREE.Vector3(),
    tmpV2 = new THREE.Vector3(),
    tmpQ = new THREE.Quaternion(),
    tmpM = new THREE.Matrix4();
  function spawnLeaf(L, resting = false) {
    if (resting) {
      const n = clearingDir(rand(-2.2, 2.2), rand(-2.2, 2.2));
      L.p.copy(surfacePoint(n, 0.012));
      L.rest = rand(0, 12);
      L.q
        .setFromUnitVectors(ZAXIS, n)
        .multiply(tmpQ.setFromAxisAngle(ZAXIS, rand(0, 6.28)));
    } else if (Math.random() < 0.65) {
      const tree = pick(trees);
      const n = tree.position.clone().normalize();
      L.p
        .copy(tree.position)
        .addScaledVector(n, 1.0 * tree.scale.x)
        .add(tmpV.set(rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)));
      L.rest = 0;
    } else {
      const n = clearingDir(rand(-5, -1.5), rand(-3.5, 2.5));
      L.p.copy(surfacePoint(n, rand(0.5, 1.4)));
      L.rest = 0;
    }
    L.v.set(0, 0, 0);
    L.age = 0;
  }
  for (let i = 0; i < LEAF_N; i++) {
    const L = {
      p: new THREE.Vector3(),
      v: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      rest: 0,
      age: 0,
      axis: new THREE.Vector3(
        rand(-1, 1),
        rand(-1, 1),
        rand(-1, 1)
      ).normalize(),
      spin: rand(2, 6),
      phase: rand(0, 10),
    };
    spawnLeaf(L, i < LEAF_N * 0.45);
    if (!L.rest) L.age = rand(0, 10);
    leafState.push(L);
    leaves.setColorAt(i, new THREE.Color(pick(LEAF_COLORS)));
  }
  const _lwv = new THREE.Vector3(),
    _ln3 = new THREE.Vector3(),
    _lside = new THREE.Vector3();
  function updateLeaves(dt, t) {
    const wv = _lwv,
      n = _ln3,
      side = _lside;
    for (let i = 0; i < LEAF_N; i++) {
      const L = leafState[i];
      n.copy(L.p).normalize();
      const ground = R + heightAt(n);
      if (L.rest > 0) {
        L.rest -= dt;
        const g = gust(L.p, t);
        if (L.rest <= 0) {
          if (g > 0.55 && Math.random() < 0.5) {
            L.v.copy(n).multiplyScalar(0.5);
            L.age = 0;
          } else spawnLeaf(L);
        }
      } else {
        windVec(L.p, t, wv);
        const g = gust(L.p, t);
        side.crossVectors(n, wv).normalize();
        tmpV
          .copy(wv)
          .multiplyScalar(1.9)
          .addScaledVector(
            n,
            -0.22 + (g - 0.5) * 0.5 + Math.sin(t * 3 + L.phase) * 0.12
          )
          .addScaledVector(side, Math.sin(t * 2.3 + L.phase * 2) * 0.25);
        L.v.lerp(tmpV, 1 - Math.exp(-dt * 2.5));
        L.p.addScaledVector(L.v, dt);
        L.q.multiply(tmpQ.setFromAxisAngle(L.axis, L.spin * dt * (0.4 + g)));
        L.age += dt;
        const alt = L.p.length() - ground;
        if (alt < 0.012) {
          L.rest = rand(2, 8);
          n.copy(L.p).normalize();
          L.p.copy(n).multiplyScalar(ground + 0.012);
          L.q
            .setFromUnitVectors(ZAXIS, n)
            .multiply(tmpQ.setFromAxisAngle(ZAXIS, rand(0, 6.28)));
        } else if (L.age > 16 || alt > 3) spawnLeaf(L);
      }
      tmpM.compose(L.p, L.q, tmpV2.set(1, 1, 1));
      leaves.setMatrixAt(i, tmpM);
    }
    leaves.instanceMatrix.needsUpdate = true;
  }

  const clouds = [];
  {
    const mat = toon("#fffaf0", { emissive: "#3a3026" });
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      const parts = 4 + Math.floor(Math.random() * 3);
      for (let p = 0; p < parts; p++) {
        const r = rand(0.7, 1.3) * (p === 0 ? 1.3 : 1);
        const b = new THREE.Mesh(blobGeo(r, Math.random() * 40, 16, 12), mat);
        b.position.set(
          (p - parts / 2) * rand(0.7, 1.0),
          rand(0, 0.5) + (p === 0 ? 0.3 : 0),
          rand(-0.3, 0.3)
        );
        b.scale.y = 0.75;
        g.add(b);
      }
      g.position.set(rand(-26, 26), rand(3.2, 7.2), rand(-22, -15));
      g.scale.setScalar(rand(0.7, 1.15));
      g.userData.speed = rand(0.5, 1.0);
      scene.add(g);
      clouds.push(g);
    }
  }

  const K = 1.3;
  const S = {
    rumpR: 0.066 * K,
    chestR: 0.07 * K,
    headR: 0.07 * K,
    head: [0.09 * K, 0.07 * K, 0.074 * K],
    L1: 0.11 * K,
    upper: 0.064 * K,
    lower: 0.068 * K,
    legR: 0.027 * K,
    footR: 0.015 * K,
    hipW: 0.04 * K,
  };
  const GRAV = 6;
  const POSES = {
    stand: { rump: 0.135, chest: 0.14, reach: 1, headF: 0.085, headU: 0.075 },
    crouch: {
      rump: 0.1,
      chest: 0.072,
      reach: 1.05,
      headF: 0.095,
      headU: 0.025,
    },
    bow: { rump: 0.16, chest: 0.064, reach: 1.1, headF: 0.08, headU: 0.03 },
    sit: { rump: 0.07, chest: 0.205, reach: 0.3, headF: 0.03, headU: 0.085 },
    lie: { rump: 0.068, chest: 0.072, reach: 1, headF: 0.088, headU: 0.05 },
    arch: { rump: 0.17, chest: 0.165, reach: 0.92, headF: 0.08, headU: 0.07 },
    rear: { rump: 0.08, chest: 0.22, reach: 0.12, headF: 0.03, headU: 0.07 },
    stretch: { rump: 0.16, chest: 0.07, reach: 1.3, headF: 0.1, headU: 0.035 },
    flop: { rump: 0.07, chest: 0.07, reach: 1, headF: 0.085, headU: 0.035 },
  };
  for (const p of Object.values(POSES))
    for (const k of ["rump", "chest", "headF", "headU"]) p[k] *= K;
  const TAIL_N = 13,
    TAIL_RING = 10,
    TAIL_SEG = 0.026 * K;

  const sphereGeo = new THREE.SphereGeometry(1, 24, 16);
  function taperGeo(r0, r1) {
    const g = new THREE.CylinderGeometry(r1, r0, 1, 18, 1, true);
    g.translate(0, 0.5, 0);
    return g;
  }
  const _span = new THREE.Vector3();
  function setSpan(mesh, a, b) {
    _span.subVectors(b, a);
    const len = _span.length() || 1e-4;
    mesh.position.copy(a);
    mesh.quaternion.setFromUnitVectors(UP, _span.divideScalar(len));
    mesh.scale.set(1, len, 1);
  }

  function makeTailMesh(mat) {
    const vcount = TAIL_N * TAIL_RING + 1;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vcount * 3), 3)
    );
    const ind = [];
    for (let i = 0; i < TAIL_N - 1; i++) {
      for (let r = 0; r < TAIL_RING; r++) {
        const a = i * TAIL_RING + r,
          b = i * TAIL_RING + ((r + 1) % TAIL_RING);
        ind.push(a, a + TAIL_RING, b, b, a + TAIL_RING, b + TAIL_RING);
      }
    }
    const last = (TAIL_N - 1) * TAIL_RING;
    for (let r = 0; r < TAIL_RING; r++)
      ind.push(last + r, vcount - 1, last + ((r + 1) % TAIL_RING));
    geo.setIndex(ind);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    return mesh;
  }

  const LEG_N = 14,
    LEG_RING = 16;
  function makeLegMesh(mat) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(LEG_N * LEG_RING * 3), 3)
    );
    const ind = [];
    for (let i = 0; i < LEG_N - 1; i++) {
      for (let r = 0; r < LEG_RING; r++) {
        const a = i * LEG_RING + r,
          b = i * LEG_RING + ((r + 1) % LEG_RING);
        ind.push(a, a + LEG_RING, b, b, a + LEG_RING, b + LEG_RING);
      }
    }
    geo.setIndex(ind);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    return mesh;
  }

  /** Fill `mesh` with a tube along a curve from `hip` through `knee` to `foot`, tapering from `r0` to `r1`. */
  const _lp = new THREE.Vector3(),
    _lt = new THREE.Vector3(),
    _ln = new THREE.Vector3(),
    _lb = new THREE.Vector3(),
    _lc = new THREE.Vector3();
  function fillLeg(mesh, hip, knee, foot, r0, r1) {
    _lc.addVectors(hip, foot).multiplyScalar(0.5);
    _lc.lerp(_lt.copy(knee).multiplyScalar(2).sub(_lc), 0.3);
    const pos = mesh.geometry.attributes.position;
    _ln.set(1, 0, 0);
    for (let i = 0; i < LEG_N; i++) {
      const t = i / (LEG_N - 1),
        u = 1 - t;
      _lp
        .set(0, 0, 0)
        .addScaledVector(hip, u * u)
        .addScaledVector(_lc, 2 * u * t)
        .addScaledVector(foot, t * t);
      _lt
        .set(0, 0, 0)
        .addScaledVector(hip, -2 * u)
        .addScaledVector(_lc, 2 * (u - t))
        .addScaledVector(foot, 2 * t)
        .normalize();
      _ln.addScaledVector(_lt, -_ln.dot(_lt));
      if (_ln.lengthSq() < 1e-8) _ln.set(0, 0, 1).addScaledVector(_lt, -_lt.z);
      _ln.normalize();
      _lb.crossVectors(_lt, _ln);
      const r = lerp(r0, r1, Math.pow(t, 0.8));
      for (let k = 0; k < LEG_RING; k++) {
        const a = (k / LEG_RING) * Math.PI * 2,
          ca = Math.cos(a) * r,
          sa = Math.sin(a) * r;
        pos.setXYZ(
          i * LEG_RING + k,
          _lp.x + _ln.x * ca + _lb.x * sa,
          _lp.y + _ln.y * ca + _lb.y * sa,
          _lp.z + _ln.z * ca + _lb.z * sa
        );
      }
    }
    pos.needsUpdate = true;
  }

  function makeEye(o) {
    const mat = new THREE.MeshBasicMaterial({
      color: o.eye,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const eye = new THREE.Group();
    const body = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    const capGeo = new THREE.CircleGeometry(1, 20);
    const top = new THREE.Mesh(capGeo, mat),
      bottom = new THREE.Mesh(capGeo, mat);
    eye.add(body, top, bottom);
    eye.userData.parts = { body, top, bottom };
    return eye;
  }

  function makeFrame(n) {
    const up = n.clone().normalize();
    const ex = new THREE.Vector3(1, 0, 0).addScaledVector(up, -up.x);
    if (ex.lengthSq() < 1e-6) ex.set(0, 0, 1).addScaledVector(up, -up.z);
    ex.normalize();
    const ez = new THREE.Vector3().crossVectors(ex, up);
    return { o: up.clone().multiplyScalar(R + heightAt(up)), ex, up, ez };
  }
  const _frameM = new THREE.Matrix4(),
    _fw = new THREE.Vector3(),
    _fq2 = new THREE.Quaternion();
  function toWorld(c, p, out) {
    const F = c.frame;
    return out
      .copy(F.o)
      .addScaledVector(F.ex, p.x)
      .addScaledVector(F.up, p.y)
      .addScaledVector(F.ez, p.z);
  }
  /** Move the cat's local frame under it and re-express every stored point, without moving anything in the world. */
  // the axes are carried along the sphere rather than rebuilt, so headings stay valid across the move
  function recenter(c) {
    const F = c.frame;
    if (c.pos.x * c.pos.x + c.pos.z * c.pos.z < 1e-10) return;
    _fw.copy(F.o).addScaledVector(F.ex, c.pos.x).addScaledVector(F.ez, c.pos.z);
    const up2 = _fw.clone().normalize();
    _fq2.setFromUnitVectors(F.up, up2);
    const o2 = up2.clone().multiplyScalar(R + heightAt(up2));
    const ex2 = F.ex.clone().applyQuaternion(_fq2),
      ez2 = F.ez.clone().applyQuaternion(_fq2);
    const point = (q) => {
      toWorld(c, q, _fw).sub(o2);
      q.set(_fw.dot(ex2), _fw.dot(up2), _fw.dot(ez2));
    };
    const vec = (q) => {
      _fw
        .set(0, 0, 0)
        .addScaledVector(F.ex, q.x)
        .addScaledVector(F.up, q.y)
        .addScaledVector(F.ez, q.z);
      q.set(_fw.dot(ex2), _fw.dot(up2), _fw.dot(ez2));
    };
    for (const ch of [c.rump, c.chest, c.head]) {
      point(ch.p);
      point(ch.prev);
      vec(ch.v);
    }
    for (const f of c.feet) {
      point(f.p);
      point(f.from);
      point(f.to);
    }
    for (const q of c.tail.pts) point(q);
    c.pos.set(0, 0, 0);
    Object.assign(F, { o: o2, ex: ex2, up: up2, ez: ez2 });
  }

  function makeCat(o) {
    const mat = new THREE.MeshBasicMaterial({ color: o.color });
    const pink = new THREE.MeshBasicMaterial({ color: "#e8a3a8" });
    const group = new THREE.Group();
    planet.add(group);
    const rollGroup = new THREE.Group();
    group.add(rollGroup);
    const add = (geo, parent = rollGroup) => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      parent.add(m);
      return m;
    };

    const m = {};
    m.rump = add(sphereGeo);
    m.rump.scale.setScalar(S.rumpR);
    m.chest = add(sphereGeo);
    m.chest.scale.setScalar(S.chestR);
    const midR = (S.rumpR + S.chestR) * 0.47;
    m.mid = add(sphereGeo);
    m.mid.scale.setScalar(midR);
    m.body1 = add(taperGeo(S.rumpR, midR));
    m.body2 = add(taperGeo(midR, S.chestR));
    m.neck = add(taperGeo(S.chestR * 0.72, 0.045 * K));
    m.head = new THREE.Group();
    rollGroup.add(m.head);
    add(sphereGeo, m.head).scale.set(...S.head);
    m.ears = [];
    for (const s of [1, -1]) {
      const ear = new THREE.Group();
      ear.position.set(s * 0.058 * K, 0.046 * K, -0.004 * K);
      const outer = add(new THREE.ConeGeometry(0.03 * K, 0.055 * K, 14), ear);
      outer.scale.z = 0.4;
      outer.position.y = 0.022 * K;
      const inner = new THREE.Mesh(
        new THREE.ConeGeometry(0.017 * K, 0.033 * K, 12),
        pink
      );
      inner.scale.z = 0.3;
      inner.position.set(0, 0.016 * K, 0.008 * K);
      ear.add(inner);
      m.head.add(ear);
      m.ears.push({ g: ear, side: s });
    }
    m.eyes = [];
    for (const s of [1, -1]) {
      const eye = makeEye(o);
      eye.position.set(s * 0.033 * K, -0.004 * K, 0.0655 * K);
      m.head.add(eye);
      Object.assign(eye.userData, {
        side: s,
        x: eye.position.x,
        y: eye.position.y,
      });
      m.eyes.push(eye);
    }
    const softMat = new THREE.MeshBasicMaterial({
      color: o.color,
      side: THREE.DoubleSide,
    });
    m.legs = [];
    for (let i = 0; i < 4; i++) {
      const tube = makeLegMesh(softMat);
      rollGroup.add(tube);
      const foot = add(sphereGeo);
      foot.scale.setScalar(S.footR);
      const hip = add(sphereGeo);
      m.legs.push({ tube, foot, hip });
    }
    m.tail = makeTailMesh(softMat);
    rollGroup.add(m.tail);
    m.roll = rollGroup;

    const dir = [Math.sin(o.heading), Math.cos(o.heading)];
    const chunk = (r, f, y) => {
      const p = new THREE.Vector3(dir[0] * f, y, dir[1] * f);
      return { p, prev: p.clone(), v: new THREE.Vector3(), r };
    };
    const neutral = {
      crouch: 0,
      bow: 0,
      arch: 0,
      stretch: 0,
      rear: 0,
      flop: 0,
      sit: 0,
      lie: 0,
      wiggle: 0,
      pawL: 0,
      pawR: 0,
      groom: 0,
      headYaw: 0,
      headPitch: 0,
      tilt: 0,
      tailUp: 0.5,
      earsBack: 0,
      slowBlink: 0,
      happy: 0,
      surprise: 0,
    };
    const c = {
      group,
      m,
      rump: chunk(S.rumpR, -S.L1 / 2, POSES.stand.rump),
      chest: chunk(S.chestR, S.L1 / 2, POSES.stand.chest),
      head: chunk(
        S.headR,
        S.L1 / 2 + POSES.stand.headF,
        POSES.stand.chest + POSES.stand.headU
      ),
      feet: [],
      tail: {
        yaw: new Float32Array(TAIL_N - 1).fill(o.heading + Math.PI),
        pitch: new Float32Array(TAIL_N - 1),
        vy: new Float32Array(TAIL_N - 1),
        vp: new Float32Array(TAIL_N - 1),
        pts: Array.from({ length: TAIL_N }, () => new THREE.Vector3(0, 0.1, 0)),
      },
      frame: makeFrame(o.n),
      pos: new THREE.Vector3(),
      bodyYaw: o.heading,
      speed: 0,
      gait: 0,
      burst: 0,
      burstT: 0,
      wanderH: o.heading,
      crabSide: 1,
      flopSide: 1,
      heading: o.heading,
      wantHeading: o.heading,
      wantSpeed: 0,
      lookYaw: o.heading,
      air: false,
      airT: 0,
      seed: Math.random() * 100,
      tailFreq: rand(1.6, 2.2),
      tailSide: o.tailSide,
      blinkIn: rand(1, 4),
      blink: 0,
      earTwitch: 0,
      gazeAngle: o.heading,
      dartIn: 1,
      dart: { x: 0, y: 0 },
      eye: { len: 1, thick: 1, rot: 0, dx: 0, dy: 0 },
      pose: { ...neutral },
      target: { ...neutral },
      neutral,
    };
    for (const front of [true, false]) {
      for (const side of [1, -1]) {
        const base = front ? c.chest : c.rump;
        const p = new THREE.Vector3(base.p.x + side * S.hipW, 0, base.p.z);
        c.feet.push({
          front,
          side,
          p,
          from: new THREE.Vector3(),
          to: new THREE.Vector3(),
          anchor: new THREE.Vector3(),
          home: new THREE.Vector3(),
          t: -1,
          dur: 0.15,
          lifted: false,
          swing: false,
          bendDown: 0,
        });
      }
    }
    return c;
  }

  const cats = [
    makeCat({
      color: "#f4ede0",
      eye: "#2a272c",
      n: clearingDir(0.45, 0.25),
      heading: -1.6,
      tailSide: 1,
    }),
    makeCat({
      color: "#232127",
      eye: "#dfe2d6",
      n: clearingDir(-0.5, -0.2),
      heading: 1.4,
      tailSide: -1,
    }),
  ];

  const SKELETON_COLOR = "#e0782c";
  const SKELETON_SEGMENTS = 3 + 4 * 2 + (TAIL_N - 1);
  const SKELETON_JOINTS = 4 + 4 * 3 + TAIL_N;
  function dotTexture() {
    const size = 64,
      cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const g = cv.getContext("2d");
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    g.fill();
    return new THREE.CanvasTexture(cv);
  }
  function addSkeleton(c) {
    const wire = new THREE.MeshBasicMaterial({
      color: "#3a332d",
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    c.m.roll.traverse((o) => {
      if (o.isMesh) o.material = wire;
    });
    const lines = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(SKELETON_SEGMENTS * 6), 3)
      ),
      new THREE.LineBasicMaterial({
        color: "#2b2622",
        depthTest: false,
        transparent: true,
      })
    );
    const joints = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(SKELETON_JOINTS * 3), 3)
      ),
      new THREE.PointsMaterial({
        color: SKELETON_COLOR,
        size: 8,
        sizeAttenuation: false,
        map: dotTexture(),
        alphaTest: 0.5,
        depthTest: false,
        transparent: true,
      })
    );
    for (const o of [lines, joints]) {
      o.renderOrder = 10;
      o.frustumCulled = false;
      c.m.roll.add(o);
    }
    c.skeleton = { lines, joints };
  }
  function updateSkeleton(c) {
    const head = _r1.copy(c.head.p);
    const spine = [c.rump.p, c.m.mid.position, c.chest.p, head];
    const lp = c.skeleton.lines.geometry.attributes.position,
      jp = c.skeleton.joints.geometry.attributes.position;
    let li = 0,
      ji = 0;
    const seg = (a, b) => {
      lp.setXYZ(li++, a.x, a.y, a.z);
      lp.setXYZ(li++, b.x, b.y, b.z);
    };
    const joint = (a) => jp.setXYZ(ji++, a.x, a.y, a.z);
    for (let i = 0; i < 3; i++) seg(spine[i], spine[i + 1]);
    spine.forEach(joint);
    for (const leg of c.m.legs) {
      seg(leg.hipAt, leg.kneeAt);
      seg(leg.kneeAt, leg.footAt);
      joint(leg.hipAt);
      joint(leg.kneeAt);
      joint(leg.footAt);
    }
    const q = c.tail.pts;
    for (let i = 0; i < TAIL_N - 1; i++) seg(q[i], q[i + 1]);
    q.forEach(joint);
    lp.needsUpdate = true;
    jp.needsUpdate = true;
  }
  if (GAIT_MODE) addSkeleton(cats[1]);
  if (GAIT_MODE) cats[0].group.visible = false;

  const RATES = {
    pawL: 14,
    pawR: 14,
    wiggle: 10,
    groom: 8,
    bow: 5,
    surprise: 18,
    arch: 8,
    rear: 7,
    flop: 4,
    stretch: 4,
  };
  const _a = new THREE.Vector3(),
    _b = new THREE.Vector3(),
    _fwd = new THREE.Vector3(),
    _side = new THREE.Vector3();
  const _hip = new THREE.Vector3(),
    _foot = new THREE.Vector3(),
    _knee = new THREE.Vector3(),
    _hint = new THREE.Vector3();
  const _r1 = new THREE.Vector3(),
    _r2 = new THREE.Vector3(),
    _r3 = new THREE.Vector3(),
    _wind = new THREE.Vector3();
  const _eyeN = new THREE.Vector3(),
    _rollQ = new THREE.Quaternion();
  const turnToward = (cur, want, step) =>
    cur + clamp(wrap(want - cur), -step, step);

  function bodyFrame(c) {
    _fwd.subVectors(c.chest.p, c.rump.p);
    _fwd.y = 0;
    if (_fwd.lengthSq() < 1e-8)
      _fwd.set(Math.sin(c.heading), 0, Math.cos(c.heading));
    _fwd.normalize();
    _side.set(_fwd.z, 0, -_fwd.x);
  }

  function postureTargets(c) {
    const T = { ...POSES.stand };
    for (const k of [
      "crouch",
      "bow",
      "arch",
      "stretch",
      "rear",
      "sit",
      "lie",
      "flop",
    ]) {
      const w = c.pose[k];
      if (w > 1e-3) for (const f in T) T[f] = lerp(T[f], POSES[k][f], w);
    }
    return T;
  }

  function keepDistance(a, b, min, max, wb) {
    _a.subVectors(b.p, a.p);
    const d = _a.length();
    if (d < 1e-6) return;
    const target = clamp(d, min, max);
    if (target === d) return;
    _a.multiplyScalar((d - target) / d);
    a.p.addScaledVector(_a, 1 - wb);
    b.p.addScaledVector(_a, -wb);
  }

  const CAT_RADIUS = 0.13,
    LOOK_AHEAD = 0.7;
  const _ob = new THREE.Vector3();
  /** Return the turn, in radians, that steers `c` around props within `LOOK_AHEAD` of its wanted path. */
  function avoidTurn(c) {
    if (c.wantSpeed < 0.05) return 0;
    let turn = 0;
    for (const o of obstacles) {
      _ob.copy(o.p).sub(c.frame.o);
      const dx = _ob.dot(c.frame.ex) - c.pos.x,
        dz = _ob.dot(c.frame.ez) - c.pos.z;
      const gap = Math.hypot(dx, dz) - o.r - CAT_RADIUS;
      if (gap > LOOK_AHEAD) continue;
      const rel = wrap(Math.atan2(dx, dz) - c.wantHeading);
      if (Math.abs(rel) > 1.4) continue;
      const push =
        (1 - Math.max(0, gap) / LOOK_AHEAD) * (1 - Math.abs(rel) / 1.4);
      // keep passing on the same side until the prop is well off to one side, so the choice can't flip
      if (o.side === undefined || Math.abs(rel) > 0.5)
        o.side = rel < 0 ? -1 : 1;
      turn -= o.side * push * 1.6;
    }
    return clamp(turn, -1.5, 1.5);
  }
  /** Push `c` out of any prop it overlaps, cancelling only the inward part of this step so it slides along the edge. */
  function pushOutOfObstacles(c, h) {
    const mx = Math.sin(c.bodyYaw) * c.speed * h,
      mz = Math.cos(c.bodyYaw) * c.speed * h;
    for (const o of obstacles) {
      _ob.copy(o.p).sub(c.frame.o);
      const dx = c.pos.x - _ob.dot(c.frame.ex),
        dz = c.pos.z - _ob.dot(c.frame.ez);
      const d = Math.hypot(dx, dz),
        min = o.r + CAT_RADIUS;
      if (d >= min || d < 1e-5) continue;
      const nx = dx / d,
        nz = dz / d;
      const inward = -(mx * nx + mz * nz);
      const out = Math.max(0, inward) + Math.min(min - d, 0.3 * h);
      c.pos.x += nx * out;
      c.pos.z += nz * out;
    }
  }

  function springTo(ch, x, y, z, vx, vy, vz, k, ky, h) {
    const d = 2 * Math.sqrt(k),
      dy = 2 * Math.sqrt(ky);
    ch.v.x += (k * (x - ch.p.x) + d * (vx - ch.v.x)) * h;
    ch.v.y += (ky * (y - ch.p.y) + dy * (vy - ch.v.y)) * h;
    ch.v.z += (k * (z - ch.p.z) + d * (vz - ch.v.z)) * h;
  }

  // critically damped springs let the rump lag on turns without wobbling
  function stepCat(c, h, t, T) {
    const { rump, chest, head } = c,
      P = c.pose;
    if (!c.air) {
      const run = smoothstep(0.35, 0.7, c.speed);
      c.bodyYaw = turnToward(
        c.bodyYaw,
        c.wantHeading + avoidTurn(c),
        lerp(4.5, 2.4, run) * h
      );
      const acc = c.wantSpeed > c.speed ? 2.6 : 4.5;
      c.speed += clamp(c.wantSpeed - c.speed, -acc * h, acc * h);
      const fx = Math.sin(c.bodyYaw),
        fz = Math.cos(c.bodyYaw);
      c.pos.x += fx * c.speed * h;
      c.pos.z += fz * c.speed * h;
      pushOutOfObstacles(c, h);
      const half =
        (S.L1 * T.reach * (1 + 0.12 * Math.sin(c.gait * Math.PI * 2) * run)) /
        2;
      const wig = Math.sin(t * 15) * 0.012 * K * P.wiggle;
      const bob =
        run * 0.016 * K * Math.max(0, Math.sin(c.gait * Math.PI * 2 + 0.6)) -
        (1 - run) *
          smoothstep(0.03, 0.15, c.speed) *
          0.004 *
          K *
          Math.cos(c.gait * Math.PI * 4);
      const vx = fx * c.speed,
        vz = fz * c.speed;
      springTo(
        chest,
        c.pos.x + fx * half,
        T.chest + bob,
        c.pos.z + fz * half,
        vx,
        0,
        vz,
        420,
        360,
        h
      );
      springTo(
        rump,
        c.pos.x - fx * half + fz * wig,
        T.rump + bob * 0.6,
        c.pos.z - fz * half - fx * wig,
        vx,
        0,
        vz,
        180,
        300,
        h
      );
    } else {
      c.airT += h;
      rump.v.y -= GRAV * h;
      chest.v.y -= GRAV * h;
    }
    bodyFrame(c);
    c.lookYaw = Math.atan2(_fwd.x, _fwd.z) + P.headYaw;
    const lx = Math.sin(c.lookYaw),
      lz = Math.cos(c.lookYaw);
    springTo(
      head,
      chest.p.x + lx * T.headF,
      chest.p.y + T.headU - 0.05 * K * P.headPitch - 0.035 * K * P.groom,
      chest.p.z + lz * T.headF,
      chest.v.x,
      chest.v.y,
      chest.v.z,
      300,
      300,
      h
    );

    for (const ch of [rump, chest, head]) {
      ch.prev.copy(ch.p);
      ch.p.addScaledVector(ch.v, h);
    }
    for (let it = 0; it < 2; it++) {
      keepDistance(rump, chest, S.L1 * 0.8, S.L1 * 1.35, 0.5);
      keepDistance(chest, head, 0.05 * K, 0.13 * K, 0.8);
      for (const ch of [rump, chest, head]) if (ch.p.y < ch.r) ch.p.y = ch.r;
    }
    for (const ch of [rump, chest, head])
      ch.v.subVectors(ch.p, ch.prev).divideScalar(h);
    if (
      c.air &&
      c.airT > 0.12 &&
      chest.v.y <= 0 &&
      chest.p.y < T.chest + 0.03 * K
    ) {
      c.air = false;
      c.pos.set((rump.p.x + chest.p.x) / 2, 0, (rump.p.z + chest.p.z) / 2);
      bodyFrame(c);
      c.bodyYaw = Math.atan2(_fwd.x, _fwd.z);
      c.speed = Math.min(Math.hypot(chest.v.x, chest.v.z) * 0.4, 0.4);
    }
  }

  // foot phase offsets, in feet order [front L, front R, hind L, hind R]
  const GAIT = { walk: [0.25, 0.75, 0, 0.5], run: [0.5, 0.6, 0, 0.1] };
  function updateFeet(c, dt, t) {
    const P = c.pose;
    bodyFrame(c);
    const speed = c.air ? 0 : c.speed;
    const run = smoothstep(0.35, 0.7, speed);
    const stride = lerp(0.17, 0.42, run) * (1 + Math.max(0, speed - 0.8) * 0.5);
    const duty = lerp(0.62, 0.38, run);
    const moving = speed > 0.025;
    if (moving) c.gait = (c.gait + (speed / stride) * dt) % 1;
    const lift = lerp(0.034, 0.05, run) * K;
    const tuck = Math.max(P.lie, P.sit);
    let settling = c.feet.some((f) => f.t >= 0);
    c.feet.forEach((f, i) => {
      const base = f.front ? c.chest : c.rump;
      f.anchor
        .copy(base.p)
        .addScaledVector(_fwd, f.front ? 0.005 * K : -0.012 * K)
        .addScaledVector(_side, S.hipW * f.side);
      f.anchor.y -= 0.02 * K;
      f.home.set(f.anchor.x, 0, f.anchor.z);
      if (tuck > 0.4 && !(f.front && P.sit > 0.4)) {
        f.home
          .addScaledVector(_fwd, (f.front ? 0.04 : 0.035) * K * tuck)
          .addScaledVector(_side, -0.012 * K * f.side * tuck);
      }
      if (f.front) f.home.addScaledVector(_fwd, 0.1 * K * P.stretch);
      else f.home.addScaledVector(_fwd, 0.03 * K * P.rear);
      f.bendDown = 0;
      if (c.air) {
        f.t = -1;
        f.swing = false;
        f.p
          .copy(f.anchor)
          .addScaledVector(_fwd, f.front ? 0.085 * K : -0.08 * K);
        f.p.y -= 0.05 * K;
        f.lifted = true;
        return;
      }
      const swat = f.front ? (f.side > 0 ? P.pawL : P.pawR) : 0;
      const groom = f.front && f.side < 0 ? P.groom : 0;
      const rear = f.front ? P.rear : 0;
      f.bendDown = Math.max(swat, groom, rear);
      if (Math.max(f.bendDown, P.flop) > 0.05) {
        _a.copy(f.anchor);
        _a.y = 0;
        if (P.flop > 0.05) {
          _b.copy(f.anchor).addScaledVector(
            _fwd,
            (f.front ? 0.035 : -0.035) * K +
              Math.sin(t * 2.5 + i * 1.7) * 0.01 * K
          );
          _b.y -= 0.075 * K;
          _a.lerp(_b, P.flop);
        }
        if (rear > 0.05) {
          _b.copy(c.chest.p)
            .addScaledVector(_fwd, 0.06 * K)
            .addScaledVector(_side, f.side * 0.032 * K);
          _b.y -= 0.05 * K;
          _a.lerp(_b, rear);
        }
        if (swat > 0.05) {
          _b.copy(c.chest.p)
            .addScaledVector(_fwd, (0.08 + 0.06 * swat) * K)
            .addScaledVector(_side, f.side * 0.02 * K);
          _b.y += (0.01 + 0.06 * swat) * K;
          _a.lerp(_b, Math.min(1, swat * 1.6));
        }
        if (groom > 0.05) {
          _b.copy(c.head.p)
            .addScaledVector(_fwd, 0.035 * K)
            .addScaledVector(_side, f.side * 0.01 * K);
          _b.y -= 0.045 * K;
          _a.lerp(_b, groom);
        }
        f.p.lerp(_a, 1 - Math.exp(-dt * 14));
        f.t = -1;
        f.swing = false;
        f.lifted = true;
        return;
      }
      const settle = (dur) => {
        f.t = 0;
        f.dur = dur;
        f.from.copy(f.p);
        f.from.y = 0;
        f.to.copy(f.home);
        settling = true;
      };
      if (f.lifted) {
        f.lifted = false;
        settle(0.14);
      }
      if (f.t >= 0) {
        f.t += dt / f.dur;
        const u = Math.min(1, f.t);
        f.p.lerpVectors(f.from, f.to, u * u * (3 - 2 * u));
        f.p.y = Math.sin(Math.PI * u) * 0.025 * K;
        if (u >= 1) {
          f.t = -1;
          f.p.y = 0;
        }
        return;
      }
      if (moving) {
        const ph = (c.gait + lerp(GAIT.walk[i], GAIT.run[i], run)) % 1;
        if (ph < duty) {
          if (f.swing) {
            f.swing = false;
            f.p.copy(f.to);
            f.p.y = 0;
          }
        } else {
          const u = (ph - duty) / (1 - duty);
          if (!f.swing) {
            f.swing = true;
            f.from.copy(f.p);
            f.from.y = 0;
          }
          f.to.copy(f.home).addScaledVector(_fwd, stride * duty * 0.5);
          f.p.lerpVectors(f.from, f.to, u * u * (3 - 2 * u));
          f.p.y = Math.sin(Math.PI * Math.pow(u, 0.7)) * lift;
        }
      } else if (f.swing) {
        f.swing = false;
        settle(0.12);
      } else {
        const dx = f.p.x - f.home.x,
          dz = f.p.z - f.home.z;
        if (!settling && dx * dx + dz * dz > (0.022 * K) ** 2) settle(0.13);
        else
          f.p.y =
            !f.front && P.wiggle > 0.3
              ? Math.max(0, Math.sin(t * 16 + (f.side > 0 ? 0 : Math.PI))) *
                0.012 *
                K *
                P.wiggle
              : 0;
      }
    });
  }

  const TAIL_SEGS = TAIL_N - 1;
  const _relP = new Float32Array(TAIL_SEGS),
    _relY = new Float32Array(TAIL_SEGS);
  function tailShape(c, t) {
    const P = c.pose,
      rest = Math.min(1, P.sit + P.lie + P.flop);
    const run = smoothstep(0.35, 0.7, c.speed);
    const k1 = Math.min(1, P.tailUp * 2),
      k2 = Math.max(0, P.tailUp * 2 - 1);
    let root = lerp(lerp(-0.2, -0.65, k1), 0.75, k2);
    let seg = lerp(lerp(0, 0.11, k1), 0.085, k2);
    let tip = lerp(lerp(0, 0.12, k1), 0.35, k2);
    root = lerp(root, -0.05, run * (1 - k2));
    seg = lerp(seg, 0.045, run);
    root = lerp(root, P.sit > P.lie ? -1.2 : -0.45, rest);
    seg = lerp(seg, 0.03, rest);
    tip = lerp(tip, 0.1, rest);
    const curl = c.tailSide * 0.3 * rest;
    const lash = smoothstep(0.4, 0.8, P.earsBack) * (1 - rest);
    const amp = lerp(0.07, 0.03, run) + 0.12 * lash;
    const freq = (lerp(1.6, 4.5, lash) * c.tailFreq) / 1.9;
    const stepping = smoothstep(0.02, 0.15, c.speed);
    for (let i = 0; i < TAIL_SEGS; i++) {
      const s = i / (TAIL_SEGS - 1);
      _relP[i] = i === 0 ? root : seg + tip * smoothstep(0.7, 1, s);
      _relY[i] =
        curl + amp * Math.sin(t * freq - i * 0.55) * (i === 0 ? 0.5 : 1);
      if (s > 0.7) _relY[i] += Math.sin(t * 13 + c.seed) * 0.35 * P.wiggle;
      _relP[i] +=
        Math.sin(c.gait * Math.PI * 2 * (run > 0.5 ? 1 : 2) - i * 0.5) *
        lerp(0.04, 0.1, run) *
        stepping *
        s;
    }
  }
  function updateTail(c, dt, t) {
    const T = c.tail;
    bodyFrame(c);
    tailShape(c, t);
    const baseYaw = Math.atan2(-_fwd.x, -_fwd.z);
    const basePitch = -Math.atan2(
      c.chest.p.y - c.rump.p.y,
      Math.hypot(c.chest.p.x - c.rump.p.x, c.chest.p.z - c.rump.p.z)
    );
    windVec(c.frame.o, t, _r2);
    _wind.set(_r2.dot(c.frame.ex), _r2.dot(c.frame.up), _r2.dot(c.frame.ez));
    const lift = (c.rump.v.y - (c.tailLastVy ?? c.rump.v.y)) / dt;
    const surge = (c.speed - (c.tailLastSpeed ?? c.speed)) / dt;
    c.tailLastVy = c.rump.v.y;
    c.tailLastSpeed = c.speed;
    const h = dt / 2;
    for (let sub = 0; sub < 2; sub++) {
      for (let i = 0; i < TAIL_SEGS; i++) {
        const s = i / (TAIL_SEGS - 1);
        const py = i === 0 ? baseYaw : T.yaw[i - 1],
          pp = i === 0 ? basePitch : T.pitch[i - 1];
        const k = lerp(260, 70, s),
          d = 2 * Math.sqrt(k) * 0.75;
        const windTorque =
          (_wind.x * Math.cos(T.yaw[i]) - _wind.z * Math.sin(T.yaw[i])) * 6 * s;
        T.vy[i] +=
          (k * wrap(py + _relY[i] - T.yaw[i]) - d * T.vy[i] + windTorque) * h;
        T.vp[i] +=
          (k * (pp + _relP[i] - T.pitch[i]) -
            d * T.vp[i] -
            1.5 * Math.cos(T.pitch[i]) * s -
            clamp(lift, -20, 20) * 0.35 * Math.cos(T.pitch[i]) * s -
            clamp(surge, -6, 6) * 0.25 * Math.sin(T.pitch[i]) * s) *
          h;
        T.yaw[i] += T.vy[i] * h;
        T.pitch[i] = clamp(T.pitch[i] + T.vp[i] * h, -1.5, 2.6);
      }
    }
    const pts = T.pts;
    pts[0].copy(c.rump.p).addScaledVector(_fwd, -0.035 * K);
    pts[0].y += 0.02 * K;
    for (let i = 0; i < TAIL_SEGS; i++) {
      const r = tailRadius(i + 1);
      if (pts[i].y + Math.sin(T.pitch[i]) * TAIL_SEG < r) {
        T.pitch[i] = Math.asin(clamp((r - pts[i].y) / TAIL_SEG, -1, 1));
        T.vp[i] = Math.max(T.vp[i], 0);
      }
      const cp = Math.cos(T.pitch[i]) * TAIL_SEG;
      pts[i + 1].set(
        pts[i].x + Math.sin(T.yaw[i]) * cp,
        pts[i].y + Math.sin(T.pitch[i]) * TAIL_SEG,
        pts[i].z + Math.cos(T.yaw[i]) * cp
      );
    }
  }
  const tailRadius = (i) =>
    lerp(0.022 * K, 0.016 * K, i / (TAIL_N - 1)) +
    0.008 * K * Math.max(0, 1 - i / 2);

  function legIK(hip, foot, hint, knee) {
    _a.subVectors(foot, hip);
    let d = _a.length();
    const L = (S.upper + S.lower) * 0.999;
    if (d > L) {
      _a.multiplyScalar(L / d);
      foot.copy(hip).add(_a);
      d = L;
    }
    _a.divideScalar(d || 1e-6);
    const a = (S.upper * S.upper - S.lower * S.lower + d * d) / (2 * d);
    const hh = Math.sqrt(Math.max(0, S.upper * S.upper - a * a));
    _b.copy(hint).addScaledVector(_a, -hint.dot(_a)).normalize();
    knee.copy(hip).addScaledVector(_a, a).addScaledVector(_b, hh);
  }

  function renderCat(c, dt, t) {
    const P = c.pose,
      m = c.m;
    bodyFrame(c);
    c.heading = Math.atan2(_fwd.x, _fwd.z);
    const F = c.frame;
    c.group.position.copy(F.o);
    c.group.quaternion.setFromRotationMatrix(
      _frameM.makeBasis(F.ex, F.up, F.ez)
    );
    const L = (p, out) => out.copy(p);
    // flopping rolls the whole drawing around the spine, pivoting where the body touches the ground
    _rollQ.setFromAxisAngle(_fwd, P.flop * c.flopSide * 1.35);
    _r1.addVectors(c.rump.p, c.chest.p).multiplyScalar(0.5);
    _r1.y = S.rumpR;
    m.roll.quaternion.copy(_rollQ);
    m.roll.position.copy(_r1).sub(_r2.copy(_r1).applyQuaternion(_rollQ));

    L(c.rump.p, m.rump.position);
    L(c.chest.p, m.chest.position);
    const archV =
      (P.arch * 0.035 +
        Math.sin(c.gait * Math.PI * 2) *
          smoothstep(0.35, 0.7, c.speed) *
          0.012 -
        P.crouch * 0.008) *
      K;
    L(c.rump.p, _r1);
    L(c.chest.p, _r2);
    m.mid.position.addVectors(_r1, _r2).multiplyScalar(0.5);
    m.mid.position.y += archV;
    setSpan(m.body1, _r1, m.mid.position);
    setSpan(m.body2, m.mid.position, _r2);
    L(c.head.p, _r3);
    setSpan(m.neck, _r2, _r3);
    m.head.position.copy(_r3);
    m.head.rotation.set(
      0.35 * P.headPitch + 0.3 * P.groom,
      c.lookYaw,
      P.tilt,
      "YXZ"
    );

    c.earTwitch = Math.max(0, c.earTwitch - dt * 3);
    if (Math.random() < dt * 0.35) c.earTwitch = 1;
    for (const e of m.ears) {
      e.g.rotation.set(
        -0.6 * P.earsBack -
          (e.side > 0 ? 0.35 * c.earTwitch * Math.sin(t * 28) : 0),
        0,
        -e.side * (0.35 + 0.5 * P.earsBack)
      );
    }

    c.feet.forEach((f, i) => {
      const leg = m.legs[i];
      L(f.anchor, _hip);
      L(f.p, _foot);
      _foot.y += S.footR;
      // bend perpendicular to the leg within the body's side plane, so the knee can never flip sides
      _hint
        .crossVectors(_side, _r2.subVectors(_foot, _hip).normalize())
        .lerp(_r3.set(0, -1, 0), f.bendDown);
      legIK(_hip, _foot, _hint, _knee);
      // never let the joint poke out ahead of the shoulder or hip
      const ahead = _r2.subVectors(_knee, _hip).dot(_fwd) - 0.01 * K;
      if (ahead > 0) _knee.addScaledVector(_fwd, -ahead);
      const r0 = f.front ? S.legR : S.legR * 1.35;
      fillLeg(leg.tube, _hip, _knee, _foot, r0, S.footR * 1.05);
      leg.foot.position.copy(_foot);
      leg.hip.position.copy(_hip);
      leg.hip.scale.setScalar(r0);
      if (c.skeleton) {
        leg.hipAt = (leg.hipAt ?? new THREE.Vector3()).copy(_hip);
        leg.kneeAt = (leg.kneeAt ?? new THREE.Vector3()).copy(_knee);
        leg.footAt = (leg.footAt ?? new THREE.Vector3()).copy(_foot);
      }
    });

    const pos = m.tail.geometry.attributes.position,
      q = c.tail.pts;
    _r3.set(1, 0, 0);
    for (let i = 0; i < TAIL_N; i++) {
      L(q[i], _r1);
      _r2
        .subVectors(q[Math.min(i + 1, TAIL_N - 1)], q[Math.max(i - 1, 0)])
        .normalize();
      _r3.addScaledVector(_r2, -_r3.dot(_r2));
      if (_r3.lengthSq() < 1e-8) _r3.set(0, 1, 0).addScaledVector(_r2, -_r2.y);
      _r3.normalize();
      _b.crossVectors(_r2, _r3);
      const r = tailRadius(i);
      for (let k = 0; k < TAIL_RING; k++) {
        const ang = (k / TAIL_RING) * Math.PI * 2,
          ca = Math.cos(ang) * r,
          sa = Math.sin(ang) * r;
        pos.setXYZ(
          i * TAIL_RING + k,
          _r1.x + _r3.x * ca + _b.x * sa,
          _r1.y + _r3.y * ca + _b.y * sa,
          _r1.z + _r3.z * ca + _b.z * sa
        );
      }
    }
    pos.setXYZ(
      TAIL_N * TAIL_RING,
      _r1.x + _r2.x * 0.016 * K,
      _r1.y + _r2.y * 0.016 * K,
      _r1.z + _r2.z * 0.016 * K
    );
    pos.needsUpdate = true;
    if (c.skeleton) updateSkeleton(c);

    c.blinkIn -= dt;
    if (c.blinkIn < 0) {
      c.blink = 0.18;
      c.blinkIn = rand(2, 6);
    }
    c.blink = Math.max(0, c.blink - dt);
    c.dartIn -= dt;
    if (c.dartIn < 0) {
      c.dart.x = rand(-0.6, 0.6);
      c.dart.y = rand(-0.4, 0.4);
      c.dartIn = rand(1.2, 3);
    }
    const focus = Math.max(P.crouch, P.wiggle, 0.5 * (P.pawL + P.pawR));
    const sleepy = Math.max(P.slowBlink, 0.8 * P.groom);
    let len = 1,
      thick = 1,
      rot = 0,
      dy = 0;
    len = lerp(len, 0.75, focus);
    thick = lerp(thick, 1.15, focus);
    rot = lerp(rot, 0.28, focus);
    len = lerp(len, 0.58, P.happy);
    thick = lerp(thick, 1.1, P.happy);
    rot = lerp(rot, -0.22, P.happy);
    dy = lerp(dy, 0.003, P.happy);
    len = lerp(len, 0.95, sleepy);
    thick = lerp(thick, 0.55, sleepy);
    rot = lerp(rot, Math.PI / 2, sleepy);
    dy = lerp(dy, -0.004, sleepy);
    len = lerp(len, 1.25, P.surprise);
    thick = lerp(thick, 1.35, P.surprise);
    rot = lerp(rot, 0, P.surprise);
    dy = lerp(dy, 0.002, P.surprise);
    const blink = c.blink > 0 ? Math.sin((c.blink / 0.18) * Math.PI) : 0;
    len = lerp(len, 0.12, blink);
    const gaze = clamp(wrap(c.gazeAngle - c.lookYaw), -0.8, 0.8) / 0.8;
    const dx = (gaze * 0.7 + c.dart.x * 0.3) * 0.009 * K;
    dy = dy * K + c.dart.y * 0.003 * K * (1 - sleepy) - 0.004 * K * P.headPitch;
    const e = c.eye,
      kq = 1 - Math.exp(-dt * (blink > 0 ? 40 : 14));
    e.len += (len - e.len) * kq;
    e.thick += (thick - e.thick) * kq;
    e.rot += (rot - e.rot) * kq;
    e.dx += (dx - e.dx) * (1 - Math.exp(-dt * 22));
    e.dy += (dy - e.dy) * (1 - Math.exp(-dt * 22));
    for (const eye of m.eyes) {
      const u = eye.userData;
      const w = 0.015 * K * e.thick,
        l = Math.max(0.042 * K * e.len, w);
      const { body, top, bottom } = u.parts;
      body.scale.set(w, Math.max(l - w, 1e-5), 1);
      top.scale.setScalar(w / 2);
      bottom.scale.setScalar(w / 2);
      top.position.y = (l - w) / 2;
      bottom.position.y = -(l - w) / 2;
      const x = u.x + e.dx,
        y = u.y + e.dy;
      const [ha, hb, hc] = S.head;
      const z =
        hc * Math.sqrt(Math.max(0.05, 1 - (x / ha) ** 2 - (y / hb) ** 2)) +
        0.002 * K;
      eye.position.set(x, y, z);
      _eyeN.set(x / (ha * ha), y / (hb * hb), z / (hc * hc)).normalize();
      eye.quaternion
        .setFromUnitVectors(ZAXIS, _eyeN)
        .multiply(tmpQ.setFromAxisAngle(ZAXIS, u.side * e.rot));
    }
  }

  function poseCat(c, dt, t) {
    if (dt < 1e-4) return;
    for (const k in c.pose)
      c.pose[k] +=
        (c.target[k] - c.pose[k]) * (1 - Math.exp(-dt * (RATES[k] ?? 6)));
    const T = postureTargets(c);
    const h = dt / 2;
    stepCat(c, h, t, T);
    stepCat(c, h, t, T);
    updateFeet(c, dt, t);
    updateTail(c, dt, t);
    recenter(c);
    renderCat(c, dt, t);
    recordTrail(c, cats.indexOf(c), t);
  }

  let trailHead = TRAIL_LIVE;
  const _tw = new THREE.Vector3();
  function recordTrail(c, ci, t) {
    for (const [k, ch] of [
      [0, c.chest],
      [1, c.rump],
    ]) {
      toWorld(c, ch.p, _tw).setLength(R);
      trail[ci * 2 + k].set(_tw.x, _tw.y, _tw.z, c.air ? -1000 : t);
    }
    if (c.air || c.speed < 0.15) return;
    toWorld(c, c.pos, _tw);
    c.lastTrail ??= new THREE.Vector3(1e9, 0, 0);
    if (c.lastTrail.distanceTo(_tw) < 0.12) return;
    c.lastTrail.copy(_tw);
    trail[trailHead].set(_tw.x, _tw.y, _tw.z, t);
    trailHead = trailHead + 1 >= TRAIL_N ? TRAIL_LIVE : trailHead + 1;
  }

  const _wa = new THREE.Vector3(),
    _wb = new THREE.Vector3(),
    _wd = new THREE.Vector3();
  function catContacts() {
    const [a, b] = cats;
    if (a.air || b.air) return;
    for (const ca of [a.rump, a.chest, a.head]) {
      toWorld(a, ca.p, _wa);
      for (const cb of [b.rump, b.chest, b.head]) {
        toWorld(b, cb.p, _wb);
        _wd.subVectors(_wb, _wa);
        const d = _wd.length(),
          min = ca.r + cb.r;
        if (d < min && d > 1e-5) {
          _wd.multiplyScalar(((min - d) / d) * 0.5);
          a.pos.x -= _wd.dot(a.frame.ex);
          a.pos.z -= _wd.dot(a.frame.ez);
          b.pos.x += _wd.dot(b.frame.ex);
          b.pos.z += _wd.dot(b.frame.ez);
        }
      }
    }
  }
  function centerWorld(c, out) {
    _a.addVectors(c.rump.p, c.chest.p).multiplyScalar(0.5);
    return toWorld(c, _a, out);
  }
  function angleTo(c, w) {
    _b.copy(w).sub(c.frame.o);
    return Math.atan2(_b.dot(c.frame.ex), _b.dot(c.frame.ez));
  }

  function launch(c, dx, dz, horiz, up) {
    for (const ch of [c.rump, c.chest, c.head])
      ch.v.set(dx * horiz, up, dz * horiz);
    c.chest.v.y += 0.35;
    c.air = true;
    c.airT = 0;
    c.speed = 0;
  }

  const play = {
    mode: "greet",
    t: 0,
    dur: 1.8,
    runner: 0,
    att: undefined,
    def: undefined,
    loser: undefined,
    restKind: "loaf",
  };
  const INVITE_DUR = { bow: 1.3, flop: 2.8, crab: 2.4 };
  const _rubF = new THREE.Vector3(),
    _rubS = new THREE.Vector3();
  function setMode(mode, dur) {
    play.mode = mode;
    play.t = 0;
    play.dur = dur;
    play.tagAt = 0;
  }
  function startChase(runner) {
    play.runner = cats.indexOf(runner);
    runner.burst = rand(1.05, 1.3);
    runner.burstT = rand(1.2, 2);
    runner.wanderH = runner.gazeAngle + Math.PI;
    setMode("chase", rand(9, 15));
  }
  function startPounce(att, def, dist) {
    const flight = 0.45;
    launch(
      att,
      Math.sin(att.gazeAngle),
      Math.cos(att.gazeAngle),
      clamp(dist - 0.35, 0.12, 0.8) / flight,
      (GRAV * flight) / 2
    );
    const a = def.gazeAngle + Math.PI + (Math.random() < 0.5 ? -0.9 : 0.9);
    launch(def, Math.sin(a), Math.cos(a), 0.5, 1.0);
    play.att = att;
    play.def = def;
    setMode("pounce", 1.5);
  }
  function direct(dt, t) {
    play.t += dt;
    const first = play.t <= dt + 1e-9;
    const A = cats[play.runner],
      B = cats[1 - play.runner];
    centerWorld(A, _wa);
    centerWorld(B, _wb);
    const dist = _wa.distanceTo(_wb);
    A.gazeAngle = angleTo(A, _wb);
    B.gazeAngle = angleTo(B, _wa);
    for (const c of cats) {
      Object.assign(c.target, c.neutral);
      c.target.headYaw = clamp(wrap(c.gazeAngle - c.heading), -1, 1);
      c.wantSpeed = 0;
    }
    const face = (c) => {
      c.wantHeading = c.gazeAngle;
    };
    switch (play.mode) {
      case "greet": {
        face(A);
        face(B);
        A.wantSpeed = B.wantSpeed = dist > 1.6 ? 0.6 : dist > 0.6 ? 0.22 : 0;
        A.target.tailUp = B.target.tailUp = 0.9;
        if (dist < 0.75)
          for (const c of [A, B]) {
            c.target.headPitch = 0.4;
            c.target.happy = 0.6;
          }
        A.target.tilt = 0.2;
        if (dist > 0.66) play.t = Math.min(play.t, 0.01);
        if (play.t > play.dur) {
          if (Math.random() < 0.35) setMode("rub", 4);
          else {
            const next = pick(["bow", "bow", "crab", "flop"]);
            setMode(next, INVITE_DUR[next]);
          }
        }
        break;
      }
      case "rub": {
        if (first) {
          const F = A.frame;
          _rubF
            .set(0, 0, 0)
            .addScaledVector(F.ex, Math.sin(A.bodyYaw))
            .addScaledVector(F.ez, Math.cos(A.bodyYaw));
          _rubS.crossVectors(F.up, _rubF);
          if (_rubS.dot(_b.subVectors(_wb, _wa)) < 0) _rubS.negate();
          play.rubPath = [
            _wa
              .clone()
              .addScaledVector(_rubS, 0.19)
              .addScaledVector(_rubF, 0.22),
            _wa
              .clone()
              .addScaledVector(_rubS, 0.17)
              .addScaledVector(_rubF, -0.55),
          ];
        }
        let toEnd = centerWorld(B, _wd).distanceTo(play.rubPath[0]);
        if (toEnd < 0.1 && play.rubPath.length > 1) {
          play.rubPath.shift();
          toEnd = _wd.distanceTo(play.rubPath[0]);
        }
        B.wantHeading = angleTo(B, play.rubPath[0]);
        B.wantSpeed = toEnd > 0.08 ? 0.18 : 0;
        B.target.tailUp = 1;
        B.target.happy = 1;
        B.target.headYaw = 0;
        A.target.tailUp = 1;
        A.target.happy = 1;
        A.target.tilt = 0.25;
        if ((play.rubPath.length === 1 && toEnd <= 0.08) || play.t > play.dur) {
          const next = pick(["bow", "flop", "crab"]);
          setMode(next, INVITE_DUR[next]);
        }
        break;
      }
      case "bow": {
        face(A);
        face(B);
        B.target.bow = 1;
        B.target.tailUp = 0.85;
        B.target.happy = 0.8;
        B.target.wiggle = 0.25;
        A.target.crouch = 0.25;
        A.target.tilt = 0.3;
        if (play.t > play.dur) startChase(B);
        break;
      }
      case "flop": {
        if (first) A.flopSide = Math.random() < 0.5 ? -1 : 1;
        face(B);
        A.target.flop = play.t > 0.3 ? 1 : 0;
        A.target.happy = 1;
        A.target.tailUp = 0.3;
        A.target.headYaw = 0;
        B.wantSpeed = dist > 0.5 ? 0.2 : 0;
        B.target.tilt = 0.35;
        B.target.tailUp = 0.7;
        if (play.t > 1.4 && dist < 0.6)
          B.target.pawR = Math.sin(play.t * 5) > 0.5 ? 0.55 : 0;
        if (play.t > play.dur) startChase(A);
        break;
      }
      case "crab": {
        if (first) A.crabSide = Math.random() < 0.5 ? -1 : 1;
        face(A);
        A.target.arch = 1;
        A.target.tailUp = 1;
        A.target.earsBack = 0.3;
        A.target.surprise = 0.4;
        face(B);
        B.target.crouch = 0.5;
        B.target.tailUp = 0.3;
        B.target.wiggle = play.t > play.dur - 0.8 ? 1 : 0;
        A.hopIn = (A.hopIn ?? 0) - dt;
        if (A.hopIn <= 0 && !A.air && play.t > 0.4) {
          const a = A.gazeAngle + (A.crabSide * Math.PI) / 2;
          launch(A, Math.sin(a), Math.cos(a), 0.5, 1.0);
          A.hopIn = 0.42;
        }
        if (play.t > play.dur) setMode("stalk", 0.8);
        break;
      }
      case "chase": {
        A.burstT -= dt;
        if (A.burstT <= 0) {
          const r = Math.random();
          if (r < 0.75) {
            A.burst = rand(1.0, 1.35);
            A.burstT = rand(1.2, 2.6);
          } else if (r < 0.92) {
            A.burst = 0.35;
            A.burstT = rand(0.4, 0.8);
          } else {
            A.burst = 0;
            A.burstT = rand(0.4, 0.7);
          }
        }
        A.wanderH += Math.sin(t * 0.8 + A.seed) * 1.3 * dt;
        if (dist < 0.9)
          A.wanderH = turnToward(A.wanderH, A.gazeAngle + Math.PI, dt * 3);
        A.wantHeading = A.burst === 0 ? A.gazeAngle : A.wanderH;
        A.wantSpeed = A.burst;
        A.target.tailUp = A.burst > 0.5 ? 0.45 : 0.6;
        A.target.happy = 0.7;
        const waiting = A.burst === 0 && dist < 1.1;
        face(B);
        B.wantSpeed = waiting ? 0 : clamp((dist - 0.45) * 2.2, 0, 1.3);
        B.target.tailUp = 0.5;
        if (waiting) B.target.crouch = 0.5;
        if (dist < 0.5 && A.burst > 0.5 && play.t - (play.tagAt ?? 0) > 1.5) {
          play.tagAt = play.t;
          play.runner = 1 - play.runner;
          B.burst = rand(1.05, 1.3);
          B.burstT = rand(1, 1.8);
          B.wanderH = B.gazeAngle + Math.PI;
          break;
        }
        if ((play.t > play.dur && waiting) || play.t > play.dur + 6) {
          if (Math.random() < 0.4) setMode("ambush", 4);
          else setMode("stalk", 1.6);
        }
        break;
      }
      case "ambush": {
        face(A);
        A.target.crouch = 1;
        A.target.tailUp = 0;
        A.target.earsBack = 0.3;
        A.target.wiggle = dist < 0.9 ? 1 : 0;
        B.wantHeading = B.gazeAngle + Math.sin(t * 1.3) * 0.7;
        B.wantSpeed = 0.22;
        B.target.headYaw = Math.sin(t * 1.7) * 0.9;
        B.target.tailUp = 0.6;
        if (dist < 0.65 || play.t > play.dur) startPounce(A, B, dist);
        break;
      }
      case "stalk": {
        face(B);
        B.wantSpeed = dist > 0.85 ? 0.12 : 0;
        face(A);
        B.target.crouch = 1;
        B.target.wiggle = play.t > 0.8 ? 1 : 0;
        B.target.tailUp = 0;
        B.target.earsBack = 0.2;
        A.target.crouch = 0.3;
        A.target.tilt = 0.25;
        if (play.t > play.dur) startPounce(B, A, dist);
        break;
      }
      case "pounce": {
        const { att, def } = play;
        att.target.tailUp = 0.5;
        att.target.earsBack = 0.5;
        def.target.tailUp = 1;
        def.target.earsBack = 0.6;
        def.target.surprise = play.t < 0.7 ? 1 : 0;
        face(A);
        face(B);
        if ((play.t > 0.4 && !A.air && !B.air) || play.t > play.dur)
          setMode("wrestle", rand(1.6, 2.6));
        break;
      }
      case "wrestle": {
        for (const c of [A, B]) {
          face(c);
          c.wantSpeed = dist > 0.5 ? 0.2 : 0;
          c.target.rear = 1;
          c.target.earsBack = 0.8;
          c.target.tailUp = 0.45;
          const sw = Math.sin(play.t * 7 + (c === A ? 0 : 2.1));
          c.target.pawL = sw > 0.35 ? sw : 0;
          c.target.pawR = sw < -0.35 ? -sw : 0;
        }
        if (play.t > play.dur) {
          const r = Math.random();
          if (r < 0.25) {
            play.loser = pick([A, B]);
            setMode("tumble", 1.6);
          } else if (r < 0.85) startChase(pick([A, B]));
          else setMode("rest", rand(4, 6));
        }
        break;
      }
      case "tumble": {
        const L = play.loser,
          W = L === A ? B : A;
        if (first) L.flopSide = Math.random() < 0.5 ? -1 : 1;
        L.target.flop = 1;
        L.target.surprise = play.t < 0.4 ? 1 : 0;
        L.target.tailUp = 0.3;
        L.target.headYaw = 0;
        face(W);
        W.target.sit = 0.5;
        W.target.tailUp = 0.8;
        W.target.earsBack = 0.3;
        if (play.t > play.dur) startChase(L);
        break;
      }
      case "rest": {
        if (first) play.restKind = pick(["loaf", "allogroom", "groom"]);
        A.target.lie = 1;
        A.target.slowBlink = 1;
        A.target.tailUp = 0.2;
        A.target.happy = 0.4;
        if (play.restKind === "allogroom") {
          face(B);
          B.wantSpeed = dist > 0.48 ? 0.18 : 0;
          if (dist < 0.55) {
            B.target.sit = 1;
            B.target.headPitch = 0.45 + Math.sin(t * 7) * 0.12;
            B.target.happy = 0.6;
            B.target.slowBlink = 0.5;
            A.target.tilt = 0.4;
          }
        } else {
          A.target.headYaw = Math.sin(t * 0.5) * 0.4;
          if (play.restKind === "loaf") {
            B.target.lie = 1;
            B.target.slowBlink = 0.8;
            B.target.tailUp = 0.2;
          } else {
            B.target.sit = 1;
            B.target.tailUp = 0.2;
            B.target.happy = 0.6;
            B.target.groom = play.t > 0.8 ? 1 : 0;
            B.target.headPitch = Math.sin(t * 9) * 0.15 * B.pose.groom;
          }
        }
        if (play.t > play.dur) setMode("stretch", 2.2);
        break;
      }
      case "stretch": {
        A.target.stretch = play.t < 1.4 ? 1 : 0;
        B.target.stretch = play.t > 0.6 && play.t < 2.0 ? 1 : 0;
        for (const c of [A, B]) {
          c.target.tailUp = 0.9;
          c.target.slowBlink = 0.8 * c.target.stretch;
        }
        if (play.t > play.dur) {
          play.runner = 1 - play.runner;
          setMode("greet", 1.2);
        }
        break;
      }
    }
    catContacts();
  }

  const _wl = new THREE.Vector3(),
    _axis = new THREE.Vector3();
  function updateProps(dt, t) {
    for (const tree of trees) {
      windVec(tree.position, t, _wl).applyQuaternion(tree.userData.baseQuatInv);
      const mag = _wl.length();
      _axis.set(_wl.z, 0, -_wl.x).normalize();
      const angle =
        mag * 0.1 + Math.sin(t * 3.2 + tree.userData.phase) * 0.03 * mag;
      tree.quaternion
        .copy(tree.userData.baseQuat)
        .multiply(tmpQ.setFromAxisAngle(_axis, angle));
      tree.userData.blobs.forEach((b, i) => {
        const k = Math.sin(t * 6 + i * 1.7 + tree.userData.phase) * 0.025 * mag;
        b.position.copy(b.userData.base).addScaledVector(_wl, k * 4);
        b.rotation.z = k;
      });
    }

    {
      const ud = windmill.userData;
      windVec(windmill.position, t, _wl).applyQuaternion(
        windmill.userData.baseQuatInv
      );
      const g = _wl.length();
      const want = Math.atan2(-_wl.x, -_wl.z);
      ud.head.rotation.y = turnToward(ud.head.rotation.y, want, dt * 0.8);
      ud.spin += g * dt * 7;
      ud.rotor.rotation.z = ud.spin;
    }

    {
      const ud = flag.userData;
      windVec(flag.position, t, _wl).applyQuaternion(flag.userData.baseQuatInv);
      const g = _wl.length();
      ud.yaw = turnToward(ud.yaw, Math.atan2(-_wl.z, _wl.x), dt * 3);
      ud.swivel.rotation.y = ud.yaw;
      const p = ud.cloth.geometry.attributes.position,
        base = ud.base;
      const limp = 1 - Math.min(1, g * 1.4);
      for (let i = 0; i < p.count; i++) {
        const x0 = base[i * 3],
          y0 = base[i * 3 + 1];
        const u = x0 / 0.42;
        const wave = Math.sin(u * 9 - t * (6 + 7 * g) + y0 * 4);
        const x = x0 * (1 - 0.35 * limp) - Math.abs(wave) * 0.01 * u;
        const y = y0 - limp * u * 0.2 + Math.sin(u * 5 - t * 4) * 0.01 * u;
        p.setXYZ(i, x, y, wave * 0.05 * u * (0.4 + g));
      }
      p.needsUpdate = true;
      ud.cloth.geometry.computeVertexNormals();
    }

    for (const c of clouds) {
      c.position.x += dt * c.userData.speed * (0.3 + windStrength * 0.5);
      if (c.position.x > 30) c.position.x = -30;
    }
  }

  const post = new THREE.ShaderMaterial({
    uniforms: { tScene: { value: null }, uRes: { value: new THREE.Vector2() } },
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene; uniform vec2 uRes;
      varying vec2 vUv;
      float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return v; }
      float fbm2(vec2 p) { return 0.65 * vnoise(p) + 0.35 * vnoise(p * 2.1 + 5.3); }
      float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
      vec4 S(vec2 uv) { vec4 c = texture2D(tScene, uv); return vec4(pow(max(c.rgb, 0.0), vec3(1.0 / 2.2)), c.a); }
      void main() {
        vec2 asp = vec2(uRes.x / uRes.y, 1.0);
        vec2 p = vUv * asp;
        vec2 px = 1.0 / uRes;
        vec2 wob = vec2(fbm(p * 6.0), fbm(p * 6.0 + 9.3)) - 0.5;
        vec2 uv = vUv + wob * 0.007;
        vec4 c0 = S(uv);
        vec2 o = px * 2.0;
        vec4 n1 = S(uv + vec2(o.x, 0.0)), n2 = S(uv - vec2(o.x, 0.0));
        vec4 n3 = S(uv + vec2(0.0, o.y)), n4 = S(uv - vec2(0.0, o.y));
        vec4 blur = (n1 + n2 + n3 + n4) * 0.25;
        vec4 c = mix(c0, blur, 0.45);

        float gx = lum(n1.rgb) * n1.a - lum(n2.rgb) * n2.a;
        float gy = lum(n3.rgb) * n3.a - lum(n4.rgb) * n4.a;
        float edge = length(vec2(gx, gy)) * 1.6 + length(vec2(n1.a - n2.a, n3.a - n4.a)) * 0.6;
        edge = smoothstep(0.04, 0.5, edge);

        vec3 col = c.rgb;
        float pool = clamp((lum(blur.rgb) - lum(c0.rgb)) * 2.5, -0.2, 0.4);
        col *= 1.0 - pool * 0.35;
        col *= 1.0 - edge * 0.3;
        col = mix(col, col * col * 1.15, edge * 0.25);
        col *= 0.93 + 0.14 * fbm(p * 2.5 + 3.0);
        col *= 1.0 - (fbm2(gl_FragCoord.xy * 0.35) - 0.5) * 0.2 * (1.0 - lum(col));

        vec3 skyTop = vec3(0.80, 0.86, 0.90), skyBot = vec3(0.98, 0.90, 0.78);
        vec3 sky = mix(skyBot, skyTop, smoothstep(0.35, 1.0, vUv.y + (fbm(p * 1.6) - 0.5) * 0.35));
        sky = mix(sky, vec3(0.99, 0.84, 0.70), smoothstep(0.55, 0.8, fbm(p * 2.2 + 5.0)) * 0.35);
        col = mix(sky, col, c.a);

        vec3 paper = vec3(0.985, 0.955, 0.905);
        col = mix(col, paper, 0.07);
        float fiber = fbm2(gl_FragCoord.xy * vec2(0.06, 0.4));
        col *= 0.955 + 0.05 * fiber + 0.03 * (hash(floor(gl_FragCoord.xy)) - 0.5);
        vec2 q = vUv - 0.5;
        col *= 1.0 - dot(q, q) * 0.35;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const postScene = new THREE.Scene();
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
  let rt;
  function resize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    rt?.dispose();
    rt = new THREE.WebGLRenderTarget(size.x, size.y, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    post.uniforms.tScene.value = rt.texture;
    post.uniforms.uRes.value.copy(size);
    // redraw right away so a resized canvas never shows a blank frame
    if (hasDrawn) drawFrame();
  }
  let hasDrawn = false;
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const camTarget = new THREE.Vector3(0, 5.75, 0.9);
  const camOffset = new THREE.Vector3(0, 8.0, 9.6).sub(camTarget);
  let zoom = 1.2,
    zoomTarget = 1.2;
  const _camT = new THREE.Vector3();
  function placeCamera() {
    const f = smoothstep(1.3, 3.2, zoom);
    const target = _camT.copy(camTarget).multiplyScalar(1 - f);
    camera.position.copy(target).addScaledVector(camOffset, zoom);
    camera.lookAt(target);
  }
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  if (!GAIT_MODE) {
    canvas.tabIndex = 0;
    Object.assign(canvas.style, {
      touchAction: "pan-y",
      cursor: "grab",
      outline: "none",
    });
  }
  const spin = { dragging: false, x: 0, y: 0 };
  const K_DRAG = 0.005;
  const _qa = new THREE.Quaternion(),
    _camUp = new THREE.Vector3(),
    _camRight = new THREE.Vector3();
  function rotatePlanet(ax, ay) {
    _camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    _camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    planet.quaternion
      .premultiply(_qa.setFromAxisAngle(_camUp, ax))
      .premultiply(_qa.setFromAxisAngle(_camRight, ay))
      .normalize();
  }
  const pointers = new Map();
  const pinch = { startDist: 0, startZoom: 1 };
  const pointerSpread = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (GAIT_MODE) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      spin.dragging = false;
      pinch.startDist = pointerSpread();
      pinch.startZoom = zoomTarget;
      return;
    }
    spin.dragging = true;
    spin.x = e.clientX;
    spin.y = e.clientY;
    canvas.style.cursor = "grabbing";
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2) {
      if (takesAllInput() && pinch.startDist > 0) {
        zoomTarget = clamp(
          (pinch.startZoom * pinch.startDist) / Math.max(pointerSpread(), 1),
          0.9,
          3.6
        );
      }
      return;
    }
    if (!spin.dragging) return;
    rotatePlanet((e.clientX - spin.x) * K_DRAG, (e.clientY - spin.y) * K_DRAG);
    spin.x = e.clientX;
    spin.y = e.clientY;
  });
  function endDrag(e) {
    pointers.delete(e.pointerId);
    if (pointers.size === 1) {
      const [rest] = pointers.values();
      spin.dragging = true;
      spin.x = rest.x;
      spin.y = rest.y;
      return;
    }
    if (!spin.dragging) return;
    spin.dragging = false;
    canvas.style.cursor = "grab";
  }
  const keys = {};
  const KEYS = [
    "w",
    "a",
    "s",
    "d",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
  ];
  canvas.addEventListener("keydown", (e) => {
    if (GAIT_MODE) return;
    const k = e.key.toLowerCase();
    if (KEYS.includes(k)) {
      keys[k] = true;
      e.preventDefault();
    }
  });
  canvas.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });
  canvas.addEventListener("blur", () => {
    for (const k in keys) keys[k] = false;
  });
  const _ray = new THREE.Vector3(),
    FOCUS = new THREE.Vector3();
  const _gf = new THREE.Vector3(),
    _gs = new THREE.Vector3(),
    _gu = new THREE.Vector3(),
    _gc = new THREE.Vector3();
  function gaitStep(dt, t) {
    const c = cats[1];
    Object.assign(c.target, c.neutral);
    c.target.tailUp = lerp(0.4, 0.35, smoothstep(0.35, 0.7, c.speed));
    c.target.happy = 0.3;
    c.target.headYaw = 0;
    c.gazeAngle = c.bodyYaw;
    c.wantHeading = c.bodyYaw;
    c.wantSpeed = gaitControl.speed;
    poseCat(c, dt, t);
  }
  function placeGaitCamera(dt) {
    const c = cats[1];
    groundUnder(c, _fm);
    _fm.normalize().applyQuaternion(planet.quaternion);
    _fq.setFromUnitVectors(_fm, UP);
    planet.quaternion
      .premultiply(_fI.identity().slerp(_fq, 1 - Math.exp(-dt * 6)))
      .normalize();
    const F = c.frame;
    centerWorld(c, _gc).applyQuaternion(planet.quaternion);
    _gu.copy(F.up).applyQuaternion(planet.quaternion);
    _gf
      .set(0, 0, 0)
      .addScaledVector(F.ex, Math.sin(c.bodyYaw))
      .addScaledVector(F.ez, Math.cos(c.bodyYaw))
      .applyQuaternion(planet.quaternion);
    _gs.crossVectors(_gu, _gf).normalize();
    camera.position
      .copy(_gc)
      .addScaledVector(_gs, -1.25)
      .addScaledVector(_gu, 0.1);
    camera.up.copy(_gu);
    camera.lookAt(_gc.addScaledVector(_gu, 0.03));
  }
  /** Return the unit direction of the planet point under the middle of the screen. */
  function screenCenterOnPlanet(out) {
    camera.getWorldDirection(_ray);
    const b = camera.position.dot(_ray),
      c = camera.position.lengthSq() - R * R,
      disc = b * b - c;
    if (disc < 0) return out.copy(camera.position).normalize();
    return out
      .copy(camera.position)
      .addScaledVector(_ray, -b - Math.sqrt(disc))
      .normalize();
  }
  const _fm = new THREE.Vector3(),
    _fq = new THREE.Quaternion(),
    _fI = new THREE.Quaternion(),
    followDir = new THREE.Vector3();
  /** Return the ground point under `c`, ignoring jumps so the camera does not bounce with them. */
  function groundUnder(c, out) {
    _a.addVectors(c.rump.p, c.chest.p).multiplyScalar(0.5);
    return out
      .copy(c.frame.o)
      .addScaledVector(c.frame.ex, _a.x)
      .addScaledVector(c.frame.ez, _a.z);
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener(
    "wheel",
    (e) => {
      if (GAIT_MODE || !takesAllInput()) return;
      e.preventDefault();
      zoomTarget = clamp(zoomTarget * Math.exp(e.deltaY * 0.0012), 0.9, 3.6);
    },
    { passive: false }
  );

  const clock = new THREE.Clock();
  let elapsed = 0;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const t = elapsed;
    windStrength =
      0.6 + 0.22 * Math.sin(t * 0.21) + 0.12 * Math.sin(t * 0.53 + 1);
    windUniforms.uTime.value = t;
    windUniforms.uStrength.value = windStrength;

    zoom = lerp(zoom, zoomTarget, 1 - Math.exp(-dt * 6));
    if (!GAIT_MODE) placeCamera();
    camera.updateMatrixWorld();
    const kx =
      (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    const ky =
      (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0);
    if (!GAIT_MODE && (kx || ky)) {
      rotatePlanet(-kx * 1.3 * dt, ky * 1.3 * dt);
    }

    if (GAIT_MODE) gaitStep(dt, t);
    else {
      direct(dt, t);
      for (const c of cats) poseCat(c, dt, t);
    }
    if (!GAIT_MODE) updateProps(dt, t);
    if (!GAIT_MODE) updateLeaves(dt, t);

    if (GAIT_MODE) placeGaitCamera(dt);
    else if (!spin.dragging && !kx && !ky) {
      groundUnder(cats[0], _fm);
      groundUnder(cats[1], _wb);
      _fm.add(_wb).normalize();
      if (followDir.lengthSq() === 0) followDir.copy(_fm);
      followDir.lerp(_fm, 1 - Math.exp(-dt * 2.5)).normalize();
      _fm.copy(followDir).applyQuaternion(planet.quaternion);
      _fq.setFromUnitVectors(_fm, screenCenterOnPlanet(FOCUS));
      planet.quaternion
        .premultiply(_fI.identity().slerp(_fq, 1 - Math.exp(-dt * 3)))
        .normalize();
    }

    drawFrame();
    rafId = requestAnimationFrame(frame);
  }
  function drawFrame() {
    const touch = takesAllInput() ? "none" : "pan-y";
    if (!GAIT_MODE && canvas.style.touchAction !== touch)
      canvas.style.touchAction = touch;
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    hasDrawn = true;
  }
  let rafId = requestAnimationFrame(frame);
  const visibilityObserver = new IntersectionObserver((entries) => {
    const isVisible = entries.some((entry) => entry.isIntersecting);
    cancelAnimationFrame(rafId);
    if (isVisible) {
      clock.getDelta();
      rafId = requestAnimationFrame(frame);
    }
  });
  visibilityObserver.observe(container);

  return () => {
    cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    for (const s of [scene, postScene]) {
      s.traverse((o) => {
        o.geometry?.dispose();
        for (const m of [o.material].flat()) m?.dispose();
      });
    }
    rt.dispose();
    sun.shadow.dispose();
    gradientMap.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
