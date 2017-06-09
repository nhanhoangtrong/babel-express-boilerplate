import passport from 'passport'
import LocalStrategy from 'passport-local'
import User from '../models/User'

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

/**
 * Local strategy using Email and Password
 */
passport.use('local', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            console.error(err)
            return done(err)
        }
        if (!user) {
            return done(null, false, { msg: `Email ${email} not found.` })
        }

        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                console.error(err)
                return done(err)
            }
            if (isMatch) {
                return done(null, user)
            }
            return done(null, false, { msg: 'Invalid email or password.' })
        })
    })
}))

/**
 * Login required middleware
 */
export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}
