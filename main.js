class DoodlePortfolio {
    constructor() {
        this.apiURL = "https://script.google.com/macros/s/AKfycbxCLN3_jENMomMM46pdoI4_TAVVFhuK4w-EKVpHurgpjV0FQJURnSi85psXQVl5TwM/exec";
        this.projects = [];
        this.certificates = [];
        
        this.init();
        this.setupRevealAnimations();
        this.setupCopyEmail();
        this.setupScribbleCanvas();
        this.loadData();
    }

    async loadData() {
        try {
            console.log("Retrieving sketchbook data... ☁️");
            const response = await fetch(this.apiURL);
            const data = await response.json();
            
            this.projects = data.project || [];
            this.certificates = data.sertifikat || [];
            
            this.renderProjects();
            this.renderCertificates();
            console.log("Doodles synced! ✨", this.projects.length, "Projects found.");
        } catch (error) {
            console.error("Failed to fetch doodles:", error);
            // Fallback content if API fails
            this.projects = [
                { title: 'Offline Workspace', type: 'System', desc: 'Could not reach the sketchbook server. Check your connection!', tech: ['Error-404'] }
            ];
            this.renderProjects();
        }
    }

    init() {
        // Sticky Notes colors
        this.noteColors = ['yellow', 'blue', 'pink'];
        
        // Form Handling
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = contactForm.querySelector('button');
                const originalBtnText = btn.innerText;
                btn.innerText = "Scribbling... ✒️";
                btn.disabled = true;

                // Send via EmailJS (using keys from old portfolio)
                emailjs.sendForm('service_default', 'template_default', contactForm)
                    .then(() => {
                        btn.innerText = "Sent! ✨";
                        contactForm.reset();
                        setTimeout(() => {
                            btn.innerText = originalBtnText;
                            btn.disabled = false;
                        }, 3000);
                    }, (error) => {
                        console.error('FAILED...', error);
                        btn.innerText = "Ink leak! ❌";
                        btn.disabled = false;
                    });
            });
        }

        // Custom Pencil rotation logic (subtle)
        document.addEventListener('mousemove', (e) => {
            const cursor = document.getElementById('doodle-cursor');
            if (cursor) {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
                cursor.style.transform = `translate(-10%, -90%) rotate(${Math.sin(Date.now() * 0.005) * 5}deg)`;
            }
        });

        // Sticky Header Scroll
        const nav = document.getElementById('sketch-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });

        // Mobile Menu Toggle
        const menuToggle = document.getElementById('menu-toggle');
        const navLinks = document.getElementById('nav-links');
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });

            // Close menu when clicking a link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                });
            });
        }

        // Hover wiggle effect for links
        const interactiveElements = document.querySelectorAll('.scribble-hover, .sketch-btn, .sticky-note, .sketch-btn-sm');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => el.style.animation = 'sketchy-vibe 0.5s infinite linear');
            el.addEventListener('mouseleave', () => el.style.animation = '');
        });
    }

    renderProjects() {
        const grid = document.getElementById('sticky-grid');
        if (!grid) return;
        
        grid.innerHTML = this.projects.map((p, index) => {
            const color = this.noteColors[index % this.noteColors.length];
            return `
                <div class="sticky-note ${color} reveal" onclick="openProject(${index})">
                    <div class="tape"></div>
                    <div class="note-img-wrapper">
                        <img src="${p.screenshot || 'project-placeholder.png'}" alt="${p.title}" class="note-img">
                    </div>
                    <h4>${p.title}</h4>
                    <p>${p.desc}</p>
                    <div class="note-meta">${p.type} • ${p.date}</div>
                </div>
            `;
        }).join('');
        
        this.setupRevealAnimations(); // Re-run to catch new elements
    }

    renderCertificates() {
        const container = document.getElementById('cert-gallery');
        if (!container) {
            console.warn("Cert gallery container not found!");
            return;
        }
        
        if (this.certificates.length === 0) {
            container.innerHTML = `<div class="loading-state">Empty sketchbook. Add something!</div>`;
            return;
        }

        container.innerHTML = this.certificates.map(c => {
            // Mapping fields safely in case of API inconsistencies
            const title = c.title || c.Title || "Secret Document";
            const year = c.year || c.Year || "2024";
            const inst = c.institution || c.Institution || "Authorized Entity";
            const tech = c.tech || c.Tech || "";
            const link = c.downloadLink || c.Link || "#";
            const badge = c.badge || c.Badge || "★";

            return `
                <div class="cert-paper reveal">
                    <div class="cert-header">
                        <span class="cert-badge">${badge}</span>
                        <span class="cert-year">${year}</span>
                    </div>
                    <h3>${title}</h3>
                    <p class="cert-inst">${inst}</p>
                    <div class="cert-tech">${tech}</div>
                    <a href="${link}" target="_blank" class="sketch-btn-sm" style="margin-top: auto;">View Certificate</a>
                </div>
            `;
        }).join('');
        
        // Trigger reveal animations for certificates
        this.setupRevealAnimations();
    }

    setupRevealAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    setupProjectOverlay() {
        // Global function for onclick
        window.openProject = (index) => {
            const project = this.projects[index];
            if (!project) return;
            
            const overlay = document.getElementById('project-overlay');
            const body = document.getElementById('project-detail-body');
            
            body.innerHTML = `
                <div class="project-grid-detail">
                    <div class="project-visual-side">
                        <img src="${project.screenshot || 'project-placeholder.png'}" alt="${project.title}" class="project-modal-img">
                    </div>
                    <div class="project-info-side">
                        <div class="project-header-sketch">
                            <h2 style="font-family: var(--font-heading); font-size: 3rem; line-height:1; margin-bottom:1rem;">${project.title}</h2>
                        </div>
                        <div class="detail-block">
                            <h4>[ Project Details ]</h4>
                            <p>${project.desc}</p>
                        </div>
                        <div class="detail-block">
                            <h4>[ Tech Stack ]</h4>
                            <p>${Array.isArray(project.tech) ? project.tech.join(', ') : project.tech}</p>
                        </div>
                        <div class="detail-block">
                            <h4>[ Date ]</h4>
                            <p>${project.date} // ${project.type}</p>
                        </div>
                        
                        <div class="overlay-footer">
                            <a href="${project.github}" target="_blank" class="sketch-btn">View Source</a>
                            <button class="sketch-btn-sm" onclick="closeProject()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            const titleEl = body.querySelector('h2');
            if (titleEl) {
                titleEl.style.animation = 'sketchy-vibe 0.5s infinite linear';
            }
        };

        window.closeProject = () => {
            document.getElementById('project-overlay').style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    setupCopyEmail() {
        const copyEmail = document.getElementById('copy-email-doodle');
        if (copyEmail) {
            copyEmail.addEventListener('click', () => {
                const email = copyEmail.getAttribute('data-email');
                
                // 1. Open mail client
                window.location.href = `mailto:${email}`;
                
                // 2. Also copy to clipboard for convenience
                navigator.clipboard.writeText(email).then(() => {
                    const originalText = copyEmail.innerText;
                    copyEmail.innerText = "Copy & Mail! ✉️";
                    setTimeout(() => copyEmail.innerText = originalText, 2000);
                });
            });
            
            // Add a style to indicate it's a link
            copyEmail.style.cursor = 'pointer';
        }
    }

    setupScribbleCanvas() {
        const canvas = document.getElementById('scribble-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#333';
        };

        window.addEventListener('resize', resize);
        resize();

        let drawing = false;
        const startDrawing = (e) => { drawing = true; draw(e); };
        const stopDrawing = () => { drawing = false; ctx.beginPath(); };
        const draw = (e) => {
            if (!drawing) return;
            
            // Get correct coordinates for both touch and mouse
            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const rect = canvas.getBoundingClientRect();
            const x = (clientX - rect.left);
            const y = (clientY - rect.top);
            
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };
       
        // Prevent scrolling when drawing on touch screens
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); }, { passive: false });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
        window.addEventListener('touchend', stopDrawing);

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDrawing);

        document.getElementById('clear-canvas').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        document.getElementById('save-canvas').addEventListener('click', () => {
            // Create a temporary canvas to add the white background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Fill with white
            tempCtx.fillStyle = '#FFFFFF';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw current art on top
            tempCtx.drawImage(canvas, 0, 0);
            
            // Trigger download
            const link = document.createElement('a');
            link.download = 'my-doodle-masterpiece.png';
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new DoodlePortfolio();
    app.setupProjectOverlay(); // Ensure overlay logic is bound
});
