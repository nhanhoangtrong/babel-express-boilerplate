import passport from 'passport';
import LocalStrategy from 'passport-local';
import logger from '../logger';
import { User } from '../models';

passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

/**
 * Local strategy using Email and Password
 */
export const localStrategy =  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            logger.error('%j', err);
            return done(err);
        }
        if (!user) {
            return done(null, false, { msg: `Email ${email} not found.` });
        }

        return user.comparePassword(password, (otherErr, isMatch) => {
            if (otherErr) {
                logger.error('%j', otherErr);
                return done(otherErr);
            }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, { msg: 'Invalid email or password.' });
        });
    });
});
