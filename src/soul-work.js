import workStyles from "./soul-work.css?inline";

/**
 * @typedef {"markets" | "agents" | "astronomy" | "molecules" | "climate"} SceneKind
 * @typedef {{ kind: SceneKind, name: string, discipline: string, role: string,
 * title: string[], sequence: string, color: string, background: string }} WorkStudy
 */

/** @type {readonly WorkStudy[]} */
const WORK_STUDIES = Object.freeze([
  { kind: "markets", name: "artificial hedge", discipline: "AI × CAPITAL", role: "Founder", title: ["Capital.", "With context."], sequence: "Question → research → conviction", color: "#f9cb79", background: "#141918" },
  { kind: "agents", name: "ctxt-MAM", discipline: "MULTI-AGENT SYSTEMS", role: "Open-source fork", title: ["Many minds.", "One direction."], sequence: "Context → coordination → output", color: "#c8b9ff", background: "#17161e" },
  { kind: "astronomy", name: "speedX", discipline: "SCIENTIFIC COMPUTING", role: "Research & engineering", title: ["A universe", "of questions."], sequence: "Observation → retrieval → discovery", color: "#edb590", background: "#161821" },
  { kind: "molecules", name: "ZANE", discipline: "AI × MOLECULAR SCIENCE", role: "Product & research", title: ["Small structures.", "Big questions."], sequence: "Target → molecule → investigation", color: "#8fbaff", background: "#111b2b" },
  { kind: "climate", name: "Space4Climate", discipline: "SPACE × CLIMATE", role: "Co-founder & CTO", title: ["One planet.", "Infinite curiosity."], sequence: "Space → science → people", color: "#d4dbb3", background: "#17211f" },
]);

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rgba = (hex, alpha) => `${hex}${Math.round(clamp(alpha, 0, 1) * 255).toString(16).padStart(2, "0")}`;
const seeded = (seed) => {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

function createText(doc, className, text, tag = "span") {
  const element = doc.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function stroke(ctx, points, color, width = 1) {
  if (!points.length) return;
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function dot(ctx, x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(.2, radius), 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
}

function frame(ctx, scene) {
  const { width: w, height: h, study } = scene;
  ctx.fillStyle = study.background;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * .66, h * .56, 0, w * .6, h * .56, w * .68);
  glow.addColorStop(0, rgba(study.color, .075));
  glow.addColorStop(1, rgba(study.color, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = rgba(study.color, .045);
  ctx.lineWidth = 1;
  const step = Math.max(28, w / 15);
  for (let x = step; x < w; x += step) stroke(ctx, [[x, 0], [x, h]], rgba(study.color, .035));
  for (let y = step; y < h; y += step) stroke(ctx, [[0, y], [w, y]], rgba(study.color, .035));
  // A sparse fixed constellation gives every study a shared visual rhythm.
  scene.specks.forEach((p) => dot(ctx, p.x * w, p.y * h, .55, rgba(study.color, .17)));
}

function drawMarkets(ctx, scene, t) {
  const { width: w, height: h, study, pointer } = scene;
  const left = w * .095, right = w * .905, top = h * .35, bottom = h * .8;
  const count = scene.mobile ? 50 : 80;
  const paths = [];
  for (let line = 0; line < 4; line++) {
    const points = [];
    for (let i = 0; i <= count; i++) {
      const u = i / count;
      const wave = Math.sin(u * 9.4 + t * .34 + line * .42) * .042 + Math.sin(u * 26 - t * .17) * .013;
      const rise = .45 - u * .28 + Math.sin(u * 4.6 + line) * .055;
      points.push([left + u * (right - left), h * (.27 + rise + wave + line * .027)]);
    }
    paths.push(points);
    stroke(ctx, points, rgba(study.color, line === 0 ? .9 : .12 + line * .035), line === 0 ? 2.2 : 1);
  }
  const primary = paths[0];
  ctx.beginPath();
  ctx.moveTo(primary[0][0], bottom);
  primary.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(right, bottom);
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, top, 0, bottom);
  fill.addColorStop(0, rgba(study.color, .16));
  fill.addColorStop(1, rgba(study.color, 0));
  ctx.fillStyle = fill;
  ctx.fill();
  const probe = clamp(Math.floor((.5 + pointer.x * .43) * count), 0, count);
  const [px, py] = primary[probe];
  ctx.setLineDash([3, 5]);
  stroke(ctx, [[px, top], [px, bottom]], rgba(study.color, .28));
  ctx.setLineDash([]);
  dot(ctx, px, py, 14 + Math.sin(t * 1.5) * 2, rgba(study.color, .07));
  dot(ctx, px, py, 4.3, study.color);
  dot(ctx, px, py, 1.5, study.background);
  for (let i = 0; i < 25; i++) {
    const x = left + (right - left) * i / 24;
    const height = (Math.sin(i * 1.9) * .5 + .5) * h * .045 + h * .012;
    ctx.fillStyle = rgba(study.color, .17);
    ctx.fillRect(x, bottom + h * .015, Math.max(2, w * .007), height);
  }
}

function drawAgents(ctx, scene, t) {
  const { width: w, height: h, study, pointer } = scene;
  const cx = w * .5 + pointer.x * w * .025, cy = h * .57 + pointer.y * h * .025;
  const nodes = [{ x: cx, y: cy, central: true }];
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU - Math.PI / 2 + Math.sin(t * .14) * .045;
    nodes.push({ x: cx + Math.cos(a) * w * .29, y: cy + Math.sin(a) * h * .225, central: false });
  }
  ctx.setLineDash([2, 6]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * .29, h * .225, 0, 0, TAU);
  ctx.strokeStyle = rgba(study.color, .14);
  ctx.stroke();
  ctx.setLineDash([]);
  nodes.slice(1).forEach((node, i) => {
    stroke(ctx, [[cx, cy], [node.x, node.y]], rgba(study.color, .26));
    const next = nodes[1 + (i + 1) % 6];
    stroke(ctx, [[node.x, node.y], [next.x, next.y]], rgba(study.color, .11));
    const progress = (t * .2 + i / 6) % 1;
    const x = node.x + (cx - node.x) * progress;
    const y = node.y + (cy - node.y) * progress;
    dot(ctx, x, y, 8, rgba(study.color, .045));
    dot(ctx, x, y, 2.3, study.color);
  });
  nodes.forEach((node, i) => {
    const radius = w * (node.central ? .061 : .032);
    dot(ctx, node.x, node.y, radius + 9, rgba(study.color, .04));
    dot(ctx, node.x, node.y, radius, study.background);
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, TAU);
    ctx.strokeStyle = rgba(study.color, node.central ? .8 : .48);
    ctx.lineWidth = 1;
    ctx.stroke();
    if (node.central) {
      stroke(ctx, [[node.x - radius * .35, node.y], [node.x + radius * .35, node.y]], study.color, 1.5);
      stroke(ctx, [[node.x, node.y - radius * .35], [node.x, node.y + radius * .35]], study.color, 1.5);
    } else dot(ctx, node.x, node.y, 2.3, rgba(study.color, .9));
  });
}

function drawAstronomy(ctx, scene, t) {
  const { width: w, height: h, study, pointer } = scene;
  const cx = w * .5 + pointer.x * w * .035, cy = h * .565 + pointer.y * h * .025;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-.37 + t * .012);
  for (let arm = 0; arm < 3; arm++) {
    const points = [];
    for (let j = 1; j <= 45; j++) {
      const u = j / 45;
      const a = arm / 3 * TAU + u * 7 + t * .025;
      points.push([Math.cos(a) * u * w * .35, Math.sin(a) * u * w * .35 * .54]);
    }
    stroke(ctx, points, rgba(study.color, .075), 3);
  }
  scene.stars.forEach((star, i) => {
    const r = star.r * w * .35;
    const a = (i % 3) / 3 * TAU + star.a * .065 + star.r * 7 + t * .025;
    const x = Math.cos(a) * r, y = Math.sin(a) * r * .54;
    const brightness = .3 + Math.sin(t * .5 + i) * .14;
    dot(ctx, x, y, star.size * (w / 550), rgba(study.color, brightness + .3 * (1 - star.r)));
  });
  const light = ctx.createRadialGradient(0, 0, 0, 0, 0, w * .18);
  light.addColorStop(0, rgba(study.color, .2));
  light.addColorStop(.25, rgba(study.color, .07));
  light.addColorStop(1, rgba(study.color, 0));
  ctx.fillStyle = light;
  ctx.fillRect(-w * .2, -w * .2, w * .4, w * .4);
  ctx.restore();
  const targets = [[.34, .46, .06], [.66, .63, .082], [.56, .43, .043]];
  targets.forEach(([x, y, size], i) => {
    const bx = x * w + Math.sin(t * .2 + i) * 3, by = y * h;
    const s = size * w, tick = s * .3;
    const color = rgba(study.color, .48);
    stroke(ctx, [[bx - s, by - s + tick], [bx - s, by - s], [bx - s + tick, by - s]], color);
    stroke(ctx, [[bx + s - tick, by - s], [bx + s, by - s], [bx + s, by - s + tick]], color);
    stroke(ctx, [[bx - s, by + s - tick], [bx - s, by + s], [bx - s + tick, by + s]], color);
    stroke(ctx, [[bx + s - tick, by + s], [bx + s, by + s], [bx + s, by + s - tick]], color);
  });
  const scan = h * (.35 + ((t * .035) % 1) * .42);
  stroke(ctx, [[w * .12, scan], [w * .88, scan]], rgba(study.color, .08));
}

