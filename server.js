import express from 'express';
import httpProxy from 'http-proxy';

const app = express();
const proxy = httpProxy.createProxyServer({});

// Logovanje grešaka proxy-ja da se server ne bi rušio
proxy.on('error', (err, req, res) => {
    console.error('Proxy greška:', err);
    if (!res.headersSent) {
        res.status(500).send('Proxy neuspešan');
    }
});

app.get('/proxy', (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL parametar je obavezan');
    }

    try {
        const target = new URL(targetUrl).origin;

        // Postavi CORS headere da browser dozvoli strimovanje
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        // Proxy konfiguracija
        proxy.web(req, res, {
            target: target,
            changeOrigin: true,    // Važno za AMSS/MUP servere
            secure: false,         // Ignoriše istekle SSL sertifikate
            ignorePath: false      // Prosleđuje punu putanju
        });

    } catch (err) {
        console.error('Neispravan URL:', err);
        res.status(400).send('Neispravan URL format');
    }
});

// Ruta za proveru da li proxy radi
app.get('/status', (req, res) => res.send('Proxy server je aktivan'));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`Proxy aktivan na http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
});