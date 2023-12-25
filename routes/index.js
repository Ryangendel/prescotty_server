const router = require('express').Router();
const apiRoutes = require('./api');
const getdata = require('./getdata');
const csvParserRoutes = require('./csvparser');
const webhooks = require('./webhooks');

router.use('/admin', csvParserRoutes);
router.use('/data', getdata);
router.use('/api', apiRoutes);
router.use('/webhooks', webhooks);

module.exports = router;