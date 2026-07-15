// MAIN SITE INTERACTIVITY & ANIMATION LOGIC

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// DOM Elements
const typingText = document.getElementById('typing-text');
const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const cursorGlow = document.getElementById('cursor-glow');
const cursorDot = document.getElementById('cursor-dot');
const scrollProgressBar = document.getElementById('scroll-progress');
const contactForm = document.getElementById('portfolio-contact-form');
const formStatus = document.getElementById('form-status');

// 2. HERO ENTRANCE ANIMATION
function triggerHeroEntrance() {
  gsap.fromTo('.reveal-item', 
    { opacity: 0, y: 30, filter: "blur(5px)" },
    { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      duration: 1, 
      stagger: 0.15,
      ease: "power3.out",
      onComplete: () => {
        // Start typing animation once hero elements are in
        startTypingLoop();
      }
    }
  );
}

// 3. TYPING REPEATING LOOP
const typingWords = [
  "Founder & CEO of ElevateX Digital Solutions",
  "Creator of NOVA AI Platform",
  "AI & Full-Stack Developer",
  "Student Entrepreneur"
];
let wordIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typingSpeed = 80;

function startTypingLoop() {
  if (!typingText) return;

  const currentWord = typingWords[wordIdx];
  
  if (isDeleting) {
    // Erasing character
    typingText.textContent = currentWord.substring(0, charIdx - 1);
    charIdx--;
    typingSpeed = 30; // Erases faster than it types
  } else {
    // Typing character
    typingText.textContent = currentWord.substring(0, charIdx + 1);
    charIdx++;
    typingSpeed = 80;
  }

  // Handle word boundaries
  if (!isDeleting && charIdx === currentWord.length) {
    // Word fully typed, pause
    typingSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    // Word fully erased, move to next
    isDeleting = false;
    wordIdx = (wordIdx + 1) % typingWords.length;
    typingSpeed = 500; // Pause before typing next word
  }

  setTimeout(startTypingLoop, typingSpeed);
}

// 4. CUSTOM INTERACTIVE CURSOR GLOW
function initCustomCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) {
    // Disable custom cursor dot on mobile/touch screens
    cursorDot.style.display = 'none';
    return;
  }
  
  cursorDot.style.display = 'block';

  document.addEventListener('mousemove', (e) => {
    // Glow follower (handles blur mesh spotlight coordinates)
    gsap.to(cursorGlow, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.6,
      ease: "power2.out"
    });

    // Small sharp dot follower
    gsap.to(cursorDot, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out"
    });

    // Parallax movement for hero background console elements
    const wrapper = document.querySelector('.hero-console-wrapper');
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      
      gsap.to('.console-glow-rays', {
        x: relX * 0.12,
        y: relY * 0.12,
        duration: 0.6,
        ease: "power2.out"
      });
      
      gsap.to('.console-grid-overlay', {
        x: relX * 0.04,
        y: relY * 0.04,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  });

  // Make cursor react to interactive elements hover
  const interactives = document.querySelectorAll('a, button, .sidebar-links li, .project-card, .info-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.width = '24px';
      cursorDot.style.height = '24px';
      cursorDot.style.backgroundColor = 'rgba(6, 182, 212, 0.4)';
      cursorDot.style.border = '1px solid var(--accent-cyan)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.width = '8px';
      cursorDot.style.height = '8px';
      cursorDot.style.backgroundColor = 'var(--text-primary)';
      cursorDot.style.border = 'none';
    });
  });
}

// 5. SCROLL EVENTS: NAVBAR, BACK-TO-TOP & PROGRESS
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  // Update navbar styling
  if (scrollTop > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Update Scroll Progress Bar
  if (scrollProgressBar) {
    scrollProgressBar.style.width = `${scrollPercent}%`;
  }

  // Highlight active section link
  highlightActiveLink();
});

function highlightActiveLink() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  let currentSecId = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    const sectionHeight = section.offsetHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSecId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSecId}`) {
      link.classList.add('active');
    }
  });
}

// 6. MOBILE MENU OVERLAY TOGGLE
if (mobileToggle && navMenu) {
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Close menu on clicking links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });
}

// 7. THEME MODE TOGGLE (DARK & LIGHT)
function initThemeMode() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }

  themeToggle.addEventListener('click', () => {
    const isLightTheme = document.body.classList.contains('light-theme');
    
    if (isLightTheme) {
      // Switch to Dark Theme
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      if (window.updateThreeTheme) window.updateThreeTheme(false);
    } else {
      // Switch to Light Theme
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      if (window.updateThreeTheme) window.updateThreeTheme(true);
    }
  });

  // Synchronize initial background settings in Three.js
  setTimeout(() => {
    const isLightTheme = document.body.classList.contains('light-theme');
    if (window.updateThreeTheme) window.updateThreeTheme(isLightTheme);
  }, 1000);
}

// 8. NOVA AI INTERACTIVE WORKSPACE DASHBOARD
function initDashboardTabs() {
  const tabLinks = document.querySelectorAll('.sidebar-links li');
  const panels = document.querySelectorAll('.dashboard-tab-panel');

  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Toggle sidebar links active state
      tabLinks.forEach(item => item.classList.remove('active'));
      link.classList.add('active');

      // Fetch the selected panel ID
      const selectedTabId = link.getAttribute('data-tab');

      // Hide all panels and animate them back in
      panels.forEach(panel => {
        if (panel.id === selectedTabId) {
          panel.classList.add('active');
          gsap.fromTo(panel, 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
          );

          // Simulated layout generator progress triggers
          if (selectedTabId === 'tab-generator') {
            const fill = panel.querySelector('.progress-fill');
            if (fill) {
              gsap.fromTo(fill, { width: "0%" }, { width: "100%", duration: 1.5, ease: "power1.inOut" });
            }
          }
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

// 9. PROJECT SHADOWS ELEVATION PARALLAX
function initParallaxCards() {
  const projectCards = document.querySelectorAll('.project-card, .about-image-card, .hero-console-card, .cert-card, .vision-banner');
  
  if (window.matchMedia("(pointer: coarse)").matches) return; // Skip mouse parallax tilt on touch

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate rotation factor (tilt effect)
      const tiltX = -y / (rect.height / 10);
      const tiltY = x / (rect.width / 10);

      gsap.to(card, {
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`,
        duration: 0.5,
        ease: "power2.out"
      });
    });
  });
}

