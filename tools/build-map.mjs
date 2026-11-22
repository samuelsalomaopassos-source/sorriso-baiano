// Gera o mapa isométrico de Guaratiba (base + camada de luzes) a partir de geometria 3D.
// node tools/build-map.mjs  ->  assets/map-base.svg, assets/map-lights.svg, assets/map-meta.json
import { writeFileSync } from "node:fs";
import * as k from "./iso-kit.mjs";

const W = 1600, H = 1100;

// ---------- mundo ----------
// +x -> baixo-direita na tela, +y -> baixo-esquerda, z para cima. Mar ao fundo-direita (y negativo).
const PLATE = { x: -250, y: -200, w: 505, d: 360, r: 0 };
const COAST = -82;      // linha d'água (y)
const DUNE = -6;       // início da grama (y)
const BASE_Z = -46;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, BASE_Z, 0), [0, 0, 90]],
  W, H, { pad: 40, azimuth: 45, elevation: 30 },
);
const at = (p) => k.iso(p, P);
const f = (n) => Math.round(n * 10) / 10;
const pts = (list) => list.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");
const poly3 = (list) => k.pathOf(list.map(at), true);
const depth = (p) => k.depthOf(p, P);

// ---------- cor ----------
const hex = (h) => { if (h.length === 4) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const _hexOld = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const SHADE = [0.34, 0.25, 0.16, 0.08];
const LINE = "#3b2a1e";

function solid(paths, base, { top, line = LINE, lw = 0.9, cls = "", attrs = "" } = {}) {
  const t = top || mix(base, "#ffffff", 0.1);
  const out = [`<g class="s ${cls}" ${attrs}>`];
  out.push(`<path d="${paths.fill}" fill="${base}"/>`);
  paths.shades.forEach((d, i) => d && out.push(`<path d="${d}" fill="${mix(base, "#1a1208", SHADE[i])}"/>`));
  if (paths.top) out.push(`<path d="${paths.top}" fill="${t}"/>`);
  if (paths.crease) out.push(`<path d="${paths.crease}" fill="none" stroke="${mix(base, "#ffffff", 0.35)}" stroke-width="${lw * 0.6}" stroke-opacity=".7"/>`);
  out.push(`<path d="${paths.outline}" fill="none" stroke="${line}" stroke-width="${lw}" stroke-opacity=".55" stroke-linejoin="round"/>`);
  out.push(`</g>`);
  return out.join("");
}
const slab = (plan, z, h, base, o = {}) => solid(k.slabOf(plan, z, h, P, o.steps ?? 3, 0), base, o);
const cyl = (cx, cy, r, z, h, base, o = {}) => solid(k.cylinder(cx, cy, r, z, h, P, o.steps ?? 24), base, o);
const prism = (ring, z, h, base, o = {}) => solid(k.extrude(ring, z, h, P, { convex: o.convex ?? true }), base, o);
const line = (d, color = LINE, w = 0.8, extra = "") => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const flat = (list3, fill, extra = "") => `<path d="${poly3(list3)}" fill="${fill}" ${extra}/>`;

// faixas listradas num quadrilátero 3D (a,b,c,d) com n listras ao longo de a->b
function stripes(a, b, c, d, n, c1, c2, extra = "") {
  const lerp = (p, q, t) => p.map((v, i) => v + (q[i] - v) * t);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    out.push(flat([lerp(a, b, t0), lerp(a, b, t1), lerp(d, c, t1), lerp(d, c, t0)], i % 2 ? c2 : c1, extra));
  }
  out.push(`<path d="${poly3([a, b, c, d])}" fill="none" stroke="${LINE}" stroke-width=".7" stroke-opacity=".45"/>`);
  return out.join("");
}

// ---------- coleções ordenáveis ----------
const items = [];   // {d, svg}
const lights = [];  // camada noturna
const anim = [];    // camada animada leve (ondas + baleia), separada para não repintar o mapa inteiro
const add = (p, svg) => items.push({ d: depth(p), svg });

// ---------- peças ----------
function palm(x, y, h = 46, lean = [4, -3], seed = 0) {
  const out = [];
  const n = 6;
  let top;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const cx = x + lean[0] * t * t, cy = y + lean[1] * t * t;
    out.push(cyl(cx, cy, 2.3 - t * 0.9, (h / n) * i, h / n + 0.4, "#8a6a4a", { steps: 10, lw: 0.6 }));
    top = [x + lean[0], y + lean[1], h];
  }
  const [tx, ty] = at(top);
  const leaves = 8;
  const fronds = [];
  for (let i = 0; i < leaves; i++) {
    const a = (i / leaves) * Math.PI * 2 + seed;
    const len = 26 + ((i * 7 + seed * 10) % 5) * 2;
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.55 + 10;
    const mx = tx + Math.cos(a) * len * 0.55, my = ty + Math.sin(a) * len * 0.3 - 6;
    const nx = -Math.sin(a) * 5, ny = Math.cos(a) * 3;
    const col = i % 2 ? "#3f7d3a" : "#5a9a44";
    fronds.push({ back: Math.sin(a) < 0, d: `M${f(tx)},${f(ty)} Q${f(mx + nx)},${f(my + ny)} ${f(ex)},${f(ey)} Q${f(mx - nx)},${f(my - ny)} ${f(tx)},${f(ty)}Z`, col });
  }
  const leaf = (fr) => `<path d="${fr.d}" fill="${fr.col}" stroke="#25451f" stroke-width=".6" stroke-opacity=".6"/>`;
  const svg = `<g class="palm">${fronds.filter((q) => q.back).map(leaf).join("")}${out.join("")}${fronds.filter((q) => !q.back).map(leaf).join("")}<circle cx="${f(tx)}" cy="${f(ty)}" r="2.6" fill="#6b4a2a"/></g>`;
  add([x, y, 0], svg);
}

