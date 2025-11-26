/* ===================================
   MOBILE INTERACTIONS
   Touch and Mobile-Specific JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Touch-friendly carousel swipe
    const carousel = document.querySelector('.carousel');
    const carouselTrack = document.querySelector('.carousel-track');
    
    if (carousel && carouselTrack) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let currentSlide = 0;
        const totalSlides = 3;
        
        function updateCarousel() {
            const translateX = -currentSlide * (100 / totalSlides);
            carouselTrack.style.transform = `translateX(${translateX}%)`;
            
            // Update indicators
            const indicators = document.querySelectorAll('.carousel-indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }
        
        // Touch events
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
            carouselTrack.style.transition = 'none';
        });
        
        carousel.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            const currentTranslateX = -currentSlide * (100 / totalSlides);
            const newTranslateX = currentTranslateX + (diffX / carousel.offsetWidth) * (100 / totalSlides);
            
            carouselTrack.style.transform = `translateX(${newTranslateX}%)`;
        });
        
        carousel.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            
            isDragging = false;
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            
            const diffX = currentX - startX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            } else {
                updateCarousel();
            }
        });
        
        // Button controls
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        // Indicator controls
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function() {
                currentSlide = index;
                updateCarousel();
            });
        });
        
        // Auto-play (pause on interaction)
        let autoplayInterval;
        
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 6000);
        }
        
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }
        
        // Start autoplay
        startAutoplay();
        
        // Pause on user interaction
        carousel.addEventListener('touchstart', stopAutoplay);
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
    }
    
    // Smooth scrolling for horizontal scrollers
    const horizontalScrollers = document.querySelectorAll('.horizontal-scroller');
    
    horizontalScrollers.forEach(scroller => {
        let isScrolling = false;
        let startX = 0;
        let scrollLeft = 0;
        
        scroller.addEventListener('touchstart', function(e) {
            isScrolling = true;
            startX = e.touches[0].pageX - scroller.offsetLeft;
            scrollLeft = scroller.scrollLeft;
        });
        
        scroller.addEventListener('touchmove', function(e) {
            if (!isScrolling) return;
            e.preventDefault();
            
            const x = e.touches[0].pageX - scroller.offsetLeft;
            const walk = (x - startX) * 2;
            scroller.scrollLeft = scrollLeft - walk;
        });
        
        scroller.addEventListener('touchend', function() {
            isScrolling = false;
        });
    });
    
    // Optimize images for mobile
    function optimizeImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Initialize image optimization
    optimizeImages();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        // Recalculate layouts after orientation change
        setTimeout(() => {
            if (carousel && carouselTrack) {
                updateCarousel();
            }
        }, 100);
    });
    
    // Prevent zoom on double tap for better UX
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Add touch feedback for buttons
    const touchElements = document.querySelectorAll('.btn, .nav-link, .header-action, .cart-icon-wrapper');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        });
        
        element.addEventListener('touchend', function() {
            this.style.opacity = '';
        });
        
        element.addEventListener('touchcancel', function() {
            this.style.opacity = '';
        });
    });
    
    // Viewport height fix for mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    // Performance optimization: Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(function() {
            // Handle scroll-based optimizations here
            const scrollTop = window.pageYOffset;
            
            // Hide/show header on scroll (optional)
            const header = document.querySelector('.header');
            if (header) {
                if (scrollTop > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }
        }, 100);
    });
});