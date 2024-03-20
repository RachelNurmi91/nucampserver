const express = require('express')
const morgan = require('morgan')
const campsiteRouter = require('./routes/campsiteRouter')
const promotionRouter = require('./routes/promotionRouter')
const partnerRouter = require('./routes/partnerRouter')

const hostname = 'localhost';
const port = 3000;

//The express() method returns an express server application
const app = express();

//Configures Morgan to log using the dev version
app.use(morgan('dev'));

//This middleware will parse json data of the request obj.
app.use(express.json())

app.use('/campsites', campsiteRouter)
app.use('/promotions', promotionRouter)
app.use('/partners', partnerRouter)

//Allows Morgan to serve files from the public folder.
//__dirname is a Node variable that refers to the absolute path of the directory of the file its in.
app.use(express.static(__dirname + '/public'));

//The use() method sets up the server to return a request
app.use((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<html><body><h1>This is an Express Server</h1></body></html>')
})

//Listen allows us to listen for requests
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})