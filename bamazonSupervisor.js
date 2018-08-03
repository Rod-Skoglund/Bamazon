var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "rootroot",
  database: "bamazon"
});

console.log("\n");
inquirer.prompt([

    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: ["View Product Sales by Department", "Create New Department"]
    }

    ]).then(function(res) {
        // console.log("\n");
        // console.log(res.action);
        connection.connect(function(err) {
            if (err) throw err;
            switch (res.action) {

                case "View Product Sales by Department":
                    // console.log(res.action);
                    viewByDepartments(res);
                    break;
            
                case "Create New Department":
                    // console.log(res.action);
                    addNewDepartment(res);
            }
        });
    });

    // function viewProducts(response) {
    function viewByDepartments(res) {
        // SELECT departments.*, SUM(products.product_sales) AS product_sales, (SUM(products.product_sales) - departments.over_head_costs) AS total_profit FROM departments INNER JOIN products
        //         ON departments.department_name = products.department_name WHERE department_Id > 0 GROUP BY departments.department_name;

        console.log(res.action);
        console.log("\n");
        var query = "SELECT departments.*, SUM(products.product_sales) AS product_sales, " + 
                    "(SUM(products.product_sales) - departments.over_head_costs) AS total_profit " + 
                    "FROM departments INNER JOIN products " + 
                    "ON departments.department_name = products.department_name " + 
                    "WHERE department_Id > 0 GROUP BY departments.department_name"
        connection.query(query, function(err, res) {
            var values = [];
            for (var i = 0; i < res.length; i++) {
                var iRow = [
                    "   " + res[i].department_id,
                    res[i].department_name,
                    "  $" + res[i].over_head_costs.toFixed(2).toString(),
                    "  $" + res[i].product_sales.toFixed(2).toString(),
                    "  $" + res[i].total_profit.toFixed(2).toString()
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
        console.log(res.action);
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
        ]).then(function(answer) {
            // when finished prompting, insert a new item into the db with that info
            connection.query(
              "INSERT INTO departments SET ?",
              {
                department_name: answer.dName,
                over_head_costs: answer.ohc
              },
              function(err) {
                if (err) throw err;
                console.log("Your new department was added successfully!");
              }
            );
            connection.end();
        }); // .then(function(mgrInput))

    }
    
    