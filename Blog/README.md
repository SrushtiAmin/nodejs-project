# 📰 Blog Project

This is a **Node.js + Express** blog application that interacts with an external API (like [JSONPlaceholder](https://jsonplaceholder.typicode.com/)) to manage blog posts and comments.  
The app demonstrates **CRUD operations, pagination, API integration, and environment-based configuration**.

---

## 🚀 Features
- Fetch all posts with pagination  
- View a single post with its comments  
- Fetch comments for a specific post  
- Fetch all posts by a user  
- Create, update, delete posts and comments  
- Support for **PUT** and **PATCH** requests  
- Error handling and proper JSON responses  

---

## 🛠️ Tech Stack
  Runtime | Node.js |
  Framework | Express.js |
  HTTP Client | node-fetch |
  Environment Variables | dotenv |
  API | JSONPlaceholder (or any custom API via `BASE_URL`) |

---

## ⚙️ Environment Variables
Create a `.env` file in the root of your project:

```bash
PORT=3000
BASE_URL=https://jsonplaceholder.typicode.com
