// Scroll Animations and Effects for Medical Website

// Animate elements on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .testimonial-card, .stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.style.animation = `slideUp 0.6s ease forwards`;
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    elements.forEach(el => observer.observe(el));
};

// Counter animation for stats
const animateCounters = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(number => observer.observe(number));
};

const animateCounter = (element) => {
    const text = element.textContent.trim();
    const isPercentage = text.includes('%');
    const isTime = text.includes('min') || text.includes('/');
    const isYear = text.includes('+');
    
    if (isTime || isYear) {
        // Don't animate these
        return;
    }
    
    let finalValue = parseInt(text) || 0;
    let currentValue = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = finalValue / steps;
    const stepDuration = duration / steps;
    
    const counter = setInterval(() => {
        currentValue += stepValue;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(counter);
        }
        element.textContent = Math.floor(currentValue) + (isPercentage ? '%' : '');
    }, stepDuration);
};

// Parallax effect on hero section
const heroParallax = () => {
    const heroImage = document.querySelector('.hero-image img');
    if (!heroImage) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const heroSection = document.querySelector('.hero');
        
        if (scrollPosition < heroSection.offsetHeight) {
            heroImage.style.transform = `translateY(${scrollPosition * 0.5}px)`;
        }
    });
};

// Hover effects on service cards
const serviceCardHover = () => {
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            cards.forEach(c => {
                if (c !== this) {
                    c.style.opacity = '0.7';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            cards.forEach(c => {
                c.style.opacity = '1';
            });
        });
    });
};

// Form input focus animations
const formInputAnimations = () => {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
};

// Typewriter effect for hero title (optional)
const typewriterEffect = () => {
    const heroTitle = document.querySelector('.hero-content h1');
    if (!heroTitle || heroTitle.classList.contains('typed')) return;
    
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.classList.add('typed');
    
    let index = 0;
    const typeSpeed = 50;
    
    const type = () => {
        if (index < text.length) {
            heroTitle.textContent += text.charAt(index);
            index++;
            setTimeout(type, typeSpeed);
        }
    };
    
    // Start typing after page loads
    setTimeout(type, 300);
};

// Number badge animation
const badgeAnimation = () => {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'slideUp 0.6s ease both';
    });
};

// Floating animation
const createFloatingAnimation = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
};

// Initialize all animations
const initAnimations = () => {
    createFloatingAnimation();
    animateOnScroll();
    animateCounters();
    heroParallax();
    serviceCardHover();
    formInputAnimations();
    badgeAnimation();
    // Uncomment to enable typewriter effect:
    // typewriterEffect();
};

// Run animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}

// Detect if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
}