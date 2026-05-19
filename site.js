        // --- Custom cursor ---
        const cursor = document.getElementById('cursor');
        const ring = document.getElementById('cursorRing');
        let mx = 0, my = 0, rx = 0, ry = 0;

        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

        function animateCursor() {
            cursor.style.left = mx + 'px';
            cursor.style.top = my + 'px';
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.querySelectorAll('a, button, .skill-tag').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '16px';
                cursor.style.height = '16px';
                ring.style.width = '50px';
                ring.style.height = '50px';
                ring.style.opacity = '0.8';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '10px';
                cursor.style.height = '10px';
                ring.style.width = '36px';
                ring.style.height = '36px';
                ring.style.opacity = '0.5';
            });
        });

        // --- Scroll reveal ---
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.querySelectorAll('.skill-bar').forEach(bar => {
                        bar.style.animationPlayState = 'running';
                    });
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.reveal').forEach((el, i) => {
            el.style.transitionDelay = (i % 4) * 0.1 + 's';
            observer.observe(el);
        });

        // --- Active nav link on scroll ---
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        window.addEventListener('scroll', () => {
            const y = window.scrollY + 200;
            sections.forEach(s => {
                if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    const link = document.querySelector(`.nav-links a[href="#${s.id}"]`);
                    if (link) link.classList.add('active');
                }
            });
        });

        // --- Contact form ---
        function handleSubmit(btn) {
            btn.textContent = 'Sending...';
            btn.style.opacity = '0.6';
            setTimeout(() => {
                btn.textContent = 'Message Sent ✓';
                btn.style.borderColor = '#6ee2a0';
                btn.style.color = '#6ee2a0';
                btn.style.opacity = '1';
            }, 1400);
        }