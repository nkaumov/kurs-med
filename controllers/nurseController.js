const db = require("../config/db");

exports.dashboard = (_, res) => res.redirect("/nurse/patients");

exports.listPatients = (req, res) => {
  const sql = `
    SELECT p.full_name, p.card_id, s.name AS status
    FROM patients p
    JOIN statuses s ON p.status_id = s.id
    WHERE p.date_out IS NULL`;
  db.query(sql, (err, patients) => {
    if (err) throw err;
    res.render("nurse/patients", { title: "Пациенты", patients });
  });
};

exports.showAddPatient = (req, res) => {
  const roomsQ = 'SELECT id, room_number FROM rooms WHERE status != "full"';
  const doctorsQ = 'SELECT id, full_name FROM users WHERE role="doctor"';
  db.query(roomsQ, (_, rooms) => {
    db.query(doctorsQ, (_, doctors) => {
      res.render("nurse/addPatient", {
        title: "Добавить пациента",
        rooms,
        doctors,
      });
    });
  });
};

exports.addPatient = (req, res) => {
  const {
    full_name,
    age,
    gender,
    disease,
    severity,
    room_id,
    doctor_id,
    date_in,
  } = req.body;
  const statusId = 1;

  const insPatient = `
    INSERT INTO patients
      (full_name, age, gender, disease, severity,
       room_id, doctor_id, date_in, status_id)
    VALUES (?,?,?,?,?,?,?,?,?)`;

  db.query(
    insPatient,
    [
      full_name,
      age,
      gender,
      disease,
      severity,
      room_id,
      doctor_id,
      date_in,
      statusId,
    ],
    (e1, r) => {
      if (e1) throw e1;
      const patientId = r.insertId;

      db.query(
        "INSERT INTO cards (patient_id) VALUES (?)",
        [patientId],
        (_, r2) =>
          db.query(
            "UPDATE patients SET card_id=? WHERE id=?",
            [r2.insertId, patientId],
            () => res.redirect("/nurse/patients")
          )
      );
    }
  );
};

exports.searchPatients = (req, res) => {
  const oldPatsQ =
    "SELECT id, full_name, card_id FROM patients WHERE date_out IS NOT NULL";
  const roomsQ = 'SELECT id, room_number FROM rooms WHERE status != "full"';
  const doctorsQ = 'SELECT id, full_name FROM users WHERE role="doctor"';

  db.query(oldPatsQ, (_, patients) =>
    db.query(roomsQ, (_, rooms) =>
      db.query(doctorsQ, (_, doctors) =>
        res.render("nurse/searchPatient", {
          title: "Поиск пациента",
          patients,
          rooms,
          doctors,
        })
      )
    )
  );
};

exports.addExistingPatient = (req, res) => {
  const id = req.params.id;
  const { room_id, doctor_id, date_in } = req.body;
  const statusId = 1;

  const sql = `
    UPDATE patients
    SET room_id=?, doctor_id=?, date_in=?, date_out=NULL, status_id=?
    WHERE id = ?`;

  db.query(sql, [room_id, doctor_id, date_in, statusId, id], () =>
    res.redirect("/nurse/patients")
  );
};

exports.viewCard = (req, res) => {
  const cardId = req.params.cardId;

  const patQ = `
    SELECT p.card_id, p.full_name, p.status_id
    FROM patients p WHERE p.card_id = ?`;
  const entQ =
    "SELECT * FROM card_entries WHERE card_id=? ORDER BY entry_date DESC, entry_time DESC";
  const stQ = "SELECT * FROM statuses";

  db.query(patQ, [cardId], (_, patRows) =>
    db.query(entQ, [cardId], (_, entries) =>
      db.query(stQ, (_, statuses) =>
        res.render("nurse/card", {
          title: "Карточка",
          patient: patRows[0],
          entries,
          statuses,
        })
      )
    )
  );
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

  db.query(
    "INSERT INTO card_entries (card_id, entry_date, entry_time, note) VALUES (?,?,?,?)",
    [cardId, entry_date, entry_time, note],
    () => res.redirect(`/nurse/card/${cardId}`)
  );
};

exports.showCallForm = (req, res) => {
  const roomsQ = "SELECT id, room_number FROM rooms";
  const doctorsQ = 'SELECT id, full_name FROM users WHERE role="doctor"';
  db.query(roomsQ, (_, rooms) =>
    db.query(doctorsQ, (_, doctors) =>
      res.render("nurse/callDoctor", { title: "Вызов врача", rooms, doctors })
    )
  );
};

exports.sendCall = (req, res) => {
  const { room_id, doctor_id } = req.body;

  db.query(
    "INSERT INTO doctor_calls (room_id, doctor_id) VALUES (?,?)",
    [room_id, doctor_id],
    (e, r) => {
      const io = req.app.get("io");
      io.to("doctor:" + doctor_id).emit("doctorCall", {
        dbId: r.insertId, 
        room_id,
        time: new Date().toISOString(),
      });
      res.redirect("/nurse/patients");
    }
  );
};
