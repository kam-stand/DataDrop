const API_BASE = 'http://localhost:8080/api/v1';

// Tab switching
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Load data for the selected tab
  if (tabName === 'downloads') {
    loadRecentDownloads();
  } else if (tabName === 'urls') {
    loadBaseUrls();
  } else if (tabName === 'files') {
    loadProcessedFiles();
  }
}

// Show status message
function showStatus(message, isError = false) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = '';
  }, 3000);
}

// Load recent downloads
function loadRecentDownloads() {
  chrome.storage.local.get(['recentDownloads'], (result) => {
    const downloads = result.recentDownloads || [];
    const downloadsList = document.getElementById('downloadsList');
    
    if (downloads.length === 0) {
      downloadsList.innerHTML = '<p>No recent downloads found.</p>';
      return;
    }
    
    downloadsList.innerHTML = downloads.map(download => `
      <div class="download-item">
        <strong>${download.filename}</strong><br>
        <small>Downloaded: ${new Date(download.timestamp).toLocaleString()}</small><br>
        <small>From: ${download.url}</small><br>
        <button class="upload-btn" data-download-id="${download.id}" data-filename="${download.filename}">
          Send to Backend
        </button>
      </div>
    `).join('');
  });
}

// Clear recent downloads
function clearRecentDownloads() {
  chrome.storage.local.set({ recentDownloads: [] }, () => {
    showStatus('Recent downloads cleared!', false);
    loadRecentDownloads(); // Refresh the display
  });
}

