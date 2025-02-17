// filepath: /D:/DOWNLOAD/Jyoti/Projects/Web Scrapping/my-app/api/scrape.js
const cheerio = require('cheerio');
const axios = require('axios');

module.exports = async (req, res) => {
    const { url, types } = req.query;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let data = {};

        if (types.includes('structuredData')) {
            data.structuredData = $('script[type="application/ld+json"]').map((i, script) => $(script).html()).get();
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error during HTML scraping:', error.message);
        res.status(500).json({ error: 'Error during HTML scraping' });
    }
};