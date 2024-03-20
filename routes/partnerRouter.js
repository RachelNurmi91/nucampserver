const express = require('express')
const partnerRouter = express.Router()
const Partner = require('../models/partner');
const authenticate = require('../authenticate');

// Veryify user is autheticated for every endpoint except GET.

partnerRouter.route('/')
.get((req, res, next) => {
    Partner.find()
    .then(partners => res.status(200).json(partners)) 
    .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Partner.create(req.body)
    // Status code 201 means Created Resource while 200 is a general success
    .then(partner => res.status(201).json(partner))
    .catch(err => next(err))
})
.put(authenticate.verifyUser, (req, res) => {
    statusCode = 403
    res.end('PUT operation not supported on /partners')
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Partner.deleteMany()
    .then(partners => res.status(200).json(partners))
    .catch(err => next(err))
})


partnerRouter.route('/:partnerId')
.get((req, res, next) => {
    Partner.findById(req.params.partnerId)
    .then(partner => res.status(200).json(partner))
    .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res) => {
    statusCode = 403;
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`)
})
.put(authenticate.verifyUser, (req, res, next) => {
    // Requires 3 arguments: Id, payload of the new update and an object.
    // If we dont include the object of { new: true } the old partner will be returned to the user and not the new updated partner.
    Partner.findByIdAndUpdate(req.params.partnerId, req.body, { new: true })
    .then(partner => res.status(200).json(partner))
    .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)
    .then(partner => res.status(200).json(partner))
    .catch(err => next(err))
})

module.exports = partnerRouter