const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

//Custom configuration for how multer handles uploads.
//This specific config is for disk storage.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //Calback, null and path we want the image to save to.
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        //Makes sure the file name on server matches the file name on the clients side. If we dont set this multer will randomize the name
        cb(null, file.originalname)
    }
});

//Checks image file to see if it matches requires files.
const imageFileFilter = (req, file, cb) => {
    //The match uses RegEx.
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        //False will make upload fail
        return cb(new Error('You can upload only image files!'), false);
    }
    //Null says theyre is no error and true makes it accept the file
    cb(null, true);
};




const upload = multer({storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
//Add the const upload to the params. This will allow multer to take over.
uploadRouter.route('/')
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
uploadRouter.route('/')
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
uploadRouter.route('/')
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});



module.exports = uploadRouter;