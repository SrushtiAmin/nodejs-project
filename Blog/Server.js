const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

// Validate env variables
if (!BASE_URL) {
  console.error("Error: BASE_URL not found in .env");
  process.exit(1);
}

// Helper: sanitize input
const sanitize = (str) => str.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Helper: validate positive integer
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

// ---------------- GET ROUTES ----------------

// Get all posts with pagination
app.get('/api/posts', async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (!isPositiveInt(page) || !isPositiveInt(limit)) {
      return res.status(400).json({ error: "Page and limit must be positive integers" });
    }

    const response = await fetch(`${BASE_URL}/posts`);
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    const posts = await response.json();
    const start = (page - 1) * limit;
    const end = page * limit;

    res.json(posts.slice(start, end));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID with comments
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid post ID" });

    const postRes = await fetch(`${BASE_URL}/posts/${id}`);
    if (!postRes.ok) return res.status(postRes.status).json({ error: `External API error: ${postRes.statusText}` });
    const post = await postRes.json();

    const commentsRes = await fetch(`${BASE_URL}/posts/${id}/comments`);
    if (!commentsRes.ok) return res.status(commentsRes.status).json({ error: `External API error: ${commentsRes.statusText}` });
    const comments = await commentsRes.json();

    post.comments = comments;
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments of a post
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid post ID" });

    const response = await fetch(`${BASE_URL}/posts/${id}/comments`);
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });
    const comments = await response.json();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single comment by ID
app.get('/api/comments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid comment ID" });

    const response = await fetch(`${BASE_URL}/comments/${id}`);
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });
    const comment = await response.json();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts by user
app.get('/api/users/:id/posts', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid user ID" });

    const response = await fetch(`${BASE_URL}/users/${id}/posts`);
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });
    const posts = await response.json();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- POST ROUTES ----------------

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    let { title, body, userId } = req.body;

    if (!title || !body || !userId) return res.status(400).json({ error: "title, body, and userId are required" });

    title = sanitize(title);
    body = sanitize(body);

    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId })
    });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new comment to a post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid post ID" });

    const { name, email, body } = req.body;
    if (!name || !email || !body) return res.status(400).json({ error: "name, email, body are required" });

    const sanitizedComment = {
      name: sanitize(name),
      email: sanitize(email),
      body: sanitize(body)
    };

    const response = await fetch(`${BASE_URL}/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedComment)
    });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- PUT & PATCH ROUTES ----------------

// Update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid post ID" });

    let { title, body, userId } = req.body;
    if (!title || !body || !userId) return res.status(400).json({ error: "title, body, userId required" });

    title = sanitize(title);
    body = sanitize(body);

    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId })
    });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patch a post
app.patch('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid post ID" });

    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patch a comment
app.patch('/api/comments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid comment ID" });

    const response = await fetch(`${BASE_URL}/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a comment
app.put('/api/comments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid comment ID" });

    const response = await fetch(`${BASE_URL}/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- DELETE ROUTES ----------------

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid post ID" });

    const response = await fetch(`${BASE_URL}/posts/${id}`, { method: 'DELETE' });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid comment ID" });

    const response = await fetch(`${BASE_URL}/comments/${id}`, { method: 'DELETE' });
    if (!response.ok) return res.status(response.status).json({ error: `External API error: ${response.statusText}` });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
