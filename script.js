/**
 * Links Opener - Open Multiple URLs in New Tabs
 * A clean, Linear-inspired productivity tool
 */

class LinksOpener {
    constructor() {
        this.urlInput = document.getElementById('urlInput');
        this.urlCount = document.getElementById('urlCount');
        this.validCount = document.getElementById('validCount');
        this.openAllBtn = document.getElementById('openAllBtn');
        this.openValidBtn = document.getElementById('openValidBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.urlListSection = document.getElementById('urlListSection');
        this.urlList = document.getElementById('urlList');
        this.togglePreviewBtn = document.getElementById('togglePreviewBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
        this.toast = document.getElementById('toast');
        this.toastMessage = this.toast.querySelector('.toast-message');
        
        this.urls = [];
        this.validUrls = [];
        this.previewVisible = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStats();
        this.loadFromStorage();
    }
    
    bindEvents() {
        // Input events
        this.urlInput.addEventListener('input', () => this.handleInput());
        this.urlInput.addEventListener('paste', (e) => this.handlePaste(e));
        
        // Button events
        this.openAllBtn.addEventListener('click', () => this.openAll());
        this.openValidBtn.addEventListener('click', () => this.openValid());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
        this.togglePreviewBtn.addEventListener('click', () => this.togglePreview());
        this.exampleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadExample();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.validUrls.length > 0) {
                    this.openValid();
                } else if (this.urls.length > 0) {
                    this.openAll();
                }
            }
            
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.clear();
            }
        });
    }
    
    handleInput() {
        this.parseUrls();
        this.updateStats();
        this.updateButtons();
        this.saveToStorage();
        
        if (this.previewVisible) {
            this.renderUrlList();
        }
    }
    
    handlePaste(e) {
        // Let the default paste happen, then process
        setTimeout(() => {
            this.handleInput();
            this.showToast(`Pasted ${this.urls.length} URLs`);
        }, 0);
    }
    
    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const currentValue = this.urlInput.value;
            const newValue = currentValue ? currentValue + '\n' + text : text;
            this.urlInput.value = newValue;
            this.urlInput.focus();
            this.handleInput();
            this.showToast('Pasted from clipboard');
        } catch (err) {
            this.showToast('Failed to paste from clipboard', 'error');
        }
    }
    
    parseUrls() {
        const text = this.urlInput.value.trim();
        
        if (!text) {
            this.urls = [];
            this.validUrls = [];
            return;
        }
        
        // Split by newlines, commas, or spaces
        const rawUrls = text
            .split(/[\n,\s]+/)
            .map(url => url.trim())
            .filter(url => url.length > 0);
        
        this.urls = [...new Set(rawUrls)]; // Remove duplicates
        this.validUrls = this.urls.filter(url => this.isValidUrl(url));
    }
    
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            // Try adding https:// prefix
            try {
                const url = new URL('https://' + string);
                return url.protocol === 'https:';
            } catch (_) {
                return false;
            }
        }
    }
    
    normalizeUrl(url) {
        try {
            new URL(url);
            return url;
        } catch (_) {
            return 'https://' + url;
        }
    }
    
    updateStats() {
        const total = this.urls.length;
        const valid = this.validUrls.length;
        
        this.urlCount.textContent = `${total} URL${total !== 1 ? 's' : ''}`;
        this.validCount.textContent = `${valid} valid`;
        
        // Update valid count color
        if (valid > 0) {
            this.validCount.style.color = 'var(--success)';
        } else {
            this.validCount.style.color = 'var(--text-muted)';
        }
    }
    
    updateButtons() {
        const hasUrls = this.urls.length > 0;
        const hasValid = this.validUrls.length > 0;
        
        this.openAllBtn.disabled = !hasUrls;
        this.openValidBtn.disabled = !hasValid;
        
        // Update preview visibility
        if (hasUrls && !this.previewVisible) {
            this.previewVisible = true;
            this.urlListSection.style.display = 'block';
            this.renderUrlList();
        } else if (!hasUrls) {
            this.previewVisible = false;
            this.urlListSection.style.display = 'none';
        }
    }
    
    renderUrlList() {
        this.urlList.innerHTML = '';
        
        this.urls.forEach((url, index) => {
            const isValid = this.validUrls.includes(url);
            const normalizedUrl = this.normalizeUrl(url);
            
            const li = document.createElement('li');
            li.className = 'url-item';
            li.style.animationDelay = `${index * 0.03}s`;
            
            li.innerHTML = `
                <span class="url-status ${isValid ? 'valid' : 'invalid'}"></span>
                <span class="url-text" title="${normalizedUrl}">${url}</span>
                <button class="btn-icon url-open" title="Open this link" data-url="${normalizedUrl}">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            `;
            
            // Add click handler for individual open
            const openBtn = li.querySelector('.url-open');
            openBtn.addEventListener('click', () => {
                this.openUrl(normalizedUrl);
            });
            
            this.urlList.appendChild(li);
        });
    }
    
    openUrl(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    
    openAll() {
        if (this.urls.length === 0) return;
        
        let openedCount = 0;
        this.urls.forEach(url => {
            const normalizedUrl = this.normalizeUrl(url);
            this.openUrl(normalizedUrl);
            openedCount++;
        });
        
        this.showToast(`Opening ${openedCount} tab${openedCount !== 1 ? 's' : ''}...`);
        
        // Track event
        this.trackEvent('open_all', { count: openedCount });
    }
    
    openValid() {
        if (this.validUrls.length === 0) return;
        
        this.validUrls.forEach(url => {
            const normalizedUrl = this.normalizeUrl(url);
            this.openUrl(normalizedUrl);
        });
        
        this.showToast(`Opening ${this.validUrls.length} valid tab${this.validUrls.length !== 1 ? 's' : ''}...`);
        
        // Track event
        this.trackEvent('open_valid', { count: this.validUrls.length });
    }
    
    clear() {
        this.urlInput.value = '';
        this.urls = [];
        this.validUrls = [];
        this.updateStats();
        this.updateButtons();
        this.saveToStorage();
        this.urlInput.focus();
        this.showToast('Cleared');
    }
    
    togglePreview() {
        this.previewVisible = !this.previewVisible;
        this.urlListSection.style.display = this.previewVisible ? 'block' : 'none';
        this.togglePreviewBtn.textContent = this.previewVisible ? 'Hide' : 'Show';
    }
    
    loadExample() {
        const examples = [
            'https://google.com',
            'https://github.com',
            'https://stackoverflow.com',
            'https://news.ycombinator.com',
            'https://producthunt.com',
            'https://vercel.com',
            'not-a-valid-url',
            'https://linear.app',
            'https://figma.com',
            'another-invalid-link'
        ];
        
        this.urlInput.value = examples.join('\n');
        this.handleInput();
        this.showToast('Loaded example URLs');
    }
    
    showToast(message, type = 'info') {
        this.toastMessage.textContent = message;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('linksOpener_urls', this.urlInput.value);
            localStorage.setItem('linksOpener_timestamp', Date.now());
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('linksOpener_urls');
            if (saved) {
                this.urlInput.value = saved;
                this.handleInput();
            }
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    trackEvent(eventName, data = {}) {
        // Simple console logging for now
        // In production, you might want to use analytics
        console.log(`[Links Opener] ${eventName}:`, data);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LinksOpener();
});

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Could register service worker here for offline support
        console.log('Links Opener loaded successfully');
    });
}