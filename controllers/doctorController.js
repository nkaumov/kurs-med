const db = require('../config/db');

exports.dashboard = (req, res) => {
  const id = req.session.user.id;
  const sql = `
    SELECT r.room_number, dc.call_time
    FROM doctor_calls dc
    JOIN rooms r ON r.id = dc.room_id
    WHERE dc.doctor_id = ?
    ORDER BY dc.call_time DESC
    LIMIT 20`;
  db.query(sql, [id], (_, calls) =>
    res.render('doctor/dashboard', { title: 'Врач', calls })
  );
};

exports.closeCall = (req, res) => {
    const id = req.params.id;
    db.query('UPDATE doctor_calls SET status="closed" WHERE id=?', [id], () =>
      res.json({ ok: true })
    );
  };
  
