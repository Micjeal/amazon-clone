// ===================================
// CAROUSEL MODULE
// Accessible carousel with keyboard navigation
// ===================================

export class Carousel {
    constructor(element, options = {}) {
        this.element = element;
        this.track = element.querySelector('.carousel-track');
        this.slides = [...this.track.children];
        this.prevBtn = element.querySelector('.carousel-prev');
        this.nextBtn = element.querySelector('.carousel-next');
        this.indicatorsContainer = element.querySelector('.carousel-indicators');

        // Options
        this.options = {
            autoPlay: options.autoPlay !== false,
            interval: options.interval || 6000,
            pauseOnHover: options.pauseOnHover !== false,
            pauseOnFocus: options.pauseOnFocus !== false,
            loop: options.loop !== false,
            ...options
        };

        this.currentSlide = 0;
        this.timer = null;
        this.isPlaying = false;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        // Set up ARIA attributes
        this.element.setAttribute('role', 'region');
        this.element.setAttribute('aria-roledescription', 'carousel');
        this.element.setAttribute('aria-label', this.options.label || 'Image carousel');

        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `${index + 1} of ${this.slides.length}`);
            slide.setAttribute('aria-hidden', index !== 0);
        });

        // Create indicators if container exists
        if (this.indicatorsContainer) {
            this.createIndicators();
        }

        // Event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Keyboard navigation
        this.element.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Pause on hover
        if (this.options.pauseOnHover) {
            this.element.addEventListener('mouseenter', () => this.pause());
            this.element.addEventListener('mouseleave', () => this.play());
        }

        // Pause on focus
        if (this.options.pauseOnFocus) {
            this.element.addEventListener('focusin', () => this.pause());
            this.element.addEventListener('focusout', () => this.play());
        }

        // Auto-play
        if (this.options.autoPlay) {
            this.play();
        }

        // Initial render
        this.goToSlide(0);
    }

    createIndicators() {
        this.indicators = [];
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('carousel-indicator');
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        });
    }

    goToSlide(index, direction = 'forward') {
        if (index < 0 || index >= this.slides.length) return;

        const previousSlide = this.currentSlide;
        this.currentSlide = index;

        // Update track position
        const offset = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${offset}%)`;

        // Update ARIA attributes
        this.slides.forEach((slide, i) => {
            slide.setAttribute('aria-hidden', i !== this.currentSlide);

            // Only allow tabbing to elements in current slide
            if (i === this.currentSlide) {
                slide.querySelectorAll('a, button, input').forEach(el => {
                    el.removeAttribute('tabindex');
                });
            } else {
                slide.querySelectorAll('a, button, input').forEach(el => {
                    el.setAttribute('tabindex', '-1');
                });
            }
        });

        // Update indicators
        if (this.indicators) {
            this.indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === this.currentSlide);
                indicator.setAttribute('aria-selected', i === this.currentSlide);
            });
        }

        // Update button states
        if (!this.options.loop) {
            if (this.prevBtn) {
                this.prevBtn.disabled = this.currentSlide === 0;
            }
            if (this.nextBtn) {
                this.nextBtn.disabled = this.currentSlide === this.slides.length - 1;
            }
        }

        // Announce to screen readers
        this.announceSlide();

        // Trigger custom event
        this.element.dispatchEvent(new CustomEvent('slide-change', {
            detail: {
                previousSlide,
                currentSlide: this.currentSlide,
                direction
            }
        }));
    }

    next() {
        let nextSlide = this.currentSlide + 1;
        if (nextSlide >= this.slides.length) {
            nextSlide = this.options.loop ? 0 : this.slides.length - 1;
        }
        this.goToSlide(nextSlide, 'forward');
    }

    prev() {
        let prevSlide = this.currentSlide - 1;
        if (prevSlide < 0) {
            prevSlide = this.options.loop ? this.slides.length - 1 : 0;
        }
        this.goToSlide(prevSlide, 'backward');
    }

    play() {
        if (this.isPlaying || !this.options.autoPlay) return;

        this.isPlaying = true;
        this.timer = setInterval(() => {
            this.next();
        }, this.options.interval);
    }

    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prev();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.next();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.slides.length - 1);
                break;
        }
    }

    announceSlide() {
        // Create or update live region for screen reader announcements
        let liveRegion = this.element.querySelector('.carousel-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.classList.add('carousel-live-region', 'sr-only');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            this.element.appendChild(liveRegion);
        }

        const currentSlide = this.slides[this.currentSlide];
        const slideLabel = currentSlide.getAttribute('aria-label') ||
            `Slide ${this.currentSlide + 1} of ${this.slides.length}`;
        liveRegion.textContent = slideLabel;
    }

    destroy() {
        this.pause();
        // Remove event listeners and reset DOM
        if (this.prevBtn) {
            this.prevBtn.replaceWith(this.prevBtn.cloneNode(true));
        }
        if (this.nextBtn) {
            this.nextBtn.replaceWith(this.nextBtn.cloneNode(true));
        }
    }
}

/**
 * Initialize all carousels on the page
 */
export function initCarousels(selector = '.carousel') {
    const carousels = document.querySelectorAll(selector);
    const instances = [];

    carousels.forEach(element => {
        const options = {
            autoPlay: element.dataset.autoplay !== 'false',
            interval: parseInt(element.dataset.interval) || 6000,
            loop: element.dataset.loop !== 'false'
        };

        const carousel = new Carousel(element, options);
        instances.push(carousel);
    });

    return instances;
}
