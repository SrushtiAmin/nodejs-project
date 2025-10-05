// Importing required modules
const express = require('express');
const fs = require('fs').promises;  // Using async fs methods
const { v4: uuidv4 } = require('uuid');
const validUrl = require('valid-url');

const app = express();
const PORT = 3000;
const DATA_FILE = './data/urls.json';

app.use(express.json()); // Middleware to parse JSON requests

// ---------------- Helper Functions ----------------

// ✅ Read data from JSON file (asynchronous)
async function readUrls() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn’t exist, return empty array
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

// ✅ Write data to JSON file (asynchronous)
async function writeUrls(urls) {
  await fs.writeFile(DATA_FILE, JSON.stringify(urls, null, 2));
}

// ✅ Generate short code
function generateShortCode() {
  return uuidv4().slice(0, 8); // Short unique ID
}

// ---------------- ROUTES ----------------

// 1️⃣ GET - Fetch all URLs or search by shortCode
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await readUrls();
    const { code } = req.query;

    if (code) {
      const found = urls.find(u => u.shortCode === code);
      if (!found) return res.status(404).json({ error: 'Short code not found' });
      return res.json(found);
    }

    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// 2️⃣ POST - Create a new short URL
app.post('/api/urls', async (req, res) => {
  try {
    const { originalUrl, expiresAt } = req.body;

    // Validation
    if (!originalUrl || !validUrl.isUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    const urls = await readUrls();
    const shortCode = generateShortCode();

    const newUrl = {
      id: uuidv4(),
      shortCode,
      originalUrl,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      isActive: true
    };

    urls.push(newUrl);
    await writeUrls(urls);

    res.status(201).json({ message: 'Short URL created successfully', data: newUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

// 3️⃣ PUT - Full update (replace entire record)
app.put('/api/urls/:id', async (req, res) => {
  try {
    const { originalUrl, expiresAt, isActive } = req.body;
    const urls = await readUrls();
    const index = urls.findIndex(u => u.id === req.params.id);

    if (index === -1) return res.status(404).json({ error: 'URL not found' });

    // Validation
    if (!originalUrl || !validUrl.isUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    // Replace the whole object
    urls[index] = {
      ...urls[index],
      originalUrl,
      expiresAt: expiresAt || null,
      isActive: isActive ?? true,
      updatedAt: new Date().toISOString()
    };

    await writeUrls(urls);
    res.json({ message: 'URL updated successfully', data: urls[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update URL' });
  }
});

// 4️⃣ PATCH - Partial update (update specific fields only)
app.patch('/api/urls/:id', async (req, res) => {
  try {
    const { originalUrl, expiresAt, isActive } = req.body;
    const urls = await readUrls();
    const url = urls.find(u => u.id === req.params.id);

    if (!url) return res.status(404).json({ error: 'URL not found' });

    if (originalUrl && !validUrl.isUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Only update provided fields
    if (originalUrl) url.originalUrl = originalUrl;
    if (expiresAt) url.expiresAt = expiresAt;
    if (typeof isActive === 'boolean') url.isActive = isActive;

    url.updatedAt = new Date().toISOString();

    await writeUrls(urls);
    res.json({ message: 'URL partially updated', data: url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to partially update URL' });
  }
});

// 5️⃣ DELETE - Remove a URL
app.delete('/api/urls/:id', async (req, res) => {
  try {
    const urls = await readUrls();
    const filtered = urls.filter(u => u.id !== req.params.id);

    if (urls.length === filtered.length) {
      return res.status(404).json({ error: 'URL not found' });
    }

    await writeUrls(filtered);
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

// 6️⃣ Redirect route - (optional) Access original URL using shortCode
app.get('/:code', async (req, res) => {
  try {
    const urls = await readUrls();
    const url = urls.find(u => u.shortCode === req.params.code && u.isActive);

    if (!url) return res.status(404).json({ error: 'Invalid or expired short link' });

    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ error: 'Failed to redirect' });
  }
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
