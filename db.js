const { Pool } = require('pg');

// Create a new instance of the Pool class with your database configuration.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost', // e.g., 'localhost' if it's running locally
    database: 'geeoh_upload',
    password: 'postgres',
    port: 5432, // default PostgreSQL port
});

// Connect to the database
pool.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database:', err);
    });

// Perform database operations (e.g., querying, inserting, updating) here

// When you're done, release the database connection
// pool.end()
//     .then(() => {
//         console.log('Disconnected from PostgreSQL database');
//     })
//     .catch((err) => {
//         console.error('Error disconnecting from PostgreSQL database:', err);
//     });

module.exports = { pool };
