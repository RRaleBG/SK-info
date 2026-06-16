import express from 'express';
import httpProxy from 'http-proxy';

const app = express();
const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    secure: false
});

app.get('/api', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL obavezan');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Proxy-iramo zahtev
    proxy.web(req, res, { target: targetUrl }, (err) => {
        res.status(500).send('Proxy greska');
    });
});

export default function handler(req, res) {
    app(req, res);
}