function bush(x, y, r = 8, col = "#4f8f3f") {
  const [cx, cy] = at([x, y, r * 0.6]);
  add([x, y, 0], `<g class="bush"><ellipse cx="${f(cx)}" cy="${f(cy + r * 0.5)}" rx="${r * 1.2}" ry="${r * 0.55}" fill="#000" opacity=".12"/><circle cx="${f(cx - r * 0.5)}" cy="${f(cy)}" r="${r * 0.8}" fill="${mix(col, "#000", 0.15)}"/><circle cx="${f(cx + r * 0.45)}" cy="${f(cy + 1)}" r="${r * 0.75}" fill="${col}"/><circle cx="${f(cx)}" cy="${f(cy - r * 0.45)}" r="${r * 0.75}" fill="${mix(col, "#fff", 0.12)}"/>
  <circle cx="${f(cx - 2)}" cy="${f(cy - r * 0.2)}" r="1.4" fill="#e0457b"/><circle cx="${f(cx + r * 0.6)}" cy="${f(cy + 1)}" r="1.2" fill="#f07aa0"/></g>`);
}

function thatch(x, y, z = 0, poleH = 15, r = 12) {
  const out = [cyl(x, y, 0.9, z, poleH, "#7a5a3a", { steps: 8, lw: 0.5 })];
  const straw = "#c9a25e";
  out.push(cyl(x, y, r, z + poleH, 1.6, straw, { steps: 10, lw: 0.7 }));
  out.push(cyl(x, y, r * 0.72, z + poleH + 1.6, 1.8, mix(straw, "#fff", 0.06), { steps: 10, lw: 0.6 }));
  out.push(cyl(x, y, r * 0.42, z + poleH + 3.4, 1.8, mix(straw, "#fff", 0.12), { steps: 10, lw: 0.6 }));
  out.push(cyl(x, y, 1.4, z + poleH + 5.2, 1.4, "#8a6a3a", { steps: 8, lw: 0.5 }));
  // franja da palha
  const ring = k.circleRing(x, y, r, 30).filter(([px, py]) => (px - x) + (py - y) > -r * 0.4);
  const fr = ring.map(([px, py]) => { const a = at([px, py, z + poleH]); return `M${f(a[0])},${f(a[1])}l0,2.2`; }).join("");
  out.push(line(fr, "#8a6a35", 0.7));
  add([x, y, z], `<g class="thatch">${out.join("")}</g>`);
}

function lounger(x, y, z = 0, rot = false, cushion = "#f4efe6") {
  const plan = rot ? { x: x - 9, y: y - 4, w: 18, d: 8, r: 1 } : { x: x - 4, y: y - 9, w: 8, d: 18, r: 1 };
  const back = rot ? { x: x - 9, y: y - 4, w: 5, d: 8, r: 1 } : { x: x - 4, y: y - 9, w: 8, d: 5, r: 1 };
  add([x, y, z], `<g>${slab(plan, z, 2.2, "#8a6a48")}${slab(k.insetPlan(plan, 0.6), z + 2.2, 1.6, cushion, { lw: 0.6 })}${slab(back, z + 3.8, 3, cushion, { lw: 0.6 })}</g>`);
}

function table(x, y, z = 0, cloth = "#ffffff", umb = null) {
  const out = [cyl(x, y, 0.7, z, 6, "#5a4030", { steps: 8, lw: 0.4 }), cyl(x, y, 4.2, z + 6, 0.9, cloth, { steps: 16, lw: 0.6 })];
  for (const [dx, dy] of [[6, 0], [-6, 0], [0, 6], [0, -6]]) out.unshift(cyl(x + dx, y + dy, 1.6, z, 3.4, "#7a5a3a", { steps: 10, lw: 0.4 }));
  if (umb) {
    out.push(cyl(x, y, 0.5, z + 6.9, 12, "#ddd", { steps: 6, lw: 0.3 }));
    // guarda-sol listrado (gomos alternados)
    const R = 10, zc = z + 19, n = 12;
    const apex = [x, y, zc + 4.5];
    const gores = [];
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      const p0 = [x + Math.cos(a0) * R, y + Math.sin(a0) * R, zc], p1 = [x + Math.cos(a1) * R, y + Math.sin(a1) * R, zc];
      const mid = (a0 + a1) / 2;
      gores.push({ dd: Math.cos(mid) + Math.sin(mid), svg: flat([apex, p0, p1], i % 2 ? umb[1] : umb[0], `stroke="${LINE}" stroke-width=".4" stroke-opacity=".35"`) });
    }
    gores.sort((a, b) => a.dd - b.dd);
    out.push(gores.map((g) => g.svg).join(""));
  }
  add([x, y, z], `<g class="table">${out.join("")}</g>`);
}

function canoe(x, y, len = 30, wid = 7, col = "#2f6db5") {
  const ring = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; ring.push([x - len / 2 + len * t, y - Math.sin(Math.PI * t) * wid / 2]); }
  for (let i = 20; i >= 0; i--) { const t = i / 20; ring.push([x - len / 2 + len * t, y + Math.sin(Math.PI * t) * wid / 2]); }
  const inner = ring.map(([px, py]) => [x + (px - x) * 0.86, y + (py - y) * 0.7]);
  add([x, y, 0], `<g class="canoe">${prism(ring, 0, 3.4, col, { convex: true })}${flat(inner.map(([a, b]) => [a, b, 3.4]), "#f4efe6")}${line(k.onTop(inner, 3.4, P, true), LINE, 0.5)}${slab({ x: x - 1.5, y: y - wid / 2 + 1, w: 3, d: wid - 2, r: 0 }, 1.5, 2, "#c99a5a", { lw: 0.4 })}</g>`);
}

