exports.ensureAuth = (req, res, next) => {
    if (!req.session.user) return res.redirect('/');
    next();
};

exports.ensureRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) return res.redirect('/');
        next();
    };
};
