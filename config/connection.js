const mysql = require("mysql2/promise");
const bluebird = require('bluebird');

// create the connection to database

async function createConnection() {
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "easy",
        database: "employees_db",
        Promise: bluebird,
    });
}


module.exports = createConnection;