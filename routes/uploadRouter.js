const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

// Storage customizatoion
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        // The first arguement is null for errors and the second is where we want to store the image. If we store it in public it becomes accessable for use.
        callback(null, 'public/images');
    },
    filename: (req, file, callback) => {
        // Null for errors and the second argument is setting the file name on the server side to be the same on the client side. 
        callback(null, file.originalname)
    
    }
});

const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        // We will send an error to the callback and send false. False will tell Multer to reject the upload.
        return callback(new Error('You can upload only image files'), false);
    }
    callback(null, true);
};

// We need to send the storage customization and imageFileFilter function to Multer.
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
// upload.single() is a Multer middleware. It tells Multer to expect a 'imageFile' from the front end.
// From there Multer takes over.
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file)
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
})

module.exports = uploadRouter;