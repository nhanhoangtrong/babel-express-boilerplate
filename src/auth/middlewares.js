/**
 * Login required middleware
 */
export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect(`/login?ref=${req.path}`);
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin === true) {
        return next();
    }
    return res.redirect(`/admin/login?ref=${req.path}`);
};
