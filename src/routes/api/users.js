import { Router } from 'express'

import User from '../../models/User'

const availableFields = {
    hashedPassword: 0,
    salt: 0,
    __v: 0,
}

export default Router()
// Get all users route
.get('/', (req, res, next) => {
    User
    .find({})
    .select(availableFields)
    .exec()
    .then((users) => {
        res.json(users)
    })
    .catch(next)
})
.get('/:id', (req, res, next) => {
    User.findById(req.params.id)
    .select(availableFields)
    .exec()
    .then((user) => {
        if (user) {
            return res.json(user)
        }
        return next()
    })
    .catch((err) => {
        if (err.name === 'CastError') {
            return next()
        }
        return next(err)
    })
})
.get('/:email', (req, res, next) => {
    User
    .findOne({email: req.params.email})
    .select(availableFields)
    .exec()
    .then((user) => {
        if (user) {
            return res.json(user)
        }
        return next()
    })
    .catch(next)
})
.post('/')
