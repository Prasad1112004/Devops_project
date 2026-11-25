const router  = require('express').Router();
const ctrl    = require('../controllers/orderController');
const auth    = require('../middleware/auth');
const { role } = require('../middleware/auth');

// Public tracking
router.get('/track/:trackingId', ctrl.track);

// Protected
router.use(auth);
router.get('/',          ctrl.list);
router.get('/:id',       ctrl.get);
router.post('/',         ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id/assign', role('Admin'), ctrl.assign);
router.delete('/:id',    role('Admin'), ctrl.cancel);

module.exports = router;
