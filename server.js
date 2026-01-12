const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/config/db');
connectDB();

const app = require('./src/app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})