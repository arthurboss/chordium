const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/cifraclub-search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const searchUrl = `https://www.cifraclub.com.br/?q=${encodeURIComponent(query)}`;
    console.log(`Searching Cifra Club for: ${query}`);

    let browser;
    try {
        // ✅ Launch Puppeteer with proper session management
        browser = await puppeteer.launch({
            headless: true, // ✅ Run in headless mode for production efficiency
            defaultViewport: null,
            args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        console.log("Page loaded, extracting song links...");

        // ✅ Extract real search results (Google injected links)
        const results = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.gsc-result a'))
                .map(link => ({
                    title: link.textContent.trim(),
                    url: link.href.startsWith('http') ? link.href : `https://www.cifraclub.com.br${link.href}`
                }))
                .filter(r => r.title && r.url);
        });

        console.log(`Found ${results.length} results`);

        // ✅ Properly close Puppeteer session
        await browser.close();
        console.log('✅ Puppeteer browser session successfully closed');
        res.json(results);
    } catch (err) {
        console.error('Scraping failed:', err.message);
        if (browser) {
            await browser.close(); // ✅ Ensure the session is closed even in case of errors
            console.log('✅ Puppeteer browser session closed after error');
        }
        res.status(500).json({ error: 'Scraping failed' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Cifra Club scraper backend running on port ${PORT}`);
});
