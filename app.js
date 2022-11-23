// NodeJS server used for local testing of the site

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const public = path.join(__dirname, 'public');

const app = express();

app.use(express.static(public));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('', (req, res) => res.sendFile(path.join(public, 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(public, 'about.html')));
app.get('/post', (req, res) => res.sendFile(path.join(public, 'post.html')));
app.get('/new-post', (req, res) => res.sendFile(path.join(__dirname, 'post-template.html')));

app.post('/create-post', (req, res) =>
{
    // Check if post with that id already exists
    let filePath = path.join(public, 'posts', `${req.body.postID}.json`);

    if (fs.existsSync(filePath))
    {
        res.send(JSON.stringify({ responseCode: 1, message: `Post with ID ${req.body.postID} already exists.` }));
        return;
    }

    fs.writeFile(filePath, JSON.stringify(req.body.postData), (err) =>
    {
        if (err)
        {
            console.error(err);
            res.send(JSON.stringify({ responseCode: 1, message: `Failed to write file to disk. ${err.message}` }));
            return;
        }

        let dbPath = path.join(public, 'posts', 'db.json');

        fs.readFile(dbPath, (dbErr, data) =>
        {
            if (err)
            {
                res.send(JSON.stringify({ responseCode: 2, message: `Failed to read database. ${dbErr.message}` }));
                return;
            }

            let jsonData = JSON.parse(data);

            // Remove last preview if there's already 5 posts in the array
            if (jsonData.previews.length === 5)
                jsonData.previews.pop();

            jsonData.previews.unshift(req.body.postID);
            jsonData.all.unshift(req.body.postID);

            fs.writeFile(dbPath, JSON.stringify(jsonData), (dbWriteErr) =>
            {
                if (dbWriteErr)
                {
                    res.send(JSON.stringify({ responseCode: 1, message: `Failed to write database. ${dbWriteErr.message}` }));
                    return;
                }

                res.send(JSON.stringify({ responseCode: 0 }));
            });
        });
    });
});

app.listen(8080, () =>
{
    console.log(`Server listening on port 8080`);
});
