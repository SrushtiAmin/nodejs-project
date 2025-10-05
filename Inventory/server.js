// Imports
const http = require('http');
const fs = require('fs/promises'); // async file operations
const urlModule = require('url');
const { v4: uuidv4 } = require('uuid');

// Constants
const PORT = 3000;
const HOST = 'localhost';
const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405
};
const DATA_FILE = './data/product.json';

// Read products from JSON file (async)
async function readProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return []; // return empty array if file doesn't exist or is empty
  }
}

// Write products to JSON file (async)
async function writeProducts(products) {
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
}

// Parse request body (async)
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}
// Validate required fields for a product
function validateProduct(data) {
  const requiredFields = ['name', 'category', 'price', 'quantity'];
  for (const field of requiredFields) {
    if (data[field] === undefined) return false;
  }
  return true;
}
// GET /api/products?filters...
async function handleGetProducts(req, res, query) {
  try {
    let products = await readProducts();

    // Filters
    if (query.name) products = products.filter(p => p.name.toLowerCase() === query.name.toLowerCase());
    if (query.category) products = products.filter(p => p.category.toLowerCase().includes(query.category.toLowerCase()));
    if ('inStock' in query) {
      const inStock = query.inStock === 'true';
      products = products.filter(p => Boolean(p.inStock) === inStock);
    }
    if (query.minPrice || query.maxPrice) {
      const min = parseFloat(query.minPrice) || 0;
      const max = parseFloat(query.maxPrice) || Infinity;
      products = products.filter(p => p.price >= min && p.price <= max);
    }
    if (query.tags) {
      const tags = query.tags.split(',').map(t => t.toLowerCase());
      products = products.filter(p => p.tags.some(tag => tags.includes(tag.toLowerCase())));
    }
     // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.writeHead(STATUS.OK, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      total: products.length,
      page,
      limit,
      totalPages: Math.ceil(products.length / limit),
      data: paginatedProducts
    }));
  } catch (err) {
    res.writeHead(STATUS.BAD_REQUEST, { 'Content-Type': 'text/plain' });
    res.end(err.message);
  }
}
// POST /api/products
async function handlePostProduct(req, res) {
  try {
    const data = await parseBody(req);

    if (!validateProduct(data)) {
      res.writeHead(STATUS.BAD_REQUEST, { 'Content-Type': 'text/plain' });
      return res.end('Missing required fields');
    }

    const products = await readProducts();
    const newProduct = {
      id: uuidv4(),
      ...data,
      tags: data.tags || [],
      inStock: data.quantity > 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeProducts(products);

    res.writeHead(STATUS.CREATED, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newProduct));
  } catch (err) {
    res.writeHead(STATUS.BAD_REQUEST, { 'Content-Type': 'text/plain' });
    res.end(err.message);
  }
}
// PUT / PATCH / DELETE /api/products/:id
async function handleUpdateOrDelete(req, res, id) {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      res.writeHead(STATUS.NOT_FOUND, { 'Content-Type': 'text/plain' });
      return res.end('Product not found');
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const data = await parseBody(req);
      products[index] = {
        ...products[index],
        ...data,
        inStock: data.quantity !== undefined ? data.quantity > 0 : products[index].inStock,
        updatedAt: new Date().toISOString()
      };
      await writeProducts(products);
      res.writeHead(STATUS.OK, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(products[index]));
    } else if (req.method === 'DELETE') {
      const deleted = products.splice(index, 1)[0];
      await writeProducts(products);
      res.writeHead(STATUS.OK, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Deleted successfully', deleted }));
    } else {
      res.writeHead(STATUS.METHOD_NOT_ALLOWED, { 'Content-Type': 'text/plain' });
      return res.end('Method Not Allowed');
    }
  } catch (err) {
    res.writeHead(STATUS.BAD_REQUEST, { 'Content-Type': 'text/plain' });
    res.end(err.message);
  }
}
// ---------------- Server ----------------
const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const urlObj = urlModule.parse(url, true);
  const pathname = urlObj.pathname;
  const query = urlObj.query;

  try {
    if (pathname === '/api/products') {
      if (method === 'GET') return handleGetProducts(req, res, query);
      if (method === 'POST') return handlePostProduct(req, res);
      res.writeHead(STATUS.METHOD_NOT_ALLOWED, { 'Content-Type': 'text/plain' });
      return res.end('Method Not Allowed');
    } else if (pathname.startsWith('/api/products/')) {
      const id = pathname.split('/').pop();
      return handleUpdateOrDelete(req, res, id);
    } else {
      res.writeHead(STATUS.NOT_FOUND, { 'Content-Type': 'text/plain' });
      res.end('Endpoint Not Found');
    }
  } catch (err) {
    res.writeHead(STATUS.BAD_REQUEST, { 'Content-Type': 'text/plain' });
    res.end(err.message);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});