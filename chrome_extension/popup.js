const baseApi = "http://localhost:8080/api/v1";

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tab-add').addEventListener('click', () => showTab('add'));
  document.getElementById('tab-view').addEventListener('click', () => showTab('view'));
  document.getElementById('tab-downloads').addEventListener('click', () => showTab('downloads'));
  document.getElementById('addUrlBtn').addEventListener('click', addUrl);
});

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
  if (tabId === 'view') fetchUrls();
  if (tabId === 'downloads') loadDownloads();
}

async function addUrl() {
  const baseUrl = document.getElementById('baseUrl').value;
  const fileType = document.getElementById('fileType').value;

  if (!baseUrl) {
    alert("Please enter a base URL");
    return;
  }

  const response = await fetch(`${baseApi}/url`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ url: baseUrl, file_type: fileType })
  });

  if (response.ok) {
    alert('URL added successfully!');
    document.getElementById('baseUrl').value = '';
    fetchUrls();
  }
}

async function fetchUrls() {
  const response = await fetch(`${baseApi}/url`);
  const urls = await response.json();
  const urlList = document.getElementById('urlList');
  urlList.innerHTML = '';
  urls.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.baseUrl} (${u.file_type})`;
    urlList.appendChild(li);
  });
}

function loadDownloads() {
  chrome.storage.local.get(['downloads'], (result) => {
    const downloadList = document.getElementById('downloadList');
    downloadList.innerHTML = '';
    if (result.downloads) {
      result.downloads.forEach(d => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = '⬆';
        btn.addEventListener('click', () => uploadFile(d.id));
        li.textContent = `${d.filename} (${d.baseUrl}) `;
        li.appendChild(btn);
        downloadList.appendChild(li);
      });
    }
  });
}

async function uploadFile(downloadId) {
  chrome.storage.local.get(['downloads'], async (result) => {
    const download = result.downloads.find(d => d.id === downloadId);
    if (!download) return;

    const fileBlob = await fetch(download.fileUrl).then(r => r.blob());
    const formData = new FormData();
    formData.append('file', fileBlob, download.filename);

    await fetch(`${baseApi}/files/upload`, {
      method: 'POST',
      body: formData
    });
    alert('File uploaded successfully!');
  });
}
