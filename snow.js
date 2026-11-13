(() => {
  const canvas = document.getElementById("snow-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let width = window.innerWidth;
  let height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  const flakes = [];

  const BASE_FLAKE_COUNT = Math.min(120, Math.floor(width / 10));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    canvas.style.opacity = "1";
  } else {
    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });
  }

  const FLAKE_COUNT = prefersReducedMotion
    ? Math.max(20, Math.floor(BASE_FLAKE_COUNT / 2))
    : BASE_FLAKE_COUNT;

  const GLOBAL_WIND = 0.06;
  const SIZE_SCALE = 1 / 1.5;

  function createFlake() {
    const size = (Math.random() * 2.5 + 1) * SIZE_SCALE;
    const r = Math.random();
    let type;
    if (r < 1 / 3) type = "wind";
    else if (r < 2 / 3) type = "straight";
    else type = "gust";

    const flake = {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: size,
      speedY: 0.5 + size * 0.22,
      phase: Math.random() * Math.PI * 2,
      swayAmplitude: 0.02 + Math.random() * 0.25,
      opacity: 0.45 + Math.random() * 0.8,
      type,
      windFactor: 0,
      windVel: 0
    };

    if (type === "wind") {
      flake.windFactor = 0.3 + Math.random() * 0.4;
    } else if (type === "gust") {
      flake.windVel = (0.4 + Math.random() * 0.6) * GLOBAL_WIND * 3;
    }

    return flake;
  }

  function initFlakes() {
    flakes.length = 0;
    for (let i = 0; i < FLAKE_COUNT; i++) {
      flakes.push(createFlake());
    }
  }

  function resetFlake(flake) {
    flake.x = Math.random() * width;
    flake.y = -flake.radius;
    if (flake.type === "gust") {
      flake.windVel = (0.4 + Math.random() * 0.6) * GLOBAL_WIND * 3;
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener("resize", resize);

  initFlakes();

  let lastTime = performance.now();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) lastTime = performance.now();
  });

  function draw(now) {
    let delta = (now - lastTime) / 16.67;
    lastTime = now;
    if (delta > 3) delta = 1;

    ctx.clearRect(0, 0, width, height);

    for (let flake of flakes) {
      const sway = Math.sin(flake.phase + now * 0.0015) * flake.swayAmplitude;

      let windX = 0;
      if (flake.type === "wind") windX = GLOBAL_WIND * flake.windFactor;
      else if (flake.type === "gust") {
        windX = flake.windVel;
        flake.windVel *= 0.987;
      }

      flake.y += flake.speedY * delta;
      flake.x += (sway + windX) * delta;

      if (flake.y > height + flake.radius) resetFlake(flake);
      if (flake.x < -flake.radius) flake.x = width + flake.radius;
      if (flake.x > width + flake.radius) flake.x = -flake.radius;

      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = flake.radius * 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

