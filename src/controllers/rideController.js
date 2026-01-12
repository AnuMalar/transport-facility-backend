const Ride = require('../models/ride');

//add a new ride
exports.addRide = async (req, res) => {
    try {
        const { employeeId, vehicleType, vehicleNo, vacantSeats, time, pickupPoint, destination } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const data = await Ride.create({
            employeeId, vehicleType, vehicleNo, vacantSeats, time, pickupPoint, destination, date: today
        })
        res.status(200).json({
            info: data._id,
            statusCode: 201,
            message: 'Ride Added Successfully'
        })
    } catch (err) {
        res.status(500).send({ statusCode: 500, message: err.message })
    }
}

//get all ride list
exports.getAllRides = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { currentTime } = req.query;

        let data = await Ride.find({
            date: today,
            vacantSeats: { $gt: 0 }
        }).sort({ time: -1 });

        const selectedMinutes = timeToMinutes(currentTime);
        const minTime = Math.max(0, selectedMinutes - 60);
        const maxTime = Math.min(1440, selectedMinutes + 60);

        if (!!currentTime) {
            data = data.filter(ride => {
                const rideMinutes = timeToMinutes(ride.time);
                return rideMinutes >= minTime && rideMinutes <= maxTime;
            });
        }
        res.status(200).json({
            info: data.length ? data : null,
            statusCode: 200,
            message: data.length
                ? 'Fetched all today rides'
                : 'No rides available'
        });

    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: err.message
        });
    }
};

//check if the ride exists for the respective empId
exports.checkRideExists = async (req, res) => {
    try {
        const { empId, today } = req.body;
        const data = await Ride.findOne({
            employeeId: empId,
            date: today
        })
        res.status(200).json({
            exists: data ? true : false,
            statusCode: 200,
            message: "OK"
        })
    } catch (err) {
        res.status(500).send({ statusCode: 500, message: err.message });
    }
}

//search a ride
exports.searchRides = async (req, res) => {
    try {
        const { time, vehicleType, empId } = req.body;
        const { currentTime } = req.query;
        // if (!!time) {
        const selectedMinutes = timeToMinutes(time ? time : currentTime);
        const minTime = Math.max(0, selectedMinutes - 60);
        const maxTime = Math.min(1440, selectedMinutes + 60);
        // }
        const today = new Date().toISOString().split('T')[0];
        let data = await Ride.find(
            {
                date: today,
                vacantSeats: { $gt: 0 },
                // employeeId: { $ne: empId }
            }
        ).sort({ time: -1 });
        if (!!time || !!currentTime) {
            data = data.filter(ride => {
                const rideMinutes = timeToMinutes(ride.time);
                return rideMinutes >= minTime && rideMinutes <= maxTime;
            });
        }
        if (vehicleType !== 'All') {
            data = data.filter(r => r.vehicleType === vehicleType);
        }
        res.status(200).json({
            info: data,
            statusCode: 200,
            message: 'OK'
        })
    } catch (err) {
        res.status(500).send({ statusCode: 500, message: err.message });
    }
}

// convert time to minutes
function timeToMinutes(time) {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

//book a ride for today
exports.bookRide = async (req, res) => {
    try {
        const { rideId, empId } = req.body;

        const selectedRide = await Ride.findById(rideId);
        if (!selectedRide)
            return res.status(404).json({ statusCode: 404, message: 'Ride not found' });

        if (selectedRide.employeeId === empId)
            return res.status(202).json({ statusCode: 202, message: 'Cannot book own ride' });

        // if (selectedRide.vacantSeats <= 0)
        //   return res.status(202).json({ statusCode: 202, message: 'No seats available' });

        if (selectedRide.bookedEmployees.includes(empId))
            return res.status(202).json({ statusCode: 202, message: 'Already booked this ride' });

        const selectedRideMinutes = timeToMinutes(selectedRide.time);
        const minTime = Math.max(0, selectedRideMinutes - 60);
        const maxTime = Math.min(1440, selectedRideMinutes + 60);

        const today = selectedRide.date;

        const anotherRides = await Ride.find({
            date: today,
            bookedEmployees: empId
        });

        const isExist = anotherRides.some(ride => {
            const rideMinutes = timeToMinutes(ride.time);
            return rideMinutes >= minTime && rideMinutes <= maxTime;
        });

        if (isExist) {
            return res.status(202).json({
                statusCode: 202,
                message: 'You had already booked another ride'
            });
        }
        selectedRide.vacantSeats -= 1;
        selectedRide.bookedEmployees.push(empId);
        await selectedRide.save();

        res.status(200).json({
            statusCode: 200,
            message: 'Ride booked successfully'
        });

    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: err.message
        });
    }
};
