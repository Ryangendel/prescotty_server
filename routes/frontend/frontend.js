const router = require("express").Router();
const path = require("path")
const express = require('express');

router.use(express.static(path.join(__dirname, '/../../public')));

router.get("/controller", (req, res) => {
    res.sendFile(path.join(__dirname,'../../public/pages/internal_busynesspicker.html'));
})

router.get("/bestdaze/home", (req, res) => {
    console.log("------")
    res.sendFile(path.join(__dirname,'../../public/pages/bestdaze_landing.html'));
})

router.get("/bestdaze/placeorder", (req, res) => {
    res.sendFile(path.join(__dirname,'../../public/pages/bestdaze_order.html'));
})

router.get("/orderconfirmation", (req, res) => {
    res.sendFile(path.join(__dirname,'../../public/pages/bestdaze_ordercompleted.html'));
})

module.exports = router;