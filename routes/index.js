const router = require('express').Router();
const apiRoutes = require('./api');
const getdata = require('./getdata');
const csvParserRoutes = require('./csvparser');
const webhooks = require('./webhooks');
const frontend = require('./frontend')
const admin = require('./admin');

router.use('/admin', csvParserRoutes);
router.use('/data', getdata);
router.use('/api', apiRoutes);
router.use('/webhooks', webhooks);
router.use('/frontend', frontend);
router.use('/changetaskrouting', admin);

module.exports = router;