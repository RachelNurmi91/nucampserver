const express = require('express')
const promotionRouter = express.Router()
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate');

// Veryify user is autheticated for every endpoint except GET.

promotionRouter.route('/')
.get((req, res, next) => {
    Promotion.find()
    .then(promotions => res.status(200).json(promotions)) 
    .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Promotion.create(req.body)
    // Status code 201 means Created Resource while 200 is a general success
    .then(promotion => res.status(201).json(promotion))
    .catch(err => next(err))
})
.put(authenticate.verifyUser, (req, res) => {
    statusCode = 403
    res.end('PUT operation not supported on /promotions')
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Promotion.deleteMany()
    .then(promotions => res.status(200).json(promotions))
    .catch(err => next(err))
})


promotionRouter.route('/:promotionId')
.get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
    .then(promotion => res.status(200).json(promotion))
    .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res) => {
    statusCode = 403;
    res.end(`POST operation not supported on /promotions/${req.params.promotionId}`)
})
.put(authenticate.verifyUser, (req, res, next) => {
    // Requires 3 arguments: Id, payload of the new update and an object.
    // If we dont include the object of { new: true } the old promotion will be returned to the user and not the new updated promotion.
    Promotion.findByIdAndUpdate(req.params.promotionId, req.body, { new: true })
    .then(promotion => res.status(200).json(promotion))
    .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Promotion.findByIdAndDelete(req.params.promotionId)
    .then(promotion => res.status(200).json(promotion))
    .catch(err => next(err))
})

module.exports = promotionRouter