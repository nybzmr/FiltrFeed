# FiltrFeed 🎯

> Turn YouTube into your personal learning assistant. Block distractions. Focus better.

FiltrFeed is a Chrome extension that helps learners stay focused on educational content by automatically filtering out non-educational YouTube videos. No more rabbit holes — just pure productivity.
 ![CtrlTube Banner](Extension/icon.jpeg)

---

## 🚀 Features

- ✅ Automatically hides non-educational YouTube content  
- 🎯 Designed to identify distractions like Shorts, music videos, and entertainment  
- 🔍 Uses keyword analysis and heuristics to detect content type  
- 🧠 Perfect for students and lifelong learners  
- 🌐 Lightweight and privacy-respecting Chrome extension  

---

## 📸 Preview

> _Screenshots of the extension in action_

| Before | After |
|--------|-------|
| ![Before](assets/Screenshot%202026-09-08%20at%208.15.16 PM.png) | ![After](assets/Screenshot%202026-09-08%20at%208.15.05 PM.png) | 
---


## 🧩 Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/nybzmr/FiltrFeed.git
   ```
2. Open [chrome://extensions](chrome://extensions) in your browser.  
3. Enable **Developer Mode** (top right).  
4. Click **Load unpacked** and select the `FiltrFeed` folder.  

---

## 🛠️ Development

This project is built using:

- JavaScript (ES6)
- Chrome Extensions APIs
- Manifest v3

> **Key files:**
- `service_worker.js` – background service worker
- `content.js` – logic injected into YouTube pages
- `popup.html` – minimal UI interface (if needed)

---

## 🔍 How It Works

FiltrFeed evaluates YouTube thumbnails, titles, and metadata using predefined rules and keyword filters. Videos deemed distracting are automatically hidden or removed from the page.

> **Planned:** AI-based detection using Gemini API (coming soon).

---

## 📦 Folder Structure

```
FiltrFeed/
│
├── extension/           # main folder
├──├── popup.html           # Extension popup
├──├── content.js           # Page logic
├──├── service_worker.js    # Background service worker
├──├── manifest.json        # Extension config
└──├── styles.css           # Optional styling
```
---

## 🤝 Contributing

Pull requests are welcome! To contribute:

1. Fork the repo  
2. Create your feature branch:  
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit changes:  
   ```bash
   git commit -m 'Add your feature'
   ```
4. Push to the branch:  
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request  

---

## 🙌 Acknowledgments

Created with passion by [Nayaab Zameer](https://github.com/nybzmr).