// server.js
const express = require('express');
const axios = require('axios'); // for API calls
require('dotenv').config(); // to use .env variables

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.API_URL || 'https://jsonplaceholder.typicode.com';

// Middleware to parse JSON
app.use(express.json());

//POSTS 

// Get all posts with pagination
app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const response = await axios.get(`${BASE_URL}/posts`);
    let posts = response.data;

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.status(200).json({
      total: posts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: paginatedPosts
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post with comments
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postResponse = await axios.get(`${BASE_URL}/posts/${id}`);
    const commentsResponse = await axios.get(`${BASE_URL}/posts/${id}/comments`);

    const post = {
      ...postResponse.data,
      comments: commentsResponse.data
    };

    res.status(200).json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch post with comments' });
  }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/posts`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update a post (replace whole post)
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(`${BASE_URL}/posts/${id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Patch a post (update partial fields)
app.patch('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.patch(`${BASE_URL}/posts/${id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to patch post' });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await axios.delete(`${BASE_URL}/posts/${id}`);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// COMMENTS 

// Get comments for a post
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/posts/${id}/comments`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a comment for a post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.post(`${BASE_URL}/posts/${id}/comments`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update a comment
app.put('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(`${BASE_URL}/comments/${id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Patch a comment
app.patch('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.patch(`${BASE_URL}/comments/${id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to patch comment' });
  }
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await axios.delete(`${BASE_URL}/comments/${id}`);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// USERS 

// Get all posts by a user
app.get('/api/users/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/users/${id}/posts`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
