const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const createConnection = require('./config/connection');

const db = createConnection();

// Connect to database
// const db = mysql.createConnection(
//     {
//       host: 'localhost',
//       // MySQL username,
//       user: 'root',
//       // MySQL password
//       password: 'easy',
//       database: 'employees_db'
//     },
//     console.log(`Connected to the employees_db database.`)
//   );


const mainMenuPrompt = {
    type: 'list',
    name: 'choice',
    Message: 'What would you like to do?',
    choices: [        
        'View All Departments',
        'View All Employees',
        'View All Roles',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Quit'
    ],
};

const addDeptPrompt = {
    type: 'input',
    name: 'newDept',
    Message: 'What is the name of the department?',
};

const viewAllDept = () => {
    db.query('SELECT * FROM department;', function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);        
    });
}

const viewAllRoles = () => {
    db.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);        
    });
}

const viewAllEmployees = () => {
    db.query("SELECT e.id, e.first_name, e.last_name , r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Left JOIN employee m ON e.manager_id = m.id JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id;", function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);        
    });
}

const addDepartment = () => {
    inquirer.prompt(mainMenuPrompt).then((answer) => {    
        db.query(`INSERT INTO department (name) VALUES (${answer.newDept});`, function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);        
        });        
    }).catch((error) => {
        console.log(error);
    });
}
    


//SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;

inquirer.prompt(mainMenuPrompt).then((answer) => {    
    switch (answer.choice) {
        case 'View All Employees':
            // function to be added
            viewAllEmployees();
            break;
        case 'Add Employee':
            // function to be added
            break;
        case 'Update Employee Role':
            // function to be added
            break;
        case 'View All Roles':
            // function to be added
            viewAllRoles();
            break;
        case 'Add Role':
            // function to be added
            break;
        case 'View All Departments':
            // function to be added
            viewAllDept();
            break;
        case 'Quit':
            // function to be added
            return;            
    }
    
}).catch((error) => {
    console.log(error);
});

console.log('end');