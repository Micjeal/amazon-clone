// ===================================
// CART MODULE
// Shopping cart state management
// ===================================

import { addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart } from './api.js';

class CartManager {
    constructor() {
        this.items = [];
        this.listeners = [];
        this.loadFromStorage();
    }

    /**
     * Load cart from localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem('cart');
            if (data) {
                const cart = JSON.parse(data);
                this.items = cart.items || [];
            }
        } catch (error) {
            console.error('Failed to load cart from storage:', error);
            this.items = [];
        }
    }

    /**
     * Save cart to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify({ items: this.items }));
        } catch (error) {
            console.error('Failed to save cart to storage:', error);
        }
    }

    /**
     * Add item to cart
     */
    async addItem(product, quantity = 1) {
        // Optimistic update
        const existingItem = this.items.find(item => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: `item-${Date.now()}-${Math.random()}`,
                productId: product.id,
                product: product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveToStorage();
        this.notifyListeners('add', product);
        this.updateCartBadge();

        // Sync with backend (in production)
        try {
            await apiAddToCart(product.id, quantity);
        } catch (error) {
            console.error('Failed to sync cart with backend:', error);
            // In production, you might want to rollback the optimistic update
        }

        return this.items;
    }

    /**
     * Update item quantity
     */
    async updateQuantity(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);

        if (!item) {
            throw new Error('Item not found in cart');
        }

        if (quantity <= 0) {
            return this.removeItem(itemId);
        }

        const oldQuantity = item.quantity;
        item.quantity = quantity;

        this.saveToStorage();
        this.notifyListeners('update', item);
        this.updateCartBadge();

        // Sync with backend
        try {
            await apiUpdateCartItem(itemId, quantity);
        } catch (error) {
            console.error('Failed to sync cart update:', error);
            item.quantity = oldQuantity; // Rollback
            this.saveToStorage();
        }

        return this.items;
    }

    /**
     * Remove item from cart
     */
    async removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);

        if (index === -1) {
            throw new Error('Item not found in cart');
        }

        const [removedItem] = this.items.splice(index, 1);

        this.saveToStorage();
        this.notifyListeners('remove', removedItem);
        this.updateCartBadge();

        // Sync with backend
        try {
            await apiRemoveFromCart(itemId);
        } catch (error) {
            console.error('Failed to sync cart removal:', error);
        }

        return this.items;
    }

    /**
     * Clear entire cart
     */
    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.notifyListeners('clear', null);
        this.updateCartBadge();
    }

    /**
     * Get all items
     */
    getItems() {
        return this.items;
    }

    /**
     * Get total item count
     */
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Get cart subtotal
     */
    getSubtotal() {
        return this.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    /**
     * Subscribe to cart changes
     */
    subscribe(callback) {
        this.listeners.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify all listeners of cart changes
     */
    notifyListeners(action, data) {
        this.listeners.forEach(callback => {
            try {
                callback({ action, data, items: this.items });
            } catch (error) {
                console.error('Error in cart listener:', error);
            }
        });
    }

    /**
     * Update cart count badge in header
     */
    updateCartBadge() {
        const badge = document.querySelector('.cart-count');
        if (badge) {
            const count = this.getItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
}

// Create singleton instance
export const cart = new CartManager();

/**
 * Initialize cart functionality
 */
export function initCart() {
    // Update badge on page load
    cart.updateCartBadge();

    // Listen for add-to-cart buttons
    document.addEventListener('click', async (e) => {
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (!addBtn) return;

        e.preventDefault();

        const productId = addBtn.dataset.productId;
        const productData = addBtn.dataset.product;

        if (!productId || !productData) {
            console.error('Missing product data on add-to-cart button');
            return;
        }

        try {
            const product = JSON.parse(productData);

            // Show loading state
            addBtn.disabled = true;
            const originalText = addBtn.textContent;
            addBtn.textContent = 'Adding...';

            await cart.addItem(product);

            // Show success feedback
            addBtn.textContent = 'Added!';
            setTimeout(() => {
                addBtn.textContent = originalText;
                addBtn.disabled = false;
            }, 1500);

            // Show cart modal or notification
            showCartNotification(product);
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            addBtn.disabled = false;
        }
    });

    return cart;
}

/**
 * Show cart notification/modal when item is added
 */
function showCartNotification(product) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
    <div class="alert alert-success" style="position: fixed; top: 80px; right: 20px; z-index: 1100; min-width: 300px; animation: slideDown 300ms ease-out;">
      <strong>Added to cart!</strong><br>
      ${product.title}
    </div>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
