const inquirer = require('inquirer');
//const mysql = require('mysql2');
const cTable = require('console.table');

const art = require('ascii-art');

const createConnection = require('./config/connection');

const db = createConnection();

// Prompt for the Main Menu inquirer function
const mainMenuPrompt = [
    {
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
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
}];

// Prompt for the AddDepartment inquirer function
const addDeptPrompt = [
    {
    type: 'input',
    name: 'newDept',
    message: 'What is the name of the department?',
    },
];

// Function to view all departments
const viewAllDept = () => {
    db.query('SELECT * FROM department;', function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);    
        init();    
    });
}

// Function to view all roles
const viewAllRoles = () => {
    db.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);
        init();        
    });
}

// Function to view all employee's
const viewAllEmployees = () => {
    db.query("SELECT e.id, e.first_name, e.last_name , r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Left JOIN employee m ON e.manager_id = m.id JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id;", function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);
        init();      
    });
}

// Function to add a department
const addDepartment = () => {
    inquirer.prompt(addDeptPrompt).then((result) => { 
        const queryString = `INSERT INTO department (name) VALUES ('${result.newDept}');`;
        
        db.query(queryString, function(err, results) {
            if (err) {
                console.log(err);
            }                
        });
        console.log(`Added ${result.newDept} to list of departments`);
        init();        
    }).catch((error) => {
        console.log(error);
    });    
}


// Function to add a roll
const addRoll = () => {
    db.query('SELECT name FROM department;', function(err, results) {
        if (err) {
            console.log(err);
        }
        //initialArray contains all the rolls in the form of an array of objects               
        const initialArray = Object.values(results);
        const deptArray = [];
        
        //takes each object in the array, turns it into a string and the separates the department name only and pushes it to a new array
        for (let i = 0; i < initialArray.length; i++) {
            let dept = JSON.stringify(initialArray[i]).split('"')[3];
            deptArray.push(dept);
        }

        const addRolePrompt = [
            {
                type: 'input',
                name: 'newRole',
                message: 'What is the name of the role?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?',
            },
            {
                type: 'list',
                name: 'dept',
                message: 'Which department does the role belong to?',
                choices: deptArray,
            },
        ];

        inquirer.prompt(addRolePrompt).then((result) => { 
            
            db.query(`INSERT INTO role (title, salary, department_id) SELECT '${result.newRole}', '${result.salary}', department.id FROM department WHERE name = '${result.dept}';`, function(err, results) {
                if (err) {
                    console.log(err);
                }        
            });
            console.log(`Added ${result.newRole} to list of roles`);
            init();        
        }).catch((error) => {
            console.log(error);
        });       
    });    
}

// Function to add an employee
const addEmployee = () => {
    db.query('SELECT * FROM employee;', function(err, results) {
        if (err) {
            console.log(err);
        }

        const initialManagerArray = Object.values(results);
        const managerArray = ['None'];

        //takes each object in the array, turns it into a string and the separates the department name only and pushes i to a new array
        for (let i = 0; i < initialManagerArray.length; i++) {
            let manager = JSON.stringify(initialManagerArray[i]).split('"')[5] + ' ' + JSON.stringify(initialManagerArray[i]).split('"')[9];
            managerArray.push(manager);
        }
        
        db.query('SELECT * FROM role;', function(err, results) {
            if (err) {
                console.log(err);
            }
            //initialArray contains all the columns from the role table in the form of an array of objects               
            const initialRoleArray = Object.values(results);
            const roleArray = [];
            
            //takes each object in the array, turns it into a string and the separates the role title only and pushes it to a new array
            for (let i = 0; i < initialRoleArray.length; i++) {
                let role = JSON.stringify(initialRoleArray[i]).split('"')[5];
                roleArray.push(role);
            }

            const addEmpPrompt = [
                {
                    type: 'input',
                    name: 'fn',
                    message: "What is the employee's first name?",
                },
                {
                    type: 'input',
                    name: 'ln',
                    message: "What is the employee's last name?",
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: roleArray,
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managerArray,
                },
            ];

             

            inquirer.prompt(addEmpPrompt).then((result) => { 

                const nameArray = result.manager.split(' ');
                const  managerFn = nameArray[0];
                const  managerLn = nameArray[1];

                if (managerFn === 'None') {
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) SELECT '${result.fn}', '${result.ln}', role.id, null FROM role WHERE role.title = '${result.role}';`, function(err, results) {
                        if (err) {
                            console.log(err);
                        }        
                    });
                }
                else {
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) SELECT '${result.fn}', '${result.ln}', role.id, employee.id FROM role, employee WHERE role.title = '${result.role}' AND employee.first_name = '${managerFn}' AND employee.last_name = '${managerLn}';`, function(err, results) {
                        if (err) {
                            console.log(err);
                        }        
                    });
                }                

                console.log(`Added ${result.fn} ${result.ln} to list of employee's`);

                init();        
            }).catch((error) => {
                console.log(error);
            });       
        });
    });
}

