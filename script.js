// Global variables
let canvas, ctx;
let particles = [];
let cursorParticles = [];
let mouse = { x: 0, y: 0 };
let currentSection = 'home';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initLoader();
    initInteractiveBackground();
    initNavigation();
    initSmoothScrolling();
    initAnimations();
    initSocialIcons();
    initContactForm();
    initIntersectionObserver();
});

// Loading Animation
function initLoader() {
    const loader = document.getElementById('loader');
    
    // Hide loader after 3 seconds
    setTimeout(() => {
        loader.classList.add('hidden');
        // Remove loader from DOM after transition
        setTimeout(() => {
            loader.remove();
        }, 500);
    }, 3000);
}

// Interactive Background
function initInteractiveBackground() {
    canvas = document.getElementById('bgCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    createParticles();
    animateBackground();
    
    // Mouse move event
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Create cursor following particles
        createCursorParticle(e.clientX, e.clientY);
    });
    
    // Resize event
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles() {
    particles = [];
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 10));
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
}

// Create cursor following particles
function createCursorParticle(x, y) {
    // Limit the number of cursor particles
    if (cursorParticles.length > 15) {
        cursorParticles.shift();
    }
    
    // Create new cursor particle
    cursorParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        targetX: x,
        targetY: y,
        size: Math.random() * 3 + 1,
        opacity: 0.8,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        color: {
            r: 102 + Math.random() * 50,
            g: 126 + Math.random() * 50,
            b: 234 + Math.random() * 21
        }
    });
}

function animateBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw background particles
    particles.forEach((particle, index) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Mouse interaction
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += dx * force * 0.001;
            particle.vy += dy * force * 0.001;
        }
        
        // Boundary check
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
        ctx.fill();
        
        // Draw connections
        particles.slice(index + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = `rgba(102, 126, 234, ${0.1 * (1 - distance / 100)})`;
                ctx.stroke();
            }
        });
    });
    
    // Update and draw cursor particles
    cursorParticles.forEach((particle, index) => {
        // Move towards target with some lag
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        
        particle.x += dx * 0.1;
        particle.y += dy * 0.1;
        
        // Add some random movement
        particle.x += (Math.random() - 0.5) * 2;
        particle.y += (Math.random() - 0.5) * 2;
        
        // Update life
        particle.life -= particle.decay;
        particle.opacity = particle.life * 0.8;
        
        // Remove dead particles
        if (particle.life <= 0) {
            cursorParticles.splice(index, 1);
            return;
        }
        
        // Draw cursor particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`;
        ctx.fill();
        
        // Add glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity * 0.2})`;
        ctx.fill();
    });
    
    // Draw connections between cursor particles
    cursorParticles.forEach((particle, index) => {
        cursorParticles.slice(index + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                const opacity = (1 - distance / 50) * particle.opacity * otherParticle.opacity;
                ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${opacity * 0.3})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    });
    
    requestAnimationFrame(animateBackground);
}

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const rocketIndicator = document.querySelector('.rocket-indicator');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Hamburger menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Move rocket indicator
            moveRocketIndicator(link);
            
            // Scroll to section
            scrollToSection(targetSection);
            
            // Close mobile menu
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Initialize rocket position
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
        moveRocketIndicator(activeLink);
    }
}

function moveRocketIndicator(targetLink) {
    const rocketIndicator = document.querySelector('.rocket-indicator');
    const linkRect = targetLink.getBoundingClientRect();
    const navMenuRect = document.querySelector('.nav-menu').getBoundingClientRect();
    
    const targetPosition = linkRect.left - navMenuRect.left + linkRect.width / 2 - 10;
    
    rocketIndicator.classList.add('moving');
    rocketIndicator.style.left = targetPosition + 'px';
    
    setTimeout(() => {
        rocketIndicator.classList.remove('moving');
    }, 500);
}

// Smooth Scrolling
function initSmoothScrolling() {
    // Custom smooth scroll function
    window.scrollToSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 70; // Account for navbar height
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    };
}

// Animations
function initAnimations() {
    // Animate skill bars when they come into view
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
            }
        });
    };
    
    // Initial check
    animateSkillBars();
    
    // Check on scroll
    window.addEventListener('scroll', animateSkillBars);
    
    // Animate list items
    const animateListItems = () => {
        const listItems = document.querySelectorAll('.list-item, .contact-item, .skill-item');
        listItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 100);
            }
        });
    };
    
    window.addEventListener('scroll', animateListItems);
    animateListItems(); // Initial check
}

// Social Icons Animation
function initSocialIcons() {
    const socialIcons = document.querySelectorAll('.social-icon');
    
    socialIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add breaking animation
            icon.classList.add('breaking');
            
            // Create particle effect
            createBreakingEffect(icon);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                icon.classList.remove('breaking');
            }, 600);
            
            // Simulate opening social media (you can replace with actual links)
            const platform = icon.getAttribute('data-platform');
            console.log(`Opening ${platform}...`);
            
            // Example: Open actual social media links
            const socialLinks = {
                github: 'https://github.com',
                linkedin: 'https://linkedin.com',
                twitter: 'https://twitter.com',
                instagram: 'https://instagram.com'
            };
            
            if (socialLinks[platform]) {
                setTimeout(() => {
                    window.open(socialLinks[platform], '_blank');
                }, 300);
            }
        });
    });
}

function createBreakingEffect(icon) {
    const rect = icon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create multiple small particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#667eea';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        document.body.appendChild(particle);
        
        // Animate particle
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                form.reset();
            }, 2000);
        }, 2000);
        
        console.log('Form submitted:', data);
    });
}

// Intersection Observer for section transitions
function initIntersectionObserver() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-70px 0px -70px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                currentSection = sectionId;
                
                // Update active section
                sections.forEach(s => s.classList.remove('active'));
                entry.target.classList.add('active');
                
                // Update active nav link
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                        moveRocketIndicator(link);
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
const debouncedResize = debounce(() => {
    resizeCanvas();
    createParticles();
}, 250);

window.addEventListener('resize', debouncedResize);

// Preload images for better performance
function preloadImages() {
    const images = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize image preloading
preloadImages();

// Add some extra interactive effects
document.addEventListener('mousemove', (e) => {
    // Parallax effect for hero section
    if (currentSection === 'home') {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            
            heroContent.style.transform = `translate(${x * 0.01}px, ${y * 0.01}px)`;
        }
    }
});

// Add scroll-based animations
let ticking = false;

function updateScrollAnimations() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Parallax background
    const bg = document.querySelector('.interactive-background');
    if (bg) {
        bg.style.transform = `translateY(${rate}px)`;
    }
    
    ticking = false;
}

function requestScrollTick() {
    if (!ticking) {
        requestAnimationFrame(updateScrollAnimations);
        ticking = true;
    }
}

window.addEventListener('scroll', requestScrollTick);

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    const sections = ['home', 'about', 'skills', 'projects', 'contact'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
        e.preventDefault();
        scrollToSection(sections[currentIndex + 1]);
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        scrollToSection(sections[currentIndex - 1]);
    }
});

// Add touch gestures for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        const sections = ['home', 'about', 'skills', 'projects', 'contact'];
        const currentIndex = sections.indexOf(currentSection);
        
        if (diff > 0 && currentIndex < sections.length - 1) {
            // Swipe up - next section
            scrollToSection(sections[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe down - previous section
            scrollToSection(sections[currentIndex - 1]);
        }
    }
}