const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    vehicleType: { type: String, required: true },
    vehicleNo: { type: String, required: true },
    vacantSeats: { type: Number },
    time: { type: String, required: true },
    pickupPoint: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    bookedEmployees: [String]
}, {
    timestamps: true,
    versionKey: false
})

rideSchema.index(
    { employeeId: 1, date: 1 },
    { unique: true }
);

module.exports = mongoose.model('Ride', rideSchema);