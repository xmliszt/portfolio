/** GLSL ES 1.0 fragment shader for the sunset scene; the caller prepends `#define ITER <n>` for the wave iteration count and `#define RIPPLES <n>` and `#define RIPPLE_LIFE <seconds>` for `uRipples`, and `#define WAKES <n>` and `#define WAKE_LIFE <seconds>` for `uWakes`. */
export const SUNSET_FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime, uSunY, uHorizon, uSunR, uChop, uScale, uSpeed, uRough, uGlint, uIsland, uExpo, uVis, uGlow, uSpread, uHaze, uDof, uSunI, uSat, uContrast, uBloom, uSail, uRoll, uPitch, uWakeFreq, uWakeSpeed;
uniform vec3 uZen, uMid, uHor, uSunC, uSea;
uniform vec4 uRipples[RIPPLES];
uniform vec4 uWakes[WAKES];

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

vec3 sky(vec2 q) {
  float a = max(q.y - uHorizon, 0.0);
  float t = clamp(a / (1.0 - uHorizon), 0.0, 1.0);
  vec3 c = mix(uHor, uMid, smoothstep(0.0, 0.35, t));
  c = mix(c, uZen, smoothstep(0.25, 1.0, t));
  c *= 1.0 - uHaze * exp(-a * 30.0);
  vec2 d = q - vec2(0.0, uSunY);
  float g = exp(-length(d * vec2(0.55, 1.0)) * 7.0) * 0.5 + exp(-length(d) * 24.0) * 0.55;
  float band = exp(-a * 18.0) * exp(-abs(q.x) * 1.6);
  return c + uSunC * (g * uGlow + band * 0.3 * uGlow);
}

vec2 waves(vec2 p, float fp, out vec3 cov) {
  float t = uTime * uSpeed;
  vec2 grad = vec2(0.0);
  float freq = 1.0, amp = 1.0, seed = 0.0, wsum = 0.0;
  cov = vec3(0.0);
  for (int i = 0; i < ITER; i++) {
    float ang = (fract(seed * 0.1591549) - 0.5) * 6.2831853 * uSpread;
    vec2 d = vec2(sin(ang), cos(ang));
    float x = dot(d, p) * freq + t * sqrt(freq) * 1.6;
    float e = exp(sin(x) - 1.0);
    float dx = e * cos(x);
    float w = amp * (1.0 - smoothstep(3.0, 8.0, freq * fp));
    grad += w * freq * dx * d;
    float lost = (amp - w) * freq * 0.6;
    cov += 0.5 * lost * lost * vec3(d.x * d.x, d.y * d.y, d.x * d.y);
    p -= d * dx * amp * 0.38;
    wsum += amp;
    freq *= 1.18; amp *= 0.83; seed += 1232.399963;
  }
  cov /= wsum * wsum;
  return grad / wsum;
}

vec3 agx(vec3 v) {
  mat3 m = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                0.0784335999999992, 0.878468636469772, 0.0784336,
                0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  vec3 x = clamp(log2(m * max(v, vec3(1e-10))), -12.47393, 4.026069);
  x = (x + 12.47393) / 16.499999;
  vec3 x2 = x * x, x4 = x2 * x2;
  x = 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
  mat3 mi = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                 -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                 -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
  x = mi * x;
  float l = dot(x, vec3(0.2126, 0.7152, 0.0722));
  return l + uSat * (pow(max(x, 0.0), vec3(uContrast)) - l);
}

vec2 ring(vec4 r, vec2 p, float footprint, float life, float freq, float speed) {
  float age = uTime - r.z;
  if (r.w <= 0.0 || age < 0.0 || age > life) return vec2(0.0);
  vec2 d = p - r.xy;
  float dist = length(d) + 1e-4;
  float front = dist - speed * age;
  float width = 0.06 + 0.1 * age;
  if (abs(front) > 3.0 * width) return vec2(0.0);
  float env = exp(-front * front / (width * width)) * r.w
    * smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(life * 0.35, life, age));
  return d / dist * cos(freq * front) * env * (1.0 - smoothstep(0.5, 2.0, freq * footprint));
}

vec2 ripples(vec2 p, float footprint) {
  vec2 slope = vec2(0.0);
  for (int i = 0; i < RIPPLES; i++) slope += ring(uRipples[i], p, footprint, RIPPLE_LIFE, 26.0, 0.4);
  for (int i = 0; i < WAKES; i++) slope += ring(uWakes[i], p, footprint, WAKE_LIFE, uWakeFreq, uWakeSpeed);
  return slope * 2.5;
}

float fresnel(float c) {
  float x = 1.0 - clamp(c, 0.0, 1.0);
  float x2 = x * x;
  return 0.02 + 0.98 * x2 * x2 * x;
}

