// DataDrop Background Script - Tracks Downloads and Monitored URLs
class DataDropTracker {
  constructor() {
    this.downloads = [];
    this.monitoredUrls = [];
    this.init();
  }

  async init() {
    // Load existing data from storage
    await this.loadDownloads();
    await this.loadMonitoredUrls();
    
    // Listen for download events
    chrome.downloads.onCreated.addListener((downloadItem) => {
      this.trackDownload(downloadItem);
    });

    chrome.downloads.onChanged.addListener((delta) => {
      this.updateDownload(delta);
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    console.log('DataDrop: Background script initialized');
  }

  // ============ DOWNLOADS MANAGEMENT ============

  async loadDownloads() {
    try {
      const result = await chrome.storage.local.get({ downloads: [] });
      this.downloads = result.downloads || [];
      console.log('DataDrop: Loaded', this.downloads.length, 'downloads from storage');
    } catch (error) {
      console.error('DataDrop: Failed to load downloads:', error);
      this.downloads = [];
    }
  }

  async saveDownloads() {
    try {
      await chrome.storage.local.set({ downloads: this.downloads });
      console.log('DataDrop: Saved', this.downloads.length, 'downloads to storage');
    } catch (error) {
      console.error('DataDrop: Failed to save downloads:', error);
    }
  }

  // ============ MONITORED URLS MANAGEMENT ============

  async loadMonitoredUrls() {
    try {
      const result = await chrome.storage.local.get({ monitoredUrls: [] });
      this.monitoredUrls = result.monitoredUrls || [];
      console.log('DataDrop: Loaded', this.monitoredUrls.length, 'monitored URLs from storage');
    } catch (error) {
      console.error('DataDrop: Failed to load monitored URLs:', error);
      this.monitoredUrls = [];
    }
  }

  async saveMonitoredUrls() {
    try {
      await chrome.storage.local.set({ monitoredUrls: this.monitoredUrls });
      console.log('DataDrop: Saved', this.monitoredUrls.length, 'monitored URLs to storage');
    } catch (error) {
      console.error('DataDrop: Failed to save monitored URLs:', error);
    }
  }

  extractBaseUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol + '//' + urlObj.hostname;
    } catch (e) {
      return url;
    }
  }

  isUrlMonitored(downloadUrl) {
    const baseUrl = this.extractBaseUrl(downloadUrl);
    return this.monitoredUrls.some(urlData => urlData.baseUrl === baseUrl);
  }

  addMonitoredUrl(baseUrl) {
    // Check if URL already exists
    const exists = this.monitoredUrls.some(urlData => urlData.baseUrl === baseUrl);
    
    if (exists) {
      return { success: false, error: 'URL already being monitored' };
    }

    const urlData = {
      baseUrl: baseUrl,
      dateAdded: new Date().toISOString(),
      downloadCount: 0
    };

    this.monitoredUrls.push(urlData);
    this.saveMonitoredUrls();
    
    console.log('DataDrop: Added monitored URL:', baseUrl);
    return { success: true };
  }

  removeMonitoredUrl(index) {
    if (index >= 0 && index < this.monitoredUrls.length) {
      const removed = this.monitoredUrls.splice(index, 1)[0];
      this.saveMonitoredUrls();
      console.log('DataDrop: Removed monitored URL:', removed.baseUrl);
      return { success: true };
    }
    return { success: false, error: 'Invalid index' };
  }

  // ============ CLOUD PROCESSING ============

  async processDownloadForCloud(download) {
    console.log('DataDrop: Processing download for cloud:', download.filename);
    
    // Here you would implement the actual cloud processing logic
    // For now, we'll just log and show a notification
    
    try {
      // Update download count for the monitored URL
      const baseUrl = this.extractBaseUrl(download.url);
      const urlData = this.monitoredUrls.find(u => u.baseUrl === baseUrl);
      if (urlData) {
        urlData.downloadCount++;
        this.saveMonitoredUrls();
      }

      // Show notification that processing started
      this.showNotification(
        'DataDrop - Cloud Processing', 
        `Started processing: ${download.filename}`
      );

      // TODO: Implement actual cloud processing here
      // - Send to AWS Lambda/Cloud Function
      // - Process the data
      // - Save results to Google Drive
      
      console.log('DataDrop: Cloud processing completed for:', download.filename);
      
    } catch (error) {
      console.error('DataDrop: Cloud processing failed:', error);
      this.showNotification(
        'DataDrop - Processing Error', 
        `Failed to process: ${download.filename}`
      );
    }
  }

