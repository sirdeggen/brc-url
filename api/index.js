const app = require('express')();

app.get('/api/:slug', (req, res) => {
    const { slug } = req.params;
    res.redirect('https://bsv.brc.dev/' + slug, 308);
});

module.exports = app;