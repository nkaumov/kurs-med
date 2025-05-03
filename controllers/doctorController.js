const db = require('../config/db');

exports.dashboard = (req, res) => {
  const id = req.session.user.id;
  const sql = `
    SELECT dc.id, r.room_number, dc.call_time, dc.status
    FROM doctor_calls dc
    JOIN rooms r ON r.id = dc.room_id
    WHERE dc.doctor_id = ? AND dc.status IN ('pending','seen')
    ORDER BY dc.call_time DESC`;

  db.query(sql, [id], (err, calls) => {
    if (err) throw err;

    const pendIds = calls.filter(c => c.status === 'pending').map(c => c.id);
    if (pendIds.length)
      db.query('UPDATE doctor_calls SET status="seen" WHERE id IN (?)', [pendIds]);

    res.render('doctor/dashboard', {
      title : 'Врач',
      calls,
      doctorName : req.session.user.name,
      doctorId   : id
    });
  });
};

exports.closeCall = (req, res) => {
  const id = req.params.id;
  db.query('UPDATE doctor_calls SET status="closed" WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ ok:false });
    res.json({ ok:true });
  });
};