// ---------- terreno (desenhado primeiro, sem ordenação) ----------
const ground = [];
// base de terra (diorama)
ground.push(slab(PLATE, BASE_Z, 30, "#9a6b45", { steps: 1, top: "#9a6b45" }));
// faixas de estrato na lateral
for (const z of [-34, -26]) ground.push(line(k.sideSeam(PLATE, z, P, 1), "#6e4a2f", 0.8, 'stroke-opacity=".5"'));
// leito do mar
const SEA = { x: PLATE.x, y: PLATE.y, w: PLATE.w, d: COAST - PLATE.y, r: 0 };
ground.push(slab(SEA, BASE_Z + 30, 2, "#d8c08f", { steps: 1 }));
// água (camada translúcida)
const WATER_TOP = BASE_Z + 30 + 20;
const water = k.slabOf(SEA, BASE_Z + 32, WATER_TOP - (BASE_Z + 32), P, 1, 0);
ground.push(`<g class="water"><path d="${water.fill}" fill="url(#seaSide)" opacity=".92"/>${water.shades.map((d) => d && `<path d="${d}" fill="url(#seaSide)" opacity=".85"/>`).join("")}<path d="${water.top}" fill="url(#seaTop)"/><path d="${water.outline}" fill="none" stroke="#0e3b5c" stroke-width=".9" stroke-opacity=".5"/></g>`);

const ZS = BASE_Z + 30 + 26;  // topo da areia
const ZL = BASE_Z + 30 + 30;  // topo da grama
// espuma na beira
const foam = [];
for (let i = 0; i <= 80; i++) { const x = PLATE.x + (PLATE.w * i) / 80; foam.push([x, COAST - 3 - Math.sin(i * 0.9) * 2.2]); }
ground.push(line(k.onTop(foam, WATER_TOP + 0.2, P), "#ffffff", 2.2, 'stroke-opacity=".85" stroke-dasharray="60 10 30 14"'));
// ondas (animadas no CSS)
for (let j = 0; j < 6; j++) {
  const yy = COAST - 24 - j * 18;
  if (yy < PLATE.y + 10) continue;
  const wv = [];
  const x0 = PLATE.x + 30 + ((j * 53) % 90), x1 = x0 + 120 + (j % 3) * 60;
  for (let x = x0; x <= Math.min(x1, PLATE.x + PLATE.w - 10); x += 6) wv.push([x, yy + Math.sin(x * 0.12 + j) * 2]);
  anim.push(line(k.onTop(wv, WATER_TOP + 0.2, P), "#ffffff", 1.1, `class="wave w${j % 3}" stroke-opacity=".55"`));
  const x2 = x1 + 70; const wv2 = [];
  for (let x = x2; x <= Math.min(x2 + 110, PLATE.x + PLATE.w - 10); x += 6) wv2.push([x, yy - 8 + Math.sin(x * 0.12 + j) * 2]);
  if (wv2.length > 2) anim.push(line(k.onTop(wv2, WATER_TOP + 0.2, P), "#ffffff", 1.1, `class="wave w${(j + 1) % 3}" stroke-opacity=".5"`));
}
// areia
const SAND = { x: PLATE.x, y: COAST, w: PLATE.w, d: DUNE - COAST, r: 0 };
ground.push(slab(SAND, BASE_Z + 30, 30 - 16 + 12, "#ead7ae", { steps: 1, top: "#f1e2bf" }));
// grama/terra firme
const LAND = { x: PLATE.x, y: DUNE, w: PLATE.w, d: PLATE.y + PLATE.d - DUNE, r: 0 };
ground.push(slab(LAND, BASE_Z + 30, 30 - 16 + 16, "#7fae5a", { steps: 1, top: "#8dbb62" }));
// textura de areia (pontinhos)
const sandDots = [];
for (let i = 0; i < 260; i++) {
  const x = PLATE.x + ((i * 97.3) % PLATE.w), y = COAST + 6 + ((i * 41.7) % (DUNE - COAST - 10));
  const [sx, sy] = at([x, y, ZS]);
  sandDots.push(`<circle cx="${f(sx)}" cy="${f(sy)}" r=".8"/>`);
}
ground.push(`<g fill="#c9ad78" opacity=".55">${sandDots.join("")}</g>`);
// grama: tufos
const grass = [];
for (let i = 0; i < 220; i++) {
  const x = PLATE.x + 8 + ((i * 83.1) % (PLATE.w - 16)), y = DUNE + 8 + ((i * 57.7) % (PLATE.y + PLATE.d - DUNE - 16));
  const [sx, sy] = at([x, y, ZL]);
  grass.push(`M${f(sx - 1.5)},${f(sy)}l1.5,-3l1.5,3`);
}
ground.push(line(grass.join(""), "#5f8f45", 0.7, 'stroke-opacity=".6"'));
// borda da duna (vegetação rasteira)
const dune = [];
for (let i = 0; i <= 60; i++) { const x = PLATE.x + (PLATE.w * i) / 60; dune.push([x, DUNE + Math.sin(i * 1.3) * 1.5]); }
ground.push(line(k.onTop(dune, ZL, P), "#5f8f45", 1.4, 'stroke-opacity=".7"'));

// ---------- caminhos ----------
// estrada de pedra do shopping até o restaurante
const road = [[-74, 50], [-50, 56], [-20, 60], [10, 62], [40, 62], [70, 66], [110, 64], [150, 60], [200, 58], [255, 56]];
const roadL = [], roadR = [];
road.forEach(([x, y], i) => {
  const [nx, ny] = road[Math.min(i + 1, road.length - 1)], [px, py] = road[Math.max(i - 1, 0)];
  const dx = nx - px, dy = ny - py, L = Math.hypot(dx, dy) || 1;
  const ox = (-dy / L) * 7, oy = (dx / L) * 7;
  roadL.push([x + ox, y + oy]); roadR.push([x - ox, y - oy]);
});
ground.push(`<path d="${k.onTop([...roadL, ...roadR.reverse()], ZL + 0.2, P, true)}" fill="#e8dcc4" stroke="#b9a582" stroke-width=".8"/>`);
const cob = [];
road.slice(0, -1).forEach(([x, y], i) => { const [nx, ny] = road[i + 1]; for (let t = 0.15; t < 1; t += 0.3) { const [sx, sy] = at([x + (nx - x) * t, y + (ny - y) * t, ZL]); cob.push(`<circle cx="${f(sx)}" cy="${f(sy)}" r="1"/>`); } });
ground.push(`<g fill="#c4b08c">${cob.join("")}</g>`);

