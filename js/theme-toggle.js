// Theme Toggle with localStorage Persistence

(function() {
    'use strict';

    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const THEME_KEY = 'ethereal-theme';

    // Initialize theme from localStorage or default to light
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Use saved theme, or fall back to system preference, or default to light
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        setTheme(theme, false);
        
        // Update checkbox to match theme
        if (themeToggle) {
            themeToggle.checked = (theme === 'dark');
        }
        
        console.log('Theme initialized:', theme);
    }

    // Set theme and optionally save to localStorage
    function setTheme(theme, save = true) {
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        
        if (save) {
            localStorage.setItem(THEME_KEY, theme);
            console.log('Theme saved:', theme);
        }
    }

    // Get current theme
    function getCurrentTheme() {
        return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    // Toggle theme (called when checkbox changes)
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        setTheme(newTheme);
    }

    // Add event listener to checkbox
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Listen for system theme changes (optional enhancement)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(THEME_KEY)) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme, false);
            if (themeToggle) {
                themeToggle.checked = e.matches;
            }
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Get navbar height for offset
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navbar
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.padding = '0.75rem 0';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '1rem 0';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Initialize atmospheric particles (subtle effect)
    function createAtmosphericParticles() {
        const atmosphere = document.getElementById('atmosphere');
        if (!atmosphere) return;
        
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.pointerEvents = 'none';
            
            atmosphere.appendChild(particle);
        }
    }

    // Add subtle float animation to particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translate(0, 0); opacity: 0.2; }
            25% { transform: translate(20px, -30px); opacity: 0.4; }
            50% { transform: translate(-10px, -60px); opacity: 0.3; }
            75% { transform: translate(-30px, -40px); opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);

    // Initialize everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            createAtmosphericParticles();
        });
    } else {
        initTheme();
        createAtmosphericParticles();
    }

})();
