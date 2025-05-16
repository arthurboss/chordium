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
            // Get all links from the search results
            const links = Array.from(document.querySelectorAll('.gsc-result a'));
            
            return links
            .filter(link => {
                // Only keep links whose parent has exactly the "gs-title" class and nothing else
                const parent = link.parentElement;
                if (!parent) return false;
                
                // Check if parent has exactly the gs-title class
                return parent.className === 'gs-title';
            })
            .map(link => ({
                title: link.textContent.trim(),
                url: link.href.startsWith('http') ? link.href : `https://www.cifraclub.com.br${link.href}`
            }))
            .filter(r => r.title && r.url);
        });

        console.log(`Found ${results.length} total results`);

        // Filter to get only URLs with both artist and song segments and clean up titles
        const filteredResults = results.filter(result => {
            try {
                const url = new URL(result.url);
                // Remove the leading slash and trailing slash if exists, then split by slash
                const path = url.pathname.replace(/^\/|\/$/g, '');
                const segments = path.split('/');
                
                // We want exactly 2 non-empty path segments (artist/song-title)
                return segments.length === 2 && segments[0] && segments[1];
            } catch (e) {
                // If URL parsing fails for any reason, exclude this result
                return false;
            }
        }).map(result => ({
            ...result,
            title: result.title.replace(/ - Cifra Club$/, '')
        }));
        
        console.log(`Filtered to ${filteredResults.length} results with artist/song structure`);

        // ✅ Properly close Puppeteer session
        await browser.close();
        console.log('✅ Puppeteer browser session successfully closed');
        res.json(filteredResults);
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
