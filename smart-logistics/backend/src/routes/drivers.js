const router = require('express').Router();
const ctrl   = require('../controllers/driverController');
const auth   = require('../middleware/auth');
const { role } = require('../middleware/auth');

router.use(auth);
router.get('/',                 ctrl.list);
router.get('/vehicles',         ctrl.listVehicles);
router.get('/:id',              ctrl.get);
router.patch('/:id/status',     role('Admin'), ctrl.updateStatus);

module.exports = router;
