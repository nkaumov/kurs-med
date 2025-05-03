const db = require('../config/db');

exports.showLogin = (req, res) => {
    res.render('auth/login', { message: req.flash('error') });
};

exports.login = (req, res) => {
    const { login, password } = req.body;

    const sql = 'SELECT * FROM users WHERE login = ? AND password = ?';
    db.query(sql, [login, password], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            req.flash('error', 'Неверный логин или пароль');
            return res.redirect('/');
        }

        const user = results[0];
        req.session.user = {
            id: user.id,
            name: user.full_name,
            role: user.role
        };

        if (user.role === 'nurse') return res.redirect('/nurse/dashboard');
        if (user.role === 'doctor') return res.redirect('/doctor/dashboard');
    });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
