// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const cheerio = require('cheerio');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.post('/scrape', async (req, res) => {
//     const { url, types } = req.body;

//     try {
//         // Step 1: Try fetching JSON data from the API
//         const jsonData = await fetchJsonData(url);

//         if (jsonData && Object.keys(jsonData).length > 0) {
//             // JSON data found, return it
//             return res.json({ data: jsonData });
//         } else {
//             // JSON data not found, fallback to HTML scraping
//             const htmlData = await fetchHtmlData(url, types);
//             return res.json({ data: htmlData });
//         }
//     } catch (error) {
//         console.error('Error during scraping:', error.message);
//         res.status(500).json({ error: 'Failed to scrape the URL' });
//     }
// });

// // Function to fetch JSON data from the website
// const fetchJsonData = async (url) => {
//     try {
//         const response = await axios.get(url, {
//             headers: {
//                 'Accept': 'application/json, text/plain, */*'
//             },
//             timeout: 10000, // 10 seconds timeout
//         });

//         if (response.headers['content-type'].includes('application/json')) {
//             return response.data; // Return JSON data if found
//         } else {
//             return null; // JSON not found
//         }
//     } catch (error) {
//         console.warn('No JSON data found or error fetching JSON:', error.message);
//         return null; // Silent fail, no logging, return null to fallback to HTML
//     }
// };

// // Function to scrape data from HTML
// const fetchHtmlData = async (url, types) => {
//     try {
//         const response = await axios.get(url, { timeout: 10000 }); // 10 seconds timeout
//         const $ = cheerio.load(response.data);
//         let data = {};

//         if (types.includes('text')) {
//             data.text = $('body').text().trim(); // Extract text content
//         }
//         if (types.includes('html')) {
//             data.html = $.html(); // Extract raw HTML
//         }
//         if (types.includes('images')) {
//             data.images = $('img').map((i, img) => $(img).attr('src')).get(); // Extract image URLs
//         }
//         if (types.includes('links')) {
//             data.links = $('a').map((i, link) => $(link).attr('href')).get(); // Extract links
//         }
//         if (types.includes('structuredData')) {
//             data.structuredData = $('script[type="application/ld+json"]').map((i, script) => $(script).html()).get(); // Extract structured data
//         }
//         if (types.includes('custom')) {
//             // Placeholder for custom data extraction logic
//             // Implement your custom logic here based on requirements
//             data.custom = 'Custom data extraction logic not implemented';
//         }

//         return data;
//     } catch (error) {
//         console.error('Error during HTML scraping:', error.message);
//         throw new Error('Failed to scrape HTML content');
//     }
// };

// app.listen(5000, () => {
//     console.log('Server is running on port 5000');
// });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const app = express();
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

let visitorCount = 0;

// Middleware for logging requests
const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    console.log('Request body:', req.body);
    next();
};

// Middleware for validating input
const validateInput = (req, res, next) => {
    const { url, types } = req.body;

    if (!url || !types || !Array.isArray(types) || types.length === 0) {
        return res.status(400).json({ error: 'Invalid request: URL and types are required.' });
    }

    next(); // Proceed to the next middleware or route handler
};



// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
    console.error('Error during processing:', err.message);

    if (err.code === 'ENOTFOUND' || err.response?.status === 404) {
        return res.status(400).json({ error: `Invalid URL: ${req.body.url}` });
    }

    res.status(500).json({ error: 'An internal error occurred.' });
};

// Apply middlewares globally
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/scrape', validateInput);

// Middleware to increment visitor count
const incrementVisitorCount = (req, res, next) => {
    visitorCount++;
    console.log(`Visitor count: ${visitorCount}`);
    next();
};


// Serve homepage with visitor count
app.get('/', incrementVisitorCount, (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                    }
                    .content {
                        flex: 1;
                        padding: 20px;
                        text-align: center;
                    }
                    footer {
                        background-color: #f1f1f1;
                        padding: 10px;
                        text-align: center;
                        position: absolute;
                        bottom: 0;
                        width: 100%;
                    }
                </style>
            </head>
            <body>
                <div class="content">
                    <h1>Welcome to my web page!</h1>
                    <p>Enjoy browsing!</p>
                </div>
                <footer>
                    <p>Number of visitors: ${visitorCount}</p>
                </footer>
            </body>
        </html>
    `);
});
app.use('/scrape', validateInput);


app.post('/scrape', async (req, res, next) => {
    const { url, types } = req.body;

    try {
        const jsonData = await fetchJsonData(url);

        if (jsonData && Object.keys(jsonData).length > 0) {
            return res.json({ data: jsonData });
        } else {
            const htmlData = await fetchHtmlData(url, types);
            if (Object.keys(htmlData).length > 0) {
                return res.json({ data: htmlData });
            } else {
                return res.status(404).json({ error: 'No data found on the page.' });
            }
        }
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

app.post('/download-csv', (req, res) => {
    const { data } = req.body;

    try {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment('scraped_data.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error during CSV conversion:', error);
        res.status(500).json({ error: 'Failed to convert data to CSV' });
    }
});

const fetchJsonData = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
            return response.data; 
        } else {
            return null; 
        }
    } catch (error) {
        console.error('Error fetching JSON data:', error.message);
        return null; 
    }
};

const fetchHtmlData = async (url, types) => {
    try {
        const response = await client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.google.com' // Update with a valid referer if needed
            }
        });
        const $ = cheerio.load(response.data);
        let data = {};

        const resolveUrl = (relativeUrl) => {
            const baseUrl = new URL(url);
            return new URL(relativeUrl, baseUrl).href;
        };

        if (types.includes('text')) {
            data.text = $('body').text().trim();
        }
        if (types.includes('html')) {
            data.html = $.html();
        }
        if (types.includes('images')) {
            data.images = $('img').map((i, img) => {
                const src = $(img).attr('src');
                return src ? resolveUrl(src) : null;
            }).get().filter(url => url !== null);
        }
        if (types.includes('links')) {
            data.links = $('a').map((i, link) => $(link).attr('href')).get();
        }
        if (types.includes('structuredData')) {
            data.structuredData = $('script[type="application/ld+json"]').map((i, script) => $(script).html()).get();
        }

        return data;
    } catch (error) {
        console.error('Error during HTML scraping:', error.message);
        return {};
    }
};

app.use(errorHandler); // Apply the error handler middleware

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
