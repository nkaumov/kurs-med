const db = require('../config/db');

exports.dashboard = (req, res) => {
    res.render('nurse/dashboard', { title: 'Панель медсестры', content: '' });
};

exports.listPatients = (req, res) => {
    const sql = `
        SELECT p.full_name, p.card_id, s.name AS status 
        FROM patients p 
        JOIN statuses s ON p.status_id = s.id 
        WHERE p.date_out IS NULL`;

    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('nurse/dashboard', {
            title: 'Пациенты',
            content: require('../views/nurse/patients.hbs')({ patients: results })
        });
    });
};

exports.showAddPatient = (req, res) => {
    const getRooms = 'SELECT id, room_number FROM rooms WHERE status != "full"';
    const getDoctors = 'SELECT id, full_name FROM users WHERE role = "doctor"';

    db.query(getRooms, (err, rooms) => {
        if (err) throw err;
        db.query(getDoctors, (err2, doctors) => {
            if (err2) throw err2;
            res.render('nurse/dashboard', {
                title: 'Добавить пациента',
                content: require('../views/nurse/addPatient.hbs')({ rooms, doctors })
            });
        });
    });
};

exports.addPatient = (req, res) => {
    const {
        full_name, age, gender, disease, severity,
        room_id, doctor_id, date_in
    } = req.body;

    const statusId = 1; // например, "в стационаре"

    const insertPatient = `
        INSERT INTO patients (full_name, age, gender, disease, severity, room_id, doctor_id, date_in, status_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(insertPatient, [full_name, age, gender, disease, severity, room_id, doctor_id, date_in, statusId], (err, result) => {
        if (err) throw err;

        const patientId = result.insertId;

        db.query('INSERT INTO cards (patient_id) VALUES (?)', [patientId], (err2, result2) => {
            if (err2) throw err2;
            const cardId = result2.insertId;

            db.query('UPDATE patients SET card_id = ? WHERE id = ?', [cardId, patientId], () => {
                res.redirect('/nurse/patients');
            });
        });
    });
};

exports.searchPatients = (req, res) => {
    const sql = 'SELECT id, full_name FROM patients WHERE date_out IS NOT NULL';
    db.query(sql, (err, results) => {
        if (err) throw err;
        // Реализовать выбор пациента (форма + post /add-existing/:id)
        res.send('Реализовать форму выбора существующего пациента');
    });
};

exports.addExistingPatient = (req, res) => {
    const id = req.params.id;
    const { room_id, doctor_id, date_in } = req.body;

    const sql = `UPDATE patients SET room_id = ?, doctor_id = ?, date_in = ?, date_out = NULL WHERE id = ?`;

    db.query(sql, [room_id, doctor_id, date_in, id], (err) => {
        if (err) throw err;
        res.redirect('/nurse/patients');
    });
};

exports.viewCard = (req, res) => {
    const cardId = req.params.cardId;

    const getCard = `
        SELECT p.full_name, p.status_id, s.name AS status
        FROM patients p 
        JOIN statuses s ON p.status_id = s.id
        WHERE p.card_id = ?`;

    const getEntries = `
        SELECT * FROM card_entries WHERE card_id = ? ORDER BY entry_date DESC, entry_time DESC`;

    const getStatuses = 'SELECT * FROM statuses';

    db.query(getCard, [cardId], (err, patientRows) => {
        if (err) throw err;
        db.query(getEntries, [cardId], (err2, entryRows) => {
            if (err2) throw err2;
            db.query(getStatuses, (err3, statuses) => {
                if (err3) throw err3;
                res.render('nurse/dashboard', {
                    title: 'Карточка пациента',
                    content: require('../views/nurse/card.hbs')({
                        patient: patientRows[0],
                        entries: entryRows,
                        statuses
                    })
                });
            });
        });
    });
};

exports.updateStatus = (req, res) => {
    const cardId = req.params.cardId;
    const status_id = req.body.status_id;

    const sql = `UPDATE patients SET status_id = ?, date_out = IF(? = 2, CURDATE(), NULL) WHERE card_id = ?`;
    db.query(sql, [status_id, status_id, cardId], () => {
        res.redirect(`/nurse/card/${cardId}`);
    });
};

exports.addEntry = (req, res) => {
    const { entry_date, entry_time, note } = req.body;
    const cardId = req.params.cardId;

    const sql = `INSERT INTO card_entries (card_id, entry_date, entry_time, note) VALUES (?, ?, ?, ?)`;

    db.query(sql, [cardId, entry_date, entry_time, note], () => {
        res.redirect(`/nurse/card/${cardId}`);
    });
};

exports.showCallForm = (req, res) => {
    const getRooms = 'SELECT id, room_number FROM rooms';
    const getDoctors = 'SELECT id, full_name FROM users WHERE role = "doctor"';

    db.query(getRooms, (err, rooms) => {
        if (err) throw err;
        db.query(getDoctors, (err2, doctors) => {
            if (err2) throw err2;
            res.render('nurse/dashboard', {
                title: 'Вызов врача',
                content: require('../views/nurse/callDoctor.hbs')({ rooms, doctors })
            });
        });
    });
};

exports.sendCall = (req, res) => {
    const { room_id, doctor_id } = req.body;

    const sql = `INSERT INTO doctor_calls (room_id, doctor_id) VALUES (?, ?)`;
    db.query(sql, [room_id, doctor_id], () => {
        res.redirect('/nurse/dashboard');
    });
};
