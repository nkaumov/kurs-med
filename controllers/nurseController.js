const db = require('../config/db');

exports.dashboard = (_, res) => res.redirect('/nurse/patients');

exports.listPatients = (req, res) => {
  const sql = `
    SELECT p.full_name, p.card_id, s.name AS status
    FROM patients p
    JOIN statuses s ON p.status_id = s.id
    WHERE p.date_out IS NULL`;
  db.query(sql, (err, patients) => {
    if (err) throw err;
    res.render('nurse/patients', { title: 'Пациенты', patients });
  });
};

exports.showAddPatient = (req, res) => {
  const roomsQ   = 'SELECT id, room_number FROM rooms WHERE status != "full"';
  const doctorsQ = 'SELECT id, full_name FROM users WHERE role = "doctor"';
  db.query(roomsQ, (e1, rooms) => {
    if (e1) throw e1;
    db.query(doctorsQ, (e2, doctors) => {
      if (e2) throw e2;
      res.render('nurse/addPatient', { title: 'Добавить пациента', rooms, doctors });
    });
  });
};

exports.addPatient = (req, res) => {
  const { full_name, age, gender, disease, severity,
          room_id, doctor_id, date_in } = req.body;
  const statusId = 1; 

  const insPat = `
    INSERT INTO patients (full_name, age, gender, disease, severity,
                          room_id, doctor_id, date_in, status_id)
    VALUES (?,?,?,?,?,?,?,?,?)`;
  db.query(insPat, [full_name, age, gender, disease, severity,
                    room_id, doctor_id, date_in, statusId], (e1, r1) => {
    if (e1) throw e1;
    const patientId = r1.insertId;

    db.query('INSERT INTO cards (patient_id) VALUES (?)', [patientId], (e2, r2) => {
      if (e2) throw e2;
      db.query('UPDATE patients SET card_id = ? WHERE id = ?', [r2.insertId, patientId], () =>
        res.redirect('/nurse/patients')
      );
    });
  });
};

exports.viewCard = (req, res) => {
  const cardId = req.params.cardId;

  const patQ = `
    SELECT p.card_id, p.full_name, p.status_id, s.name AS status
    FROM patients p JOIN statuses s ON p.status_id = s.id
    WHERE p.card_id = ?`;
  const entQ = 'SELECT * FROM card_entries WHERE card_id = ? ORDER BY entry_date DESC, entry_time DESC';
  const stQ  = 'SELECT * FROM statuses';

  db.query(patQ, [cardId], (e1, patRows) => {
    if (e1) throw e1;
    db.query(entQ, [cardId], (e2, entries) => {
      if (e2) throw e2;
      db.query(stQ, (e3, statuses) => {
        if (e3) throw e3;
        res.render('nurse/card', {
          title: 'Карточка',
          patient : patRows[0],
          entries,
          statuses
        });
      });
    });
  });
};

exports.updateStatus = (req, res) => {
  const { cardId } = req.params;
  const { status_id } = req.body;
  const sql = `
    UPDATE patients
    SET status_id=?, date_out = IF(? = 2, CURDATE(), NULL)
    WHERE card_id = ?`;
  db.query(sql, [status_id, status_id, cardId], () =>
    res.redirect(`/nurse/card/${cardId}`)
  );
};

exports.addEntry = (req, res) => {
  const { cardId } = req.params;
  const { entry_date, entry_time, note } = req.body;
  const sql = 'INSERT INTO card_entries (card_id, entry_date, entry_time, note) VALUES (?,?,?,?)';
  db.query(sql, [cardId, entry_date, entry_time, note], () =>
    res.redirect(`/nurse/card/${cardId}`)
  );
};

exports.showCallForm = (req, res) => {
  const roomsQ   = 'SELECT id, room_number FROM rooms';
  const doctorsQ = 'SELECT id, full_name FROM users WHERE role="doctor"';
  db.query(roomsQ, (e1, rooms) => {
    if (e1) throw e1;
    db.query(doctorsQ, (e2, doctors) => {
      if (e2) throw e2;
      res.render('nurse/callDoctor', { title: 'Вызов врача', rooms, doctors });
    });
  });
};

exports.sendCall = (req, res) => {
  const { room_id, doctor_id } = req.body;
  db.query('INSERT INTO doctor_calls (room_id, doctor_id) VALUES (?,?)',
    [room_id, doctor_id], () => res.redirect('/nurse/patients'));
};

exports.searchPatients = (_, res) => res.send('Поиск ещё не реализован');
exports.addExistingPatient = (_, res) => res.send('Добавление из истории ещё не реализовано');
