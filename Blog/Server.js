const express = require('express');
const app = express();


app.use(express.json());

// ---------------- GET ROUTES ----------------

// Get all posts (with pagination)
app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const response = await fetch(`${BASE_URL}/posts`);
    const posts = await response.json();
    const start = (page - 1) * limit;
    const end = page * limit;
    res.json(posts.slice(start, end));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get post by ID with comments
app.get('/api/posts/:id', async (req, res) => {
  try {
    const postRes = await fetch(`${BASE_URL}/posts/${req.params.id}`);
    const post = await postRes.json();
    const commentsRes = await fetch(`${BASE_URL}/posts/${req.params.id}/comments`);
    const comments = await commentsRes.json();
    post.comments = comments;
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Get comments of a post
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/posts/${req.params.id}/comments`);
    const comments = await response.json();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Get posts by user
app.get('/api/users/:id/posts', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${req.params.id}/posts`);
    const posts = await response.json();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
});

// ---------------- POST ROUTES ----------------

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = req.body;
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    });
    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Add new comment to a post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const newComment = req.body;
    const response = await fetch(`${BASE_URL}/posts/${req.params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment)
    });
    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// ---------------- PUT ROUTES ----------------

// Update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const updatedPost = req.body;
    const response = await fetch(`${BASE_URL}/posts/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Update a comment
app.put('/api/comments/:id', async (req, res) => {
  try {
    const updatedComment = req.body;
    const response = await fetch(`${BASE_URL}/comments/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedComment)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

// ---------------- DELETE ROUTES ----------------

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await fetch(`${BASE_URL}/posts/${req.params.id}`, { method: 'DELETE' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    await fetch(`${BASE_URL}/comments/${req.params.id}`, { method: 'DELETE' });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// ---------------- SERVER ----------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
