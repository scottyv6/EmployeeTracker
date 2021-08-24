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

// const viewAllDept = () => {
//     db.query('SELECT * FROM department;', function(err, results) {
//         if (err) {
//             console.log(err);
//         }                
//         console.table(results);    
//         init();    
//     });
// }

const viewAllDept =  async () => {
    try {
        const departments = await db.query('SELECT * FROM department;');                     
        console.table(departments);    
        init();
    } catch (err) {
        console.log('ERROR => ' + err);
        return err;
    }        
}

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
        console.log('inside', deptArray);

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

            db.query(`INSERT INTO department (name) VALUES ('${result.newDept}');`, function(err, results) {
                if (err) {
                    console.log(err);
                }        
            });
            console.log(`Added ${result.newDept} to list of departments`);
            init();        
        }).catch((error) => {
            console.log(error);
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