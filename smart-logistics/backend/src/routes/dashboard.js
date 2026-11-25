const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const auth   = require('../middleware/auth');

router.use(auth);
router.get('/stats',                   ctrl.stats);
router.get('/notifications',           ctrl.notifications);
router.patch('/notifications/:id/read', ctrl.markRead);

module.exports = router;
