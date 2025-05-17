const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/cifraclub-search', async (req, res) => {
    // Get artist and song parameters
    const { artist, song } = req.query;
    
    // Combine artist and song if both are present
    const q = artist && song ? `${artist} ${song}` : artist || song;
    const searchType = artist && !song ? 'artist' : song && !artist ? 'song' : artist && song ? 'combined' : '';
    
    if (!q) return res.status(400).json({ error: 'Missing query' });

    console.log(`Received search query: ${q}`);

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

app.get('/api/cifraclub-artist-songs', async (req, res) => {
    const { artistUrl } = req.query;
    if (!artistUrl) return res.status(400).json({ error: 'Missing artistUrl' });

    let browser;
    try {
        // Extract artist slug from the URL
        let artistSlug = null;
        try {
            const url = new URL(artistUrl);
            const path = url.pathname.replace(/^\/+|\/+$/g, '');
            const segments = path.split('/');
            artistSlug = segments[0];
        } catch (e) {
            return res.status(400).json({ error: 'Invalid artistUrl' });
        }
        if (!artistSlug) return res.status(400).json({ error: 'Invalid artist slug' });

        const pageUrl = `https://www.cifraclub.com.br/${artistSlug}/`;
        console.log(`Scraping artist songs from: ${pageUrl}`);

        browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const blockedDomains = [
                'googleads.g.doubleclick.net', 'ads.pubmatic.com', 'adservice.google.com',
                'www.google-analytics.com', 'pixel.facebook.com'
            ];
            if (blockedDomains.some(domain => request.url().includes(domain))) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        console.log('Artist page loaded, extracting songs...');
        const songs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a.art_music-link')).map(link => ({
                title: link.textContent.trim(),
                url: link.href.startsWith('http') ? link.href : `https://www.cifraclub.com.br${link.getAttribute('href')}`
            })).filter(song => song.title && song.url);
        });
        console.log(`Found ${songs.length} songs for artist.`);
        await browser.close();
        res.json(songs);
    } catch (err) {
        console.error('Artist songs scraping failed:', err.message);
        if (browser) {
            await browser.close();
        }
        res.status(500).json({ error: 'Artist songs scraping failed' });
    }
});

app.get('/api/cifraclub-chord-sheet', async (req, res) => {
    const { url } = req.query;
    
    if (!url) return res.status(400).json({ error: 'Missing song URL' });
    
    console.log(`Fetching chord sheet from: ${url}`);
    
    // Log the requesting IP for debugging
    console.log(`Request from: ${req.ip || 'Unknown'} - User-Agent: ${req.get('User-Agent') || 'Unknown'}`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
        });
        
        const page = await browser.newPage();
        
        // Block ads & trackers to speed up scraping
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const blockedDomains = [
                'googleads.g.doubleclick.net', 'ads.pubmatic.com', 'adservice.google.com',
                'www.google-analytics.com', 'pixel.facebook.com'
            ];
            if (blockedDomains.some(domain => request.url().includes(domain))) {
                request.abort();
            } else {
                request.continue();
            }
        });
        
        await page.goto(url, { waitUntil: 'networkidle2' });
        console.log('Chord sheet page loaded, extracting content...');
        
        const chordData = await page.evaluate(() => {
            // For debugging - log what we found
            const log = (element, name) => {
                console.log(`Element ${name}: ${element ? 'Found' : 'Not found'}`);
                return element;
            };
            
            // Extract the chord sheet content
            const preElement = log(document.querySelector('pre'), 'pre');
            const content = preElement ? preElement.textContent : '';
            
            // Extract capo position
            const capoElement = log(document.querySelector('span#cifra_capo'), 'cifra_capo');
            const capo = capoElement ? capoElement.textContent.trim() : '';
            
            // Extract tuning
            const tuningElement = log(document.querySelector('[data-cy="song-tuningValue"]'), 'tuningValue');
            const tuning = tuningElement ? tuningElement.value : '';
            
            // Extract key
            const keyElement = log(document.querySelector('span#cifra_tom'), 'cifra_tom');
            const key = keyElement ? keyElement.textContent.trim() : '';
            
            // Get title and artist from meta tags for backup
            const metaTitle = document.querySelector('meta[property="og:title"]')?.content || '';
            const metaDescription = document.querySelector('meta[property="og:description"]')?.content || '';
            
            return {
                content,
                capo,
                tuning,
                key,
                metaTitle,
                metaDescription,
                html: document.documentElement.outerHTML.slice(0, 500) // First 500 chars for debugging
            };
        });
        
        await browser.close();
        console.log('✅ Chord sheet successfully scraped');
        
        // Extract artist and song from URL path
        let artist = '';
        let song = '';
        
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname.replace(/^\/|\/$/g, '');
            const segments = path.split('/');
            
            if (segments.length >= 2) {
                artist = segments[0].replace(/-/g, ' ');
                song = segments[1].replace(/-/g, ' ');
            }
        } catch (e) {
            console.error('Failed to extract artist/song from URL:', e);
        }
        
        res.json({
            ...chordData,
            artist,
            song
        });
    } catch (err) {
        console.error('Chord sheet scraping failed:', err.message);
        if (browser) {
            await browser.close();
        }
        res.status(500).json({ error: 'Chord sheet scraping failed' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Cifra Club scraper backend running on port ${PORT}`);
});
