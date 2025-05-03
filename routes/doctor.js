const router  = require('express').Router();
const doctor  = require('../controllers/doctorController');
const { ensureAuth, ensureRole } = require('../middleware/authMiddleware');

router.use(ensureAuth, ensureRole('doctor'));

router.get('/dashboard', doctor.dashboard);
router.post('/close-call/:id', doctor.closeCall);

module.exports = router;

