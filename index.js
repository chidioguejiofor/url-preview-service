require('dotenv/config')
const http = require('http');
const urlModule = require('url');
const PreviewFactory = require('./previewer');

const PORT = process.env.PORT || 4000;
const allowedProtocol = new Set(['http:', 'https:', 'http','https']);

const server = http.createServer(async function (req, res) {
   
    try {
        const url = req.url.slice(1);
        const parsedURL = urlModule.parse(url);
        const urlIsValid = parsedURL.host && allowedProtocol.has(parsedURL.protocol);
        res.setHeader('Content-Type', 'application/json');
        if(urlIsValid){
            const jsonData = await PreviewFactory.getPreviewJSONFromURL(url)
            return res.end(JSON.stringify(jsonData));
        }
        res.statusCode = 400;
        return  res.end(JSON.stringify({
          message: 'The URL is specified is not valid'
        }));
    } catch (error) {
        console.log(error);
        res.end(JSON.stringify({
            message: 'An error occured while processing that request'
        }));
    }

})

server.listen(PORT, function (error) {
    if (error) {
        console.error('An error occured when starting the server');
    } else {
        console.log('Server is listening on port ' + PORT);
    }
});

