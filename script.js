const themeToggle = document.getElementById("themeToggle");
const scrollTopBtn = document.getElementById("scrollTop");
const revealItems = document.querySelectorAll("[data-reveal]");
const navLinks = document.querySelectorAll(".nav a");

const applyTheme = (theme) => {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
};

const preferredTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

applyTheme(preferredTheme());

themeToggle.addEventListener("click", () => {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const handleScrollTop = () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add("visible");
  } else {
    scrollTopBtn.classList.remove("visible");
  }
};

window.addEventListener("scroll", handleScrollTop);
handleScrollTop();

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector(".brand").addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// 3D Tilt and Hover Effect
const cards = document.querySelectorAll(".glass-card, .stat-card, .profile-card, .timeline-item, .list-card, .skill-marquee");

cards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate position in percentage (0 to 1)
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    
    // Calculate distance from center (0 at center, 1 at edges)
    // We want "hovers a lot" in the middle, so we invert distance logic for scale
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distX = Math.abs(x - centerX) / (rect.width / 2);
    const distY = Math.abs(y - centerY) / (rect.height / 2);
    const distance = Math.sqrt(distX * distX + distY * distY); // Generic distance metric
    
    // Calculate tilt (standard 3D tilt)
    // RotateX: Positive y (bottom) -> negative rotate (tilt down)
    // RotateY: Positive x (right) -> positive rotate (tilt right)
    const tiltX = (0.5 - yPct) * 20; // Max 10 deg tilt
    const tiltY = (xPct - 0.5) * 20;

    // "Hovers a lot in the middle" -> Scale or Lift z-axis
    // Max lift at 0 distance.
    const lift = 10 * (1 - Math.min(distance, 1)); // 10px lift in center

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${lift}px) scale(1.02)`;
    
    // Set mouse position for spotlight effect
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)";
  });

  // Hover Ripple Effect
  card.addEventListener("mouseenter", (e) => {
    // Ripple Effect
    const circle = document.createElement("span");
    const diameter = Math.max(card.clientWidth, card.clientHeight);
    const radius = diameter / 2;

    const rect = card.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    // Set Color based on theme
    const isDark = document.body.classList.contains("dark");
    if (isDark) {
      circle.style.backgroundColor = "rgba(255, 215, 0, 0.5)"; // Gold in Dark Mode
    } else {
      circle.style.backgroundColor = "hsla(262, 83%, 35%, 0.5)"; // Darker Purple in Light Mode
    }

    const ripple = card.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    card.appendChild(circle);

    // Clean up after animation
    setTimeout(() => {
        circle.remove();
    }, 600);
  });
});

/* Universe Background Animation */
const universeCanvas = document.getElementById("universe");
if (universeCanvas) {
  const ctx = universeCanvas.getContext("2d");
  let width, height;

  // Configuration
  const STAR_COUNT = 300; // Increased star count
  const METEOR_CHANCE = 0.04; // Increased probability per frame (more meteors)

  let stars = [];
  let meteors = [];
  // Planets removed
  
  // Helper to check theme
  const isDark = () => document.body.classList.contains("dark");

  class Star {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5; // 0.5 to 2.5px
      this.baseOpacity = Math.random() * 0.5 + 0.1;
      this.opacity = this.baseOpacity;
      this.twinkleFactor = Math.random() * 0.02 + 0.005;
      this.twinkleDir = 1;
      this.speed = Math.random() * 0.2 + 0.05; // Slow drift
    }
    update() {
      // Drift
      this.x -= this.speed;
      if (this.x < 0) {
        this.x = width;
        this.y = Math.random() * height;
      }

      // Twinkle
      this.opacity += this.twinkleFactor * this.twinkleDir;
      if (this.opacity > this.baseOpacity + 0.3 || this.opacity < this.baseOpacity - 0.1) {
        this.twinkleDir *= -1;
      }
    }
    draw() {
      // White in dark mode, dark blue in light mode
      const color = isDark() ? "255, 255, 255" : "30, 30, 60";
      ctx.fillStyle = `rgba(${color}, ${Math.max(0, this.opacity)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Meteor {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width + width * 0.5;
      this.y = Math.random() * height * 0.5; // Start upper half
      this.length = Math.random() * 80 + 20;
      this.speed = Math.random() * 10 + 6;
      this.angle = Math.PI / 4; // 45 degrees
      this.opacity = 1;
      this.active = true;
    }
    update() {
      this.x -= this.speed * Math.cos(this.angle);
      this.y += this.speed * Math.sin(this.angle);
      this.opacity -= 0.015;
      if (this.x < -100 || this.y > height + 100 || this.opacity <= 0) {
        this.active = false;
      }
    }
    draw() {
      if (!this.active) return;
      // Gradient tail
      const gradient = ctx.createLinearGradient(
        this.x, this.y, 
        this.x + this.length * Math.cos(this.angle), 
        this.y - this.length * Math.sin(this.angle)
      );
      const color = isDark() ? "255, 255, 255" : "30, 30, 60";
      gradient.addColorStop(0, `rgba(${color}, ${this.opacity})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x + this.length * Math.cos(this.angle), 
        this.y - this.length * Math.sin(this.angle)
      );
      ctx.stroke();
    }
  }

  const init = () => {
    width = universeCanvas.width = window.innerWidth;
    height = universeCanvas.height = window.innerHeight;
    
    // Initialize Stars
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(s => { s.update(); s.draw(); });

    if (Math.random() < METEOR_CHANCE) {
      meteors.push(new Meteor());
    }
    
    meteors.forEach((m, i) => {
      m.update();
      m.draw();
      if (!m.active) meteors.splice(i, 1);
    });

    requestAnimationFrame(animate);
  };

  window.addEventListener("resize", init);
  init();
  animate();
}
