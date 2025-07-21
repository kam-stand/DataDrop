// DataDrop Enhanced Popup JavaScript

// ============ UTILITY FUNCTIONS ============

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function getFileType(filename) {
  if (!filename) return 'unknown';
  const ext = filename.split('.').pop()?.toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  
  if (imageTypes.includes(ext)) return 'image';
  return ext || 'unknown';
}

function extractBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol + '//' + urlObj.hostname;
  } catch (e) {
    return url;
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// ============ TAB MANAGEMENT ============

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
  
  // Load appropriate data
  if (tabName === 'downloads') {
    loadDownloads();
  } else if (tabName === 'urls') {
    loadMonitoredUrls();
  }
}

// ============ DOWNLOADS TAB FUNCTIONS ============

function renderDownloads(downloads) {
  const ul = document.getElementById('downloadsList');
  ul.innerHTML = '';

  if (!downloads.length) {
    ul.innerHTML = '<li class="text-center text-muted">No downloads tracked yet. Try downloading a file!</li>';
    return;
  }

  downloads.forEach(({id, url, filename, startTime, status, state}) => {
    const li = document.createElement('li');
    const fileType = getFileType(filename);
    const baseUrl = extractBaseUrl(url);
    
    // Add download ID for click handling
    li.setAttribute('data-download-id', id);
    
    // Determine display status
    const displayStatus = status || state || 'unknown';
    
    // Add file type data attribute for CSS styling
    li.innerHTML = `
      <div class="filename" data-type="${fileType}">
        ${filename || 'Unknown File'}
        <button class="remove-btn" title="Remove from list">×</button>
      </div>
      <div class="url">${url}</div>
      <div class="base-url">Base URL: ${baseUrl}</div>
      <div class="time">${formatDate(startTime)}</div>
      <div class="status status-${displayStatus.toLowerCase()}">${displayStatus.toUpperCase()}</div>
    `;
    
    ul.appendChild(li);
  });
}

function showLoading(elementId) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = '<li class="text-center"><div class="loading"></div> Loading...</li>';
}

function showError(elementId, message) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = `<li class="text-center status-error">Error: ${message}</li>`;
}

// Enhanced load function with error handling
async function loadDownloads() {
  try {
    showLoading('downloadsList');
    
    // Get downloads from background script
    const response = await chrome.runtime.sendMessage({ action: 'getDownloads' });
    
    if (response && response.downloads) {
      // Sort downloads by most recent first
      const sortedDownloads = response.downloads.sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
      );
      
      renderDownloads(sortedDownloads);
    } else {
      renderDownloads([]);
    }
    
  } catch (error) {
    console.error('Failed to load downloads:', error);
    showError('downloadsList', 'Failed to load downloads. Try refreshing.');
  }
}

// ============ URLS TAB FUNCTIONS ============

function renderMonitoredUrls(urls) {
  const ul = document.getElementById('urlsList');
  ul.innerHTML = '';

  if (!urls.length) {
    ul.innerHTML = '<li class="text-center text-muted">No URLs being monitored. Add some URLs to automatically process downloads!</li>';
    return;
  }

  urls.forEach((urlData, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="url-info">
        <div class="url-domain">${urlData.baseUrl}</div>
        <div class="url-added">Added: ${formatDate(urlData.dateAdded)}</div>
      </div>
      <div class="url-actions">
        <button class="url-remove-btn" data-index="${index}" title="Remove URL">Remove</button>
      </div>
    `;
    
    ul.appendChild(li);
  });
}

async function loadMonitoredUrls() {
  try {
    showLoading('urlsList');
    
    const response = await chrome.runtime.sendMessage({ action: 'getMonitoredUrls' });
    
    if (response && response.urls) {
      renderMonitoredUrls(response.urls);
    } else {
      renderMonitoredUrls([]);
    }
    
  } catch (error) {
    console.error('Failed to load monitored URLs:', error);
    showError('urlsList', 'Failed to load monitored URLs.');
  }
}

async function addMonitoredUrl(url) {
  try {
    if (!isValidUrl(url)) {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    const baseUrl = extractBaseUrl(url);
    
    const response = await chrome.runtime.sendMessage({ 
      action: 'addMonitoredUrl', 
      baseUrl: baseUrl 
    });
    
    if (response && response.success) {
      document.getElementById('newUrlInput').value = '';
      loadMonitoredUrls(); // Refresh the list
    } else {
      alert(response?.error || 'Failed to add URL');
    }
    
  } catch (error) {
    console.error('Failed to add monitored URL:', error);
    alert('Failed to add URL. Please try again.');
  }
}

async function removeMonitoredUrl(index) {
  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'removeMonitoredUrl', 
      index: index 
    });
    
    if (response && response.success) {
      loadMonitoredUrls(); // Refresh the list
    } else {
      alert('Failed to remove URL');
    }
    
  } catch (error) {
    console.error('Failed to remove monitored URL:', error);
    alert('Failed to remove URL. Please try again.');
  }
}

// ============ EVENT HANDLERS ============

// Tab click handlers
function initTabHandlers() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
}

// Downloads tab handlers
function initDownloadsHandlers() {
  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', loadDownloads);
  
  // Clear all button
  document.getElementById('clear-all-btn').addEventListener('click', async () => {
    if (confirm('Clear all download history?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearDownloads' });
        loadDownloads(); // Refresh the list
      } catch (error) {
        console.error('Failed to clear downloads:', error);
      }
    }
  });
  
  // Download item click handlers (remove buttons)
  document.addEventListener('click', async (e) => {
    const listItem = e.target.closest('li[data-download-id]');
    if (!listItem) return;
    
    const downloadId = parseInt(listItem.dataset.downloadId);
    
    if (e.target.classList.contains('remove-btn')) {
      // Remove individual download
      try {
        await chrome.runtime.sendMessage({ 
          action: 'removeDownload', 
          downloadId: downloadId 
        });
        loadDownloads(); // Refresh the list
      } catch (error) {
        console.error('Failed to remove download:', error);
      }
    }
  });
}

// URLs tab handlers
function initUrlsHandlers() {
  // Add URL button
  document.getElementById('addUrlBtn').addEventListener('click', () => {
    const url = document.getElementById('newUrlInput').value.trim();
    if (url) {
      addMonitoredUrl(url);
    }
  });
  
  // Enter key in URL input
  document.getElementById('newUrlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const url = e.target.value.trim();
      if (url) {
        addMonitoredUrl(url);
      }
    }
  });
  
  // URL remove button handlers
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('url-remove-btn')) {
      const index = parseInt(e.target.dataset.index);
      if (confirm('Remove this URL from monitoring?')) {
        await removeMonitoredUrl(index);
      }
    }
  });
}

// ============ INITIALIZATION ============

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  initTabHandlers();
  initDownloadsHandlers();
  initUrlsHandlers();
  
  // Start with downloads tab active
  switchTab('downloads');
  
  // Auto-refresh downloads every 10 seconds if on downloads tab
  setInterval(() => {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'downloads-tab') {
      loadDownloads();
    }
  }, 10000);
});

// Listen for storage changes to update in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
      if (activeTab.id === 'downloads-tab' && changes.downloads) {
        loadDownloads();
      } else if (activeTab.id === 'urls-tab' && changes.monitoredUrls) {
        loadMonitoredUrls();
      }
    }
  }
});