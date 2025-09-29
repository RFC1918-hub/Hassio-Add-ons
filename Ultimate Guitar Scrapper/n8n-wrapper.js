const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/onsong', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send('Missing required parameter: id');
    }
    exec(`./ultimate-guitar-scraper onsong -id ${id}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(stderr);
        }
        res.send(stdout);
    });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
