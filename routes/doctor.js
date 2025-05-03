const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { ensureAuth, ensureRole } = require('../middleware/authMiddleware');

router.use(ensureAuth, ensureRole('doctor'));

router.get('/dashboard', doctorController.dashboard);

module.exports = router;
