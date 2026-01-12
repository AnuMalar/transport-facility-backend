const express = require('express');
const cors = require('cors');
const app = express();

const rideRoutes = require('./routes/rideRoutes');

app.use(express.json());
app.use(cors());

app.use('/api/', rideRoutes);


app.get('/', (req, res) => {
    res.send("Test App is running");
})

module.exports = app;