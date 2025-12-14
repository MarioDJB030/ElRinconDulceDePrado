document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('gallery-grid');
    const tabs = document.querySelectorAll('.tab-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');

    // Dynamic Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Default category
    renderGallery('TARTAS'); // Defaulting to TARTAS initially, or GALLETAS if TARTAS is empty? 
    // Since TARTAS is empty in my new file, it will show nothing. 
    // Maybe best to switch default to GALLETAS if TARTAS is empty?
    // But strict adherence to "Add ONLY to GALLETAS" might mean I should just respect the structure.

    // Check if we should default to GALLETAS if we are just testing that
    // renderGallery('GALLETAS'); 

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderGallery(tab.dataset.category);
        });
    });

    // Swipe Support
    function addSwipeListeners(container) {
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true }); // passive to allow scrolling

        container.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swipe Left -> Next
                window.moveSlide({ target: container, stopPropagation: () => { } }, 1);
                // Mocking event object since moveSlide expects one to find closest container
                // Actually moveSlide does event.target.closest...
                // So if I pass container as target it works.
            }
            if (touchEndX > touchStartX + 50) {
                // Swipe Right -> Prev
                window.moveSlide({ target: container, stopPropagation: () => { } }, -1);
            }
        }
    }

    // Render Gallery Function
    function renderGallery(category) {
        grid.innerHTML = '';
        const items = galleryData[category] || [];

        if (items.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">No hay elementos en esta categoría aún.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-item';

            // Check if pattern has multiple images
            const images = item.pattern.split('|');
            let mediaContent = '';

            if (images.length > 1) {
                // Create Carousel
                const slides = images.map((img, index) => `
                    <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                        <img src="REPOSTERIA/${capitalize(category)}/${img.trim()}" alt="${item.title}" onclick="openLightbox(this.src)">
                    </div>
                `).join('');

                mediaContent = `
                    <div class="carousel-container">
                        <div class="carousel-slides">
                            ${slides}
                        </div>
                        <button class="carousel-btn prev" onclick="moveSlide(event, -1)">&#10094;</button>
                        <button class="carousel-btn next" onclick="moveSlide(event, 1)">&#10095;</button>
                        <div class="carousel-indicators">
                            ${images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="currentSlide(event, ${i})"></span>`).join('')}
                        </div>
                    </div>
                `;
            } else {
                // Single Image
                mediaContent = `
                    <div class="img-wrapper">
                        <img src="REPOSTERIA/${capitalize(category)}/${item.pattern}" alt="${item.title}" onclick="openLightbox(this.src)">
                    </div>
                `;
            }

            card.innerHTML = `
                ${mediaContent}
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                </div>
            `;
            grid.appendChild(card);

            // Add swipe listeners if carousel
            if (images.length > 1) {
                const carousel = card.querySelector('.carousel-container');
                addSwipeListeners(carousel);
            }
        });
    }

    // Helper for capitalization
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Lightbox
    window.openLightbox = (src) => {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    };

    closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
});

// Carousel Logic
window.moveSlide = function (event, n) {
    if (event.stopPropagation) event.stopPropagation();

    // Support being called from swipe where target might be the container itself
    const target = event.target || event;
    // If called from button, target is button. closest works.
    // If called from swipe, I passed container as target. closest works (returns itself).

    const container = target.closest('.carousel-container');
    if (!container) return; // Safety

    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.dot');

    let activeIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    let newIndex = (activeIndex + n + slides.length) % slides.length;

    updateCarousel(slides, dots, newIndex);
};

window.currentSlide = function (event, n) {
    event.stopPropagation();
    const container = event.target.closest('.carousel-container');
    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.dot');

    updateCarousel(slides, dots, n);
}

function updateCarousel(slides, dots, index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
}
