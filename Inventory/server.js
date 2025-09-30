const http = require('http');
const fs = require('fs');
const urlModule = require('url'); // for parsing query params
const { v4: uuidv4 } = require('uuid'); // for unique IDs
const port = 3000;
const host = 'localhost';

// ---------------- Helper Functions ----------------
function readProducts() {
  try {
    const data = fs.readFileSync('./data/product.json', 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync('./data/product.json', JSON.stringify(products, null, 2));
}

// ---------------- Server ----------------
const server = http.createServer((req, res) => {
  const { method, url } = req;
  const urlObj = urlModule.parse(url, true);
  const pathname = urlObj.pathname;
  const query = urlObj.query;

  // ------------- Routes -------------
  // /api/products -> GET list, POST new
  if (pathname === '/api/products') {
    if (method === 'GET') {
      let products = readProducts();

      // Filter by name
      if (query.name) {
        const searchName = query.name.toLowerCase();
        products = products.filter(p => p.name.toLowerCase() === searchName);
      }

      // Filter by category
      if (query.category) {
        products = products.filter(p =>
          p.category.toLowerCase().includes(query.category.toLowerCase())
        );
      }

      // Filter by stock
      if ('inStock' in query) {
        const inStock = query.inStock === "true";
        products = products.filter(p => Boolean(p.inStock) === inStock);
      }

      // Filter by price range
      if (query.minPrice || query.maxPrice) {
        const minPrice = parseFloat(query.minPrice) || 0;
        const maxPrice = parseFloat(query.maxPrice) || Infinity;
        products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);
      }

      // Filter by tags
      if (query.tags) {
        const tags = query.tags.split(',').map(t => t.toLowerCase());
        products = products.filter(p => p.tags.some(tag => tags.includes(tag.toLowerCase())));
      }
      //pagination

      const page =parseInt(query.page) || 1;
      const limit =parseInt(query.limit) || 10;
      const startIndex =(page -1 )* limit;
      const endIndex = page * limit;

      const paginatedProducts = products.slice(startIndex, endIndex);

      const response = {
        total: products.length,                 // total items after filters
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
        data: paginatedProducts
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));

    }
    else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Invalid JSON');
        }

        const products = readProducts();
        const newProduct = {
          id: uuidv4(),
          name: data.name,
          category: data.category,
          price: data.price,
          costPrice: data.costPrice,
          quantity: data.quantity,
          minStockLevel: data.minStockLevel,
          tags: data.tags || [],
          inStock: data.quantity > 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        products.push(newProduct);
        writeProducts(products);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newProduct));
      });
    } 
    else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      return res.end('Method Not Allowed');
    }
  }

  // /api/products/:id -> PUT update, DELETE remove
  else if (pathname.startsWith('/api/products/')) {
    const id = pathname.split('/').pop();
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Product not found');
    }

    if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Invalid JSON');
        }

        // Update only the provided fields
        products[productIndex] = {
          ...products[productIndex],
          ...data,
          inStock: data.quantity !== undefined ? data.quantity > 0 : products[productIndex].inStock,
          updatedAt: new Date().toISOString()
        };

        writeProducts(products);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(products[productIndex]));
      });
    } 
    else if (method === 'DELETE') {
      const deletedProduct = products.splice(productIndex, 1)[0];
      writeProducts(products);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: "Product deleted successfully", deletedProduct }));
    } 
    else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      return res.end('Method Not Allowed');
    }
  }

  // Invalid URL
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Endpoint Not Found');
  }
});

// Start server
server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}/`);
});
