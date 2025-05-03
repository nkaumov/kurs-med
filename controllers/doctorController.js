const db = require('../config/db');

exports.dashboard = (req, res) => {
    const doctorId = req.session.user.id;

    const sql = `
        SELECT dc.call_time, r.room_number
        FROM doctor_calls dc
        JOIN rooms r ON dc.room_id = r.id
        WHERE dc.doctor_id = ? AND dc.status = 'pending'
        ORDER BY dc.call_time DESC`;

    db.query(sql, [doctorId], (err, results) => {
        if (err) throw err;

        db.query('UPDATE doctor_calls SET status = "seen" WHERE doctor_id = ? AND status = "pending"', [doctorId]);

        res.render('doctor/dashboard', {
            title: 'Врач',
            calls: results,
            new_call: results.length > 0
        });
    });
};