  trackDownload(downloadItem) {
    console.log('DataDrop: New download detected:', downloadItem);
    
    const download = {
      id: downloadItem.id,
      url: downloadItem.url,
      filename: downloadItem.filename || this.getFilenameFromUrl(downloadItem.url),
      startTime: downloadItem.startTime || new Date().toISOString(),
      state: downloadItem.state || 'in_progress',
      status: 'downloading',
      isMonitored: this.isUrlMonitored(downloadItem.url)
    };

    // Add to beginning of array (most recent first)
    this.downloads.unshift(download);
    
    // Keep only last 100 downloads to prevent storage bloat
    if (this.downloads.length > 100) {
      this.downloads = this.downloads.slice(0, 100);
    }

    this.saveDownloads();
    
    // Show notification
    const message = download.isMonitored 
      ? `Tracking & processing: ${download.filename}` 
      : `Tracking download: ${download.filename}`;
    
    this.showNotification('DataDrop', message);
    
    // If this download is from a monitored URL, prepare for cloud processing
    if (download.isMonitored) {
      console.log('DataDrop: Download from monitored URL detected, will process when complete');
    }
  }

  updateDownload(delta) {
    if (delta.state && delta.state.current) {
      const downloadIndex = this.downloads.findIndex(d => d.id === delta.id);
      
      if (downloadIndex !== -1) {
        this.downloads[downloadIndex].state = delta.state.current;
        
        if (delta.state.current === 'complete') {
          this.downloads[downloadIndex].status = 'completed';
          this.downloads[downloadIndex].endTime = new Date().toISOString();
          
          console.log('DataDrop: Download completed:', this.downloads[downloadIndex].filename);
          this.showNotification('DataDrop', `Download completed: ${this.downloads[downloadIndex].filename}`);
          
          // Process download for cloud if URL is monitored
          if (this.isUrlMonitored(this.downloads[downloadIndex].url)) {
            this.processDownloadForCloud(this.downloads[downloadIndex]);
          }
        } else if (delta.state.current === 'interrupted') {
          this.downloads[downloadIndex].status = 'failed';
          this.downloads[downloadIndex].endTime = new Date().toISOString();
        }

        this.saveDownloads();
      }
    }
  }

  getFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || 'unknown_file';
    } catch (error) {
      return 'unknown_file';
    }
  }

  showNotification(title, message) {
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiM2NjdFRUEiLz4KPHBhdGggZD0iTTI0IDEyVjM2TTEyIDI0TDI0IDM2TDM2IDI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K',
        title: title,
        message: message
      });
    } catch (error) {
      console.log('DataDrop notification:', title, '-', message);
    }
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getDownloads':
        sendResponse({ downloads: this.downloads });
        break;
        
      case 'clearDownloads':
        this.downloads = [];
        this.saveDownloads();
        sendResponse({ success: true });
        break;
        
      case 'removeDownload':
        const index = this.downloads.findIndex(d => d.id === request.downloadId);
        if (index !== -1) {
          this.downloads.splice(index, 1);
          this.saveDownloads();
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Download not found' });
        }
        break;
        
      case 'getMonitoredUrls':
        sendResponse({ urls: this.monitoredUrls });
        break;
        
      case 'addMonitoredUrl':
        const addResult = this.addMonitoredUrl(request.baseUrl);
        sendResponse(addResult);
        break;
        
      case 'removeMonitoredUrl':
        const removeResult = this.removeMonitoredUrl(request.index);
        sendResponse(removeResult);
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }
}

// Initialize the tracker
const dataDropTracker = new DataDropTracker();