// 10. SCROLL REVEALS (GSAP SCROLLTRIGGER)
function initScrollAnimations() {
  const sections = document.querySelectorAll('section');
  
  sections.forEach(sec => {
    // Reveal section headers
    const header = sec.querySelector('.section-header');
    if (header) {
      gsap.fromTo(header, 
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    // Reveal children cards with stagger
    const cards = sec.querySelectorAll('.role-card, .nova-feat-card, .skills-category, .project-card, .timeline-item, .achieve-card, .service-card, .info-card, .contact-form-wrapper');
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { opacity: 0, y: 45, filter: "blur(2px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cards[0],
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  });

  // Animated skills progress bar filling triggers
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const bars = skillsSection.querySelectorAll('.skill-bar');
    
    gsap.fromTo(bars, 
      { width: "0%" },
      {
        width: function(index, target) { return target.getAttribute('data-width'); },
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: skillsSection,
          start: "top 70%",
          toggleActions: "play none none none"
        }
      }
    );
  }
}

// 11. PROJECT FILTERING
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active styling
      filterBtns.forEach(item => item.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
          gsap.fromTo(card, 
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        } else {
          card.style.display = 'none';
        }
      });

      // Refresh ScrollTrigger to recalculate offset positions of items below projects
      ScrollTrigger.refresh();
    });
  });
}

// 12. KONAMI CODE EASTER EGG (GLITCH MATRIX EFFECT)
function initEasterEggs() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let keyIdx = 0;

  document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key === konamiCode[keyIdx]) {
      keyIdx++;
      if (keyIdx === konamiCode.length) {
        triggerGlitchEgg();
        keyIdx = 0;
      }
    } else {
      keyIdx = 0;
    }
  });
}

function triggerGlitchEgg() {
  // Glitch effect overlays
  const glitchOverlay = document.createElement('div');
  glitchOverlay.className = 'glitch-overlay';
  glitchOverlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.9);
    z-index: 999999;
    font-family: 'Space Mono', monospace;
    color: #00ff00;
    padding: 3rem;
    overflow: hidden;
    font-size: 1.5rem;
  `;
  document.body.appendChild(glitchOverlay);

  const consoleLog = (msg, delay) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.textContent = `NOVA_AI@ADMIN:~# ${msg}`;
      glitchOverlay.appendChild(line);
      glitchOverlay.scrollTop = glitchOverlay.scrollHeight;
    }, delay);
  };

  consoleLog("OVERRIDE CODE DETECTED: [KONAMI_EASTER_EGG]", 500);
  consoleLog("INITIALIZING MATRIX DECRYPTION...", 1200);
  consoleLog("HI Rohan! WELCOME TO THE AI SECRET MODE.", 2000);
  consoleLog("DECRYPTING PORTFOLIO SYSTEM SOURCE FILES...", 2800);
  consoleLog("NOVA AI INTEGRITY: 100%", 3600);
  consoleLog("Hacking completed. Closing bypass port...", 4200);

  setTimeout(() => {
    gsap.to(glitchOverlay, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        glitchOverlay.remove();
        alert("🔒 Nova AI Security Bypass Complete. Welcome!");
      }
    });
  }, 5500);
}

// 13. FORM SUBMISSION VIA HIDDEN IFRAME (SILENT BACKGROUND DISPATCH, BYPASSES CORS/BLOCKED HEADERS)
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    // We do NOT call e.preventDefault(), letting the browser natively POST data to the hidden-iframe target
    const btn = document.getElementById('submit-btn');
    const name = document.getElementById('form-name').value;

    btn.disabled = true;
    btn.innerHTML = `<span>Sending Message...</span> <i class="spin-icon" data-lucide="loader"></i>`;
    lucide.createIcons();

    // After a brief delay to allow the browser to initiate the native request, update UI to Success state
    setTimeout(() => {
      btn.innerHTML = `<span>Message Sent</span> <i data-lucide="check"></i>`;
      lucide.createIcons();
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)'; // Success green

      formStatus.style.color = '#10b981';
      formStatus.textContent = `Transmission Confirmed. Thank you ${name}!`;

      // Reset form fields
      contactForm.reset();

      // Restore button status
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `<span>Send Message</span> <i data-lucide="send"></i>`;
        btn.style.background = ''; // restore CSS gradient
        lucide.createIcons();
        formStatus.textContent = '';
      }, 7000);
    }, 1000);
  });
}


// 15. CERTIFICATIONS STATS COUNT-UP
function initCertStatsCounter() {
  const countUpElements = document.querySelectorAll('.count-up');
  if (countUpElements.length === 0) return;

  countUpElements.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
        toggleActions: "play none none none"
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.val);
      }
    });
  });
}

// Dom content loaded entry initialization
window.addEventListener('DOMContentLoaded', () => {
  triggerHeroEntrance();
  initCustomCursor();
  initThemeMode();
  initDashboardTabs();
  initParallaxCards();
  initScrollAnimations();
  initProjectFilters();
  initEasterEggs();
  initCertStatsCounter();
});
