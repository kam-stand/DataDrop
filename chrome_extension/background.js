const apiUrl = "http://localhost:8080/api/v1/url";

let baseUrls = [];

// Load base URLs initially
async function loadBaseUrls() {
  try {
    const response = await fetch(apiUrl);
    baseUrls = await response.json();
  } catch (err) {
    console.error('Failed to load base URLs', err);
  }
}
loadBaseUrls();
setInterval(loadBaseUrls, 60000);

chrome.downloads.onCreated.addListener((downloadItem) => {
  const url = downloadItem.url;
  const matchingBase = baseUrls.find(u => url.startsWith(u.baseUrl));
  const downloadInfo = {
    id: downloadItem.id.toString(),
    filename: downloadItem.filename || downloadItem.url.split('/').pop(),
    fileUrl: downloadItem.url,
    baseUrl: matchingBase ? matchingBase.baseUrl : 'Unknown'
  };

  chrome.storage.local.get(['downloads'], (result) => {
    const downloads = result.downloads || [];
    downloads.unshift(downloadInfo);
    chrome.storage.local.set({ downloads });
  });

  if (matchingBase) {
    fetch(downloadItem.url)
      .then(response => response.blob())
      .then(blob => {
        const formData = new FormData();
        formData.append('file', blob, downloadItem.filename);
        fetch("http://localhost:8080/api/v1/files/upload", {
          method: 'POST',
          body: formData
        });
      });
  }
});
