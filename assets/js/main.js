// =====================================================
//  SCROLL PROGRESS BAR
// =====================================================
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const bar = document.getElementById('scrollProgress');
    if (bar) bar.style.width = progress + '%';
}

// =====================================================
//  BACK TO TOP
// =====================================================
const backToTopBtn = document.getElementById('backToTop');

function updateBackToTop() {
    if (!backToTopBtn) return;
    backToTopBtn.classList.toggle('visible', window.scrollY > 300);
}

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =====================================================
//  SHARED SCROLL LISTENER
// =====================================================
window.addEventListener('scroll', function () {
    updateScrollProgress();
    updateBackToTop();
}, { passive: true });

updateScrollProgress();
updateBackToTop();

// =====================================================
//  MOBILE MENU
// =====================================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function () {
        const isOpen = navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        });
    });
}

// =====================================================
//  SMOOTH SCROLL (with header offset)
// =====================================================
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = 64;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
});

// =====================================================
//  CONTACT FORM
// =====================================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = this.querySelector('.form-submit');
        if (!btn) return;
        const original = btn.textContent;
        btn.textContent = 'Sent!';
        btn.disabled = true;
        this.reset();
        setTimeout(function () {
            btn.textContent = original;
            btn.disabled = false;
        }, 3000);
    });
}

// =====================================================
//  A — TYPED HERO SUBTITLE (looping)
// =====================================================
function initTyped() {
    const el = document.getElementById('typed-text');
    if (!el) return;
    const texts = ['Data Engineer', 'Father Of Two', 'Ice Cream Hobbyist', 'Sourdough Adept'];
    let textIndex = 0;
    let i = 0;
    let deleting = false;

    function tick() {
        const text = texts[textIndex];
        if (!deleting) {
            // Typing forward
            el.textContent = text.slice(0, i);
            i++;
            if (i > text.length) {
                // Fully typed — pause 2.5s then start deleting
                deleting = true;
                setTimeout(tick, 2500);
                return;
            }
            setTimeout(tick, 75);
        } else {
            // Deleting backward
            el.textContent = text.slice(0, i);
            i--;
            if (i < 0) {
                // Fully deleted — advance to next string, brief pause then type
                deleting = false;
                i = 0;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(tick, 400);
                return;
            }
            setTimeout(tick, 40);
        }
    }

    setTimeout(tick, 500);
}

// =====================================================
//  B+J — INTERSECTION OBSERVER: FADE-IN + CARD STAGGER + PILLS
// =====================================================
function initIntersectionObserver() {
    // Section-level fade-in
    const sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');

            // Stagger child cards
            var cards = entry.target.querySelectorAll(
                '.project-card, .certification-category, .interest-category'
            );
            cards.forEach(function (card, i) {
                setTimeout(function () { card.classList.add('card-visible'); }, i * 110);
            });

            sectionObserver.unobserve(entry.target);
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in').forEach(function (el) {
        sectionObserver.observe(el);
    });

    // I — Skill pill stagger
    var pillObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.skill-pill, .radar-pill').forEach(function (pill, i) {
                setTimeout(function () { pill.classList.add('pill-visible'); }, i * 45);
            });
            pillObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    var skillPills = document.querySelector('.skill-pills');
    var radarPills = document.querySelector('.radar-pills');
    if (skillPills) pillObserver.observe(skillPills);
    if (radarPills) pillObserver.observe(radarPills);
}

// =====================================================
//  C — ACTIVE NAV LINK TRACKING
// =====================================================
function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('nav ul li a');

    function updateActiveNav() {
        var scrollY = window.scrollY + 100;
        var current = '';
        sections.forEach(function (section) {
            if (scrollY >= section.offsetTop) current = section.getAttribute('id');
        });
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
}

// =====================================================
//  D — 3D CARD TILT
// =====================================================
function initCardTilt() {
    document.querySelectorAll('.project-card, .interest-category').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = this.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            this.style.transition = 'box-shadow 0.3s ease';
            this.style.transform =
                'perspective(800px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 7) + 'deg) translateY(-4px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transition = '';
            this.style.transform = '';
        });
    });
}

// =====================================================
//  E — COPY TO CLIPBOARD
// =====================================================
function initClipboard() {
    var toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.textContent = 'Copied!';
    document.body.appendChild(toast);

    document.querySelectorAll('[data-copy]').forEach(function (el) {
        el.classList.add('copyable');
        el.addEventListener('click', function (e) {
            e.preventDefault();
            var text = this.getAttribute('data-copy');
            navigator.clipboard.writeText(text).then(function () {
                toast.classList.add('visible');
                setTimeout(function () { toast.classList.remove('visible'); }, 2000);
            });
        });
    });
}

// =====================================================
//  G — SECTION DOT NAVIGATION
// =====================================================
function initDotNav() {
    var sectionIds  = ['hero', 'about', 'experience', 'certifications', 'education', 'interests', 'contact'];
    var labels      = ['Home', 'About', 'Experience', 'Certifications', 'Education', 'Interests', 'Contact'];

    var nav = document.createElement('nav');
    nav.id = 'dot-nav';
    nav.setAttribute('aria-label', 'Section navigation');

    var dots = sectionIds.map(function (id, i) {
        var dot = document.createElement('button');
        dot.className = 'dot-nav-item';
        dot.setAttribute('aria-label', 'Go to ' + labels[i]);
        dot.title = labels[i];
        nav.appendChild(dot);

        dot.addEventListener('click', function () {
            var target = document.getElementById(id);
            if (!target) return;
            var offset = id === 'hero' ? 0 : 64;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });

        return dot;
    });

    document.body.appendChild(nav);

    function updateDots() {
        var mid = window.scrollY + window.innerHeight / 2;
        sectionIds.forEach(function (id, i) {
            var section = document.getElementById(id);
            if (!section) return;
            var top = section.offsetTop;
            var bottom = top + section.offsetHeight;
            dots[i].classList.toggle('active', mid >= top && mid < bottom);
        });
    }

    window.addEventListener('scroll', updateDots, { passive: true });
    updateDots();
}

// =====================================================
//  H — HERO MOUSE PARALLAX
// =====================================================
function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var content = hero.querySelector('.hero-content');
    if (!content) return;

    hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        content.style.transform = 'translate(' + (x * 14) + 'px, ' + (y * 9) + 'px)';
    });

    hero.addEventListener('mouseleave', function () {
        content.style.transform = '';
    });
}

// =====================================================
//  ARCHITECTURE MODAL (logic lives in arch-renderer.js)
// =====================================================

// =====================================================
//  INIT
// =====================================================
document.addEventListener('DOMContentLoaded', function () {
    initIntersectionObserver();
    initActiveNav();
    initTyped();
    initCardTilt();
    initClipboard();
    initDotNav();
    initHeroParallax();

    // Architecture modal
    document.querySelectorAll('.arch-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            openArchModal(btn.dataset.project);
        });
    });

    var archModal = document.getElementById('arch-modal');
    archModal.addEventListener('click', function (e) {
        if (e.target === this) closeArchModal();
    });

    document.querySelector('.arch-modal-close').addEventListener('click', closeArchModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeArchModal();
    });
});
