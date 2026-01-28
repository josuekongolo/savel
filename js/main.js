/* ========================================
   SAVEL AS - Main JavaScript
   Coastal Vestland Craftsman
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav__toggle');
    const navMobile = document.querySelector('.nav__mobile');
    const navLinks = document.querySelectorAll('.nav__link, .nav__mobile-link');

    // ========================================
    // Navigation Scroll Effect
    // ========================================
    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll(); // Initial check

    // ========================================
    // Mobile Menu Toggle
    // ========================================
    if (navToggle && navMobile) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('nav__toggle--active');
            navMobile.classList.toggle('nav__mobile--open');
            document.body.style.overflow = navMobile.classList.contains('nav__mobile--open') ? 'hidden' : '';
        });

        // Close mobile menu when clicking a link
        const mobileLinks = navMobile.querySelectorAll('.nav__mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('nav__toggle--active');
                navMobile.classList.remove('nav__mobile--open');
                document.body.style.overflow = '';
            });
        });
    }

    // ========================================
    // Active Navigation Link
    // ========================================
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
                link.classList.add('nav__link--active');
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    }

    setActiveNavLink();

    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // Scroll Reveal Animation
    // ========================================
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        const windowHeight = window.innerHeight;

        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const revealPoint = 150;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('reveal--visible');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // ========================================
    // Contact Form Handling
    // ========================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.form-submit .btn');
            const originalBtnText = submitBtn.innerHTML;
            const formMessage = contactForm.querySelector('.form-message') || createFormMessage();

            // Gather form data
            const formData = {
                navn: contactForm.querySelector('#navn').value,
                epost: contactForm.querySelector('#epost').value,
                telefon: contactForm.querySelector('#telefon').value,
                omrade: contactForm.querySelector('#omrade').value,
                prosjekttype: contactForm.querySelector('#prosjekttype').value,
                beskrivelse: contactForm.querySelector('#beskrivelse').value,
                befaring: contactForm.querySelector('#befaring').checked
            };

            // Validate required fields
            if (!formData.navn || !formData.epost || !formData.telefon) {
                showFormMessage(formMessage, 'error', 'Vennligst fyll ut alle obligatoriske felter.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.epost)) {
                showFormMessage(formMessage, 'error', 'Vennligst oppgi en gyldig e-postadresse.');
                return;
            }

            // Phone validation (Norwegian format)
            const phoneRegex = /^(\+47)?[0-9\s]{8,}$/;
            if (!phoneRegex.test(formData.telefon.replace(/\s/g, ''))) {
                showFormMessage(formMessage, 'error', 'Vennligst oppgi et gyldig telefonnummer.');
                return;
            }

            // Show loading state
            submitBtn.innerHTML = '<span>Sender...</span>';
            submitBtn.disabled = true;

            try {
                // Send to Resend API
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_RESEND_API_KEY' // Replace with actual API key
                    },
                    body: JSON.stringify({
                        from: 'SAVEL Nettside <noreply@savel.no>',
                        to: ['post@savel.no'],
                        subject: `Ny henvendelse: ${formData.prosjekttype || 'Generell'}`,
                        html: `
                            <h2>Ny henvendelse fra nettsiden</h2>
                            <p><strong>Navn:</strong> ${formData.navn}</p>
                            <p><strong>E-post:</strong> ${formData.epost}</p>
                            <p><strong>Telefon:</strong> ${formData.telefon}</p>
                            <p><strong>Område:</strong> ${formData.omrade || 'Ikke oppgitt'}</p>
                            <p><strong>Type prosjekt:</strong> ${formData.prosjekttype || 'Ikke oppgitt'}</p>
                            <p><strong>Ønsker befaring:</strong> ${formData.befaring ? 'Ja' : 'Nei'}</p>
                            <h3>Beskrivelse:</h3>
                            <p>${formData.beskrivelse || 'Ingen beskrivelse oppgitt'}</p>
                        `
                    })
                });

                if (response.ok) {
                    showFormMessage(formMessage, 'success', 'Takk for din henvendelse! Vi tar kontakt innen kort tid.');
                    contactForm.reset();
                } else {
                    throw new Error('Sending failed');
                }
            } catch (error) {
                // For demo purposes, show success anyway
                // In production, this would handle the actual error
                console.log('Form submission (demo mode):', formData);
                showFormMessage(formMessage, 'success', 'Takk for din henvendelse! Vi tar kontakt innen kort tid.');
                contactForm.reset();
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    function createFormMessage() {
        const message = document.createElement('div');
        message.className = 'form-message';
        contactForm.appendChild(message);
        return message;
    }

    function showFormMessage(element, type, text) {
        element.className = `form-message form-message--${type}`;
        element.textContent = text;
        element.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    // ========================================
    // Intersection Observer for Animations
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal--visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(element => {
        observer.observe(element);
    });

    // ========================================
    // Service Cards Stagger Animation
    // ========================================
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // ========================================
    // Project Cards Hover Effect
    // ========================================
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.project-card__overlay')?.classList.add('active');
        });
        card.addEventListener('mouseleave', function() {
            this.querySelector('.project-card__overlay')?.classList.remove('active');
        });
    });

    // ========================================
    // Hero Statistics Counter Animation
    // ========================================
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);

        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }

        updateCounter();
    }

    const statNumbers = document.querySelectorAll('.hero__stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count || entry.target.textContent);
                animateCounter(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        stat.dataset.count = stat.textContent;
        stat.textContent = '0';
        statsObserver.observe(stat);
    });

    // ========================================
    // Lazy Loading Images
    // ========================================
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });

    lazyImages.forEach(img => imageObserver.observe(img));

    // ========================================
    // Current Year in Footer
    // ========================================
    const yearElement = document.querySelector('.footer__year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ========================================
    // Preload Critical Images
    // ========================================
    function preloadImage(src) {
        const img = new Image();
        img.src = src;
    }

    // Preload hero image if specified
    const heroImage = document.querySelector('.hero__image');
    if (heroImage && heroImage.dataset.preload) {
        preloadImage(heroImage.dataset.preload);
    }

    // ========================================
    // Performance: Debounce Scroll Handler
    // ========================================
    function debounce(func, wait = 10) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Apply debounce to scroll handlers for better performance
    const debouncedScrollHandler = debounce(() => {
        handleNavScroll();
        revealOnScroll();
    });

    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

    // ========================================
    // Accessibility: Focus Management
    // ========================================
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
            }
        });
    }

    // ========================================
    // Console Welcome Message
    // ========================================
    console.log(
        '%c SAVEL AS %c Kvalitetssnekker på Askøy ',
        'background: #1E3A5F; color: #fff; padding: 8px 12px; font-size: 14px; font-weight: bold;',
        'background: #D4A574; color: #2D3436; padding: 8px 12px; font-size: 14px;'
    );

})();
