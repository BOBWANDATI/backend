const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/map', mapController.getMapData);

module.exports = router;
