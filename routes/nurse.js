const express = require('express');
const router  = express.Router();
const nurse   = require('../controllers/nurseController');
const { ensureAuth, ensureRole } = require('../middleware/authMiddleware');

router.use(ensureAuth, ensureRole('nurse'));

router.get('/dashboard', nurse.dashboard);

router.get('/patients',          nurse.listPatients);
router.get('/patients/add',      nurse.showAddPatient);
router.post('/patients/add',     nurse.addPatient);

router.get('/patients/search',   nurse.searchPatients);
router.post('/patients/add-existing/:id', nurse.addExistingPatient);

router.get('/card/:cardId',            nurse.viewCard);
router.post('/card/:cardId/status',    nurse.updateStatus);
router.post('/card/:cardId/add-entry', nurse.addEntry);

router.get('/call-doctor',  nurse.showCallForm);
router.post('/call-doctor', nurse.sendCall);

module.exports = router;
