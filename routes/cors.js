const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    //If the origin is found we set the origin to true.
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);  
};

//Returns middleware function with a cors header and allows cors for all orgins
exports.cors = cors();
//Returns middleware to check and see if incoming request belongs to white listed origins.
exports.corsWithOptions = cors(corsOptionsDelegate);