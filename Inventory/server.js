const http = require('http');
const fs = require('fs');
const { v4: uuidv4} = require('uuid');
const port= 3000;
const host ='localhost';
// connecting server
const server = http.createServer((req,res) =>{
res.writeHead(200,{'content-type':'text/plain'});// header to get the respond in particular format
res.end("Server is connected succesfully through Nodejs")// will be written on screen if it gets connected successfully
});

server.listen(port , host, ()=>{
    console.log(`Server is running succesfully at http://${host}:${port}/`)// assuring connection
});

// to read and write in product.json file 

function readProducts(){
    try{
        const data =fs.readFileSync('./data/product.json', 'utf-8');
        return JSON.parse(data);
    }catch(err){
        return [];
    }

}

// to write 

function writeProducts(){
    fs.writeFileSync('./data/product.json', JSON.stringify(product,null,2));
}