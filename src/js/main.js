// ===================================
// MAIN APP
// Application initialization and orchestration
// ===================================

import { initCarousels } from './carousel.js';
import { initLazyLoading } from './lazyload.js';
import { initSearch } from './search.js';
import { initCart } from './cart.js';

// App state
const app = {
    initialized: false,
    carousels: [],
    lazyLoader: null,
    searchInstances: [],
    cart: null
};

/**
 * Initialize the application
 */
function init() {
    if (app.initialized) return;

    console.log('🚀 Initializing ecommerce app...');

    // Initialize lazy loading
    app.lazyLoader = initLazyLoading({
        selector: 'img.lazy',
        rootMargin: '200px'
    });

    // Initialize carousels
    app.carousels = initCarousels('.carousel');

    // Initialize search
    app.searchInstances = initSearch('.search-input');

    // Initialize cart
    app.cart = initCart();

    // Initialize modals
    initModals();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize smooth scroll for anchors
    initSmoothScroll();

    // Mark as initialized
    app.initialized = true;

    console.log('✅ App initialized successfully');
}

/**
 * Initialize modal functionality
 */
function initModals() {
    // Modal triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal-trigger]');
        if (trigger) {
            const modalId = trigger.dataset.modalTrigger;
            openModal(modalId);
        }

        // Modal close buttons
        const closeBtn = e.target.closest('[data-modal-close]');
        if (closeBtn) {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        }

        // Backdrop click
        if (e.target.classList.contains('modal-backdrop')) {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => closeModal(modal.id));
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => closeModal(modal.id));
        }
    });
}

/**
 * Open a modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.querySelector('.modal-backdrop');

    if (!modal) {
        console.error(`Modal not found: ${modalId}`);
        return;
    }

    modal.classList.add('active');
    if (backdrop) {
        backdrop.classList.add('active');
    }

    // Trap focus in modal
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Close a modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.querySelector('.modal-backdrop');

    if (!modal) return;

    modal.classList.remove('active');

    // Only close backdrop if no other modals are open
    const activeModals = document.querySelectorAll('.modal.active');
    if (activeModals.length === 0 && backdrop) {
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('active');
            if (isOpen) {
                mobileMenu.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            } else {
                mobileMenu.classList.add('active');
                hamburgerBtn.setAttribute('aria-expanded', 'true');
            }
        });
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

/**
 * Utility: Format price
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

/**
 * Utility: Calculate discount percentage
 */
export function calculateDiscount(originalPrice, currentPrice) {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Create product card HTML
 */
export function createProductCard(product) {
    const discountPercent = product.discount || calculateDiscount(product.originalPrice, product.price);
    
    // Restore productData for Add to Cart button
    const productData = JSON.stringify(product).replace(/"/g, '&quot;');

    return `
    <article class="product-card" 
             data-product-id="${product.id}"
             data-category="${product.category}"
             data-price="${product.price}"
             data-availability="${product.inStock ? 'in_stock' : 'out_of_stock'}">
      
      <a href="/product/index.html?id=${product.id}" class="product-link">
        <div class="product-image-wrapper">
          ${product.bestSeller || product.newArrival || product.prime ? `
            <div class="product-badge">
              ${product.bestSeller ? '<span class="badge badge-bestseller">BESTSELLER</span>' : ''}
              ${product.prime ? '<span class="badge badge-prime">PRIME</span>' : ''}
              ${product.newArrival ? '<span class="badge badge-new">NEW</span>' : ''}
              ${product.discount > 20 ? '<span class="badge badge-deal">DEAL</span>' : ''}
            </div>
          ` : ''}
          <img
            class="product-image"
            src="${product.imageUrl || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop`}"
            alt="${product.brand} ${product.title}"
            width="400" height="400">
        </div>
        
        <h3 class="product-title">${product.title}</h3>
      </a>
      
      <div class="product-rating">
        <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
        <span class="rating-count">(${product.reviewCount.toLocaleString()})</span>
      </div>
      
      <div class="product-price">
        <span class="price-current">${formatPrice(product.price)}</span>
        ${product.originalPrice ? `
          <span class="price-original">${formatPrice(product.originalPrice)}</span>
          <span class="price-discount">${discountPercent}% off</span>
        ` : ''}
      </div>
      
      ${product.prime ? '<div class="product-shipping">FREE delivery with Prime</div>' : '<div class="product-shipping">FREE delivery Thu, Dec 14</div>'}
      
      <div class="product-actions">
        <button class="btn btn-sm btn-primary" 
                data-add-to-cart
                data-product-id="${product.id}"
                data-product='${productData}'>
          Add to Cart
        </button>
      </div>
    </article>
  `;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export app instance
export { app, openModal, closeModal };
