# 📥 DataDrop

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring-Boot-brightgreen?style=for-the-badge&logo=spring)
![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange?style=for-the-badge&logo=amazonaws)
![Google Drive](https://img.shields.io/badge/Google-Drive-blue?style=for-the-badge&logo=googledrive)
![OAuth 2.0](https://img.shields.io/badge/OAuth-2.0-red?style=for-the-badge)

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)
![CSS3](https://img.shields.io/badge/CSS3-Modern-blue?style=flat-square&logo=css3)
![REST API](https://img.shields.io/badge/REST-API-green?style=flat-square)
![Serverless](https://img.shields.io/badge/Serverless-Architecture-purple?style=flat-square)
![MIT License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)

**🚀 DataDrop – Automated file processing with AWS triggers**

Upload a file, trigger automatic AWS processing, get results in Google Drive. A backend-driven automation tool that monitors downloads and runs serverless compute jobs for data transformation via Spring Boot API.

## 🚀 Features

### 🎯 Core Functionality

- 📊 **Smart Download Tracking** - Monitor downloads from specific URLs with real-time detection
- ⚡ **Automated Processing** - Send files to cloud functions when downloaded from monitored sites
- ☁️ **Cloud Integration** - Seamless processing with AWS Lambda and Google Drive storage
- 🎨 **Modern UI** - Clean, tabbed interface with real-time updates and animations

### 🔧 Advanced Capabilities

- 🔍 **URL Pattern Matching** - Intelligent base URL detection (e.g., `https://example.com/*`)
- 📁 **File Type Recognition** - Support for CSV, JSON, XML, PDF, and more
- 🔔 **Real-time Notifications** - Instant updates on processing status
- 📱 **Responsive Design** - Works across different screen sizes
- 🔄 **Auto-refresh** - Live updates without manual refresh
- 🗑️ **Bulk Operations** - Clear all or remove individual downloads

## 🏗️ Architecture

### 🔄 Data Flow Overview

```
🌐 Web Browser → 📦 Chrome Extension → 🔐 Spring Boot API → ☁️ AWS Lambda → 📁 Google Drive
```

### 🎯 Detailed Workflow Diagram

```
👤 User Downloads File
        ↓
🔍 Extension Monitors URL
        ↓
📝 Checks Monitored List
        ↓
✅ URL Match Found?
        ↓
📤 Send to Spring Boot API
        ↓
🔐 Google OAuth Authentication
        ↓
🚀 Trigger AWS Lambda Function
        ↓
⚙️ Process Data (CSV/JSON/etc)
        ↓
📊 Transform & Analyze
        ↓
📁 Save Results to Google Drive
        ↓
🔔 Notify User of Completion
```

### 🧩 Component Architecture

| Component                | Role                | Technology                |
| ------------------------ | ------------------- | ------------------------- |
| 🖱️ **User Interface**    | Extension Popup     | HTML5 + CSS3 + JavaScript |
| 📦 **Chrome Extension**  | Download Monitoring | Manifest V3 + Chrome APIs |
| 🔐 **Authentication**    | User Security       | Google OAuth 2.0          |
| 🏗️ **Backend API**       | Business Logic      | Spring Boot + REST        |
| ☁️ **Processing Engine** | Data Transformation | AWS Lambda Functions      |
| 📁 **Storage**           | File Management     | Google Drive API          |
| 🔔 **Notifications**     | User Updates        | Chrome Notifications      |

## 🛠️ Tech Stack

### 🎨 Frontend Layer

- 📦 **Chrome Extension** (Manifest V3) - Browser integration
- 🟨 **Vanilla JavaScript** - Popup interface & logic
- 🎨 **CSS3** - Modern responsive design with animations
- 🔄 **Chrome APIs** - Downloads, Storage, Runtime messaging

### 🏗️ Backend Layer

- 🍃 **Spring Boot** - REST API and business logic
- 🔐 **Google OAuth 2.0** - Secure user authentication
- 🌐 **Google Workspace APIs** - Drive integration & file management
- 📡 **RESTful Services** - API endpoints for extension communication

### ☁️ Cloud Infrastructure

- ⚡ **AWS Lambda** - Serverless data processing functions
- 📁 **Google Drive API** - Cloud file storage and sharing
- 🔧 **Google Cloud Functions** - Alternative processing option
- 🔔 **Chrome Notifications** - Real-time user updates

### 🔌 APIs & Integrations

- 📥 **Chrome Downloads API** - Real-time download monitoring
- 💾 **Chrome Storage API** - Local data persistence
- 📨 **Chrome Runtime Messaging** - Inter-component communication
- 🔑 **Google OAuth Flow** - Secure authentication workflow

## 📋 Step-by-Step Workflow

### 🎯 Phase 1: Setup & Monitoring

```
1️⃣ 🔧 Install Extension → 2️⃣ 📝 Add URLs → 3️⃣ 👀 Monitor Downloads
```

### 🎯 Phase 2: Detection & Processing

```
4️⃣ 📥 Download Detected → 5️⃣ 🔍 URL Check → 6️⃣ 🚀 Send to Cloud
```

### 🎯 Phase 3: Transformation & Storage

```
7️⃣ ⚙️ Process Data → 8️⃣ 📊 Transform → 9️⃣ 📁 Save to Drive → 🔟 🔔 Notify User
```

### 🔄 Real-Time Process Flow

| Step | Action                      | Component           | Result              |
| ---- | --------------------------- | ------------------- | ------------------- |
| 🟢   | User downloads file         | 🌐 Browser          | File detected       |
| 🔵   | Extension captures download | 📦 Chrome Extension | URL analyzed        |
| 🟡   | Check if URL is monitored   | 📦 Chrome Extension | Match/No match      |
| 🟠   | Send to backend API         | 🔐 Spring Boot      | Authentication      |
| 🔴   | Process with Lambda         | ☁️ AWS Lambda       | Data transformation |
| 🟣   | Store results               | 📁 Google Drive     | File saved          |
| ✅   | Notify completion           | 🔔 Notifications    | User informed       |

## 🎯 Use Cases

- **Data Scientists**: Automatically process CSV/JSON downloads
- **Researchers**: Transform datasets from research portals
- **Analysts**: Process reports from business tools
- **Developers**: Handle API response files

## 🔧 Setup

### Chrome Extension

1. Enable Developer Mode in `chrome://extensions/`
2. Click "Load unpacked" and select the `chrome-extension` folder
3. Pin the extension and start adding monitored URLs

### Backend Services

1. **Spring Boot**: Configure Google OAuth credentials
2. **AWS Lambda**: Deploy data processing functions
3. **Google Drive**: Set up API access and folder permissions

## 📁 Project Structure

```
DataDrop/
├── chrome-extension/     # Chrome extension files
│   ├── manifest.json    # Extension configuration
│   ├── background.js    # Download tracking service
│   ├── popup.html       # Extension popup UI
│   ├── popup.js         # UI logic and communication
│   └── popup.css        # Modern styling
├── backend/             # Spring Boot API (coming soon)
├── lambda/              # AWS Lambda functions (coming soon)
└── README.md           # This file
```

## 🔒 Security

- Google OAuth 2.0 for secure authentication
- Chrome extension permissions limited to downloads only
- Encrypted data transmission to cloud services
- User-controlled URL monitoring

## 🎨 UI Features

- **Two-tab interface**: Recent Downloads & URL Management
- **Real-time updates**: Auto-refresh download status
- **File type indicators**: Visual icons for different formats
- **Status tracking**: Visual indicators for processing states
- **Clean design**: Modern gradients and smooth animations

## 🔄 Workflow

### 📊 AWS Lambda & S3 Integration

DataDrop leverages AWS serverless architecture for scalable file processing. When a file is uploaded to S3, it automatically triggers Lambda functions for data transformation and analysis.

#### 🏗️ Architecture Diagram

```
📁 File Upload → S3 Bucket → 🔔 Event Trigger → ⚡ Lambda Function → 📊 Process Data → 📁 Google Drive
```

#### ☁️ AWS Services Flow

![AWS Lambda Architecture](https://docs.aws.amazon.com/images/lambda/latest/dg/images/overview-layers.png)

**S3 Event-Driven Processing:**

- 📤 Files uploaded to designated S3 bucket
- 🔔 S3 events automatically trigger Lambda functions
- ⚡ Lambda processes data (CSV, JSON, XML transformation)
- 📊 Results stored back to S3 or forwarded to Google Drive

![S3 Event Notifications](https://docs.aws.amazon.com/images/AmazonS3/latest/userguide/images/notification-how-it-works.png)

#### 🚀 Lambda Function Triggers

| Event Type              | Trigger       | Action                    |
| ----------------------- | ------------- | ------------------------- |
| `s3:ObjectCreated:*`    | File uploaded | Start processing pipeline |
| `s3:ObjectCreated:Put`  | Direct upload | Immediate transformation  |
| `s3:ObjectCreated:Post` | Form upload   | Validate and process      |

### 🐳 Docker Deployment

Run the entire DataDrop stack locally using Docker:

#### 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone https://github.com/kam-stand/DataDrop.git
cd DataDrop

# Start all services with Docker Compose
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432
```

#### 📋 Docker Services

```yaml
# docker-compose.yml structure
services:
  frontend: # React/Vite development server
  backend: # Spring Boot API
  database: # PostgreSQL database
  localstack: # Local AWS services (S3, Lambda)
```

#### 🔧 Environment Configuration

```bash
# Create .env file for local development
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
S3_BUCKET_NAME=datadrop-processing
```

#### 📦 Container Architecture

```
🐳 Docker Network: datadrop-network
├── 🌐 Frontend Container (React + Vite)
├── 🔧 Backend Container (Spring Boot + Java 17)
├── 🗄️ Database Container (PostgreSQL 15)
└── ☁️ LocalStack Container (AWS Services)
```

### 🛠️ Development Workflow

1. **📝 Code Changes**: Edit source files locally
2. **🔄 Hot Reload**: Frontend auto-refreshes on changes
3. **🧪 Testing**: Run tests in isolated containers
4. **🚀 Deployment**: Push to AWS with automated CI/CD

#### 🔍 Monitoring & Logs

```bash
# View real-time logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitor Lambda executions locally
docker-compose logs -f localstack
```

---

**Built with ❤️ for automated data workflows**
