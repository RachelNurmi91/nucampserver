const cors = require('cors');

// A whitelist is what we are currently allowing.
const whitelist = ['http://localhost:300', 'https://localhost:3443'];

const corsOptionsDelegate = (req, callback) => {
    let corsOptions;

    console.log(req.header('Origin'));

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        // We check the whitelist to see if the request origin is in our whitelist.
        // If it is foun we allow the request to be accepted with origin: true.
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    // Null means no error occured.
    callback(null, corsOptions);
};

// Calling cors returns a middleware header wtih a wild card cors header to allow cors for all origins.
exports.cors = cors();

// Calling cors but with our options function. 
// Returns a middleware function to see if the request belongs to a whitelist origin.
exports.corsWithOptions = cors(corsOptionsDelegate);