const ATOMS = Object.freeze([
  [-1.3, 0, 0], [-.8, -.85, .2], [.2, -.85, .05], [.7, 0, -.1], [.2, .85, -.05], [-.8, .85, .2],
  [1.65, -.55, .3], [2.5, .02, .1], [2.35, .92, -.15], [1.3, 1.1, -.05],
  [-2.22, -.45, .05], [-2.48, -1.4, .4], [-2.04, .5, -.5],
  [.25, -1.84, -.2], [.7, -2.3, .6], [3.35, -.32, .2],
]);
const BONDS = Object.freeze([[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6], [6, 7], [7, 8], [8, 9], [9, 4], [0, 10], [10, 11], [10, 12], [2, 13], [13, 14], [7, 15]]);

function drawMolecules(ctx, scene, t) {
  const { width: w, height: h, study, pointer } = scene;
  const angle = Math.sin(t * .2) * .35 + pointer.x * .35;
  const tilt = -.18 + pointer.y * .15;
  const scale = w * .105;
  const projected = ATOMS.map(([x, y, z], i) => {
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = z * Math.cos(angle) - x * Math.sin(angle);
    const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
    const depth = 1 + rz * .06;
    return { x: w * .465 + rx * scale * depth, y: h * .59 + ry * scale * depth, z: rz, i };
  });
  BONDS.forEach(([a, b], i) => {
    const start = projected[a], end = projected[b];
    stroke(ctx, [[start.x, start.y], [end.x, end.y]], rgba(study.color, .28 + (start.z + 2) * .08), 1.5);
    if (i < 6 && i % 2 === 0) stroke(ctx, [[start.x + 4, start.y + 3], [end.x + 4, end.y + 3]], rgba(study.color, .24), 1);
  });
  projected.sort((a, b) => a.z - b.z).forEach((atom) => {
    const radius = (atom.i > 9 ? 4 : 6) * (w / 550) * (1 + atom.z * .075);
    dot(ctx, atom.x, atom.y, radius * 3, rgba(study.color, .055));
    dot(ctx, atom.x, atom.y, radius, atom.i % 5 === 0 ? "#e8ede7" : study.color);
    dot(ctx, atom.x - radius * .25, atom.y - radius * .25, radius * .27, "#f4f6ff");
  });
  ctx.setLineDash([2, 6]);
  ctx.beginPath();
  ctx.ellipse(w * .5, h * .58, w * .365, h * .25, -.16, 0, TAU);
  ctx.strokeStyle = rgba(study.color, .12);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawClimate(ctx, scene, t) {
  const { width: w, height: h, study, pointer } = scene;
  const cx = w * .5, cy = h * .565, radius = w * .255;
  const rotation = t * .12 + pointer.x * .4;
  const project = (lat, lon) => {
    const x = Math.cos(lat) * Math.sin(lon + rotation);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.cos(lon + rotation);
    return [cx + x * radius, cy - (y * .95 + z * .17) * radius, z];
  };
  const glow = ctx.createRadialGradient(cx - radius * .4, cy - radius * .4, radius * .01, cx, cy, radius);
  glow.addColorStop(0, rgba(study.color, .13));
  glow.addColorStop(.8, rgba(study.color, .035));
  glow.addColorStop(1, rgba(study.color, .015));
  dot(ctx, cx, cy, radius, glow);
  for (let lat = -1.22; lat < 1.3; lat += .305) {
    const points = [];
    for (let j = 0; j <= 72; j++) {
      const [x, y, z] = project(lat, j / 72 * TAU);
      if (z > 0) points.push([x, y]);
      else if (points.length) { stroke(ctx, points, rgba(study.color, .23)); points.length = 0; }
    }
    stroke(ctx, points, rgba(study.color, .23));
  }
  for (let i = 0; i < 12; i++) {
    const points = [];
    for (let j = 0; j <= 36; j++) {
      const [x, y, z] = project(-Math.PI / 2 + j / 36 * Math.PI, i / 12 * TAU);
      if (z > 0) points.push([x, y]);
      else if (points.length) { stroke(ctx, points, rgba(study.color, .18)); points.length = 0; }
    }
    stroke(ctx, points, rgba(study.color, .18));
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.strokeStyle = rgba(study.color, .5);
  ctx.stroke();
  const orbitTilt = -.43 + pointer.y * .13;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(orbitTilt);
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.48, radius * .6, 0, 0, TAU);
  ctx.strokeStyle = rgba(study.color, .4);
  ctx.stroke();
  const a = t * .34;
  const sx = Math.cos(a) * radius * 1.48, sy = Math.sin(a) * radius * .6;
  dot(ctx, sx, sy, 11, rgba(study.color, .06));
  dot(ctx, sx, sy, 3.5, "#eff2d8");
  stroke(ctx, [[sx - 10, sy], [sx + 10, sy]], study.color, 2);
  ctx.restore();
}

const DRAWERS = Object.freeze({ markets: drawMarkets, agents: drawAgents, astronomy: drawAstronomy, molecules: drawMolecules, climate: drawClimate });

/** Enhance the original project panels without taking over their scroll animations. */
export function initSoulWork(doc, win) {
  if (!doc?.body || doc.querySelector("style[data-soul-work]")) return () => {};
  const style = doc.createElement("style");
  style.dataset.soulWork = "";
  style.textContent = workStyles;
  doc.head.append(style);
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = win.matchMedia("(pointer: fine)");
  const scenes = [];
  const cleanups = [];
  let raf = 0, lastFrame = -Infinity, destroyed = false;

  function render(scene, time) {
    if (!scene.width || !scene.height) return;
    scene.pointer.x += (scene.pointer.targetX - scene.pointer.x) * .07;
    scene.pointer.y += (scene.pointer.targetY - scene.pointer.y) * .07;
    scene.ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
    frame(scene.ctx, scene);
    DRAWERS[scene.study.kind](scene.ctx, scene, reduced.matches ? 3.5 : time / 1000);
  }

  function tick(now) {
    raf = 0;
    if (destroyed || doc.hidden || reduced.matches) return;
    const visible = scenes.filter((scene) => scene.visible);
    if (!visible.length) return;
    const cadence = win.innerWidth < 768 ? 1000 / 30 : 1000 / 45;
    if (now - lastFrame >= cadence) {
      visible.forEach((scene) => render(scene, now));
      lastFrame = now;
    }
    raf = win.requestAnimationFrame(tick);
  }

  function schedule() {
    if (destroyed || doc.hidden) return;
    if (reduced.matches) {
      if (raf) win.cancelAnimationFrame(raf);
      raf = 0;
      scenes.filter((scene) => scene.visible).forEach((scene) => render(scene, 0));
    } else if (!raf && scenes.some((scene) => scene.visible)) raf = win.requestAnimationFrame(tick);
  }

  function resize(scene) {
    const rect = scene.wrapper.getBoundingClientRect();
    scene.width = Math.max(1, scene.wrapper.clientWidth || rect.width);
    scene.height = Math.max(1, scene.wrapper.clientHeight || rect.height);
    scene.dpr = Math.min(win.devicePixelRatio || 1, 1.75);
    scene.mobile = win.innerWidth < 768;
    scene.canvas.width = Math.round(scene.width * scene.dpr);
    scene.canvas.height = Math.round(scene.height * scene.dpr);
    render(scene, win.performance.now());
    schedule();
  }

  const intersection = typeof win.IntersectionObserver === "function" ? new win.IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const scene = scenes.find((item) => item.wrapper === entry.target);
      if (scene) { scene.visible = entry.isIntersecting; if (scene.visible) render(scene, win.performance.now()); }
    });
    if (!scenes.some((scene) => scene.visible) && raf) { win.cancelAnimationFrame(raf); raf = 0; }
    schedule();
  }, { threshold: .01 }) : null;
  const resizeObserver = typeof win.ResizeObserver === "function" ? new win.ResizeObserver((entries) => {
    entries.forEach((entry) => { const scene = scenes.find((item) => item.wrapper === entry.target); if (scene) resize(scene); });
  }) : null;

  doc.querySelectorAll(".section-case .case-content").forEach((panel, index) => {
    const study = WORK_STUDIES[index];
    const wrapper = panel.querySelector(".case-content_image-warpper");
    const link = panel.querySelector(".case-content_guts");
    const left = panel.querySelector(".case-content_left");
    if (!study || !wrapper || !link || !left) return;
    const canvas = doc.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    canvas.className = "soul-work-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const figure = doc.createElement("figure");
    figure.className = "soul-work-study";
    figure.setAttribute("aria-label", `${study.name}: conceptual ${study.discipline.toLowerCase()} visualization`);
    const label = createText(doc, "soul-work-eyebrow", `${String(index + 1).padStart(2, "0")} / ${study.discipline}`);
    const title = doc.createElement("div");
    title.className = "soul-work-art-title";
    study.title.forEach((line) => title.append(createText(doc, "soul-work-title-line", line)));
    const footer = createText(doc, "soul-work-caption", study.sequence, "figcaption");
    const note = createText(doc, "soul-work-note", study.kind === "markets" ? "Conceptual study · simulated paths" : "Conceptual study · in motion");
    const role = createText(doc, "soul-work-role", `${study.role} / ${study.discipline}`);
    const hint = createText(doc, "soul-work-hint", "Move to explore ↗");
    figure.append(canvas, label, title, footer, note, hint);
    wrapper.append(figure);
    left.prepend(role);
    wrapper.classList.add("soul-work-viewport");
    panel.classList.add("soul-enhanced-work");
    panel.style.setProperty("--soul-work-accent", study.color);
    const random = seeded(819 + index * 137);
    const scene = {
      study, wrapper, canvas, ctx, visible: !intersection, width: 0, height: 0, dpr: 1, mobile: false,
      pointer: { x: 0, y: 0, targetX: 0, targetY: 0 },
      specks: Array.from({ length: 48 }, () => ({ x: random(), y: random() })),
      stars: Array.from({ length: win.innerWidth < 768 ? 56 : 140 }, () => ({ r: Math.sqrt(random()), a: random() * TAU, size: .5 + random() * 1.7 })),
    };
    scenes.push(scene);
    let bounds = null;
    const enter = () => { bounds = wrapper.getBoundingClientRect(); };
    const move = (event) => {
      if (!finePointer.matches || reduced.matches) return;
      if (!bounds) enter();
      scene.pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
      scene.pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
    };
    const leave = () => { scene.pointer.targetX = 0; scene.pointer.targetY = 0; bounds = null; };
    wrapper.addEventListener("pointerenter", enter, { passive: true });
    wrapper.addEventListener("pointermove", move, { passive: true });
    wrapper.addEventListener("pointerleave", leave, { passive: true });
    cleanups.push(() => {
      wrapper.removeEventListener("pointerenter", enter);
      wrapper.removeEventListener("pointermove", move);
      wrapper.removeEventListener("pointerleave", leave);
      figure.remove(); role.remove(); wrapper.classList.remove("soul-work-viewport"); panel.classList.remove("soul-enhanced-work"); panel.style.removeProperty("--soul-work-accent");
    });
    resize(scene);
    intersection?.observe(wrapper);
    resizeObserver?.observe(wrapper);
  });

  const focusColors = ["#e38c49", "#a791f1", "#8f9eb4", "#6491de", "#7c967b"];
  doc.querySelectorAll("#services .mwg035-li").forEach((row, index) => {
    row.classList.add("soul-focus-row");
    row.style.setProperty("--soul-focus-color", focusColors[index % focusColors.length]);
    cleanups.push(() => { row.classList.remove("soul-focus-row"); row.style.removeProperty("--soul-focus-color"); });
  });
  const visibility = () => {
    if (doc.hidden && raf) { win.cancelAnimationFrame(raf); raf = 0; }
    else schedule();
  };
  const motionChange = () => schedule();
  const windowResize = () => scenes.forEach(resize);
  doc.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", motionChange);
  win.addEventListener("resize", windowResize, { passive: true });
  schedule();
  return () => {
    destroyed = true;
    if (raf) win.cancelAnimationFrame(raf);
    intersection?.disconnect(); resizeObserver?.disconnect();
    doc.removeEventListener("visibilitychange", visibility);
    reduced.removeEventListener("change", motionChange);
    win.removeEventListener("resize", windowResize);
    cleanups.forEach((cleanup) => cleanup());
    style.remove();
  };
}
