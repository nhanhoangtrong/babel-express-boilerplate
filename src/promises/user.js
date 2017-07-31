import User from '../models/User'

export const getUserById = (userId) => {
    return User.findById(userId).select('-password').exec()
}

export const getAllUsers = () => {
    return User.find().select('-password').exec()
}

export const getUsersByPage = (page, nPerPage) => {
    return User.find().select('-password')
        .skip(page * nPerPage)
        .limit(nPerPage)
        .exec()
}

export const postNewUser = (body) => {
    const newUser = new User({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        createdAt: body.createdAt,
    })
    return newUser.save()
}

export const updateUser = (userId, body) => {
    return User.findById(userId).exec()
        .then(function(user) {
            if (user) {
                user.firstName = body.firstName
                user.lastName = body.lastName
                user.password = body.password
                user.email = body.email
                user.createdAt = (body.createdAt || user.createdAt)
                user.isAdmin = body.isAdmin
                return user.save()
            }
            throw new Error('User not found')
        })
}

export const updateUserInfo = (body) => {
    return User.findById(body._id).exec()
        .then(function(user) {
            if (user) {
                user.firstName = body.firstName
                user.lastName = body.lastName
                return user.save()
            }
            throw new Error('User not found')
        })
}

export const updateUserPassword = (_id, newPassword) => {
    return User.findById(_id).exec()
        .then(function(user) {
            if (user) {
                user.password = newPassword
                return user.save()
            }
            throw new Error('User not found')
        })
}

export const updateUserRole = (_id, isAdmin) => {
    return User.findById(_id).exec()
        .then(function(user) {
            if (user) {
                user.isAdmin = isAdmin
                return user.save()
            }
            throw new Error('User not found')
        })
}

export const removeUser = (userId) => {
    return User.findByIdAndRemove(userId).exec()
}
