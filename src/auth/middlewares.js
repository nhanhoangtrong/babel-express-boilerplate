/**
 * Login required middleware
 */
export const isAuthenticated = ({ redirectUrl, failOnError }) => (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    if (failOnError) {
        const err = new Error('Unauthorized.');
        err.statusCode = 401; // Unauthorized status
        return next(err);
    }
    if (typeof redirectUrl === 'function') {
        redirectUrl = redirectUrl(req);
    }
    if (typeof redirectUrl !== 'string') {
        return next(new Error("'redirectUrl: string | (req) => string' pattern doesn't match."));
    }
    return res.redirect(redirectUrl);
};

export const isAdmin = ({ redirectUrl, failOnError }) => (req, res, next) => {
    if (req.user && req.user.checkAdmin()) {
        return next();
    }
    if (failOnError) {
        const err = new Error('Permission not granted.');
        err.statusCode = 403; // Forbidden
        return next(err);
    }
    if (typeof redirectUrl === 'function') {
        redirectUrl = redirectUrl(req);
    }
    if (typeof redirectUrl !== 'string') {
        return next(new Error("'redirectUrl: string | (req) => string' pattern doesn't match."));
    }
    return res.redirect(redirectUrl);
};
