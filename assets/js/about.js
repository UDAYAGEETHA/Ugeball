// --- Particle animation ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
function createParticles(){
  particles = [];
  const count = 50;
  for(let i=0;i<count;i++){
    particles.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      vx:(Math.random()-0.5)*0.6,
      vy:(Math.random()-0.5)*0.6,
      r:1 + Math.random()*2,
      alpha:0.4 + Math.random()*0.6
    });
  }
}
createParticles();

function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<particles.length;i++){
    let p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if(p.x < 0) p.x = canvas.width;
    if(p.x > canvas.width) p.x = 0;
    if(p.y < 0) p.y = canvas.height;
    if(p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,' + p.alpha + ')';
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// --- Word switcher ---
const words = ['Compliance','Transparency','Scale','Engineering Certainty'];
let wi = 0;
const switcherEl = document.getElementById('wordSwitcher');
const sweepEls = document.querySelectorAll('.u-sweep-key');

function switchWord(){
  sweepEls.forEach(s => s.classList.remove('animate'));
  switcherEl.textContent = words[wi];
  // trigger sweep animation slightly after updating word
  setTimeout(()=> {
    sweepEls.forEach((el,i) => setTimeout(()=> el.classList.add('animate'), i*120));
  }, 120);
  wi = (wi + 1) % words.length;
}
switchWord();
setInterval(switchWord, 2200);

// --- Animate badges on intersection ---
const badges = document.querySelectorAll('.badge');
const aboutHero = document.getElementById('aboutHero');

const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      badges.forEach((b,i) => setTimeout(()=> b.classList.add('show'), i*300));
      obs.disconnect();
    }
  });
}, { threshold: 0.25 });

io.observe(aboutHero);



// Small progressive reveal using IntersectionObserver.
// Respects prefers-reduced-motion: if user prefers reduced motion, no JS animation triggers.

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // If element already has animation, don't re-add
        el.style.willChange = 'opacity, transform';
        el.classList.add('in-view');
        // allow CSS animation to run naturally (classes already define animation)
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => {
    // Add a tiny inline delay if element has delay-* class; CSS already handles delay via classes
    io.observe(el);
  });
})();


// script.js
// Adds staggered animation delays to cards and a small accessible enhancement.

document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.card');

  // Apply a small stagger so CSS animation plays in order.
  cards.forEach((card, i) => {
    const delay = 0.15 * (i + 1); // seconds
    card.style.animationDelay = `${delay}s`;
  });

  // Improve keyboard accessibility: pressing Enter toggles a subtle focus transform
  cards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // toggle a class for a quick feedback (no persistent changes)
        card.classList.add('keyboard-press');
        setTimeout(() => card.classList.remove('keyboard-press'), 220);
      }
    });
  });

  // Optional: handle reduced-motion preference (JS fallback)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    cards.forEach(card => {
      card.style.animation = 'none';
      card.style.transform = 'none';
      card.style.opacity = '1';
    });
  }
});




