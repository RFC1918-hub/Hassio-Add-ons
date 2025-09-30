const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3000;

// Security: Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit to 10 Google Drive uploads per 15 minutes
    message: 'Too many uploads, please try again later.'
});

app.use(limiter); // Apply to all requests

// Security: Configure CORS to only allow specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '1mb' })); // Limit payload size

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing, return all requests to React app
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Search endpoint
app.get('/search', async (req, res) => {
    const { title } = req.query;
    if (!title) {
        return res.status(400).send('Missing required parameter: title');
    }

    try {
        const searchUrl = `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(title)}`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'UGT_ANDROID/4.11.1 (Pixel; 8.1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        const html = response.data;
        // Extract <div class="js-store" data-content="...">
        const match = html.match(/<div class="js-store"[^>]*data-content="([^"]+)"/);
        if (!match) return res.json([]);

        const decode = str =>
            str.replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&#39;/g, "'")
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>');

        const store = JSON.parse(decode(match[1]));
        const results = store.store.page.data.results || [];

    // Pick top-rated per artist
    const topResults = {};
    results.forEach(r => {
      const artist = r.artist_name || 'Unknown';
      if (!topResults[artist] || r.rating > (topResults[artist].rating || 0)) {
        topResults[artist] = {
          id: r.id,
          song: r.song_name,
          artist: r.artist_name,  // Added artist to the response
          type: r.type,
          url: r.tab_url,
          rating: r.rating
        };
      }
    });

    res.json(Object.values(topResults));
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to search Ultimate Guitar');
  }
});

// OnSong endpoint
app.post('/onsong', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send('Missing required parameter: id');
    }
    
    // Security: Validate ID is a number to prevent command injection
    const tabId = parseInt(id, 10);
    if (isNaN(tabId) || tabId <= 0) {
        return res.status(400).send('Invalid tab ID');
    }
    
    exec(`./ultimate-guitar-scraper onsong -id ${tabId}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Failed to retrieve OnSong format');
        }
        res.send(stdout);
    });
});

// Google Drive proxy endpoint
app.post('/send-to-drive', strictLimiter, async (req, res) => {
    try {
        // Security: Get webhook URL from environment variable
        const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-058ea47.peakhq.co.za/webhook/703db9aa-615a-433c-aff6-67aea85e0712';
        
        // Security: Validate required fields
        const { content, song, artist, id } = req.body;
        if (!content || !song || !artist || !id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        console.log('Forwarding request to n8n webhook:', webhookUrl);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        // Forward the request to the n8n webhook
        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
        
        console.log('n8n webhook response:', response.status, response.data);
        
        // Forward the response back to the frontend
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error forwarding to Google Drive webhook:', error.message);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        
        // Return appropriate error response
        if (error.response) {
            const errorMessage = error.response.status === 404 
                ? 'n8n webhook not found. Please check if the workflow is active and the webhook URL is correct.'
                : error.response.data || 'Failed to send to Google Drive';
            
            res.status(error.response.status).json({
                error: errorMessage,
                details: {
                    status: error.response.status,
                    statusText: error.response.statusText
                }
            });
        } else {
            res.status(500).json({
                error: 'Failed to connect to Google Drive service'
            });
        }
    }
});

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(port, '0.0.0.0', () => {
  console.log(`Ultimate Guitar app running on port ${port}`);
});
