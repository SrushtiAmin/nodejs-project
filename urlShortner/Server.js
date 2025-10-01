// import express
const express =require('express');
const fs =require('fs');
const { v4: uuidv4 } = require('uuid'); // for unique IDs
const validUrl = require('valid-url'); // valid url package to know if the url is valid or not

// Helper Functions 
function readUrls() {
  try {
    const data = fs.readFileSync('./data/urls.json', 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUrls(urls) {
  fs.writeFileSync('./data/urls.json', JSON.stringify(urls, null, 2));
}

//creating instance 
const app = express();
// middleware
app.use(express.json());
//port 
const port =3000;
//defining routes 
app.get('/', (req,res)=>{
    res.send("Connected through express")
});

//post
app.post('/api/shorten',(req,res)=>{

    const {originalUrl,customAlias,expiresAt} =req.body;
    //validating url
    if(!validUrl.isUri(originalUrl))
    {
        return res.status(400).json({error:"Invalid URL"});
    }
    let urls= readUrls();

    let id = customAlias || uuidv4().slice(0,6);
    if(urls.find(u=>u.id === id)){
        return res.status(400).json({message:"URL exists already"});
    }

    const newUrls={
        id ,
        originalUrl,
        shortUrl:`http://localhost:${port}/${id}`,
        clicks:0,
        isActive: true,
        expiresAt: expiresAt || new Date(Date.now() + 30*24*60*60*1000).toISOString(),//expires within 30 days of creation by default is expry date is not given 
        createdAt: new Date().toISOString()

    };
        urls.push(newUrls);
        writeUrls(urls);

        res.status(201).json(newUrls);
      });
        //GET all URLs
app.get('/api/shorten/urls', (req, res) => {
    const urls = readUrls();
    res.json(urls);
});

    //GET URL by ID
    app.get('/api/shorten/:id', (req, res) => {
        const urls = readUrls();
        const id = req.params.id.trim();
        const urlEntry = urls.find(u => u.id === id);

        if (!urlEntry) {
            return res.status(404).json({ error: "URL not found" });
        }

        res.json(urlEntry);
    });

    //Redirect short URL
    app.get('/:id', (req, res) => {
        const urls = readUrls();
        const id = req.params.id.trim(); // trim any whitespace
        const urlEntry = urls.find(u => u.id === id); // use trimmed id

        if (!urlEntry) {
            return res.status(404).json({ error: "URL not found" });
        }

        // Check if expired
        if (urlEntry.expiresAt && new Date(urlEntry.expiresAt) < new Date()) {
            return res.status(410).json({ message: "URL has expired" });
        }

        // Increment clicks
        urlEntry.clicks += 1;
        writeUrls(urls);

        // Redirect to original URL
        res.redirect(urlEntry.originalUrl);
    });


//connecting server 
app.listen(port,()=>{
    console.log(`server is connected http://localhost:${port}`)
});


