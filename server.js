const express = require('express');
const userRoutes = require('./routes/user.routes.js');
require('dotenv').config({path: './config/.env'});
require('./config/db');
const app = express();




// routes
app.use('/api/user' , userRoutes);





// server
app.listen(process.env.PORT, () => {
    console.log(`application Node : http://127.0.0.1:${process.env.PORT}`);
})