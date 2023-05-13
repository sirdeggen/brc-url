const app = require('express')();

function redirectTraffic(req, res) {
    try {
        const brc = req.params["brc"] || '';
        return res.status(308).redirect('https://bsv.brc.dev/' + brc);
    } catch (error) {
        return res.status(308).redirect('https://bsv.brc.dev');
    }
}

app.get('/', redirectTraffic);
app.get('/:brc', redirectTraffic);

module.exports = app;