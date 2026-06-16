# 📺 SK-Info Portal
### Advanced Dispatch Center Monitoring & Information Management System

*A real-time video streaming system featuring a built-in CORS proxy solution.*

---

## 🏗 System Architecture
The application solves the problem of restricted access to video streams by using a local proxy server, allowing for seamless integration into the web interface without CORS blocking issues.

## 🚀 Key Features
* ⚡ **Low-Latency Streaming:** Integration with `hls.js` for minimal delay.
* 🛡️ **CORS Bypass:** Proxy server on `localhost:4000` to handle external source blocks.
* 📱 **PWA Ready:** Service Workers enabled for offline capabilities and caching.
* 🧩 **Modular Design:** Dynamic M3U playlist loading and channel filtering.
* 🔔 **Smart Notifications:** Push notification system for dispatch alerts.

## 🛠 Installation
Clone the repository and launch the development environment with a single command:

# Clone the repository
git clone https://github.com/RRaleBG/SK-info.git

# Install dependencies
npm install

# Start the proxy and frontend server
npm run dev

## 🗺 Roadmap (Future Plans)
- [ ] **Dark Mode:** Theme implementation optimized for low-light control room environments.
- [ ] **Multi-Stream View:** Grid layout for monitoring 4+ cameras simultaneously.
- [ ] **Search Engine:** Real-time channel search functionality.
- [ ] **Auto-Update:** Automated script to verify stream health and prune dead links.
- [ ] **User Auth:** Basic role-based access for system administrators.

## ⚙️ Proxy Configuration
The server runs on port `4000`. If you encounter issues with third-party sources, use the `secure: false` option in `server.js` to bypass outdated SSL certificate requirements.

## 📂 Repository Structure

```text
SK-Info/
├── public/          # Frontend (HTML, CSS, JS)
├── scripts/         # Data automation scripts
├── server.js        # Node.js Express Proxy
├── sw.js            # Service Worker logic
└── package.json     # Dependencies and scripts
```
## 💡 Tips & Troubleshooting
- **Channels:** Keep your `kanali.m3u` file updated with verified streaming URLs.
- **Debugging:** Use the `Network` tab in Chrome DevTools with the filter "proxy" to monitor requests.
- **Logs:** Proxy errors are piped directly to the terminal where `npm run dev` is running.

---
Created by RRaleBG
