const inquirer = require('inquirer');
//const mysql = require('mysql2');
const cTable = require('console.table');

const createConnection = require('./config/connection');

const db = createConnection();

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

const addEmpPrompt = [
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
        //choices: `${deptArray}`,
    },
    {
        type: 'list',
        name: 'dept',
        message: 'Wich department does the role belong to?',
        //choices: `${deptArray}`,
    },
];

const addDeptPrompt = [
    {
    type: 'input',
    name: 'newDept',
    message: 'What is the name of the department?',
    },
];

const viewAllDept = () => {
    db.query('SELECT * FROM department;', function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);    
        init();    
    });
}

// const viewAllDept =  async () => {
//     try {
//         const departments = await db.query('SELECT * FROM department;');                     
//         console.table(departments);    
//         init();
//     } catch (err) {
//         console.log('ERROR => ' + err);
//         return err;
//     }        
// }

const viewAllRoles = () => {
    db.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);
        init();        
    });
}

const viewAllEmployees = () => {
    db.query("SELECT e.id, e.first_name, e.last_name , r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Left JOIN employee m ON e.manager_id = m.id JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id;", function(err, results) {
        if (err) {
            console.log(err);
        }                
        console.table(results);
        init();      
    });
}

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

const addRoll = () => {
    db.query('SELECT name FROM department;', function(err, results) {
        if (err) {
            console.log(err);
        }
        //initialArray contains all the departments in the form of an array of objects               
        const initialArray = Object.values(results);
        const deptArray = [];
        
        //takes each object in the array, turns it into a string and the separates the department name only and pushes i to a new array
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

const addEmployee = () => {
    db.query('SELECT * FROM employee;', function(err, results) {
        if (err) {
            console.log(err);
        }

        const initialManagerArray = Object.values(results);
        const managerArray = ['None'];

        console.log('initialManagerArray', initialManagerArray);
            
        //takes each object in the array, turns it into a string and the separates the department name only and pushes i to a new array
        for (let i = 0; i < initialManagerArray.length; i++) {
            console.log('row ', i, JSON.stringify(initialManagerArray[i]));
            let manager = JSON.stringify(initialManagerArray[i]).split('"')[5] + ' ' + JSON.stringify(initialManagerArray[i]).split('"')[9];
            managerArray.push(manager);
        }
        console.log('managerArray', managerArray);

        db.query('SELECT * FROM role;', function(err, results) {
            if (err) {
                console.log(err);
            }
            //initialArray contains all the departments in the form of an array of objects               
            const initialRoleArray = Object.values(results);
            const roleArray = [];
            
            //takes each object in the array, turns it into a string and the separates the department name only and pushes i to a new array
            for (let i = 0; i < initialRoleArray.length; i++) {
                let role = JSON.stringify(initialRoleArray[i]).split('"')[5];
                roleArray.push(role);
            }

            console.log('roleArray', roleArray);

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




function init() {
inquirer.prompt(mainMenuPrompt).then((answer) => {    
    switch (answer.choice) {
        case 'View All Employees':
            // function to be added
            viewAllEmployees();
            break;
        case 'Add Employee':
            // function to be added
            addEmployee();
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
            addRoll();
            break;
        case 'View All Departments':
            // function to be added
            viewAllDept();
            break;
        case 'Add Department':
            // function to be added
            addDepartment();
            break;
        case 'Quit':
            // function to be added
            db.end();            
    }
    
}).catch((error) => {
    console.log(error);
});

console.log('end');
}

init();                         