void main() {
  vec2 q = vec2((gl_FragCoord.x - 0.5 * uRes.x) / uRes.y, gl_FragCoord.y / uRes.y - 0.5);
  q = mat2(cos(uRoll), sin(uRoll), -sin(uRoll), cos(uRoll)) * q;
  q.y += 0.5 + uPitch;
  vec3 col;
  if (q.y >= uHorizon) {
    col = sky(q);
    vec2 d = q - vec2(0.0, uSunY);
    float r = length(d);
    float px = 1.2 / uRes.y;
    float disc = smoothstep(uSunR * 1.04 + px, uSunR * 0.94 - px, r);
    vec3 core = mix(uSunC, vec3(1.0, 0.94, 0.8), 0.6 - 0.4 * r / uSunR) * uSunI;
    col = mix(col, col + core, disc);
    float xn = q.x / (0.5 * uRes.x / uRes.y);
    float hill = uIsland * 0.018 * smoothstep(-1.08, -0.72, xn) * (1.0 - smoothstep(-0.6, -0.22, xn))
      * (0.78 + 0.22 * sin(xn * 19.0) * sin(xn * 7.0 + 1.3));
    float island = smoothstep(px, -px, q.y - uHorizon - hill);
    col = mix(col, mix(uHor, uZen * 0.55 + uSea * 0.45, 0.6), island * 0.85);
  } else {
    float dh = max(uHorizon - q.y, 1e-4);
    float z = 1.0 / dh;
    vec2 sp = vec2(q.x * z, z + uTime * uSail);
    vec2 wp = sp * uScale;
    float fp = z * z * uScale * (1.0 / uRes.y + uDof * 0.02 * max(dh - 0.06, 0.0));
    vec3 cov;
    vec2 sl = waves(wp, fp, cov) * uChop + ripples(sp, z * z / uRes.y);
    cov *= uChop * uChop;
    float far = smoothstep(0.0, 0.015, cov.x + cov.y);
    float base = uRough * 0.5;
    cov += vec3(base, base, 0.0);

    float t = uTime * uSpeed;
    float lz = log(z);
    float streak = 0.0, sw = 0.0;
    for (int o = 0; o < 3; o++) {
      float A = 2.5 * pow(3.0, float(o));
      float w = smoothstep(1.5, 4.0, dh / A * uRes.y);
      streak += w * vnoise(vec2(wp.x * 0.35 * float(o + 1), lz * A + t * 0.9 * float(o + 1)));
      sw += w;
    }
    streak = sw > 0.0 ? streak / sw : 0.5;
    float glitMod = mix(1.0, smoothstep(0.3, 0.75, streak) * 2.0, far);
    vec3 n = normalize(vec3(-sl.x, 1.0, -sl.y));
    vec3 V = normalize(vec3(-q.x, dh, -1.0));

    vec3 Rs = reflect(-V, n);
    vec2 sd = vec2(Rs.x, Rs.y) / max(Rs.z, 0.05) - vec2(0.0, uSunY - uHorizon);
    float disc2 = 0.25 * uSunR * uSunR;
    float sx2 = 4.0 * cov.x * (dh * dh + cov.y) + disc2;
    float sy2 = 4.0 * cov.y + disc2;
    float spec = fresnel(dot(V, n)) * smoothstep(-0.5 * uSunR, 0.5 * uSunR, Rs.y / max(Rs.z, 0.05)) * exp(-0.5 * (sd.x * sd.x / sx2 + sd.y * sd.y / sy2)) * disc2 / sqrt(sx2 * sy2);

    vec3 vh = normalize(vec3(V.x, 0.0, V.z) + vec3(1e-5, 0.0, 0.0));
    float sigV = sqrt(max(vh.x * vh.x * cov.x + vh.z * vh.z * cov.y + 2.0 * vh.x * vh.z * cov.z, 1e-6));
    float aV = V.y / max(sqrt(1.0 - V.y * V.y), 1e-3) / (1.4142 * sigV);
    vec3 nV = normalize(n + vh * 0.32 * sigV * (1.0 - smoothstep(0.0, 2.5, aV)));
    vec3 R = reflect(-V, nV);
    R.y = abs(R.y) * 0.4 + max(R.y, 0.0) * 0.6;
    float rz = max(R.z, 0.05);
    vec3 refl = sky(vec2(R.x / rz, uHorizon + R.y / rz));
    float Fr = fresnel(dot(normalize(mix(n, vec3(0.0, 1.0, 0.0), 0.45)), V));

    Fr *= mix(1.0, 0.35 + 1.3 * streak, far);
    col = mix(uSea, refl, clamp(Fr, 0.0, 1.0)) + uSunC * spec * glitMod * uGlint * uSunI * uVis * 6.0;
  }
  vec2 qv = vec2(q.x, max(q.y, uHorizon));
  float sr = (max(length(qv - vec2(0.0, uSunY)) - uSunR, 0.0) + max(uHorizon - q.y, 0.0)) / uSunR;
  col += uSunC * uSunI * uVis * uBloom * (0.12 * exp(-sr * 4.0) + 0.025 * exp(-sr * 0.9));
  vec2 uv = min(gl_FragCoord.xy / uRes, 1.0);
  col *= uExpo * (1.0 - 0.22 * dot(uv - 0.5, uv - 0.5));
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = agx(mix(col, vec3(lum), smoothstep(0.7, 6.0, lum) * 0.55));
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;
