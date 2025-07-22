// Background script to track downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
  // Store recent download info
  chrome.storage.local.get(['recentDownloads'], (result) => {
    const downloads = result.recentDownloads || [];
    const newDownload = {
      id: downloadItem.id,
      filename: downloadItem.filename,
      url: downloadItem.url,
      timestamp: new Date().toISOString()
    };
    
    // Keep only last 10 downloads
    downloads.unshift(newDownload);
    if (downloads.length > 10) {
      downloads.pop();
    }
    
    chrome.storage.local.set({ recentDownloads: downloads });
  });
});
