// ===== DOM Elements =====
const navbar = document.querySelector('.navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navLinkItems = document.querySelectorAll('.nav-link');
const leadForm = document.getElementById('leadForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const newsletterForm = document.getElementById('newsletterForm');
const statNumbers = document.querySelectorAll('.stat-number');
const backToTop = document.getElementById('backToTop');
const scrollIndicator = document.querySelector('.scroll-indicator');

// ===== Navigation Toggle (Mobile) =====
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ===== Navbar Scroll Effect =====
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    if (currentScroll > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    
    if (scrollIndicator) {
        if (currentScroll > 100) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.pointerEvents = 'all';
        }
    }
    
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
            navLinkItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    lastScroll = currentScroll;
});

// ===== Back to Top =====
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Animated Counter =====
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    
    const updateCounter = () => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            return;
        }
        element.textContent = current;
        requestAnimationFrame(updateCounter);
    };
    updateCounter();
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => counterObserver.observe(stat));

// ===== Code Window Typing Animation =====
function typeCode() {
    const codeElement = document.querySelector('.code-body code');
    if (!codeElement) return;
    
    const rawText = codeElement.textContent;
    codeElement.innerHTML = '';
    
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    codeElement.appendChild(cursor);
    
    let charIndex = 0;
    let pauseAtEnd = false;
    
    function typeNextChar() {
        if (!pauseAtEnd) {
            if (charIndex < rawText.length) {
                const char = rawText[charIndex];
                const span = document.createElement('span');
                span.textContent = char;
                if (char === '\n') span.innerHTML = '<br>';
                cursor.before(span);
                charIndex++;
                const speed = char === ' ' ? 30 : char === '\n' ? 200 : 40;
                setTimeout(typeNextChar, speed);
            } else {
                pauseAtEnd = true;
                setTimeout(typeNextChar, 2000);
            }
        } else {
            if (charIndex > 0) {
                const spans = codeElement.querySelectorAll('span:not(.typing-cursor)');
                if (spans.length > 0) {
                    spans[spans.length - 1].remove();
                    charIndex--;
                    setTimeout(typeNextChar, 15);
                } else {
                    pauseAtEnd = false;
                    setTimeout(typeNextChar, 500);
                }
            } else {
                pauseAtEnd = false;
                setTimeout(typeNextChar, 500);
            }
        }
    }
    setTimeout(typeNextChar, 1000);
}

const codeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            typeCode();
            codeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const codeWindow = document.querySelector('.code-window');
if (codeWindow) codeObserver.observe(codeWindow);

// ===== Lead Capture Form =====
leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        service: document.getElementById('service').value,
        message: document.getElementById('message').value.trim(),
        consent: document.getElementById('consent').checked ? 'Yes' : 'No',
        access_key: '186a8ba8-2869-45df-88c6-ebedd689405f',
        subject: 'New SankiCoder Lead',
        from_name: 'SankiCoder Website'
    };
    
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log('Web3Forms response:', result);
        
        if (result.success) {
            // Store in localStorage for backup
            const leads = JSON.parse(localStorage.getItem('sankicoder_leads') || '[]');
            leads.push({ ...formData, timestamp: new Date().toISOString() });
            localStorage.setItem('sankicoder_leads', JSON.stringify(leads));
            
            leadForm.querySelector('.btn-full').style.display = 'none';
            formSuccess.style.display = 'block';
        } else {
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        console.error('Submission error:', error);
        // Fallback: save locally and show success
        const leads = JSON.parse(localStorage.getItem('sankicoder_leads') || '[]');
        leads.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem('sankicoder_leads', JSON.stringify(leads));
        
        leadForm.querySelector('.btn-full').style.display = 'none';
        formSuccess.style.display = 'block';
    }
});

// ===== Newsletter Form =====
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    const email = input.value.trim();
    
    if (email) {
        const subscribers = JSON.parse(localStorage.getItem('sankicoder_subscribers') || '[]');
        subscribers.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('sankicoder_subscribers', JSON.stringify(subscribers));
        
        const originalPlaceholder = input.placeholder;
        input.value = '';
        input.placeholder = '✓ Subscribed!';
        input.style.borderColor = '#00cec9';
        setTimeout(() => {
            input.placeholder = originalPlaceholder;
            input.style.borderColor = '';
        }, 3000);
        console.log('Newsletter subscriber:', email);
    }
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Intersection Observer for Scroll Animations =====
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    animateOnScroll.observe(card);
});

// Observe about values
document.querySelectorAll('.value-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    animateOnScroll.observe(item);
});

// Observe about-tech
document.querySelectorAll('.about-tech').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    animateOnScroll.observe(el);
});

// Observe tech items
document.querySelectorAll('.tech-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(15px)';
    item.style.transition = `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
    animateOnScroll.observe(item);
});

// Observe info cards
document.querySelectorAll('.info-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    animateOnScroll.observe(card);
});

// Observe trusted logos
document.querySelectorAll('.trusted-logo').forEach((logo, index) => {
    logo.style.opacity = '0';
    logo.style.transform = 'translateY(20px)';
    logo.style.transition = `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s`;
    animateOnScroll.observe(logo);
});

// ===== Form Input Animations =====
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
    input.addEventListener('focus', function() {
        const label = this.parentElement.querySelector('label');
        if (label) label.style.color = 'var(--primary-light)';
    });
    input.addEventListener('blur', function() {
        const label = this.parentElement.querySelector('label');
        if (label) label.style.color = '';
    });
});

// ===== Console Branding =====
console.log('%c🚀 SankiCoder', 'font-size: 24px; font-weight: bold; color: #6c5ce7;');
console.log('%cAI-Powered Tech Solutions That Scale', 'font-size: 14px; color: #a29bfe;');
console.log('%cInterested in working with us? Visit our contact section!', 'font-size: 12px; color: #b0b0c8;');

// ===== Performance: Lazy load any future images =====
if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}