import express from 'express';
import httpProxy from 'http-proxy';

const app = express();
const proxy = httpProxy.createProxyServer({});

// Logovanje grešaka proxy-ja
proxy.on('error', (err, req, res) => {
    console.error('Proxy greška:', err);
    if (!res.headersSent) {
        res.status(500).send('Proxy neuspešan');
    }
});

// Ovde više ne koristimo /proxy, već Vercel mapira fajl na /api/proxy
app.get('/', (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL parametar je obavezan');
    }

    try {
        const target = new URL(targetUrl).origin;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

        proxy.web(req, res, {
            target: target,
            changeOrigin: true,
            secure: false
        });
    } catch (err) {
        res.status(400).send('Neispravan URL');
    }
});

// UKLONI OVO: app.listen(PORT, ...) 

// DODAJ OVO ZA VERCEL:
module.exports = app;
