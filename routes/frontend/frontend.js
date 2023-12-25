const router = require("express").Router();
const path = require("path")
const express = require('express');

router.use(express.static(path.join(__dirname, '../../public')));

router.get("/controller", (req, res) => {
    res.sendFile(path.join(__dirname,'../../public/index.html'));
})

module.exports = router;