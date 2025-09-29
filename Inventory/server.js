const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
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

  if (url === '/api/products') {
    // ---------------- GET all products ----------------
    if (method === 'GET') {
      const products = readProducts();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(products));
    } 
    
    // ---------------- POST new product ----------------
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
        res.end(JSON.stringify(newProduct));
      });
    } 
    
    // ---------------- Method Not Allowed ----------------
    else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    }
  } 
  
  // ---------------- Invalid URL ----------------
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Endpoint Not Found');
  }
});

// ---------------- Start server ----------------
server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}/`);
});
