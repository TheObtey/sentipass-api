require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const db = require('./db');
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/passwords');

// Middleware
console.log('express.json is loaded');
app.use(express.json());


// Routes
app.use('/', authRoutes); // Redirige vers http://localhost:3000/api
app.use('/passwords', passwordRoutes);


app.listen(port, () => {
    console.log(`API en ligne sur http://localhost:${port}`);
});
