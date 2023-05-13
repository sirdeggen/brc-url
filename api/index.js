const app = require('express')();
const { kv } = require("@vercel/kv");

async function redirectTraffic(req, res) {
    try {
        const brc = req.params["brc"] || '';
        const path = await kv.get(brc);
        return res.status(308).redirect('https://bsv.brc.dev' + path);
    } catch (error) {
        console.log({ error })
        return res.status(308).redirect('https://bsv.brc.dev');
    }
}

async function setBRCUrl(req, res) {
    try {
        const { brc, path, token } = req.body
        if (token !== process.env.BEARER_TOKEN) return res.status(401).json({ error: 'token in body is invalid' });
        await kv.set(brc, path);
        return res.status(201).json({ [brc]: path });
    } catch (error) {
        console.log({ error })
        return res.status(500).end();
    }
}

app.get('/', redirectTraffic);
app.get('/:brc', redirectTraffic);
app.post('/set/url', setBRCUrl);

module.exports = app;