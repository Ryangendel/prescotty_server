const express = require("express")
const router = require('express').Router();
const apiRoutes = require('./api');
const getdata = require('./getdata');
const csvParserRoutes = require('./csvparser');
const webhooks = require('./webhooks');
const frontend = require('./frontend')
const admin = require('./admin');
const onfleetapi = require('./onfleetapi');
const path = require("path")

router.use('/admin', csvParserRoutes);
router.use('/data', getdata);
router.use('/api', apiRoutes);
router.use('/webhooks', webhooks);
router.use('/frontend', frontend);
router.use('/changetaskrouting', admin);
router.use('/onfleetapi', onfleetapi);

module.exports = router;