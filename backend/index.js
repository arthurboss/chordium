const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/cifraclub-search', async (req, res) => {
    // Get artist and song parameters
    const { artist, song } = req.query;
    
    // Convert to the format Cifra Club expects
    const q = artist || song;
    const searchType = artist && !song ? 'artist' : song && !artist ? 'song' : 'combined';
    
    if (!q) return res.status(400).json({ error: 'Missing query' });

    const searchUrl = `https://www.cifraclub.com.br/?q=${encodeURIComponent(q)}`;
    console.log(`Searching Cifra Club for: ${q} (Type: ${searchType || 'combined'})`);

    let browser;
    try {
        // ✅ Launch Puppeteer with proper session management
        browser = await puppeteer.launch({
            headless: true, // ✅ Run in headless mode for efficiency
            defaultViewport: null,
            args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
        });

        const page = await browser.newPage();

        // ✅ **Block Ads & Trackers to speed up scraping**
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const blockedDomains = [
                'googleads.g.doubleclick.net', 'ads.pubmatic.com', 'adservice.google.com',
                'www.google-analytics.com', 'pixel.facebook.com'
            ];
            if (blockedDomains.some(domain => request.url().includes(domain))) {
                console.log(`❌ Blocking ad request: ${request.url()}`);
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        console.log("Page loaded, extracting links...");

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

        // Process results based on search type
        let filteredResults;
        
        if (searchType === 'artist') {
            // Filter to get only URLs with exactly one segment (artist)
            filteredResults = results.filter(result => {
                try {
                    const url = new URL(result.url);
                    const path = url.pathname.replace(/^\/|\/$/g, '');
                    const segments = path.split('/');
                    
                    // We want exactly 1 non-empty path segment (artist)
                    return segments.length === 1 && segments[0];
                } catch (e) {
                    return false;
                }
            }).map(result => ({
                ...result,
                title: result.title.replace(/ - Cifra Club$/, '')
            }));
            
            console.log(`Filtered to ${filteredResults.length} results with artist structure`);
        } 
        else if (searchType === 'song') {
            // Filter to get only URLs with both artist and song segments
            filteredResults = results.filter(result => {
                try {
                    const url = new URL(result.url);
                    const path = url.pathname.replace(/^\/|\/$/g, '');
                    const segments = path.split('/');
                    
                    // We want exactly 2 non-empty path segments (artist/song-title)
                    return segments.length === 2 && segments[0] && segments[1];
                } catch (e) {
                    return false;
                }
            }).map(result => ({
                ...result,
                title: result.title.replace(/ - Cifra Club$/, '')
            }));
            
            console.log(`Filtered to ${filteredResults.length} results with artist/song structure`);
        } 
        else {
            // Combined search - filter out URLs with more than 2 segments
            filteredResults = results.filter(result => {
                try {
                    const url = new URL(result.url);
                    const path = url.pathname.replace(/^\/|\/$/g, '');
                    const segments = path.split('/');
                    
                    // For combined search, allow paths with either 1 segment (artist) or 2 segments (artist/song)
                    // Exclude paths with more segments like artist/song/letra, artist/song/video, etc.
                    return (segments.length === 1 && segments[0]) || 
                           (segments.length === 2 && segments[0] && segments[1]);
                } catch (e) {
                    return false;
                }
            }).map(result => ({
                ...result,
                title: result.title.replace(/ - Cifra Club$/, '')
            }));
            
            console.log(`Filtered to ${filteredResults.length} results (combined search)`);
        }

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
