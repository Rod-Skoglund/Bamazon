// *************************************************
// Program: Bamazon App
// Author: Rod Skoglund
// File: bamazonSupervisor.js
// *************************************************

// Declare packages
var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require("console.table");

// Create connection to mySQL bamazon DB
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "rootroot",
  database: "bamazon"
});

console.log("\n");

// Ask Supervisor what they want to do
inquirer.prompt([

    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: ["View Product Sales by Department", "Create New Department"]
    }
    // Process requested Action
    ]).then(function(res) {
        connection.connect(function(err) {
            if (err) throw err;
            switch (res.action) {

                case "View Product Sales by Department":
                    viewByDepartments(res);
                    break;
            
                case "Create New Department":
                    addNewDepartment(res);
            } // end switch statement
        }); // end connection.connect statement
    }); // end Inquirer.prompt .then action

    function viewByDepartments(res) {
        console.log(res.action);
        console.log("\n");
        // define query statement for DB query
        var query = "SELECT departments.*, SUM(products.product_sales) AS product_sales, " + 
                    "(SUM(products.product_sales) - departments.over_head_costs) AS total_profit " + 
                    "FROM departments LEFT JOIN products " + 
                    "ON departments.department_name = products.department_name " + 
                    "WHERE department_Id > 0 GROUP BY departments.department_name"

        // Run query and format results for display in client (node.js) window
        connection.query(query, function(err, res) {
            var values = [];
            for (var i = 0; i < res.length; i++) {
                var pSales = "";
                var tProfit = "";
                if (res[i].product_sales == null) {
                    pSales = null;
                } else {
                    pSales = "  $" + res[i].product_sales.toFixed(2);
                }
                if (res[i].total_profit == null) {
                    tProfit = null;
                } else {
                    tProfit = "  $" + res[i].total_profit.toFixed(2);
                }
                var iRow = [
                    "   " + res[i].department_id,
                    res[i].department_name,
                    "  $" + res[i].over_head_costs.toFixed(2),
                    pSales,
                    tProfit
                ]
                values.push(iRow);
            }
            console.table([" department_id", "department_name", "over_head_costs", "product_sales", "total_profit"], values);
                // managerDiaplay(res);
                console.log("\n");
                connection.end();
        });
    }

    function addNewDepartment(res) {
        // Create list with all existing Departments
        var validDepts = [];
        var query2 = connection.query("SELECT * FROM products", function(err, res3) {
            // console.log(res3);
            for (var j = 0; j < res3.length; j++) {
                validDepts.push(res3[j].product_name);
            }
        });

        console.log(res.action);

        // Get data from Supervisor/User
        inquirer.prompt([
            {
                type: "input",
                name: "dName",
                message: "Enter the new Department Name: "
            },
            {
                type: "input",
                name: "ohc",
                message: "Enter the Over Head Costs: "
            }
        ]).then (function(answer) {
            
            // Make sure the user's new department does not already exist
            if (validDepts.indexOf(answer.pName) >= 0) {
                // The users new department does not exist - process the request 
                // to add it to the table
                connection.query("INSERT INTO departments SET ?",
                {
                    department_name: answer.dName,
                    over_head_costs: answer.ohc
                },
                function(err) {
                    if (err) throw err;
                    console.log("Your new department was added successfully!");
                });
            } else {
                console.log("\nThat Department already exists - Please try again.");
            }

            connection.end();
        }); // .then(function(answer))

    }
    
    