// ---------- CASA 1: Restaurante (terra firme, perto da praia) ----------
const R0 = { x: -150, y: 14 };
const meta = {};
(function restaurante() {
  const deck = { x: R0.x - 40, y: R0.y - 14, w: 112, d: 78, r: 2 };
  add([deck.x, deck.y, 0], `<g class="house-base">${slab(deck, ZL, 2.5, "#b48a5e", { top: "#c49a6c" })}${line(k.onTop([[deck.x + 4, deck.y + 20], [deck.x + deck.w - 4, deck.y + 20]], ZL + 2.5, P), "#9a7550", 0.5)}${line(k.onTop([[deck.x + 4, deck.y + 40], [deck.x + deck.w - 4, deck.y + 40]], ZL + 2.5, P), "#9a7550", 0.5)}${line(k.onTop([[deck.x + 4, deck.y + 60], [deck.x + deck.w - 4, deck.y + 60]], ZL + 2.5, P), "#9a7550", 0.5)}</g>`);
  const z = ZL + 2.5;
  // salão (paredes brancas, cobertura turquesa)
  const hall = { x: R0.x - 34, y: R0.y - 8, w: 50, d: 40, r: 1 };
  const HH = 24;
  const parts = [];
  parts.push(slab(hall, z, HH, "#f6f1e8", { top: "#fbf8f2" }));
  // janelas/portas nas faces visíveis (+x e +y)
  const fx = hall.x + hall.w, fy = hall.y + hall.d;
  for (let i = 0; i < 3; i++) {
    const y0 = hall.y + 6 + i * 12;
    const win = [[fx + 0.1, y0, z + 5], [fx + 0.1, y0 + 7, z + 5], [fx + 0.1, y0 + 7, z + 17], [fx + 0.1, y0, z + 17]];
    parts.push(flat(win, "#2a5d7a", `class="win" stroke="${LINE}" stroke-width=".5" stroke-opacity=".5"`));
    lights.push(flat(win, "#ffd27a", 'class="glow-win"'));
    // arco
    const [ax, ay] = at([fx + 0.1, y0 + 3.5, z + 17]);
  }
  for (let i = 0; i < 3; i++) {
    const x0 = hall.x + 6 + i * 15;
    const win = [[x0, fy + 0.1, z + 5], [x0 + 8, fy + 0.1, z + 5], [x0 + 8, fy + 0.1, z + 17], [x0, fy + 0.1, z + 17]];
    parts.push(flat(win, "#2a5d7a", `class="win" stroke="${LINE}" stroke-width=".5" stroke-opacity=".5"`));
    lights.push(flat(win, "#ffd27a", 'class="glow-win"'));
  }
  // faixa turquesa (assinatura do restaurante)
  parts.push(line(k.sideSeam(hall, z + 20, P, 3), "#1fa7a2", 3.2));
  parts.push(slab(k.insetPlan(hall, -2), z + HH, 3, "#1fa7a2", { top: "#2bbab4", steps: 3 }));
  parts.push(slab(k.insetPlan(hall, 6), z + HH + 3, 6, "#f6f1e8", { steps: 3 }));
  parts.push(slab(k.insetPlan(hall, 5), z + HH + 9, 2, "#1fa7a2", { steps: 3 }));
  add([hall.x, hall.y, 0], `<g class="restaurante-hall">${parts.join("")}</g>`);
  // toldo listrado azul/branco sobre a face +x
  const aw = [[fx, hall.y + 2, z + 21], [fx, hall.y + hall.d - 2, z + 21], [fx + 12, hall.y + hall.d - 2, z + 16], [fx + 12, hall.y + 2, z + 16]];
  add([fx + 6, hall.y + hall.d, z], `<g class="awning">${stripes(aw[0], aw[1], aw[2], aw[3], 10, "#2f6db5", "#ffffff")}</g>`);
  // pérgola de madeira no terraço
  const pg = { x: fx + 14, y: hall.y - 4, w: 34, d: 56 };
  const posts = [[pg.x, pg.y], [pg.x + pg.w, pg.y], [pg.x, pg.y + pg.d], [pg.x + pg.w, pg.y + pg.d]];
  for (const [px, py] of posts) add([px, py, 0], cyl(px, py, 1.4, z, 26, "#8a6040", { steps: 8, lw: 0.5 }));
  const beams = [];
  for (let i = 0; i <= 6; i++) { const yy = pg.y + (pg.d * i) / 6; beams.push(slab({ x: pg.x - 3, y: yy - 0.8, w: pg.w + 6, d: 1.6, r: 0 }, z + 26, 1.6, "#9a6e48", { lw: 0.4 })); }
  add([pg.x + pg.w, pg.y + pg.d, z + 26], `<g class="pergola">${slab({ x: pg.x - 1, y: pg.y - 1, w: 2, d: pg.d + 2, r: 0 }, z + 24.5, 1.5, "#7a5236", { lw: 0.4 })}${slab({ x: pg.x + pg.w - 1, y: pg.y - 1, w: 2, d: pg.d + 2, r: 0 }, z + 24.5, 1.5, "#7a5236", { lw: 0.4 })}${beams.join("")}</g>`);
  // trepadeira (buganvília) na pérgola
  const bug = [];
  for (let i = 0; i < 26; i++) { const [sx, sy] = at([pg.x + ((i * 13) % pg.w), pg.y + ((i * 7) % pg.d), z + 27.5]); bug.push(`<circle cx="${f(sx)}" cy="${f(sy)}" r="${1.6 + (i % 3) * 0.6}" fill="${i % 3 ? "#d6337a" : "#4f8f3f"}" opacity=".9"/>`); }
  add([pg.x + pg.w + 1, pg.y + pg.d + 1, z + 28], `<g>${bug.join("")}</g>`);
  // mesas com guarda-sol listrado
  table(pg.x + 9, pg.y + 12, z, "#fff");
  table(pg.x + 25, pg.y + 12, z, "#fff");
  table(pg.x + 9, pg.y + 30, z, "#fff");
  table(pg.x + 25, pg.y + 30, z, "#fff");
  table(pg.x + 9, pg.y + 47, z, "#fff");
  table(pg.x + 25, pg.y + 47, z, "#fff");
  table(hall.x + 12, fy + 10, z, "#fff", ["#2f6db5", "#ffffff"]);
  table(hall.x + 34, fy + 10, z, "#fff", ["#1fa7a2", "#ffffff"]);
  // luzinhas da pérgola
  const lp = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; lp.push(at([pg.x + 2 + t * (pg.w - 4), pg.y + pg.d * 0.5 + Math.sin(t * Math.PI * 3) * 3, z + 24])); }
  lights.push(lp.map(([sx, sy]) => `<circle class="bulb" cx="${f(sx)}" cy="${f(sy)}" r="1.4"/>`).join(""));
  meta.restaurante = { anchor: at([R0.x, R0.y + 10, z + 46]), focus: at([R0.x + 10, R0.y + 20, z + 10]) };
})();
palm(R0.x - 52, R0.y - 20, 52, [5, -4], 0.3);
palm(R0.x - 48, R0.y + 52, 44, [-3, 5], 1.1);
palm(R0.x + 80, R0.y - 22, 50, [4, -6], 2.0);
bush(R0.x - 46, R0.y + 20, 9);
bush(R0.x - 30, R0.y + 70, 8, "#5a9a44");
bush(R0.x + 70, R0.y + 66, 9);
bush(R0.x + 40, R0.y + 74, 7, "#5a9a44");

