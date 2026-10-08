// WebGL renderer for the pixel hedge. Every cell is a square point; the vertex shader
// grows the tree over time, sways it in the wind, pushes cells away from the pointer
// and sends a ripple out from clicks.

const VERT = `
attribute vec2 a_pos;
attribute float a_born;
attribute vec3 a_color;
attribute float a_alpha;
attribute float a_seed;

uniform vec2 u_res;
uniform float u_cell;
uniform float u_rows;
uniform float u_grow;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_force;
uniform vec3 u_pulse;

varying vec3 v_color;
varying float v_alpha;

void main() {
  vec2 p = (a_pos + 0.5) * u_cell;

  // Wind: the canopy sways more than the trunk.
  float h = clamp(1.0 - a_pos.y / u_rows, 0.0, 1.0);
  p.x += sin(u_time * 0.8 + a_pos.y * 0.04 + a_seed) * h * h * u_cell * 1.4;

  // Pointer repulsion.
  float R = u_cell * 17.0;
  vec2 d = p - u_mouse;
  float dist = length(d) + 0.001;
  float f = (1.0 - smoothstep(0.0, R, dist)) * u_force;
  p += d / dist * f * R * 0.5;

  // Click ripple: a ring that travels outward and fades.
  float pt = u_time - u_pulse.z;
  float k = 0.0;
  if (pt > 0.0 && pt < 1.8) {
    vec2 dp = p - u_pulse.xy;
    float pd = length(dp) + 0.001;
    float ring = pt * R * 5.0;
    k = (1.0 - smoothstep(0.0, R * 0.8, abs(pd - ring))) * (1.0 - pt / 1.8);
    p += dp / pd * k * u_cell * 4.0;
  }

  float age = u_grow - a_born;
  float vis = step(0.0, age);
  float fresh = 1.0 - clamp(age / 5.0, 0.0, 1.0);
  float twinkle = step(0.993, fract(sin(floor(u_time * 5.0) * 12.9898 + a_seed * 78.233) * 43758.5453));

  vec2 clip = p / u_res * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = vis * (u_cell - 1.0) * (1.0 + f * 0.4 + k * 0.6);
  float glow = clamp(max(max(fresh, f * 0.9), max(twinkle, k)), 0.0, 1.0);
  v_color = mix(a_color, vec3(1.0, 0.945, 0.918), glow);
  v_alpha = vis * max(a_alpha, glow);
}
`;

const FRAG = `
precision mediump float;
varying vec3 v_color;
varying float v_alpha;
void main() {
  gl_FragColor = vec4(v_color * v_alpha, v_alpha);
}
`;

const ATTRS = [
  ['a_pos', 2],
  ['a_born', 1],
  ['a_color', 3],
  ['a_alpha', 1],
  ['a_seed', 1],
];
const STRIDE = ATTRS.reduce((n, [, size]) => n + size, 0);

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export function createHedgeGL(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  let offset = 0;
  for (const [name, size] of ATTRS) {
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE * 4, offset * 4);
    offset += size;
  }
  const u = Object.fromEntries(
    ['u_res', 'u_cell', 'u_rows', 'u_grow', 'u_time', 'u_mouse', 'u_force', 'u_pulse'].map((n) => [
      n,
      gl.getUniformLocation(program, n),
    ]),
  );
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let count = 0;
  let dpr = 1;

  return {
    load(state) {
      dpr = state.dpr;
      const data = new Float32Array(state.cells.length * STRIDE);
      state.cells.forEach((c, i) => {
        const [r, g, b] = hexToRgb(c.color);
        data.set([c.x, c.y, c.t, r, g, b, c.alpha, (i * 0.6180339) % 1], i * STRIDE);
      });
      count = state.cells.length;
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.u_res, canvas.width, canvas.height);
      gl.uniform1f(u.u_cell, state.cell * dpr);
      gl.uniform1f(u.u_rows, state.rows);
    },
    draw({ grow, time, pointer, pulse }) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.u_grow, grow);
      gl.uniform1f(u.u_time, time);
      gl.uniform2f(u.u_mouse, pointer.x * dpr, pointer.y * dpr);
      gl.uniform1f(u.u_force, pointer.force);
      gl.uniform3f(u.u_pulse, pulse.x * dpr, pulse.y * dpr, pulse.t);
      gl.drawArrays(gl.POINTS, 0, count);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
