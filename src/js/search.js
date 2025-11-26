// ===================================
// SEARCH MODULE
// Search autocomplete with debouncing
// ===================================

import { fetchSearchSuggestions } from './api.js';

export class SearchAutocomplete {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.suggestionsContainer = options.container || this.createSuggestionsContainer();

        this.options = {
            debounceDelay: options.debounceDelay || 300,
            minChars: options.minChars || 2,
            maxSuggestions: options.maxSuggestions || 8,
            ...options
        };

        this.selectedIndex = -1;
        this.suggestions = [];
        this.debounceTimer = null;

        this.init();
    }

    init() {
        // Event listeners
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('focus', () => this.handleFocus());

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.close();
            }
        });

        // ARIA attributes
        this.input.setAttribute('role', 'combobox');
        this.input.setAttribute('aria-autocomplete', 'list');
        this.input.setAttribute('aria-expanded', 'false');
        this.input.setAttribute('aria-controls', this.suggestionsContainer.id);
    }

    createSuggestionsContainer() {
        const container = document.createElement('div');
        container.className = 'search-suggestions';
        container.id = 'search-suggestions-' + Date.now();
        container.setAttribute('role', 'listbox');

        // Insert after input
        this.input.parentNode.appendChild(container);

        return container;
    }

    handleInput(e) {
        const query = e.target.value.trim();

        // Clear previous timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Debounce the search
        if (query.length >= this.options.minChars) {
            this.debounceTimer = setTimeout(() => {
                this.fetchSuggestions(query);
            }, this.options.debounceDelay);
        } else {
            this.close();
        }
    }

    async fetchSuggestions(query) {
        try {
            this.suggestions = await fetchSearchSuggestions(query);

            if (this.suggestions.length > 0) {
                this.render();
                this.open();
            } else {
                this.close();
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            this.close();
        }
    }

    render() {
        this.suggestionsContainer.innerHTML = '';

        this.suggestions.slice(0, this.options.maxSuggestions).forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.setAttribute('role', 'option');
            item.setAttribute('id', `suggestion-${index}`);

            item.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });

            item.addEventListener('mouseenter', () => {
                this.setSelected(index);
            });

            this.suggestionsContainer.appendChild(item);
        });
    }

    handleKeydown(e) {
        if (!this.isOpen()) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.setSelected(Math.min(this.selectedIndex + 1, this.suggestions.length - 1));
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.setSelected(Math.max(this.selectedIndex - 1, -1));
                break;

            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectSuggestion(this.suggestions[this.selectedIndex]);
                } else {
                    this.submitSearch();
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }

    handleFocus() {
        const query = this.input.value.trim();
        if (query.length >= this.options.minChars && this.suggestions.length > 0) {
            this.open();
        }
    }

    setSelected(index) {
        this.selectedIndex = index;

        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
            item.setAttribute('aria-selected', i === index);
        });

        // Update ARIA
        if (index >= 0) {
            this.input.setAttribute('aria-activedescendant', `suggestion-${index}`);
        } else {
            this.input.removeAttribute('aria-activedescendant');
        }
    }

    selectSuggestion(suggestion) {
        this.input.value = suggestion;
        this.close();
        this.submitSearch();
    }

    submitSearch() {
        // Trigger form submission or custom search event
        const form = this.input.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true }));
        } else {
            this.input.dispatchEvent(new CustomEvent('search-submit', {
                detail: { query: this.input.value }
            }));
        }
    }

    open() {
        this.suggestionsContainer.classList.add('active');
        this.input.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.suggestionsContainer.classList.remove('active');
        this.input.setAttribute('aria-expanded', 'false');
        this.selectedIndex = -1;
    }

    isOpen() {
        return this.suggestionsContainer.classList.contains('active');
    }

    destroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.suggestionsContainer.remove();
    }
}

/**
 * Initialize search autocomplete
 */
export function initSearch(selector = '.search-input') {
    const inputs = document.querySelectorAll(selector);
    const instances = [];

    inputs.forEach(input => {
        const instance = new SearchAutocomplete(input);
        instances.push(instance);
    });

    return instances;
}