// ---------- passarela de madeira (restaurante -> beach club) ----------
const walk = [];
const WX0 = -64, WX1 = 72, WY = -36;
for (let x = WX0; x < WX1; x += 5) walk.push(slab({ x, y: WY - 5, w: 3.8, d: 10, r: 0 }, ZS, 1.2, "#b58b5c", { lw: 0.45, top: "#c99d6b" }));
add([WX0, WY - 5, ZS], `<g class="walkway">${walk.join("")}</g>`);
// degraus da duna até a passarela
add([-72, -8, ZS], slab({ x: -76, y: -12, w: 14, d: 10, r: 0 }, ZS, 3, "#b58b5c", { lw: 0.45 }));
const walk2 = [];
for (let y = -36; y < -10; y += 5) walk2.push(slab({ x: -74, y, w: 10, d: 3.8, r: 0 }, ZS, 1.2, "#b58b5c", { lw: 0.45, top: "#c99d6b" }));
add([-74, -40, ZS], `<g class="walkway">${walk2.join("")}</g>`);

// ---------- CASA 2: Beach Club (na areia) ----------
const B0 = { x: 140, y: -45 };
(function beachClub() {
  const z = ZS;
  const deck = { x: B0.x - 60, y: B0.y - 26, w: 110, d: 62, r: 3 };
  add([deck.x, deck.y, 0], `<g>${slab(deck, z, 4, "#a77b4f", { top: "#bf9161" })}${Array.from({ length: 10 }, (_, i) => line(k.onTop([[deck.x + 3, deck.y + 6 + i * 5.6], [deck.x + deck.w - 3, deck.y + 6 + i * 5.6]], z + 4, P), "#94693f", 0.45)).join("")}</g>`);
  const zd = z + 4;
  // bar/salão com cobertura de palha
  const bar = { x: deck.x + 6, y: deck.y + 4, w: 40, d: 26, r: 1 };
  const parts = [];
  parts.push(slab({ x: bar.x + 2, y: bar.y + 2, w: bar.w - 4, d: 9, r: 1 }, zd, 10, "#f4efe6", { top: "#3b2a1e" }));
  for (const [px, py] of [[bar.x, bar.y], [bar.x + bar.w, bar.y], [bar.x, bar.y + bar.d], [bar.x + bar.w, bar.y + bar.d]]) parts.push(cyl(px, py, 1.3, zd, 22, "#7a5236", { steps: 8, lw: 0.5 }));
  parts.push(slab(k.insetPlan(bar, -4), zd + 22, 2.4, "#c9a25e", { top: "#d6b26e" }));
  parts.push(slab(k.insetPlan(bar, 3), zd + 24.4, 2.4, "#d0aa64", { top: "#dcb877" }));
  parts.push(slab(k.insetPlan(bar, 9), zd + 26.8, 2, "#d6b26e", { top: "#e2c184" }));
  const fringe = k.ringOf(k.insetPlan(bar, -4), 2).filter(([px, py]) => px > bar.x + bar.w - 2 || py > bar.y + bar.d - 2).map(([px, py]) => { const a = at([px, py, zd + 22]); return `M${f(a[0])},${f(a[1])}l0,2.4`; });
  parts.push(line(fringe.join(""), "#8a6a35", 0.7));
  add([bar.x + bar.w, bar.y + bar.d, zd], `<g class="bc-bar">${parts.join("")}</g>`);
  // banquetas
  for (let i = 0; i < 5; i++) add([bar.x + 5 + i * 7, bar.y + 15, zd], cyl(bar.x + 5 + i * 7, bar.y + 15, 1.8, zd, 5, "#f4efe6", { steps: 10, lw: 0.4 }));
  // palco
  const stage = { x: deck.x + 56, y: deck.y + 4, w: 30, d: 20, r: 1 };
  add([stage.x, stage.y, zd], `<g>${slab(stage, zd, 3, "#12284a", { top: "#1b3966" })}${cyl(stage.x + 8, stage.y + 8, 1.2, zd + 3, 9, "#333", { steps: 8, lw: 0.4 })}${slab({ x: stage.x + 16, y: stage.y + 6, w: 8, d: 5, r: 0.5 }, zd + 3, 5, "#222", { lw: 0.4 })}</g>`);
  // mesas com toalha branca
  for (const [dx, dy] of [[14, 40], [30, 40], [46, 40], [62, 40], [78, 40], [94, 30], [94, 46]]) table(deck.x + dx, deck.y + dy, zd, "#f4efe6");
  // varal de luzes sobre o deck
  const poles = [[deck.x + 2, deck.y + 34], [deck.x + deck.w - 2, deck.y + 34], [deck.x + deck.w - 2, deck.y + 58], [deck.x + 2, deck.y + 58]];
  for (const [px, py] of poles) add([px, py, zd], cyl(px, py, 0.8, zd, 26, "#5a4030", { steps: 6, lw: 0.4 }));
  const strand = (a, b, sag = 5, n = 14) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n; o.push(at([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, zd + 26 - Math.sin(Math.PI * t) * sag])); } return o; };
  const s1 = strand(poles[0], poles[1], 6, 18), s2 = strand(poles[1], poles[2], 3, 6), s3 = strand(poles[3], poles[2], 6, 18), s4 = strand(poles[0], poles[3], 3, 6);
  for (const s of [s1, s2, s3, s4]) {
    lights.push(`<polyline class="wire" points="${pts(s)}" fill="none"/>` + s.map(([sx, sy]) => `<circle class="bulb" cx="${f(sx)}" cy="${f(sy)}" r="1.5"/>`).join(""));
  }
  // lanternas de palha no deck
  for (const [dx, dy] of [[8, 58], [100, 58], [100, 8]]) {
    const [sx, sy] = at([deck.x + dx, deck.y + dy, zd + 4]);
    add([deck.x + dx, deck.y + dy, zd], `<g>${cyl(deck.x + dx, deck.y + dy, 2.6, zd, 6, "#c9a25e", { steps: 12, lw: 0.5 })}</g>`);
    lights.push(`<circle class="lantern" cx="${f(sx)}" cy="${f(sy)}" r="3.4"/>`);
  }
  // área de praia: ombrelones de palha + espreguiçadeiras
  const umbs = [[B0.x - 62, B0.y - 22], [B0.x - 34, B0.y - 26], [B0.x - 6, B0.y - 26], [B0.x + 22, B0.y - 26], [B0.x + 50, B0.y - 24]];
  umbs.forEach(([ux, uy], i) => { thatch(ux, uy, z, 15, 11); lounger(ux - 7, uy + 4, z, true, i % 2 ? "#f4efe6" : "#9cc3e6"); lounger(ux + 9, uy + 4, z, true, "#f4efe6"); });
  // cabanas (lounges com cortina)
  for (const [cx, cy] of [[B0.x + 74, B0.y + 10], [B0.x + 74, B0.y + 34]]) {
    const cb = { x: cx - 9, y: cy - 9, w: 18, d: 18, r: 0 };
    const cp = [];
    cp.push(slab(k.insetPlan(cb, 2), z, 3, "#f4efe6"));
    for (const [px, py] of [[cb.x, cb.y], [cb.x + 18, cb.y], [cb.x, cb.y + 18], [cb.x + 18, cb.y + 18]]) cp.push(cyl(px, py, 0.8, z, 20, "#7a5236", { steps: 6, lw: 0.4 }));
    cp.push(slab(k.insetPlan(cb, -1), z + 20, 2, "#c9a25e"));
    cp.push(slab(k.insetPlan(cb, 3), z + 22, 2, "#d6b26e"));
    // cortina off-white
    cp.push(flat([[cb.x + 18, cb.y, z + 20], [cb.x + 18, cb.y + 5, z + 20], [cb.x + 18, cb.y + 4, z + 2], [cb.x + 18, cb.y, z + 2]], "#fffaf0", 'opacity=".9"'));
    cp.push(flat([[cb.x, cb.y + 18, z + 20], [cb.x + 5, cb.y + 18, z + 20], [cb.x + 4, cb.y + 18, z + 2], [cb.x, cb.y + 18, z + 2]], "#fffaf0", 'opacity=".9"'));
    add([cb.x + 18, cb.y + 18, z], `<g class="cabana">${cp.join("")}</g>`);
  }
  // passarela até o mar
  const pier = [];
  for (let y = B0.y - 30; y > COAST - 4; y -= 5) pier.push(slab({ x: B0.x - 5, y: y - 3.8, w: 10, d: 3.8, r: 0 }, z, 1.2, "#b58b5c", { lw: 0.45, top: "#c99d6b" }));
  add([B0.x - 5, COAST, z], `<g class="walkway">${pier.join("")}</g>`);
  canoe(B0.x + 92, B0.y - 26, 30, 7);
  meta["beach-club"] = { anchor: at([B0.x, B0.y, zd + 48]), focus: at([B0.x, B0.y - 10, zd]) };
})();
palm(B0.x - 74, B0.y + 40, 54, [-4, -6], 0.7);
palm(B0.x + 100, B0.y + 40, 48, [6, -4], 1.7);
palm(B0.x + 40, B0.y + 52, 58, [2, -8], 2.6);
bush(B0.x - 50, B0.y + 62, 8);
bush(B0.x + 70, B0.y + 64, 9, "#5a9a44");

