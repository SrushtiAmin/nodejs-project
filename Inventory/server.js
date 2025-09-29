const http = require('http');
const port= 3000;
const host ='localhost';

const server = http.createServer((req,res) =>{
res.writeHead(200,{'content-type':'text/plain'});
res.end("Server is connected succesfully through Nodejs")
});

server.listen(port , host, ()=>{
    console.log(`Server is running succesfully at http://${host}:${port}/`)
});