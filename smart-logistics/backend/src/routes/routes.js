const router = require('express').Router();
const ctrl   = require('../controllers/routeController');
const auth   = require('../middleware/auth');

router.post('/optimize', auth, ctrl.optimize);
router.get('/',          auth, ctrl.list);

module.exports = router;
