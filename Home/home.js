// script.js

/* ---------- Canvas particles ---------- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d', { alpha: true });
let W, H, pts = [], mouse = { x: 0, y: 0, a: 0 };

function sizeCanvas() {
  // Visual size = parent rect; backing store scaled for devicePixelRatio
  const r = canvas.parentElement.getBoundingClientRect();
  canvas.style.width = r.width + 'px';
  canvas.style.height = r.height + 'px';
  W = Math.max(1, Math.floor(r.width * devicePixelRatio));
  H = Math.max(1, Math.floor(r.height * devicePixelRatio));
  canvas.width = W;
  canvas.height = H;
}
window.addEventListener('resize', sizeCanvas, { passive: true });
sizeCanvas();

function spawn(n = 90) {
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4
  }));
}
spawn();

canvas.addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * devicePixelRatio;
  mouse.y = (e.clientY - r.top) * devicePixelRatio;
  mouse.a = 1;
  clearTimeout(mouse._t);
  mouse._t = setTimeout(() => mouse.a = 0, 800);
}, { passive: true });

function step() {
  if (canvas.width !== W || canvas.height !== H) {
    // If DPR changed, re-size buffer & respawn to avoid odd spacing
    sizeCanvas();
    spawn(pts.length);
  }

  ctx.clearRect(0, 0, W, H);

  for (const p of pts) {
    const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = Math.max(60, dx * dx + dy * dy);
    p.vx += (dx / d2) * 6 * mouse.a; p.vy += (dy / d2) * 6 * mouse.a;
    p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy *= .985;
    if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
    if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
  }

  ctx.globalAlpha = .9;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    ctx.fillStyle = 'rgba(13,110,253,.9)';
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j]; const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
      if (d < 120 * devicePixelRatio) {
        ctx.globalAlpha = 1 - d / (120 * devicePixelRatio);
        ctx.strokeStyle = 'rgba(13,110,253,.35)';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
  }

  requestAnimationFrame(step);
}
requestAnimationFrame(step);

/* ---------- Word switcher ---------- */
const switcher = document.getElementById('switcher');
const words = ["Ugeball", "Ambition", "Scale", "Certainty", "Leaders"];
let wi = 0;

setInterval(() => {
  wi = (wi + 1) % words.length;
  switcher.style.transition = 'opacity .14s';
  switcher.style.opacity = 0;
  setTimeout(() => {
    switcher.textContent = words[wi];
    switcher.style.opacity = 1;
  }, 140);
}, 1800);




// about.js - reveal animations and stat count-up

(function () {
  /* Reveal points using IntersectionObserver */
  const points = document.querySelectorAll('.point');
  if ('IntersectionObserver' in window && points.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    points.forEach(p => io.observe(p));
  } else {
    // fallback
    points.forEach(p => p.classList.add('reveal'));
  }

  /* Count-up for numbers with better formatting (supports decimals) */
  const nums = document.querySelectorAll('.who__stats .num');
  if ('IntersectionObserver' in window && nums.length) {
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const toRaw = el.getAttribute('data-to') || '0';
        const to = parseFloat(toRaw);
        const hasDecimal = toRaw.indexOf('.') > -1;
        const duration = 1100; // ms
        let start = null;

        function step(ts) {
          if (!start) start = ts;
          const progress = Math.min(1, (ts - start) / duration);
          const current = to * progress;
          if (hasDecimal) {
            // keep two decimals for percentages like 99.95
            el.textContent = current.toFixed(2);
          } else {
            el.textContent = Math.round(current);
          }
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            // ensure final exact value
            el.textContent = hasDecimal ? to.toFixed(2) : String(Math.round(to));
          }
        }

        requestAnimationFrame(step);
        io2.unobserve(el);
      });
    }, { threshold: 0.35 });

    nums.forEach(n => io2.observe(n));
  } else {
    // fallback: set values immediately
    nums.forEach(el => {
      const toRaw = el.getAttribute('data-to') || '0';
      const to = parseFloat(toRaw);
      const hasDecimal = toRaw.indexOf('.') > -1;
      el.textContent = hasDecimal ? to.toFixed(2) : String(Math.round(to));
    });
  }
})();

// values.js - reveal logic for values tiles (keeps behavior in separate file)

(function(){
  const els = document.querySelectorAll('.value');
  if (!els.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(el => io.observe(el));
  } else {
    // fallback for older browsers
    els.forEach(el => el.classList.add('reveal'));
  }
})();

/* Reveal on scroll */
(function(){
  const els = document.querySelectorAll('#industries .ind');
  if (!('IntersectionObserver' in window)) {
    // Fallback: reveal all if IntersectionObserver not supported
    els.forEach(el => el.classList.add('reveal'));
    return;
  }

  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('reveal');
        io.unobserve(e.target);
      }
    });
  },{threshold:.15});

  els.forEach(el=>io.observe(el));
})();



/* ========== VISION — cycling headline word ========== */
(function(){
  const words = ["Innovation","Scale","Leadership","Enterprises"]; // order/words to cycle
  const el = document.getElementById('cycleWord');
  if (!el) return;

  let i = 0;
  // set initial text explicitly (helps if server-rendered HTML differs)
  el.textContent = words[i];
  el.classList.add('fadeIn');

  function next(){
    el.classList.remove('fadeIn');
    el.classList.add('fadeOut');
    setTimeout(()=>{
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('fadeOut');
      el.classList.add('fadeIn');
    }, 280); // sync with fadeOut
  }

  // run on interval
  const intervalMs = 2600;
  let t = setInterval(next, intervalMs);

  // optional: pause on focus/hover for accessibility
  el.addEventListener('mouseenter', ()=> clearInterval(t));
  el.addEventListener('mouseleave', ()=> t = setInterval(next, intervalMs));

})();


/* ========== CTA Enhancements (optional) ========== */
/* Example: track clicks on CTA for analytics */
document.addEventListener("DOMContentLoaded", () => {
  const ctaBtn = document.querySelector("#cta-simple .cta__btn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
      console.log("CTA clicked → Book a Strategy Session");
      // Optionally send analytics event here
    });
  }
});
