/**
 * Links Opener - Open Multiple URLs in New Tabs
 * With File Upload and Batch Processing
 */

class LinksOpener {
    constructor() {
        // Elements
        this.urlInput = document.getElementById('urlInput');
        this.urlCount = document.getElementById('urlCount');
        this.validCount = document.getElementById('validCount');
        this.openAllBtn = document.getElementById('openAllBtn');
        this.openValidBtn = document.getElementById('openValidBtn');
        this.openBatchBtn = document.getElementById('openBatchBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.batchSettings = document.getElementById('batchSettings');
        this.batchSize = document.getElementById('batchSize');
        this.batchDelay = document.getElementById('batchDelay');
        this.totalBatches = document.getElementById('totalBatches');
        this.batchInfo = document.getElementById('batchInfo');
        this.progressPanel = document.getElementById('progressPanel');
        this.progressCount = document.getElementById('progressCount');
        this.progressFill = document.getElementById('progressFill');
        this.progressBatch = document.getElementById('progressBatch');
        this.progressNext = document.getElementById('progressNext');
        this.cancelBatchBtn = document.getElementById('cancelBatchBtn');
        this.urlListSection = document.getElementById('urlListSection');
        this.urlList = document.getElementById('urlList');
        this.togglePreviewBtn = document.getElementById('togglePreviewBtn');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.deselectAllBtn = document.getElementById('deselectAllBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
        this.toast = document.getElementById('toast');
        this.toastMessage = this.toast.querySelector('.toast-message');
        
        // Modal
        this.batchModal = document.getElementById('batchModal');
        this.batchModalCount = document.getElementById('batchModalCount');
        this.modalBatchSize = document.getElementById('modalBatchSize');
        this.modalTotalBatches = document.getElementById('modalTotalBatches');
        this.modalBatchDelay = document.getElementById('modalBatchDelay');
        this.cancelModalBtn = document.getElementById('cancelModalBtn');
        this.confirmBatchBtn = document.getElementById('confirmBatchBtn');
        
        // State
        this.urls = [];
        this.validUrls = [];
        this.selectedUrls = new Set();
        this.previewVisible = false;
        this.isProcessing = false;
        this.batchAbortController = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStats();
        this.loadFromStorage();
    }
    
    bindEvents() {
        // Text input
        this.urlInput.addEventListener('input', () => this.handleInput());
        this.urlInput.addEventListener('paste', (e) => this.handlePaste(e));
        
        // Buttons
        this.openAllBtn.addEventListener('click', () => this.openAll());
        this.openValidBtn.addEventListener('click', () => this.openValid());
        this.openBatchBtn.addEventListener('click', () => this.showBatchModal());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
        this.togglePreviewBtn.addEventListener('click', () => this.togglePreview());
        this.selectAllBtn.addEventListener('click', () => this.selectAll());
        this.deselectAllBtn.addEventListener('click', () => this.deselectAll());
        this.exampleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadExample();
        });
        
        // File upload
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Batch settings
        this.batchSize.addEventListener('change', () => this.updateBatchInfo());
        this.batchDelay.addEventListener('change', () => this.updateBatchInfo());
        
        // Modal
        this.cancelModalBtn.addEventListener('click', () => this.hideBatchModal());
        this.confirmBatchBtn.addEventListener('click', () => this.startBatchProcessing());
        this.batchModal.querySelector('.modal-overlay').addEventListener('click', () => this.hideBatchModal());
        
        // Progress
        this.cancelBatchBtn.addEventListener('click', () => this.cancelBatch());
        
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
            
            if (e.key === 'Escape') {
                this.hideBatchModal();
            }
        });
    }
    
    // File Upload Handlers
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }
    
    processFile(file) {
        const allowedTypes = ['.txt', '.csv', '.json', '.md'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            this.showToast('Invalid file type. Please use .txt, .csv, .json, or .md', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseFileContent(content, fileExtension);
        };
        reader.onerror = () => {
            this.showToast('Error reading file', 'error');
        };
        reader.readAsText(file);
    }
    
    parseFileContent(content, fileExtension) {
        let urls = [];
        
        try {
            if (fileExtension === '.json') {
                const json = JSON.parse(content);
                // Handle different JSON structures
                if (Array.isArray(json)) {
                    urls = json.filter(item => typeof item === 'string');
                } else if (json.urls && Array.isArray(json.urls)) {
                    urls = json.urls;
                } else if (json.links && Array.isArray(json.links)) {
                    urls = json.links;
                }
            } else if (fileExtension === '.csv') {
                // Parse CSV - split by newlines and commas
                urls = content
                    .split(/[\n,]+/)
                    .map(url => url.trim().replace(/^["']|["']$/g, '')) // Remove quotes
                    .filter(url => url.length > 0);
            } else {
                // .txt and .md - split by newlines
                urls = content
                    .split('\n')
                    .map(url => url.trim())
                    .filter(url => url.length > 0);
            }
            
            // Filter out empty lines and comments (lines starting with #)
            urls = urls.filter(url => url.length > 0 && !url.startsWith('#'));
            
            // Add to textarea
            const currentValue = this.urlInput.value;
            const separator = currentValue && !currentValue.endsWith('\n') ? '\n' : '';
            this.urlInput.value = currentValue + separator + urls.join('\n');
            
            this.handleInput();
            this.showToast(`Loaded ${urls.length} URLs from file`);
        } catch (error) {
            this.showToast('Error parsing file: ' + error.message, 'error');
        }
    }
    
    // Input Handlers
    handleInput() {
        this.parseUrls();
        this.updateStats();
        this.updateButtons();
        this.updateBatchInfo();
        this.saveToStorage();
        
        if (this.urls.length > 0) {
            this.renderUrlList();
        }
    }
    
    handlePaste(e) {
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
            this.selectedUrls.clear();
            return;
        }
        
        // Split by newlines, commas, or spaces
        const rawUrls = text
            .split(/[\n,\s]+/)
            .map(url => url.trim())
            .filter(url => url.length > 0);
        
        this.urls = [...new Set(rawUrls)]; // Remove duplicates
        this.validUrls = this.urls.filter(url => this.isValidUrl(url));
        
        // Select all by default
        this.selectedUrls = new Set(this.urls);
    }
    
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
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
        
        if (valid > 0) {
            this.validCount.style.color = 'var(--success)';
        } else {
            this.validCount.style.color = 'var(--text-muted)';
        }
    }
    
    updateBatchInfo() {
        const selectedCount = this.selectedUrls.size;
        const batchSize = parseInt(this.batchSize.value) || 10;
        const totalBatches = Math.ceil(selectedCount / batchSize);
        
        this.totalBatches.textContent = totalBatches;
        this.batchInfo.textContent = `${totalBatches} batch${totalBatches !== 1 ? 'es' : ''}`;
    }
    
    updateButtons() {
        const hasUrls = this.urls.length > 0;
        const hasValid = this.validUrls.length > 0;
        const hasSelected = this.selectedUrls.size > 0;
        
        this.openAllBtn.disabled = !hasUrls;
        this.openValidBtn.disabled = !hasValid;
        this.openBatchBtn.disabled = !hasSelected;
        
        // Show batch settings
        if (hasUrls) {
            this.batchSettings.style.display = 'block';
            this.updateBatchInfo();
        } else {
            this.batchSettings.style.display = 'none';
        }
        
        // Show URL list
        if (hasUrls) {
            this.previewVisible = true;
            this.urlListSection.style.display = 'block';
        } else {
            this.previewVisible = false;
            this.urlListSection.style.display = 'none';
        }
    }
    
    renderUrlList() {
        this.urlList.innerHTML = '';
        
        this.urls.forEach((url, index) => {
            const isValid = this.validUrls.includes(url);
            const isSelected = this.selectedUrls.has(url);
            const normalizedUrl = this.normalizeUrl(url);
            
            const li = document.createElement('li');
            li.className = 'url-item';
            li.style.animationDelay = `${index * 0.03}s`;
            
            li.innerHTML = `
                <input type="checkbox" class="url-checkbox" ${isSelected ? 'checked' : ''} data-url="${url}">
                <span class="url-status ${isValid ? 'valid' : 'invalid'}"></span>
                <span class="url-text ${isSelected ? 'selected' : ''}" title="${normalizedUrl}">${url}</span>
                <button class="btn-icon url-open" title="Open this link" data-url="${normalizedUrl}">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            `;
            
            // Checkbox handler
            const checkbox = li.querySelector('.url-checkbox');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedUrls.add(url);
                    li.querySelector('.url-text').classList.add('selected');
                } else {
                    this.selectedUrls.delete(url);
                    li.querySelector('.url-text').classList.remove('selected');
                }
                this.updateButtons();
                this.updateBatchInfo();
            });
            
            // Open button handler
            const openBtn = li.querySelector('.url-open');
            openBtn.addEventListener('click', () => {
                this.openUrl(normalizedUrl);
            });
            
            this.urlList.appendChild(li);
        });
    }
    
    // Selection
    selectAll() {
        this.selectedUrls = new Set(this.urls);
        this.renderUrlList();
        this.updateButtons();
        this.updateBatchInfo();
        this.showToast(`Selected all ${this.urls.length} URLs`);
    }
    
    deselectAll() {
        this.selectedUrls.clear();
        this.renderUrlList();
        this.updateButtons();
        this.updateBatchInfo();
        this.showToast('Deselected all URLs');
    }
    
    // Opening URLs
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
    }
    
    openValid() {
        if (this.validUrls.length === 0) return;
        
        this.validUrls.forEach(url => {
            const normalizedUrl = this.normalizeUrl(url);
            this.openUrl(normalizedUrl);
        });
        
        this.showToast(`Opening ${this.validUrls.length} valid tab${this.validUrls.length !== 1 ? 's' : ''}...`);
    }
    
    // Batch Processing
    showBatchModal() {
        if (this.selectedUrls.size === 0) return;
        
        const selectedCount = this.selectedUrls.size;
        const batchSize = parseInt(this.batchSize.value) || 10;
        const batchDelay = parseInt(this.batchDelay.value) || 2000;
        const totalBatches = Math.ceil(selectedCount / batchSize);
        
        this.batchModalCount.textContent = selectedCount;
        this.modalBatchSize.textContent = batchSize;
        this.modalTotalBatches.textContent = totalBatches;
        this.modalBatchDelay.textContent = `${batchDelay}ms`;
        
        this.batchModal.style.display = 'flex';
    }
    
    hideBatchModal() {
        this.batchModal.style.display = 'none';
    }
    
    async startBatchProcessing() {
        this.hideBatchModal();
        
        if (this.selectedUrls.size === 0) return;
        
        this.isProcessing = true;
        this.batchAbortController = new AbortController();
        
        const selectedUrlsArray = Array.from(this.selectedUrls).map(url => this.normalizeUrl(url));
        const batchSize = parseInt(this.batchSize.value) || 10;
        const batchDelay = parseInt(this.batchDelay.value) || 2000;
        const totalBatches = Math.ceil(selectedUrlsArray.length / batchSize);
        const totalUrls = selectedUrlsArray.length;
        
        // Show progress panel
        this.progressPanel.style.display = 'block';
        this.progressCount.textContent = `0 / ${totalUrls}`;
        this.progressFill.style.width = '0%';
        this.progressBatch.textContent = `Batch 1 of ${totalBatches}`;
        this.progressNext.textContent = `Starting...`;
        
        let openedCount = 0;
        
        try {
            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                if (this.batchAbortController.signal.aborted) {
                    throw new Error('Cancelled');
                }
                
                const start = batchIndex * batchSize;
                const end = Math.min(start + batchSize, totalUrls);
                const batch = selectedUrlsArray.slice(start, end);
                
                // Update progress
                this.progressBatch.textContent = `Batch ${batchIndex + 1} of ${totalBatches}`;
                this.progressNext.textContent = batchIndex < totalBatches - 1 ? `Next batch in ${batchDelay/1000}s` : 'Finishing...';
                
                // Open batch
                batch.forEach(url => {
                    this.openUrl(url);
                    openedCount++;
                });
                
                // Update progress
                const progress = (openedCount / totalUrls) * 100;
                this.progressFill.style.width = `${progress}%`;
                this.progressCount.textContent = `${openedCount} / ${totalUrls}`;
                
                // Wait before next batch (except for last batch)
                if (batchIndex < totalBatches - 1) {
                    await this.delayWithAbort(batchDelay, this.batchAbortController.signal);
                }
            }
            
            this.showToast(`Opened ${openedCount} URLs in ${totalBatches} batches`);
        } catch (error) {
            if (error.message === 'Cancelled') {
                this.showToast(`Cancelled after opening ${openedCount} URLs`);
            } else {
                this.showToast('Error during batch processing', 'error');
            }
        } finally {
            this.isProcessing = false;
            this.batchAbortController = null;
            
            // Hide progress panel after a delay
            setTimeout(() => {
                this.progressPanel.style.display = 'none';
            }, 3000);
        }
    }
    
    delayWithAbort(ms, signal) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, ms);
            signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Cancelled'));
            });
        });
    }
    
    cancelBatch() {
        if (this.batchAbortController) {
            this.batchAbortController.abort();
        }
    }
    
    // UI Helpers
    clear() {
        this.urlInput.value = '';
        this.urls = [];
        this.validUrls = [];
        this.selectedUrls.clear();
        this.updateStats();
        this.updateButtons();
        this.updateBatchInfo();
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
            'another-invalid-link',
            'https://twitter.com',
            'https://linkedin.com',
            'https://reddit.com',
            'https://youtube.com',
            'https://spotify.com'
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
    
    // Storage
    saveToStorage() {
        try {
            localStorage.setItem('linksOpener_urls', this.urlInput.value);
            localStorage.setItem('linksOpener_batchSize', this.batchSize.value);
            localStorage.setItem('linksOpener_batchDelay', this.batchDelay.value);
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
            
            const savedBatchSize = localStorage.getItem('linksOpener_batchSize');
            if (savedBatchSize) {
                this.batchSize.value = savedBatchSize;
            }
            
            const savedBatchDelay = localStorage.getItem('linksOpener_batchDelay');
            if (savedBatchDelay) {
                this.batchDelay.value = savedBatchDelay;
            }
        } catch (e) {
            // Ignore storage errors
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new LinksOpener();
});