// Function to update an employee
const updateEmpRole = () => {
    db.query("SELECT CONCAT(first_name, ' ', last_name) FROM employee;", function(err, results) {
        if (err) {
            console.log(err);
        }

        const initialEmpArray = Object.values(results);
        const employeeArray = [];

        //takes each object in the array, turns it into a string and pushes it to a new array
        for (let i = 0; i < initialEmpArray.length; i++) {
            let employee = JSON.stringify(initialEmpArray[i]).split('"')[3];
            employeeArray.push(employee);
        }
        console.log('employeeArray', employeeArray);

        db.query('SELECT * FROM role;', function(err, results) {
            if (err) {
                console.log(err);
            }
            //initialArray contains all the columns from the role table in the form of an array of objects               
            const initialRoleArray = Object.values(results);
            const roleArray = [];
            
            //takes each object in the array, turns it into a string and the separates the role title only and pushes it to a new array
            for (let i = 0; i < initialRoleArray.length; i++) {
                let role = JSON.stringify(initialRoleArray[i]).split('"')[5];
                roleArray.push(role);
            }

            console.log('roleArray', roleArray);

            const updateEmpPrompt = [
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee's role do you want to update?",
                    choices: employeeArray,
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "Which role do you want to assign to the selected employee?",
                    choices: roleArray,
                },
            ];

            inquirer.prompt(updateEmpPrompt).then((result) => { 

                const nameArray = result.employee.split(' ');
                const  employeeFn = nameArray[0];
                const  employeeLn = nameArray[1];

                db.query(`UPDATE employee SET role_id = (SELECT role.id FROM role WHERE role.title = '${result.role}') WHERE first_name = '${employeeFn}' AND last_name = '${employeeLn}';`, function(err, results) {
                    if (err) {
                        console.log(err);
                    }        
                });
                              
                console.log(`updated employee's role.`);

                init();        
            }).catch((error) => {
                console.log(error);
            });       
        });
    });
}

// initial menu calling all required functions
function init() {
inquirer.prompt(mainMenuPrompt).then((answer) => {    
    switch (answer.choice) {
        case 'View All Employees':
            viewAllEmployees();
            break;
        case 'Add Employee':
            addEmployee();
            break;
        case 'Update Employee Role':
            updateEmpRole();
            break;
        case 'View All Roles':
            viewAllRoles();
            break;
        case 'Add Role':
            addRoll();
            break;
        case 'View All Departments':
            viewAllDept();
            break;
        case 'Add Department':
            addDepartment();
            break;
        case 'Quit':
            db.end();            
    }
    
}).catch((error) => {
    console.log(error);
});

}


// Render fancy title and then call init to start program
art.font("Employee Manager", 'doom')
       .then((rendered)=>{
            console.log(rendered);
            init();
       }).catch((err)=>{
            console.log(err);
       });

