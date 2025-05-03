const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { ensureAuth, ensureRole } = require('../middleware/authMiddleware');

router.use(ensureAuth, ensureRole('nurse'));

router.get('/dashboard', nurseController.dashboard);

// Пациенты
router.get('/patients', nurseController.listPatients);
router.get('/patients/add', nurseController.showAddPatient);
router.post('/patients/add', nurseController.addPatient);
router.get('/patients/search', nurseController.searchPatients);
router.post('/patients/add-existing/:id', nurseController.addExistingPatient);

// Карточка
router.get('/card/:cardId', nurseController.viewCard);
router.post('/card/:cardId/status', nurseController.updateStatus);
router.post('/card/:cardId/add-entry', nurseController.addEntry);

// Вызов врача
router.get('/call-doctor', nurseController.showCallForm);
router.post('/call-doctor', nurseController.sendCall);

module.exports = router;
