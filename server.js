const express = require('express');
require('dotenv').config({path: './config/.env'});
require('./config/db');
const app = express();



app.get('/', (req, res) => res.send('Hello World!'))


app.listen(process.env.PORT, () => {
    console.log(`application Node : http://127.0.0.1:${process.env.PORT}`);
})