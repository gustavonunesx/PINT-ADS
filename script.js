// ─── SCROLL REVEAL ───
const revealEls = document.querySelectorAll('.reveal, .step');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), Number(delay));
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// ─── STAT COUNTERS ───
function animateCounter(el, target, duration = 1800, suffix = '') {
  let start = 0;
  const step = target / (duration / 16);
  const update = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start) + suffix;
    if (start < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.target), 1800, el.dataset.suffix || '');
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => statObserver.observe(el));

// ─── DASHBOARD ANIMATION ───
const dashObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.dash-bar .fill').forEach(bar => {
        bar.style.height = bar.dataset.h;
      });
      document.querySelectorAll('.dp-bar-fill').forEach(fill => {
        fill.style.width = fill.dataset.w;
      });
      dashObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const dashMock = document.querySelector('.dashboard-mock');
if (dashMock) dashObserver.observe(dashMock);

// ─── STAGGER BENEFIT CARDS ───
const benefitsGrid = document.querySelector('.benefits-grid');
if (benefitsGrid) {
  const cards = benefitsGrid.querySelectorAll('.benefit-card');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';
    card.style.transition = 'opacity 0.45s ease, transform 0.45s ease, background 0.22s';
  });

  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 90);
        });
        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  gridObserver.observe(benefitsGrid);
}

// ─── STEP DELAYS ───
document.querySelectorAll('.step').forEach((step, i) => {
  step.style.transitionDelay = `${i * 0.1}s`;
});

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ─── ACTIVE NAV ───
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.style.color = 'var(--text)';
        }
      });
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => navObserver.observe(s));

// ─── PARALLAX GLOW (very subtle) ───
window.addEventListener('scroll', () => {
  const glow = document.querySelector('.hero-glow');
  if (glow) glow.style.transform = `translate(${window.scrollY * 0.04}px, ${window.scrollY * 0.06}px)`;
}, { passive: true });
