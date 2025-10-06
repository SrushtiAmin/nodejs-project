// server.js
const express = require('express');
const axios = require('axios'); // for API calls
require('dotenv').config(); // to use .env variables

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.API_URL;

// Middleware to parse JSON
app.use(express.json());

// GETTING BLOG WITH PAGINATION 
app.get('/api/posts', async(req,res)=>{
  try{
    const {page =1,limit=10} =req.query;
    const response = await axios.get(`${BASE_URL}/posts`);
    const post =response.data;

    //pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts= post.slice(startIndex, endIndex);

      res.status(200).json({
      total: post.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: paginatedPosts
      })

  }catch(error){
    console.error(error.message);
    res.response(500).json({error:'Failed to fetch posts'});
  }
});

//getting post by comments
app.get('/api/posts/:id', async(req,res)=>{
  try{
    const {id} =req.params;

    //fetching post
    const postResponse = await axios.get(`${BASE_URL}/posts/${id}`);
    const post =postResponse.data;

    // getting comment
    const commentResponse = await axios.get(`${BASE_URL}/posts/${id}/comments`);
    const comment = commentResponse.data;

    //showing post along with comment 
    const fullPost ={... post, comment};

    res.status(200).json(fullPost);

  }catch(error){
    console.error(error.message);
    res.status(500).json({error:'Failed to fetch posts through comments'});
  }
});
// Getting comment by ID and its post
app.get('/api/comments/:commentId/post', async (req, res) => {
  try {
    const { commentId } = req.params;

    // Fetch the comment first
    const commentResponse = await axios.get(`${BASE_URL}/comments/${commentId}`);
    const comment = commentResponse.data;

    // Fetch the post using comment.postId
    const postResponse = await axios.get(`${BASE_URL}/posts/${comment.postId}`);
    const post = postResponse.data;

    // Combine post and comment
    const fullPost = { ...post, comment };

    res.status(200).json(fullPost);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch comment and its post' });
  }
});

// Test route to check server
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
