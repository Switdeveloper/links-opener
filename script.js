/**
 * Links Opener - Open Multiple URLs in New Tabs
 * With File Upload and Advanced Batch Processing
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
        this.manualBatchSize = document.getElementById('manualBatchSize');
        this.scheduledBatchSize = document.getElementById('scheduledBatchSize');
        this.scheduledDelay = document.getElementById('scheduledDelay');
        this.scheduledTime = document.getElementById('scheduledTime');
        this.totalBatches = document.getElementById('totalBatches');
        this.batchInfo = document.getElementById('batchInfo');
        this.scheduledCountdown = document.getElementById('scheduledCountdown');
        this.countdownValue = document.getElementById('countdownValue');
        this.advancedToggle = document.getElementById('advancedToggle');
        this.advancedContent = document.getElementById('advancedContent');
        this.shuffleBatches = document.getElementById('shuffleBatches');
        this.skipInvalid = document.getElementById('skipInvalid');
        this.confirmEachBatch = document.getElementById('confirmEachBatch');
        this.maxBatches = document.getElementById('maxBatches');
        this.progressPanel = document.getElementById('progressPanel');
        this.progressCount = document.getElementById('progressCount');
        this.progressFill = document.getElementById('progressFill');
        this.progressBatch = document.getElementById('progressBatch');
        this.progressNext = document.getElementById('progressNext');
        this.cancelBatchBtn = document.getElementById('cancelBatchBtn');
        this.pauseBatchBtn = document.getElementById('pauseBatchBtn');
        this.nextBatchBtn = document.getElementById('nextBatchBtn');
        this.urlListSection = document.getElementById('urlListSection');
        this.urlList = document.getElementById('urlList');
        this.togglePreviewBtn = document.getElementById('togglePreviewBtn');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.deselectAllBtn = document.getElementById('deselectAllBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
        this.toast = document.getElementById('toast');
        this.toastMessage = this.toast.querySelector('.toast-message');
        
        // Modals
        this.batchModal = document.getElementById('batchModal');
        this.batchModalCount = document.getElementById('batchModalCount');
        this.modalBatchSize = document.getElementById('modalBatchSize');
        this.modalTotalBatches = document.getElementById('modalTotalBatches');
        this.modalBatchDelay = document.getElementById('modalBatchDelay');
        this.modalScheduledItem = document.getElementById('modalScheduledItem');
        this.modalScheduledTime = document.getElementById('modalScheduledTime');
        this.modalModeValue = document.getElementById('modalModeValue');
        this.cancelModalBtn = document.getElementById('cancelModalBtn');
        this.confirmBatchBtn = document.getElementById('confirmBatchBtn');
        
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmBatchNumber = document.getElementById('confirmBatchNumber');
        this.confirmTotalBatches = document.getElementById('confirmTotalBatches');
        this.confirmBatchSize = document.getElementById('confirmBatchSize');
        this.skipBatchBtn = document.getElementById('skipBatchBtn');
this.confirmOpenBatchBtn = document.getElementById('confirmOpenBatchBtn');
        
        // Resume Memory Elements
        this.resumeMemory = document.getElementById('resumeMemory');
        this.resumeLastOpened = document.getElementById('resumeLastOpened');
        this.resumeProgress = document.getElementById('resumeProgress');
        this.resumeRemaining = document.getElementById('resumeRemaining');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.clearMemoryBtn = document.getElementById('clearMemoryBtn');

        // State
        this.urls = [];
        this.validUrls = [];
        this.selectedUrls = new Set();
        this.previewVisible = false;
        this.isProcessing = false;
        this.isPaused = false;
        this.batchMode = 'auto'; // 'auto', 'manual', 'scheduled'
        this.currentBatchIndex = 0;
        this.totalBatchCount = 0;
        this.scheduledTimeout = null;
        this.countdownInterval = null;
        this.batchResolve = null;
        this.batchAbortController = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupBatchTabs();
        this.updateStats();
        this.loadFromStorage();
        this.setupScheduledTime();
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
        this.manualBatchSize.addEventListener('change', () => this.updateBatchInfo());
        this.scheduledBatchSize.addEventListener('change', () => this.updateBatchInfo());
        this.scheduledDelay.addEventListener('change', () => this.updateBatchInfo());
        this.scheduledTime.addEventListener('change', () => this.handleScheduledTimeChange());
        
        // Advanced options
        this.advancedToggle.addEventListener('click', () => this.toggleAdvanced());
        
        // Modals
        this.cancelModalBtn.addEventListener('click', () => this.hideBatchModal());
        this.confirmBatchBtn.addEventListener('click', () => this.startBatchProcessing());
        this.batchModal.querySelector('.modal-overlay').addEventListener('click', () => this.hideBatchModal());
        
        // Confirm modal
        this.skipBatchBtn.addEventListener('click', () => this.skipBatch());
        this.confirmOpenBatchBtn.addEventListener('click', () => this.confirmBatchOpen());
        this.confirmModal.querySelector('.modal-overlay').addEventListener('click', () => this.hideConfirmModal());
        
        // Progress
        this.cancelBatchBtn.addEventListener('click', () => this.cancelBatch());
        this.pauseBatchBtn.addEventListener('click', () => this.togglePause());
        this.nextBatchBtn.addEventListener('click', () => this.openNextManualBatch());
        
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
                this.hideConfirmModal();
            }
        });
        
        // Resume memory buttons
        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', () => this.resumeSession());
        }
        if (this.clearMemoryBtn) {
            this.clearMemoryBtn.addEventListener('click', () => this.clearSessionMemory());
        }
    }
    
    setupBatchTabs() {
        const tabs = document.querySelectorAll('.batch-tab');
        const contents = document.querySelectorAll('.batch-mode-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                this.batchMode = mode;
                
                // Update tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update content
                contents.forEach(c => c.classList.remove('active'));
                document.querySelector(`.batch-mode-content[data-mode="${mode}"]`).classList.add('active');
                
                // Update UI
                this.updateBatchInfo();
                this.saveToStorage();
            });
        });
    }
    
    setupScheduledTime() {
        // Set default scheduled time to 1 minute from now
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        this.scheduledTime.value = now.toISOString().slice(0, 16);
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
                if (Array.isArray(json)) {
                    urls = json.filter(item => typeof item === 'string');
                } else if (json.urls && Array.isArray(json.urls)) {
                    urls = json.urls;
                } else if (json.links && Array.isArray(json.links)) {
                    urls = json.links;
                }
            } else if (fileExtension === '.csv') {
                urls = content
                    .split(/[\n,]+/)
                    .map(url => url.trim().replace(/^["']|["']$/g, ''))
                    .filter(url => url.length > 0);
            } else {
                urls = content
                    .split('\n')
                    .map(url => url.trim())
                    .filter(url => url.length > 0);
            }
            
            urls = urls.filter(url => url.length > 0 && !url.startsWith('#'));
            
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
        
        const rawUrls = text
            .split(/[\n,\s]+/)
            .map(url => url.trim())
            .filter(url => url.length > 0);
        
        this.urls = [...new Set(rawUrls)];
        this.validUrls = this.urls.filter(url => this.isValidUrl(url));
        
        if (this.skipInvalid.checked) {
            this.selectedUrls = new Set(this.validUrls);
        } else {
            this.selectedUrls = new Set(this.urls);
        }
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
        let batchSize = 10;
        
        if (this.batchMode === 'auto') {
            batchSize = parseInt(this.batchSize.value) || 10;
        } else if (this.batchMode === 'manual') {
            batchSize = parseInt(this.manualBatchSize.value) || 10;
        } else if (this.batchMode === 'scheduled') {
            batchSize = parseInt(this.scheduledBatchSize.value) || 10;
        }
        
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
        
        if (hasUrls) {
            this.batchSettings.style.display = 'block';
            this.updateBatchInfo();
        } else {
            this.batchSettings.style.display = 'none';
        }
        
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
        
        const urlsToShow = this.shuffleBatches.checked 
            ? this.shuffleArray([...this.selectedUrls])
            : [...this.selectedUrls];
        
        urlsToShow.forEach((url, index) => {
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
            
            const openBtn = li.querySelector('.url-open');
            openBtn.addEventListener('click', () => {
                this.openUrl(normalizedUrl);
            });
            
            this.urlList.appendChild(li);
        });
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
    
    toggleAdvanced() {
        const isOpen = this.advancedContent.style.display !== 'none';
        this.advancedContent.style.display = isOpen ? 'none' : 'block';
        this.advancedToggle.classList.toggle('open', !isOpen);
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
        let batchSize = 10;
        let delay = 2;
        
        if (this.batchMode === 'auto') {
            batchSize = parseInt(this.batchSize.value) || 10;
            delay = parseFloat(this.batchDelay.value) || 2;
        } else if (this.batchMode === 'manual') {
            batchSize = parseInt(this.manualBatchSize.value) || 10;
            delay = 'Manual';
        } else if (this.batchMode === 'scheduled') {
            batchSize = parseInt(this.scheduledBatchSize.value) || 10;
            delay = parseFloat(this.scheduledDelay.value) || 2;
        }
        
        const totalBatches = Math.ceil(selectedCount / batchSize);
        
        this.batchModalCount.textContent = selectedCount;
        this.modalBatchSize.textContent = batchSize;
        this.modalTotalBatches.textContent = totalBatches;
        this.modalBatchDelay.textContent = typeof delay === 'number' ? delay + 's' : delay;
        
        // Update mode display
        const modeNames = {
            'auto': 'Auto Timer',
            'manual': 'Manual Click',
            'scheduled': 'Scheduled Start'
        };
        this.modalModeValue.textContent = modeNames[this.batchMode];
        
        // Show/hide scheduled info
        if (this.batchMode === 'scheduled') {
            this.modalScheduledItem.style.display = 'flex';
            this.modalScheduledTime.textContent = new Date(this.scheduledTime.value).toLocaleString();
        } else {
            this.modalScheduledItem.style.display = 'none';
        }
        
        this.batchModal.style.display = 'flex';
    }
    
    hideBatchModal() {
        this.batchModal.style.display = 'none';
    }
    
    hideConfirmModal() {
        this.confirmModal.style.display = 'none';
    }
    
    async startBatchProcessing() {
        this.hideBatchModal();
        
        if (this.selectedUrls.size === 0) return;
        
        // Prepare URLs
        let selectedUrlsArray = Array.from(this.selectedUrls).map(url => this.normalizeUrl(url));
        
        if (this.shuffleBatches.checked) {
            selectedUrlsArray = this.shuffleArray(selectedUrlsArray);
        }
        
        // Get batch settings
        let batchSize = 10;
        let delay = 2000;
        
        if (this.batchMode === 'auto') {
            batchSize = parseInt(this.batchSize.value) || 10;
            delay = (parseFloat(this.batchDelay.value) || 2) * 1000;
        } else if (this.batchMode === 'manual') {
            batchSize = parseInt(this.manualBatchSize.value) || 10;
            delay = 0;
        } else if (this.batchMode === 'scheduled') {
            batchSize = parseInt(this.scheduledBatchSize.value) || 10;
            delay = (parseFloat(this.scheduledDelay.value) || 2) * 1000;
            
            // Handle scheduled start
            const scheduledDate = new Date(this.scheduledTime.value);
            const now = new Date();
            const waitTime = scheduledDate.getTime() - now.getTime();
            
            if (waitTime > 0) {
                this.showToast(`Scheduled for ${scheduledDate.toLocaleTimeString()}`);
                this.startScheduledCountdown(scheduledDate);
                await this.delay(waitTime);
                this.stopScheduledCountdown();
            }
        }
        
        // Apply max batches limit
        const maxBatches = parseInt(this.maxBatches.value) || 0;
        if (maxBatches > 0) {
            selectedUrlsArray = selectedUrlsArray.slice(0, maxBatches * batchSize);
        }
        
        // Start processing
        this.isProcessing = true;
        this.isPaused = false;
        this.currentBatchIndex = 0;
        this.totalBatchCount = Math.ceil(selectedUrlsArray.length / batchSize);
        this.batchAbortController = new AbortController();
        
        // Show progress
        this.progressPanel.style.display = 'block';
        this.updateProgressUI(0, selectedUrlsArray.length);
        
        // Update UI based on mode
        if (this.batchMode === 'manual') {
            this.pauseBatchBtn.style.display = 'none';
            this.nextBatchBtn.style.display = 'flex';
            this.progressNext.textContent = 'Click to open next batch';
        } else {
            this.pauseBatchBtn.style.display = 'flex';
            this.nextBatchBtn.style.display = 'none';
        }
        
        // Save initial session memory
        this.saveSessionMemory(0, batchSize);
        
        try {
            for (let i = 0; i < this.totalBatchCount; i++) {
                if (this.batchAbortController.signal.aborted) {
                    throw new Error('Cancelled');
                }
                
                this.currentBatchIndex = i;
                const start = i * batchSize;
                const end = Math.min(start + batchSize, selectedUrlsArray.length);
                const batch = selectedUrlsArray.slice(start, end);
                
                // Handle manual mode
                if (this.batchMode === 'manual' || this.confirmEachBatch.checked) {
                    await this.waitForBatchConfirmation(i + 1, this.totalBatchCount, batch.length);
                }
                
                // Check if paused
                while (this.isPaused) {
                    await this.delay(100);
                    if (this.batchAbortController.signal.aborted) {
                        throw new Error('Cancelled');
                    }
                }
                
                // Open batch
                batch.forEach(url => this.openUrl(url));
                
// Update progress
            const openedCount = Math.min((i + 1) * batchSize, selectedUrlsArray.length);
            this.updateProgressUI(openedCount, selectedUrlsArray.length, batchSize);
                
                // Wait for next batch
                if (i < this.totalBatchCount - 1 && delay > 0 && this.batchMode !== 'manual') {
                    await this.delayWithAbort(delay, this.batchAbortController.signal);
                }
            }
            
            this.showToast(`Opened ${selectedUrlsArray.length} URLs in ${this.totalBatchCount} batches`);
            this.clearSessionMemory(); // Clear memory when completed successfully
        } catch (error) {
            if (error.message === 'Cancelled') {
                this.showToast('Batch processing cancelled - Session saved. Refresh to resume.');
            } else {
                this.showToast('Error during batch processing', 'error');
                this.clearSessionMemory();
            }
        } finally {
            this.isProcessing = false;
            this.batchAbortController = null;
            
            setTimeout(() => {
                this.progressPanel.style.display = 'none';
                this.pauseBatchBtn.style.display = 'flex';
                this.nextBatchBtn.style.display = 'none';
                this.pauseBatchBtn.classList.remove('btn-paused');
                this.pauseBatchBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2" y="2" width="4" height="10" rx="1" fill="currentColor"/>
                        <rect x="8" y="2" width="4" height="10" rx="1" fill="currentColor"/>
                    </svg>
                    Pause
                `;
            }, 3000);
        }
    }
    
    updateProgressUI(openedCount, totalCount, batchSize) {
        this.progressCount.textContent = `${openedCount} / ${totalCount}`;
        const progress = (openedCount / totalCount) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressBatch.textContent = `Batch ${this.currentBatchIndex + 1} of ${this.totalBatchCount}`;
        
        // Save session memory after each batch
        if (batchSize && openedCount > 0) {
            this.saveSessionMemory(openedCount, batchSize);
        }
    }
    
    waitForBatchConfirmation(batchNum, totalBatches, batchSize) {
        return new Promise((resolve, reject) => {
            this.batchResolve = resolve;
            
            this.confirmBatchNumber.textContent = batchNum;
            this.confirmTotalBatches.textContent = totalBatches;
            this.confirmBatchSize.textContent = batchSize;
            
            this.confirmModal.style.display = 'flex';
        });
    }
    
    confirmBatchOpen() {
        this.hideConfirmModal();
        if (this.batchResolve) {
            this.batchResolve();
            this.batchResolve = null;
        }
    }
    
    skipBatch() {
        this.hideConfirmModal();
        if (this.batchResolve) {
            this.batchResolve();
            this.batchResolve = null;
        }
    }
    
    openNextManualBatch() {
        if (this.batchResolve) {
            this.batchResolve();
            this.batchResolve = null;
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseBatchBtn.classList.add('btn-paused');
            this.pauseBatchBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 2L11 7L4 12V2Z" fill="currentColor"/>
                </svg>
                Resume
            `;
            this.progressNext.textContent = 'Paused';
        } else {
            this.pauseBatchBtn.classList.remove('btn-paused');
            this.pauseBatchBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="4" height="10" rx="1" fill="currentColor"/>
                    <rect x="8" y="2" width="4" height="10" rx="1" fill="currentColor"/>
                </svg>
                Pause
            `;
            this.progressNext.textContent = 'Running...';
        }
    }
    
    cancelBatch() {
        if (this.batchAbortController) {
            this.batchAbortController.abort();
        }
    }
    
    // Scheduled Mode
    handleScheduledTimeChange() {
        const scheduledDate = new Date(this.scheduledTime.value);
        const now = new Date();
        
        if (scheduledDate <= now) {
            // Set to 1 minute from now if in past
            const newDate = new Date();
            newDate.setMinutes(newDate.getMinutes() + 1);
            this.scheduledTime.value = newDate.toISOString().slice(0, 16);
            this.showToast('Scheduled time adjusted to 1 minute from now');
        }
    }
    
    startScheduledCountdown(targetDate) {
        this.scheduledCountdown.style.display = 'flex';
        this.batchSettings.classList.add('scheduled-active');
        
        this.countdownInterval = setInterval(() => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();
            
            if (diff <= 0) {
                this.countdownValue.textContent = '00:00:00';
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            this.countdownValue.textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }
    
    stopScheduledCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.scheduledCountdown.style.display = 'none';
        this.batchSettings.classList.remove('scheduled-active');
    }
    
    // Utilities
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        this.stopScheduledCountdown();
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
            localStorage.setItem('linksOpener_manualBatchSize', this.manualBatchSize.value);
            localStorage.setItem('linksOpener_scheduledBatchSize', this.scheduledBatchSize.value);
            localStorage.setItem('linksOpener_scheduledDelay', this.scheduledDelay.value);
            localStorage.setItem('linksOpener_batchMode', this.batchMode);
            localStorage.setItem('linksOpener_shuffleBatches', this.shuffleBatches.checked);
            localStorage.setItem('linksOpener_skipInvalid', this.skipInvalid.checked);
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
            if (savedBatchSize) this.batchSize.value = savedBatchSize;
            
            const savedBatchDelay = localStorage.getItem('linksOpener_batchDelay');
            if (savedBatchDelay) this.batchDelay.value = savedBatchDelay;
            
            const savedManualBatchSize = localStorage.getItem('linksOpener_manualBatchSize');
            if (savedManualBatchSize) this.manualBatchSize.value = savedManualBatchSize;
            
            const savedScheduledBatchSize = localStorage.getItem('linksOpener_scheduledBatchSize');
            if (savedScheduledBatchSize) this.scheduledBatchSize.value = savedScheduledBatchSize;
            
            const savedScheduledDelay = localStorage.getItem('linksOpener_scheduledDelay');
            if (savedScheduledDelay) this.scheduledDelay.value = savedScheduledDelay;
            
            const savedBatchMode = localStorage.getItem('linksOpener_batchMode');
            if (savedBatchMode) {
                this.batchMode = savedBatchMode;
                document.querySelectorAll('.batch-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.mode === savedBatchMode);
                });
                document.querySelectorAll('.batch-mode-content').forEach(c => {
                    c.classList.toggle('active', c.dataset.mode === savedBatchMode);
                });
            }
            
            const savedShuffle = localStorage.getItem('linksOpener_shuffleBatches');
            if (savedShuffle) this.shuffleBatches.checked = savedShuffle === 'true';
            
            const savedSkipInvalid = localStorage.getItem('linksOpener_skipInvalid');
            if (savedSkipInvalid) this.skipInvalid.checked = savedSkipInvalid === 'true';
            
            // Check for saved session memory
            this.checkSessionMemory();
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    // Session Memory Functions
    checkSessionMemory() {
        try {
            const sessionData = localStorage.getItem('linksOpener_sessionMemory');
            if (!sessionData) {
                this.hideResumeMemory();
                return;
            }
            
            const session = JSON.parse(sessionData);
            if (!session.urls || session.urls.length === 0) {
                this.hideResumeMemory();
                return;
            }
            
            // Check if session is from current URL list
            const currentUrls = this.urls.join('\n');
            const savedUrls = session.allUrls.join('\n');
            
            if (currentUrls !== savedUrls && this.urls.length > 0) {
                // Different URLs loaded, ask user
                this.showToast('Different URLs detected. Previous session available.', 'info');
            }
            
            // Calculate remaining
            const totalUrls = session.allUrls.length;
            const openedCount = session.openedCount || 0;
            const remainingUrls = session.urls.length;
            const batchSize = session.batchSize || 10;
            const remainingBatches = Math.ceil(remainingUrls / batchSize);
            
            // Update UI
            this.resumeLastOpened.textContent = new Date(session.lastOpened).toLocaleString();
            this.resumeProgress.textContent = `${openedCount} / ${totalUrls} URLs`;
            this.resumeRemaining.textContent = `${remainingBatches} batch${remainingBatches !== 1 ? 'es' : ''}`;
            
            this.showResumeMemory();
        } catch (e) {
            this.hideResumeMemory();
        }
    }
    
    showResumeMemory() {
        if (this.resumeMemory) {
            this.resumeMemory.style.display = 'block';
        }
    }
    
    hideResumeMemory() {
        if (this.resumeMemory) {
            this.resumeMemory.style.display = 'none';
        }
    }
    
    saveSessionMemory(openedCount, batchSize) {
        try {
            const remainingUrls = this.selectedUrls.size - openedCount;
            if (remainingUrls <= 0) {
                this.clearSessionMemory();
                return;
            }
            
            const sessionData = {
                allUrls: [...this.selectedUrls],
                urls: [...this.selectedUrls].slice(openedCount),
                openedCount: openedCount,
                batchSize: batchSize,
                batchMode: this.batchMode,
                lastOpened: new Date().toISOString(),
                timestamp: Date.now()
            };
            
            localStorage.setItem('linksOpener_sessionMemory', JSON.stringify(sessionData));
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    clearSessionMemory() {
        try {
            localStorage.removeItem('linksOpener_sessionMemory');
            this.hideResumeMemory();
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    resumeSession() {
        try {
            const sessionData = localStorage.getItem('linksOpener_sessionMemory');
            if (!sessionData) {
                this.showToast('No session to resume', 'error');
                return;
            }
            
            const session = JSON.parse(sessionData);
            
            // Load URLs if different
            const currentUrls = this.urls.join('\n');
            const savedUrls = session.allUrls.join('\n');
            
            if (currentUrls !== savedUrls) {
                this.urlInput.value = session.allUrls.join('\n');
                this.handleInput();
            }
            
            // Restore settings
            this.batchMode = session.batchMode || 'auto';
            
            // Update UI tabs
            document.querySelectorAll('.batch-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.mode === this.batchMode);
            });
            document.querySelectorAll('.batch-mode-content').forEach(c => {
                c.classList.toggle('active', c.dataset.mode === this.batchMode);
            });
            
            // Calculate where to resume
            const openedCount = session.openedCount || 0;
            const remainingUrls = session.urls;
            
            // Deselect already opened URLs
            remainingUrls.forEach(url => {
                this.selectedUrls.add(url);
            });
            
            // Update UI
            this.renderUrlList();
            this.updateBatchInfo();
            this.updateButtons();
            
            this.showToast(`Resuming from batch ${Math.floor(openedCount / (session.batchSize || 10)) + 1}. ${remainingUrls.length} URLs remaining.`);
            
            // Scroll to actions
            document.querySelector('.actions').scrollIntoView({ behavior: 'smooth' });
            
        } catch (e) {
            this.showToast('Error resuming session', 'error');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new LinksOpener();
});