// ---------- CASA 3: Café & Bistrô no Shopping Guaratiba ----------
const C0 = { x: 30, y: 120 };
(function cafe() {
  const z = ZL;
  const plaza = { x: C0.x - 72, y: C0.y - 60, w: 150, d: 96, r: 2 };
  add([plaza.x, plaza.y, 0], `<g>${slab(plaza, z, 1.5, "#e8dcc4", { top: "#efe4cf" })}${Array.from({ length: 9 }, (_, i) => line(k.onTop([[plaza.x + 3, plaza.y + 12 + i * 12], [plaza.x + plaza.w - 3, plaza.y + 12 + i * 12]], z + 1.5, P), "#d6c7a8", 0.5)).join("")}</g>`);
  const zp = z + 1.5;
  // edifício do shopping (fundo da praça)
  const mall = { x: C0.x - 66, y: C0.y - 56, w: 142, d: 34, r: 1 };
  const MH = 30;
  const mp = [];
  mp.push(slab(mall, zp, MH, "#f3e7d3", { top: "#f8efe0" }));
  mp.push(slab(k.insetPlan(mall, -1.5), zp + MH, 3, "#e3d2b4"));
  // lojas: vitrines na face +y
  const fy = mall.y + mall.d;
  const units = [
    { x0: mall.x + 4, w: 28, aw: ["#c8362f", "#fff8ee"], cafe: true },
    { x0: mall.x + 4, w: 28, aw: ["#c8362f", "#fff8ee"], cafe: true },
    { x0: mall.x + 38, w: 30, aw: ["#6b7a3a", "#f3e7d3"] },
    { x0: mall.x + 74, w: 30, aw: ["#d9a441", "#f3e7d3"] },
    { x0: mall.x + 110, w: 28, aw: ["#2f6db5", "#f3e7d3"] },
  ].slice(1);
  units[0].w = 30;
  units.forEach((u, i) => {
    const win = [[u.x0, fy + 0.1, zp + 2], [u.x0 + u.w, fy + 0.1, zp + 2], [u.x0 + u.w, fy + 0.1, zp + 17], [u.x0, fy + 0.1, zp + 17]];
    mp.push(flat(win, u.cafe ? "#4a2e22" : "#7f9aa8", `class="win" stroke="${LINE}" stroke-width=".5" stroke-opacity=".5"`));
    lights.push(flat(win, u.cafe ? "#ffcf7a" : "#ffe3a8", `class="glow-win ${u.cafe ? "" : "dim"}"`));
    // toldo
    const a = [u.x0 - 1, fy, zp + 22], b = [u.x0 + u.w + 1, fy, zp + 22], c = [u.x0 + u.w + 1, fy + 9, zp + 18], d = [u.x0 - 1, fy + 9, zp + 18];
    mp.push(stripes(a, b, c, d, u.cafe ? 10 : 8, u.aw[0], u.aw[1]));
    // placa
    mp.push(flat([[u.x0 + 4, fy + 0.1, zp + 24], [u.x0 + u.w - 4, fy + 0.1, zp + 24], [u.x0 + u.w - 4, fy + 0.1, zp + 28], [u.x0 + 4, fy + 0.1, zp + 28]], u.cafe ? "#7a1f2b" : "#d9c9aa"));
  });
  // colunata
  for (let i = 0; i <= 4; i++) mp.push(slab({ x: mall.x + i * 35.5 - 1, y: fy - 1, w: 2.4, d: 2.4, r: 0 }, zp, 30, "#efe2c9", { lw: 0.4 }));
  add([mall.x + mall.w, fy, zp], `<g class="mall">${mp.join("")}</g>`);
  // mesas do café na praça (toalhas xadrez vermelho)
  const cx0 = units[0].x0 + 4;
  for (const [dx, dy] of [[4, 18], [20, 18], [4, 34], [20, 34], [36, 26]]) table(cx0 + dx, fy + dy, zp, "#f4e9dc", ["#c8362f", "#fff8ee"]);
  // limoeiros em vasos
  for (const [lx, ly] of [[cx0 - 6, fy + 52], [cx0 + 46, fy + 50], [mall.x + 120, fy + 46]]) {
    add([lx, ly, zp], `<g>${cyl(lx, ly, 3.6, zp, 5, "#b5653a", { steps: 14, lw: 0.5 })}${cyl(lx, ly, 0.8, zp + 5, 7, "#6b4a2a", { steps: 6, lw: 0.3 })}</g>`);
    const [sx, sy] = at([lx, ly, zp + 15]);
    add([lx + 0.1, ly + 0.1, zp], `<g><circle cx="${f(sx)}" cy="${f(sy)}" r="7.5" fill="#4f8f3f" stroke="#25451f" stroke-width=".6" stroke-opacity=".5"/><circle cx="${f(sx - 2)}" cy="${f(sy - 2)}" r="4.5" fill="#5fa04c"/>${[[-3, 2], [3, -1], [1, 4], [4, 3]].map(([a, b]) => `<circle cx="${f(sx + a)}" cy="${f(sy + b)}" r="1.4" fill="#f2c94c"/>`).join("")}</g>`);
  }
  // luzinhas da praça
  const pa = [cx0 - 4, fy + 12], pb = [cx0 + 46, fy + 12];
  const lp = []; for (let i = 0; i <= 10; i++) { const t = i / 10; lp.push(at([pa[0] + (pb[0] - pa[0]) * t, pa[1] + Math.sin(t * Math.PI) * 4, zp + 20 - Math.sin(t * Math.PI) * 4])); }
  lights.push(`<polyline class="wire" points="${pts(lp)}" fill="none"/>` + lp.map(([sx, sy]) => `<circle class="bulb" cx="${f(sx)}" cy="${f(sy)}" r="1.4"/>`).join(""));
  // xícara gigante? não — mantém real. vaso com buganvília na entrada
  meta["cafe-bistro"] = { anchor: at([units[0].x0 + 15, fy + 4, zp + 36]), focus: at([units[0].x0 + 30, fy + 6, zp + 8]) };
})();
palm(C0.x + 96, C0.y - 66, 50, [3, -5], 0.2);
palm(C0.x - 86, C0.y + 20, 46, [-4, 3], 1.4);
bush(C0.x + 90, C0.y + 20, 9);
bush(C0.x - 70, C0.y + 76, 8, "#5a9a44");
bush(C0.x + 50, C0.y + 76, 8);
// vegetação extra
palm(-200, 110, 50, [4, -3], 0.9); palm(-160, 150, 44, [-3, 4], 1.9); palm(180, 130, 52, [3, -6], 0.4);
palm(-235, -30, 48, [4, -2], 2.2); palm(240, 20, 46, [-3, -4], 1.3); palm(-95, 120, 42, [2, 3], 2.9); palm(-20, 20, 50, [3, -5], 0.6); palm(230, 140, 40, [-2, 2], 1.1);
bush(-170, 90, 10); bush(-120, 100, 8, "#5a9a44"); bush(180, 150, 10); bush(-60, 140, 9); bush(-220, 140, 8);
bush(200, 30, 8, "#5a9a44"); bush(-235, 40, 9); bush(-30, 90, 9); bush(130, 100, 8, "#5a9a44"); bush(-200, 60, 7);

