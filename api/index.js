const app = require('express')();

app.get('/:brc', (req, res) => {
    const { brc } = req.params;
    res.status(308).redirect('https://bsv.brc.dev/' + brc);
});

module.exports = app;