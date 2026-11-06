let canvas, ctx, parts = [], raf = 0;

function ensure() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.id = "confetti";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
}

export function confetti(n = 140) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  ensure();
  const dpr = devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  const cols = ["#e2531a", "#0b8a76", "#f2b632", "#3d5afe", "#ff6b85"];
  for (let i = 0; i < n; i++) {
    parts.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.65,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 18 - 6,
      s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: cols[i % cols.length], life: 0,
    });
  }
  if (!raf) tick();
}

function tick() {
  const dpr = devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of parts) {
    p.vy += 0.5; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
    ctx.restore();
  }
  parts = parts.filter((p) => p.y < innerHeight + 40 && p.life < 240);
  if (parts.length) raf = requestAnimationFrame(tick);
  else { ctx.clearRect(0, 0, innerWidth, innerHeight); raf = 0; }
}
