const mysql = require("mysql2");

// create the connection to database

function createConnection() {
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "easy",
        database: "employees_db",
    });
}


module.exports = createConnection;