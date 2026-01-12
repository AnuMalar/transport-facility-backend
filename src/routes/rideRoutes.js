const express = require('express');
const router = express.Router();
const Ride = require('../controllers/rideController');

router.get('/getRides', Ride.getAllRides);
router.post('/addRide', Ride.addRide);
router.post('/checkExist', Ride.checkRideExists);
router.post('/search', Ride.searchRides);
router.post('/bookRide', Ride.bookRide);

module.exports = router;