// Upload file to backend
async function uploadFile(downloadId, filename) {
  showStatus('Starting upload...', false);
  
  try {
    // Get the download information
    const downloads = await chrome.downloads.search({ id: downloadId });
    if (downloads.length === 0) {
      showStatus('Download not found', true);
      return;
    }
    
    const download = downloads[0];
    console.log('Download info:', download);
    
    // Check if download is complete
    if (download.state !== 'complete') {
      showStatus('Download not complete yet', true);
      return;
    }

    let uploadSuccess = false;
    
    // Method 1: Try to fetch the file from its original URL (works for many public files)
    if (download.url && !download.url.startsWith('file://') && !download.url.startsWith('chrome://')) {
      try {
        showStatus('Downloading file from original URL...', false);
        console.log('Attempting to fetch from:', download.url);
        
        const response = await fetch(download.url, {
          method: 'GET',
          mode: 'cors' // Try CORS first
        });
        
        if (response.ok) {
          const blob = await response.blob();
          console.log('Successfully downloaded blob, size:', blob.size);
          
          if (blob.size > 0) {
            // Create FormData and upload
            const formData = new FormData();
            formData.append('file', blob, filename);
            
            showStatus('Uploading to backend...', false);
            
            const uploadResponse = await fetch(`${API_BASE}/files/upload`, {
              method: 'POST',
              body: formData
            });
            
            if (uploadResponse.ok) {
              const result = await uploadResponse.json();
              showStatus('✅ File uploaded successfully!');
              console.log('Upload success:', result);
              uploadSuccess = true;
              
              // Optionally refresh processed files
              if (document.querySelector('[data-tab="files"].active')) {
                setTimeout(() => loadProcessedFiles(), 1000);
              }
            } else {
              const errorText = await uploadResponse.text();
              console.error('Upload failed:', errorText);
              
              if (uploadResponse.status === 400) {
                if (errorText.includes('Invalid file type')) {
                  showStatus('❌ File type not allowed. Add this file type to your base URLs first.', true);
                } else if (errorText.includes('No file uploaded')) {
                  showStatus('❌ No file received by server', true);
                } else {
                  showStatus(`❌ Upload failed: ${errorText}`, true);
                }
              } else {
                showStatus(`❌ Upload failed: HTTP ${uploadResponse.status}`, true);
              }
            }
          } else {
            console.log('Downloaded blob is empty');
            showStatus('❌ Downloaded file is empty', true);
          }
        } else {
          console.log('Failed to fetch from URL:', response.status, response.statusText);
        }
      } catch (fetchError) {
        console.log('Fetch error:', fetchError.message);
        // Don't show error yet, try other methods
      }
    }
    
    // Method 2: Try no-cors mode (for some cross-origin resources)
    if (!uploadSuccess && download.url && !download.url.startsWith('file://') && !download.url.startsWith('chrome://')) {
      try {
        showStatus('Trying alternative download method...', false);
        
        const response = await fetch(download.url, {
          method: 'GET',
          mode: 'no-cors'
        });
        
        if (response.type === 'opaque') {
          // We got a response but can't read it due to CORS
          console.log('Got opaque response - CORS blocking access');
        }
      } catch (error) {
        console.log('No-cors fetch failed:', error.message);
      }
    }
    
    // Method 3: Try to use File System Access API (requires user interaction)
    if (!uploadSuccess && 'showOpenFilePicker' in window) {
      try {
        showStatus('Please select the downloaded file manually...', false);
        
        const [fileHandle] = await window.showOpenFilePicker({
          multiple: false,
          types: [{
            description: 'All files',
            accept: {
              '*/*': []
            }
          }],
          suggestedName: filename
        });
        
        const file = await fileHandle.getFile();
        console.log('File selected:', file.name, 'Size:', file.size);
        
        const formData = new FormData();
        formData.append('file', file, file.name);
        
        showStatus('Uploading selected file...', false);
        
        const uploadResponse = await fetch(`${API_BASE}/files/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          showStatus('✅ File uploaded successfully!');
          console.log('Upload success:', result);
          uploadSuccess = true;
          
          // Refresh processed files if on that tab
          if (document.querySelector('[data-tab="files"].active')) {
            setTimeout(() => loadProcessedFiles(), 1000);
          }
        } else {
          const errorText = await uploadResponse.text();
          if (uploadResponse.status === 400 && errorText.includes('Invalid file type')) {
            showStatus('❌ File type not allowed. Add this file type to your base URLs first.', true);
          } else {
            showStatus(`❌ Upload failed: ${errorText}`, true);
          }
        }
      } catch (pickerError) {
        if (pickerError.name === 'AbortError') {
          showStatus('File selection cancelled', false);
        } else {
          console.log('File picker error:', pickerError.message);
          showStatus('❌ File picker not available', true);
        }
      }
    }
    
    // Method 4: Last resort - show instructions
    if (!uploadSuccess) {
      showStatus('❌ Cannot automatically access downloaded file. Please use file picker or check CORS.', true);
      console.log('All upload methods failed for:', download);
      
      // Show helpful information
      const downloadInfo = `
        Download Info:
        - Filename: ${filename}
        - Original URL: ${download.url}
        - File exists: ${download.exists !== false}
        - State: ${download.state}
        - MIME type: ${download.mime || 'unknown'}
      `;
      console.log(downloadInfo);
    }

  } catch (error) {
    console.error('Upload error:', error);
    showStatus('❌ Upload failed: ' + error.message, true);
  }
}

// Load base URLs
async function loadBaseUrls() {
  const urlsList = document.getElementById('urlsList');
  
  try {
    showStatus('Loading base URLs...', false);
    
    const response = await fetch(`${API_BASE}/url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        urlsList.innerHTML = `
          <div class="url-item" style="background: #fff3cd; border-color: #ffeaa7;">
            <strong>Backend Connection Issue</strong><br>
            The backend server returned 404 for <code>/api/v1/url</code><br>
            <small>Please check:</small><br>
            <small>• Backend server is running on localhost:8080</small><br>
            <small>• The URL endpoint is correctly implemented</small><br>
            <small>• CORS is configured for Chrome extensions</small>
          </div>
        `;
        showStatus('Backend endpoint not found (404)', true);
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const urls = await response.json();
    
    if (urls.length === 0) {
      urlsList.innerHTML = '<p>No base URLs found. Add some URLs using the form above.</p>';
      showStatus('No base URLs found', false);
      return;
    }
    
    urlsList.innerHTML = urls.map(url => `
      <div class="url-item">
        <strong>ID:</strong> ${url.id}<br>
        <strong>Base URL:</strong> ${url.baseUrl}<br>
        <strong>File Type:</strong> ${url.file_type || 'Not specified'}
      </div>
    `).join('');
    
    showStatus(`Loaded ${urls.length} base URL(s)`, false);
    
  } catch (error) {
    console.error('Error loading base URLs:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      urlsList.innerHTML = `
        <div class="url-item" style="background: #f8d7da; border-color: #f5c6cb;">
          <strong>Backend Server Not Running</strong><br>
          Cannot connect to <code>localhost:8080</code><br>
          <small>Please start your backend server first</small>
        </div>
      `;
      showStatus('Backend server not running', true);
    } else {
      urlsList.innerHTML = `
        <div class="url-item" style="background: #f8d7da; border-color: #f5c6cb;">
          <strong>Error:</strong> ${error.message}
        </div>
      `;
      showStatus('Failed to load base URLs', true);
    }
  }
}

// Add new base URL
async function addBaseUrl() {
  const baseUrl = document.getElementById('baseUrlInput').value.trim();
  const fileType = document.getElementById('fileTypeSelect').value;
  
  if (!baseUrl) {
    showStatus('Please enter a base URL', true);
    return;
  }
  
  try {
    showStatus('Adding base URL...', false);
    
    const response = await fetch(`${API_BASE}/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        baseUrl: baseUrl,
        file_type: fileType
      })
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        showStatus('Backend endpoint not found (404). Check if server is running.', true);
        return;
      }
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    showStatus('Base URL added successfully!');
    document.getElementById('baseUrlInput').value = '';
    document.getElementById('fileTypeSelect').value = '';
    loadBaseUrls(); // Refresh the list
    
  } catch (error) {
    console.error('Error adding base URL:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showStatus('Backend server not running', true);
    } else {
      showStatus(`Failed to add base URL: ${error.message}`, true);
    }
  }
}

// Load processed files
async function loadProcessedFiles() {
  const filesList = document.getElementById('filesList');
  
  try {
    showStatus('Loading processed files...', false);
    
    const response = await fetch(`${API_BASE}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        filesList.innerHTML = `
          <div class="file-item" style="background: #fff3cd; border-color: #ffeaa7;">
            <strong>Backend Connection Issue</strong><br>
            The backend server returned 404 for <code>/api/v1/files</code><br>
            <small>Please check if the backend server is running and the endpoint exists</small>
          </div>
        `;
        showStatus('Backend endpoint not found (404)', true);
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const files = await response.json();
    
    if (files.length === 0) {
      filesList.innerHTML = '<p>No processed files found.</p>';
      showStatus('No processed files found', false);
      return;
    }
    
    filesList.innerHTML = files.map(file => `
      <div class="file-item">
        <strong>Filename:</strong> ${file.key || 'Unknown'}<br>
        <strong>Size:</strong> ${file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'Unknown'}<br>
        <strong>Last Modified:</strong> ${file.lastModified ? new Date(file.lastModified).toLocaleString() : 'Unknown'}<br>
        <strong>Storage Class:</strong> ${file.storageClass || 'Standard'}
      </div>
    `).join('');
    
    showStatus(`Loaded ${files.length} processed file(s)`, false);
    
  } catch (error) {
    console.error('Error loading processed files:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      filesList.innerHTML = `
        <div class="file-item" style="background: #f8d7da; border-color: #f5c6cb;">
          <strong>Backend Server Not Running</strong><br>
          Cannot connect to <code>localhost:8080</code><br>
          <small>Please start your backend server first</small>
        </div>
      `;
      showStatus('Backend server not running', true);
    } else {
      filesList.innerHTML = `
        <div class="file-item" style="background: #f8d7da; border-color: #f5c6cb;">
          <strong>Error:</strong> ${error.message}
        </div>
      `;
      showStatus('Failed to load processed files', true);
    }
  }
}

// Test backend connection
async function testBackendConnection() {
  const statusSpan = document.getElementById('backendStatus');
  statusSpan.textContent = 'Testing...';
  
  try {
    // Try a simple fetch to the base API
    const response = await fetch(`${API_BASE}/url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      statusSpan.textContent = '✅ Backend connected';
      statusSpan.style.color = 'green';
    } else {
      statusSpan.textContent = `❌ Backend error: ${response.status}`;
      statusSpan.style.color = 'red';
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      statusSpan.textContent = '❌ Backend not running';
    } else {
      statusSpan.textContent = `❌ Error: ${error.message}`;
    }
    statusSpan.style.color = 'red';
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Add tab button event listeners
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.getAttribute('data-tab');
      showTab(tabName);
    });
  });

  // Add URL form event listeners
  document.getElementById('addUrlBtn').addEventListener('click', addBaseUrl);
  document.getElementById('refreshUrlsBtn').addEventListener('click', loadBaseUrls);
  document.getElementById('refreshFilesBtn').addEventListener('click', loadProcessedFiles);
  document.getElementById('testBackendBtn').addEventListener('click', testBackendConnection);
  document.getElementById('clearDownloadsBtn').addEventListener('click', clearRecentDownloads);

  // Add event delegation for upload buttons (since they're dynamically created)
  document.getElementById('downloadsList').addEventListener('click', (e) => {
    if (e.target.classList.contains('upload-btn')) {
      const downloadId = parseInt(e.target.getAttribute('data-download-id'));
      const filename = e.target.getAttribute('data-filename');
      uploadFile(downloadId, filename);
    }
  });

  // Allow Enter key to add URL
  document.getElementById('baseUrlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBaseUrl();
    }
  });

  // Load initial data
  loadRecentDownloads();
});
