// NodeJS server used for local testing of the site

const fs = require('fs');
const http = require('http');
const path = require('path');

const public = path.join(__dirname, 'public');

http.createServer((req, res) => {
    if (req.url === '/')
        req.url = '/index.html';

    fs.readFile(path.join(public, req.url), (err, data) => {
        if (err)
        {
            res.writeHead(404);
            
            let response = JSON.stringify(err);

            try {
                response = fs.readFileSync(`${__dirname}/404.html`)
            } catch(err2) {
                console.log(err2);
            }

            res.end(response);
        }
        else
        {
            res.writeHead(200);
            res.end(data);
        }
    });
}).listen(8080, () => {
    console.log(`Server listening on port 8080`);
});