// ===================================
// API MODULE
// Fetch wrappers and data management
// ===================================

// Mock product database
const MOCK_PRODUCTS = [
  {
    id: 'B07X12345',
    title: 'Premium Bluetooth Headphones',
    brand: 'AudioTech',
    category: 'electronics',
    price: 129.99,
    originalPrice: 199.99,
    discount: 35,
    rating: 4.5,
    reviewCount: 2847,
    prime: true,
    inStock: true,
    bestSeller: true,
    description: 'Premium wireless headphones with active noise cancellation',
    specifications: {
      color: 'Black',
      connectivity: 'Bluetooth 5.0',
      batteryLife: '30 hours'
    }
  },
  {
    id: 'B08Y23456',
    title: 'Wireless Gaming Mouse',
    brand: 'GamePro',
    category: 'electronics',
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    rating: 4.7,
    reviewCount: 1532,
    prime: true,
    inStock: true,
    newArrival: true,
    description: 'High-precision wireless gaming mouse with RGB lighting',
    specifications: {
      color: 'Black',
      dpi: '16000',
      buttons: '8 programmable'
    }
  },
  {
    id: 'B09Z34567',
    title: 'Smart Watch Pro',
    brand: 'TechFit',
    category: 'electronics',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    rating: 4.6,
    reviewCount: 3241,
    prime: true,
    inStock: true,
    description: 'Advanced fitness tracker with heart rate monitoring',
    specifications: {
      color: 'Silver',
      display: 'AMOLED',
      waterResistance: '50m'
    }
  },
  {
    id: 'B10A45678',
    title: 'Mechanical Keyboard RGB',
    brand: 'KeyMaster',
    category: 'electronics',
    price: 149.99,
    originalPrice: null,
    discount: 0,
    rating: 4.8,
    reviewCount: 892,
    prime: true,
    inStock: true,
    bestSeller: true,
    description: 'Professional mechanical keyboard with Cherry MX switches',
    specifications: {
      color: 'Black',
      switches: 'Cherry MX Red',
      backlighting: 'RGB'
    }
  },
  {
    id: 'B11B56789',
    title: 'Portable Power Bank 20000mAh',
    brand: 'ChargePlus',
    category: 'electronics',
    price: 39.99,
    originalPrice: 59.99,
    discount: 33,
    rating: 4.4,
    reviewCount: 5621,
    prime: true,
    inStock: true,
    description: 'High-capacity portable charger with fast charging',
    specifications: {
      capacity: '20000mAh',
      ports: '2 USB-A, 1 USB-C',
      fastCharge: 'Yes'
    }
  },
  {
    id: 'B12C67890',
    title: 'Running Shoes Ultralight',
    brand: 'SpeedFit',
    category: 'fashion',
    price: 89.99,
    originalPrice: 129.99,
    discount: 31,
    rating: 4.6,
    reviewCount: 1234,
    prime: true,
    inStock: true,
    description: 'Lightweight running shoes with responsive cushioning',
    specifications: {
      color: 'Blue/White',
      weight: '220g',
      type: 'Running'
    }
  },
  {
    id: 'B13D78901',
    title: 'Coffee Maker Deluxe',
    brand: 'BrewMaster',
    category: 'home',
    price: 119.99,
    originalPrice: 159.99,
    discount: 25,
    rating: 4.5,
    reviewCount: 987,
    prime: true,
    inStock: true,
    bestSeller: true,
    description: 'Programmable coffee maker with thermal carafe',
    specifications: {
      capacity: '12 cups',
      features: 'Programmable, Auto-shutoff',
      color: 'Stainless Steel'
    }
  },
  {
    id: 'B14E89012',
    title: 'The Midnight Library',
    brand: 'Penguin Books',
    category: 'books',
    price: 14.99,
    originalPrice: 19.99,
    discount: 25,
    rating: 4.9,
    reviewCount: 12453,
    prime: true,
    inStock: true,
    bestSeller: true,
    description: 'Bestselling fiction novel by Matt Haig',
    specifications: {
      format: 'Paperback',
      pages: '304',
      language: 'English'
    }
  }
];

// API configuration
const API_CONFIG = {
  baseURL: '/api', // Mock API endpoint
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000
};

/**
 * Generic fetch wrapper with error handling and retry logic
 */
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.retryAttempts) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Fetch products with optional filters
 * @param {Object} filters - { category, minPrice, maxPrice, search, limit }
 * @returns {Promise<Array>}
 */
export async function fetchProducts(filters = {}) {
  // In production, this would be a real API call:
  // return fetchWithRetry(`${API_CONFIG.baseURL}/products`, { 
  //   method: 'POST',
  //   body: JSON.stringify(filters)
  // });

  // Mock implementation with client-side filtering
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...MOCK_PRODUCTS];

      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }

      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
      }

      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
      }

      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }

      resolve(filtered);
    }, 300); // Simulate network delay
  });
}

/**
 * Fetch single product details
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function fetchProductDetail(productId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 200);
  });
}

/**
 * Fetch search suggestions based on query
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function fetchSearchSuggestions(query) {
  if (!query || query.length < 2) {
    return [];
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercaseQuery = query.toLowerCase();
      const suggestions = MOCK_PRODUCTS
        .filter(p => 
          p.title.toLowerCase().includes(lowercaseQuery) ||
          p.category.toLowerCase().includes(lowercaseQuery)
        )
        .map(p => p.title)
        .slice(0, 8);
      
      resolve(suggestions);
    }, 100);
  });
}

/**
 * Add item to cart
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Object>}
 */
export async function addToCart(productId, quantity = 1) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In production, this would sync with backend
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      resolve({
        success: true,
        item: {
          productId,
          quantity,
          product
        }
      });
    }, 200);
  });
}

/**
 * Update cart item quantity
 * @param {string} itemId
 * @param {number} quantity
 * @returns {Promise<Object>}
 */
export async function updateCartItem(itemId, quantity) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        itemId,
        quantity
      });
    }, 150);
  });
}

/**
 * Remove item from cart
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
export async function removeFromCart(itemId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        itemId
      });
    }, 150);
  });
}

/**
 * Get cart contents
 * @returns {Promise<Object>}
 */
export async function getCart() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In production, fetch from backend
      const cartData = localStorage.getItem('cart');
      const cart = cartData ? JSON.parse(cartData) : { items: [] };
      resolve(cart);
    }, 100);
  });
}

/**
 * Get featured deals
 * @returns {Promise<Array>}
 */
export async function getFeaturedDeals() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deals = MOCK_PRODUCTS
        .filter(p => p.discount > 20)
        .slice(0, 6);
      resolve(deals);
    }, 200);
  });
}

/**
 * Get personalized recommendations
 * @returns {Promise<Array>}
 */
export async function getRecommendations() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In production, this would use ML-based recommendations
      const recommendations = [...MOCK_PRODUCTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      resolve(recommendations);
    }, 250);
  });
}

/**
 * Get best sellers
 * @returns {Promise<Array>}
 */
export async function getBestSellers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const bestSellers = MOCK_PRODUCTS
        .filter(p => p.bestSeller)
        .sort((a, b) => b.reviewCount - a.reviewCount);
      resolve(bestSellers);
    }, 200);
  });
}

// Export all products for testing
export const mockProducts = MOCK_PRODUCTS;
