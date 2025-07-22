# DataDrop Chrome Extension

A simple Chrome extension that captures browser downloads and sends them to a backend for processing.

## Features

- **Downloads Tab**: View recent downloads with "Send to Backend" buttons
- **Base URLs Tab**: View and add base URLs with file types
- **Processed Files Tab**: View files that have been processed by the backend

## Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this folder
4. Make sure your backend is running on `localhost:8080`

## Backend API Endpoints

The extension connects to these endpoints:

- `GET /api/v1/url/` - Get all base URLs
- `POST /api/v1/url/` - Add new base URL
- `GET /api/v1/url/{id}` - Get specific base URL
- `GET /api/v1/files` - Get processed files
- `POST /api/v1/files/upload` - Upload file for processing

## Usage

1. Download files in your browser
2. Click the extension icon to open the popup
3. Go to "Downloads" tab to see recent downloads
4. Click "Send to Backend" to upload files for processing
5. Use "Base URLs" tab to manage URL patterns
6. Check "Processed Files" tab to see processed results

## File Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker to track downloads
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and API calls
- `icons/` - Extension icons
