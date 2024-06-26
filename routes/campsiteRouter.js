const express = require('express');
// We are importing our cors route. Not cors directy.
const cors = require('./cors');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

const campsiteRouter = express.Router();

// Veryify user is autheticated for every endpoint except GET.

campsiteRouter.route('/')
// Options are set to handle a pre-flight request
// When approved by cors we will send a status of 200
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
// We use cors.cors because they don't need to be whitelisted to get the campsites.
.get(cors.cors, (req, res, next) => {
    Campsite.find()
    .populate('comments.author')
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        //Sends the Json and closes
        res.json(campsites);
    })
    //Will auto handle the error.
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.create(req.body)
    .then(campsite => {
        console.log('Campsite Created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body
    }, { new: true })
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if(campsite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            //Sends the Json and closes
            res.json(campsite.comments);
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } 
    })
    //Will auto handle the error.
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if(campsite) {
            // When comment is saved it will have the id of the user who submitted the comment
            req.body.author = req.user._id
            //Saves in app memory
            campsite.comments.push(req.body);
            //Saves to MongoDB database
            //Using lower c because it saves on document and not model
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } 
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if(campsite) {
            for (let i = (campsite.comments.length-1); i >=0; i--) {
                campsite.comments.id(campsite.comments[i]._id).remove();
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err)
        } 
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if(campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            //Sends the Json and closes
            res.json(campsite.comments.id(req.params.commentId));
        } else if (!campsite){
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } 
    })
    //Will auto handle the error.
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if(campsite && campsite.comments.id(req.params.commentId)) {
            if ((campsite.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                if(req.body.rating) {
                    campsite.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if(req.body.text) {
                    campsite.comments.id(req.params.commentId).text = req.body.text;
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite)
                })
                .catch(err => next(err));
            }  else {
                err = new Error("You are not authroized to update.")
                err.status = 402;
                return next(err)
            } 
        } else if (!campsite){
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } 
    })
    //Will auto handle the error.
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if(campsite && campsite.comments.id(req.params.commentId)) {
            if ((campsite.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
            campsite.comments.id(req.params.commentId).remove();
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite)
            })
            .catch(err => next(err));
        } else {
            err = new Error("You are not authroized to delete.")
            err.status = 402;
            return next(err)
        }
        } else if (!campsite){
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            //Will pass error to Express handle error mechanism
            return next(err)
        } 
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;