// const apiUrl = "http://localhost:8080/api/v1/url";

// let baseUrls = [];

// // Load base URLs initially
// async function loadBaseUrls() {
//   try {
//     const response = await fetch(apiUrl);
//     baseUrls = await response.json();
//   } catch (err) {
//     console.error('Failed to load base URLs', err);
//   }
// }
// loadBaseUrls();
// setInterval(loadBaseUrls, 60000);

// chrome.downloads.onCreated.addListener((downloadItem) => {
//   const url = downloadItem.url;
//   const matchingBase = baseUrls.find(u => url.startsWith(u.baseUrl));
//   const downloadInfo = {
//     id: downloadItem.id.toString(),
//     filename: downloadItem.filename || downloadItem.url.split('/').pop(),
//     fileUrl: downloadItem.url,
//     baseUrl: matchingBase ? matchingBase.baseUrl : 'Unknown'
//   };

//   chrome.storage.local.get(['downloads'], (result) => {
//     const downloads = result.downloads || [];
//     downloads.unshift(downloadInfo);
//     chrome.storage.local.set({ downloads });
//   });

//   if (matchingBase) {
//     fetch(downloadItem.url)
//       .then(response => response.blob())
//       .then(blob => {
//         const formData = new FormData();
//         formData.append('file', blob, downloadItem.filename);
//         fetch("http://localhost:8080/api/v1/files/upload", {
//           method: 'POST',
//           body: formData
//         });
//       });
//   }
// });



const baseUrlApi = "http://localhost:8080/api/v1/url";
const uploadApi = "http://localhost:8080/api/v1/files/upload";
const SUPPORTED_TYPES = ['pdf','jpeg','jpg','png','csv','txt','doc','docx','xls','xlsx','ppt','pptx','zip','rar','json','xml'];

let baseUrls = [];

// Load base URLs periodically
async function loadBaseUrls() {
  try {
    const res = await fetch(baseUrlApi);
    baseUrls = await res.json();
    console.log("Base URLs loaded:", baseUrls);
  } catch (e) {
    console.error("Failed to load base URLs", e);
  }
}
loadBaseUrls();
setInterval(loadBaseUrls, 60000);

// Listen for new downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
  const url = downloadItem.url;
  const ext = (downloadItem.filename || url).split('.').pop().toLowerCase();

  // 1. Check file type
  if (!SUPPORTED_TYPES.includes(ext)) {
    console.log("Skipped unsupported file:", ext);
    return;
  }

  // 2. Check base URL match
  const matchingBase = baseUrls.find(u => url.startsWith(u.baseUrl));
  if (!matchingBase) {
    console.log("URL not in base list:", url);
    return;
  }

  console.log("Download from base URL detected:", url);

  // 3. Wait until download completes
  chrome.downloads.onChanged.addListener(function listener(delta) {
    if (delta.id === downloadItem.id && delta.state && delta.state.current === "complete") {
      console.log("Download complete:", downloadItem.filename);

      // Upload file using download URL
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append('file', blob, downloadItem.filename || `file.${ext}`);
          return fetch(uploadApi, {
            method: 'POST',
            body: formData
          });
        })
        .then(() => console.log("File uploaded successfully"))
        .catch(err => console.error("Upload failed:", err));

      chrome.downloads.onChanged.removeListener(listener);
    }
  });
});
