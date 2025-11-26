// ===================================
// LAZY LOAD MODULE
// Image lazy loading with IntersectionObserver
// ===================================

export class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '200px',
            threshold: options.threshold || 0.01,
            selector: options.selector || 'img.lazy',
            ...options
        };

        this.images = [];
        this.observer = null;

        this.init();
    }

    init() {
        // Check for IntersectionObserver support
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: this.options.rootMargin,
                    threshold: this.options.threshold
                }
            );

            this.loadImages();
        } else {
            // Fallback: load all images immediately
            this.loadAllImages();
        }
    }

    loadImages() {
        // Find all lazy images
        this.images = document.querySelectorAll(this.options.selector);

        this.images.forEach(img => {
            this.observer.observe(img);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (!src) return;

        // Create a new image to load
        const tempImage = new Image();

        tempImage.onload = () => {
            img.src = src;
            if (srcset) {
                img.srcset = srcset;
            }

            img.classList.remove('lazy');
            img.classList.add('loaded');

            // Remove data attributes
            delete img.dataset.src;
            delete img.dataset.srcset;

            // Dispatch custom event
            img.dispatchEvent(new CustomEvent('image-loaded', {
                detail: { src, srcset }
            }));
        };

        tempImage.onerror = () => {
            img.classList.add('error');
            console.error(`Failed to load image: ${src}`);
        };

        // Start loading
        if (srcset) {
            tempImage.srcset = srcset;
        }
        tempImage.src = src;
    }

    loadAllImages() {
        // Fallback for browsers without IntersectionObserver
        const images = document.querySelectorAll(this.options.selector);

        images.forEach(img => {
            const src = img.dataset.src;
            const srcset = img.dataset.srcset;

            if (src) {
                img.src = src;
                if (srcset) {
                    img.srcset = srcset;
                }
                img.classList.remove('lazy');
                img.classList.add('loaded');
            }
        });
    }

    /**
     * Refresh - scan for new lazy images
     */
    refresh() {
        if (this.observer) {
            this.loadImages();
        }
    }

    /**
     * Destroy the observer
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

/**
 * Initialize lazy loading
 */
export function initLazyLoading(options = {}) {
    return new LazyLoader(options);
}

/**
 * Lazy load background images
 */
export function lazyLoadBackgrounds(selector = '.lazy-bg') {
    const elements = document.querySelectorAll(selector);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bgImage = element.dataset.bgImage;

                    if (bgImage) {
                        element.style.backgroundImage = `url(${bgImage})`;
                        element.classList.remove('lazy-bg');
                        observer.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '200px',
            threshold: 0.01
        });

        elements.forEach(el => observer.observe(el));
    } else {
        // Fallback
        elements.forEach(element => {
            const bgImage = element.dataset.bgImage;
            if (bgImage) {
                element.style.backgroundImage = `url(${bgImage})`;
            }
        });
    }
}