// ---------- vila (casinhas neutras de Guaratiba) ----------
function casinha(x, y, w = 24, d = 20, wall = "#f1ebe0", roof = "#c56a45", door = "#3d7fb8") {
  const z = ZL;
  const b = { x: x - w / 2, y: y - d / 2, w, d, r: 0.5 };
  const o = [slab(b, z, 14, wall, { top: wall })];
  o.push(slab(k.insetPlan(b, -1.5), z + 14, 2.2, roof, { top: mix(roof, "#ffffff", 0.1) }));
  o.push(slab(k.insetPlan(b, 4), z + 16.2, 2, roof, { top: mix(roof, "#ffffff", 0.16) }));
  const fy = b.y + d, fx = b.x + w;
  o.push(flat([[x - 3, fy + 0.1, z], [x + 3, fy + 0.1, z], [x + 3, fy + 0.1, z + 9], [x - 3, fy + 0.1, z + 9]], door));
  const wn = [[fx + 0.1, y - 4, z + 5], [fx + 0.1, y + 4, z + 5], [fx + 0.1, y + 4, z + 10], [fx + 0.1, y - 4, z + 10]];
  o.push(flat(wn, "#5b7d93"));
  lights.push(flat(wn, "#ffd9a0", 'class="glow-win dim"'));
  add([fx, fy, z], `<g class="casinha">${o.join("")}</g>`);
}
casinha(150, 118); casinha(205, 92, 22, 18, "#f4e6cf", "#b85c3c", "#1fa7a2"); casinha(-205, 92, 22, 20, "#eef0ea", "#c56a45", "#c8362f"); casinha(-130, 128, 20, 18, "#f6efe2", "#b85c3c", "#2f6db5");

