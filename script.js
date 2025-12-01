document.addEventListener('DOMContentLoaded', () => {

    // 0. GLOBALNA INICJALIZACJA
    document.documentElement.classList.remove('no-js');

    // =========================================
    // 1. ANIMACJA "DIGITAL SHUTTERS" (BEZ MRUGANIA)
    // =========================================
    const container = document.getElementById('transition-container');
    
    if (container) {
        // Pobieramy pasy, które już są w HTML (nie generujemy ich, żeby nie mrugało)
        const bars = document.querySelectorAll('.transition-bar');

        // A. ANIMACJA WEJŚCIA (Start Strony)
        // Pasy są ustawione w CSS na translateY(0%) - czyli ZAKRYWAJĄ ekran.
        // My je teraz zrzucamy w dół (odsłaniamy treść).
        
        gsap.to(bars, {
            y: '100%', // Zjazd w dół
            duration: 0.8,
            stagger: 0.05, // Efekt fali
            ease: "power4.inOut",
            delay: 0.2 // Krótkie opóźnienie dla stabilności
        });

        // B. ANIMACJA WYJŚCIA (Kliknięcie w link)
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Ignorujemy puste linki, kotwice, mailto itp.
                if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank') return;

                e.preventDefault();

                // 1. SZYBKI RESET: Przenosimy pasy nad ekran (są niewidoczne, bo strona jest odsłonięta)
                gsap.set(bars, { y: '-100%' });

                // 2. ANIMACJA: Pasy spadają z góry na dół, ZAKRYWAJĄC ekran
                gsap.to(bars, {
                    y: '0%', // Pozycja zakrywająca
                    duration: 0.8,
                    stagger: 0.05,
                    ease: "power4.inOut",
                    onComplete: () => {
                        // Dopiero jak jest czarno, zmieniamy stronę
                        window.location.href = href;
                    }
                });
            });
        });
    }

    // =========================================
    // 2. RESZTA KODU (BEZ ZMIAN)
    // =========================================

    // KURSOR
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const triggers = document.querySelectorAll('a, button, .hover-trigger, .project-item, .filter-btn');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            if (typeof gsap !== 'undefined') {
                gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.15, ease: "power2.out" });
            }
        });
        triggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            trigger.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }

    // SMOOTH SCROLL
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis();
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }

    // PRELOADER
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const progress = document.getElementById('progress-bar');
        const percent = document.getElementById('percent');
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 10;
            if (width > 100) width = 100;
            if (progress) progress.style.width = width + '%';
            if (percent) percent.innerText = Math.floor(width) + '%';
            if (width >= 100) {
                clearInterval(interval);
                // Preloader znika
                gsap.to(preloader, { 
                    opacity: 0, 
                    duration: 0.5, 
                    onComplete: () => {
                        preloader.style.display = 'none';
                        gsap.to(".reveal-text", { opacity: 1, y: 0, duration: 1 });
                    }
                });
            }
        }, 50);
    } else {
        gsap.to(".reveal-text", { opacity: 1, y: 0, duration: 1, delay: 0.2 });
    }

    // CANVAS
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h;
        const particles = [];
        function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
        window.addEventListener('resize', resize); resize();
        class Particle {
            constructor() {
                this.x = Math.random() * w; this.y = Math.random() * h; this.size = Math.random() * 2;
                this.speedX = Math.random() * 1 - 0.5; this.speedY = Math.random() * 1 - 0.5;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if (this.x > w) this.x = 0; if (this.x < 0) this.x = w;
                if (this.y > h) this.y = 0; if (this.y < 0) this.y = h;
            }
            draw() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }
        for (let i = 0; i < 50; i++) particles.push(new Particle());
        function animateCanvas() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(); particles[i].draw();
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        ctx.beginPath(); ctx.strokeStyle = `rgba(0, 255, 163, ${1 - distance/100})`;
                        ctx.lineWidth = 0.5; ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    // CALCULATOR
    const form = document.getElementById('omegaForm');
    if (form) {
        const totalPriceEl = document.getElementById('totalPrice');
        const summaryType = document.getElementById('summaryType');
        const addonsList = document.getElementById('addonsList');
        form.addEventListener('change', updatePrice);
        updatePrice();
        function updatePrice() {
            let price = 0;
            const type = document.querySelector('input[name="projectType"]:checked');
            if (type) {
                price += parseInt(type.dataset.price);
                if(summaryType) summaryType.innerText = type.parentElement.querySelector('.font-bold').innerText;
            }
            if(addonsList) {
                addonsList.innerHTML = '';
                document.querySelectorAll('input[name="addon"]:checked').forEach(addon => {
                    price += parseInt(addon.dataset.price);
                    const div = document.createElement('div');
                    div.innerText = "+ " + addon.parentElement.innerText.trim();
                    addonsList.appendChild(div);
                });
            }
            if(totalPriceEl) {
                gsap.to(totalPriceEl, { innerText: price, duration: 0.5, snap: { innerText: 1 }, onUpdate: function() { this.targets()[0].innerText = Math.ceil(this.targets()[0].innerText) + " PLN"; } });
            }
        }
    }

    // CMD+K
    const cmdModal = document.getElementById('cmdModal');
    if (cmdModal) {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleCmd(); }
            if (e.key === 'Escape') cmdModal.classList.add('hidden');
        });
        function toggleCmd() {
            const content = document.getElementById('cmdContent');
            if (cmdModal.classList.contains('hidden')) {
                cmdModal.classList.remove('hidden');
                gsap.to(content, { scale: 1, opacity: 1, duration: 0.2 });
                cmdModal.querySelector('input').focus();
            } else {
                cmdModal.classList.add('hidden');
                gsap.set(content, { scale: 0.95, opacity: 0 });
            }
        }
    }
    window.copyToClipboard = function(text) { navigator.clipboard.writeText(text); alert('Skopiowano: ' + text); }
    window.toggleFaq = function(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('i');
        if (content.style.height === "0px" || !content.style.height) {
            content.style.height = content.scrollHeight + "px"; icon.classList.add('rotate-45'); icon.style.color = "var(--neon)";
        } else {
            content.style.height = "0px"; icon.classList.remove('rotate-45'); icon.style.color = "white";
        }
    }
    window.openProject = function(id) {
        const modal = document.getElementById('projectModal');
        if (!modal) return;
        const title = document.getElementById('modalTitle');
        if (title) title.innerText = id === 'noir' ? 'Noir Boutique' : 'Arch Studio';
        modal.classList.remove('hidden'); document.body.style.overflow = 'hidden';
    }
    window.closeProject = function() {
        const modal = document.getElementById('projectModal');
        if (modal) modal.classList.add('hidden'); document.body.style.overflow = 'auto';
    }
    const scrollProgress = document.getElementById("scrollProgress");
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            scrollProgress.style.width = scrolled + "%";
        });
    }
    const contrastToggle = document.getElementById('contrastToggle');
    if (contrastToggle) {
        contrastToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('invert');
            document.querySelectorAll('img, video').forEach(el => el.classList.toggle('invert'));
        });
    }
});