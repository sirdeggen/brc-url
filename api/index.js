const app = require('express')();
const { kv } = require("@vercel/kv");
const bearerToken = require('express-bearer-token');

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
        if (req["token"] !== process.env.BEARER_TOKEN) return res.status(401).json({ error: 'you need a token' });
        console.log({ req })
        const { brc, path } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        await kv.set(brc, path);
        return res.status(201).json({ [brc]: path });
    } catch (error) {
        console.log({ error })
        return res.status(500).end();
    }
}

app.use(bearerToken());
app.get('/', redirectTraffic);
app.get('/:brc', redirectTraffic);
app.post('/set/url', setBRCUrl);

module.exports = app;