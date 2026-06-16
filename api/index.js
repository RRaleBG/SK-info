import express from 'express';
import httpProxy from 'http-proxy';

const app = express();
const proxy = httpProxy.createProxyServer({});

// Proxy ruta unutar Express aplikacije
app.get('/api', (req, res) => { // Vercel će ovo videti kao /api
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL obavezan');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    proxy.web(req, res, { target: new URL(targetUrl).origin, changeOrigin: true, secure: false });
});

// Ovo je ključ za Vercel API funkcije
export default app;