// ---------- baleia (detalhe escondido: Costa das Baleias) ----------
const [wx, wy] = at([-40, -170, WATER_TOP]);
const whale = `<g id="whale" transform="translate(${f(wx)} ${f(wy)})" tabindex="0" role="button" aria-label="Uma baleia jubarte">
  <g class="whale-body"><path d="M-2,0 C-4,-10 -12,-16 -20,-18 C-14,-12 -8,-10 -4,-6 C-3,-10 -2,-14 0,-16 C2,-14 3,-10 4,-6 C8,-10 14,-12 20,-18 C12,-16 4,-10 2,0 Z" fill="#1f3b52" stroke="#0e2233" stroke-width=".8"/>
  <path d="M-12,-15 C-8,-13 -5,-11 -3,-8" stroke="#fff" stroke-opacity=".5" stroke-width=".8" fill="none"/></g>
  <ellipse class="whale-splash" cx="0" cy="1" rx="12" ry="3" fill="none" stroke="#fff" stroke-width="1.2" stroke-opacity=".8"/>
</g>`;

// ---------- montagem ----------
items.sort((a, b) => a.d - b.d);
const defs = `<defs>
<linearGradient id="seaTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f5c7e"/><stop offset=".55" stop-color="#1a8aa0"/><stop offset="1" stop-color="#3fc1bd"/></linearGradient>
<linearGradient id="seaSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2aa9b4" stop-opacity=".9"/><stop offset="1" stop-color="#0e4a6b" stop-opacity=".95"/></linearGradient>
</defs>`;
const vb = `0 0 ${W} ${H}`;
const base = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="map-svg" role="img" aria-label="Mapa ilustrado da Praia de Guaratiba com as três casas do Sorriso Baiano">${defs}<g class="ground">${ground.join("")}</g><g class="things">${items.map((i) => i.svg).join("")}</g></svg>`;
const animSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="map-anim">${anim.join("")}${whale}</svg>`;
writeFileSync(new URL("../assets/map-anim.svg", import.meta.url), animSvg);
// brilho "assado" no próprio SVG (halo em gradiente) — sem filtro CSS, que pesava na animação da câmera
const halos = [];
const lightsTxt = lights.join("");
for (const m of lightsTxt.matchAll(/<circle class="(bulb|lantern)" cx="([\d.-]+)" cy="([\d.-]+)"/g)) {
  const r = m[1] === "lantern" ? 12 : 6.5;
  halos.push(`<circle cx="${m[2]}" cy="${m[3]}" r="${r}" fill="url(#halo)"/>`);
}
const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="map-lights" aria-hidden="true"><defs><radialGradient id="halo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset=".45" stop-color="#ffb44d" stop-opacity=".35"/><stop offset="1" stop-color="#ffb44d" stop-opacity="0"/></radialGradient></defs><g>${halos.join("")}</g>${lightsTxt}</svg>`;
writeFileSync(new URL("../assets/map-base.svg", import.meta.url), base);
// versões pré-coloridas por hora do dia (mesmas matrizes que antes iam no filtro CSS) — trocar de hora vira um crossfade barato
const MATRIZES = {
  manha: [1.03, 0.03, 0, 0.02, 0, 1.0, 0.02, 0.012, 0, 0, 0.94, 0.012],
  por: [1.02, 0.12, 0, 0.03, 0.05, 0.80, 0.05, 0.01, 0.02, 0.06, 0.62, 0.02],
  noite: [0.20, 0.07, 0.05, 0.012, 0.07, 0.24, 0.09, 0.022, 0.09, 0.19, 0.46, 0.07],
};
for (const [nome, m] of Object.entries(MATRIZES)) {
  const tinge = (h) => {
    let c = h.length === 4 ? "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] : h;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
    const o = [0, 1, 2].map((k) => Math.max(0, Math.min(1, m[k * 4] * r + m[k * 4 + 1] * g + m[k * 4 + 2] * b + m[k * 4 + 3])));
    return "#" + o.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
  };
  const v = base.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, tinge);
  writeFileSync(new URL(`../assets/map-base-${nome}.svg`, import.meta.url), v);
}
writeFileSync(new URL("../assets/map-lights.svg", import.meta.url), lightSvg);
const toPct = ([x, y]) => [+(x / W * 100).toFixed(2), +(y / H * 100).toFixed(2)];
const metaOut = { width: W, height: H };
for (const [key, v] of Object.entries(meta)) metaOut[key] = { anchor: toPct(v.anchor), focus: toPct(v.focus) };
writeFileSync(new URL("../assets/map-meta.json", import.meta.url), JSON.stringify(metaOut, null, 1));
console.log("ok", items.length, "itens,", (base.length / 1024).toFixed(0), "KB", metaOut);
