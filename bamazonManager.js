// *************************************************
// Program: Bamazon App
// Author: Rod Skoglund
// File: bamazonManager.js
// *************************************************

// Declare packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// Establish connection to mySQL DB
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,
    user: "root",
    password: "rootroot",
    database: "bamazon"
});

console.log("\n");

// Ask user what they want to do.
inquirer.prompt([

    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }

  ]).then(function(res) {
    // Process teh request
    connection.connect(function(err) {
        if (err) throw err;

        switch (res.action) {

            case "View Products for Sale":
                viewProducts(res);
                break;
          
            case "View Low Inventory":
                viewLowInv(res);
                break;
          
            case "Add to Inventory":
                addInventory(res);
                break;
          
            case "Add New Product":
                addNewProduct(res);
        }
       
        function viewProducts(res) {
            console.log(res.action);
            console.log("\n");
            var query = connection.query("SELECT * FROM products", function(err, res) {
                managerDisplay(res);
                console.log("\n");
                connection.end();
            });
        }

        function viewLowInv(res) {
            console.log(res.action);
            var query = connection.query("SELECT * FROM products WHERE (stock_quanity < 5)", function(err, res) {
                if (res.length > 0) {
                    // console.log("\n");
                    managerDisplay(res);
                } else {
                    console.log("All Productss have a quanity greater than or equal to 5");
                }
                connection.end();
            });
        }

        function addInventory(res) {
            console.log(res.action);
            var query = connection.query("SELECT * FROM products", function(err, res) {
                var validIDs = [];
                for (var j = 0; j < res.length; j++) {
                    validIDs.push(res[j].item_id);
                }
                managerDisplay(res);
                console.log("\n");

                // Ask user for the ID they want to change and teh quanity they want to add
                inquirer.prompt([
                    {
                    type: "input",
                    name: "id",
                    message: "Add inventory to which item (Please enter the ID): "
                    },
                    {
                        type: "input",
                        name: "qty",
                        message: "Please enter the number units you would like add: "
                    }
                ]).then(function(mgrInput) {
                    // Check for a valid ID and that the quanity is >= 0
                    if ((validIDs.indexOf(parseInt(mgrInput.id)) >= 0) && (parseInt(mgrInput.qty) >= 0)) {

        
                        var mgrQuery = "SELECT * FROM products WHERE ?"
                        
                        connection.query(mgrQuery, {item_id: mgrInput.id}, function(err, res2) {
                            var newQty = parseInt(res2[0].stock_quanity) + parseInt(mgrInput.qty);
                            var updateQtyQuery = "UPDATE products SET stock_quanity = " + parseInt(newQty) + " WHERE item_id = " + mgrInput.id;
                            connection.query(updateQtyQuery, function(err, res) {
                                if (err) throw err;
                            });
                            console.log("Success - the new quanity = " + newQty);
                            connection.end();
                        }); // Connection Query (SELECT * FROM products WHERE mgrInput.id)
                    } else {
                        console.log("\nPlease enter a valid ID and a quanity greater than or equal to zero");
                        connection.end();        
                    }
                }); // .then(function(mgrInput))
            });
        } // end funstion addInventory
        
        function addNewProduct(res) {
            var validProds = [];
            var query2 = connection.query("SELECT * FROM products", function(err, res3) {
                for (var j = 0; j < res3.length; j++) {
                    validProds.push(res3[j].product_name);
                }
            });

            console.log(res.action);
            inquirer.prompt([
                {
                    type: "input",
                    name: "pName",
                    message: "Enter the new Product Name: "
                },
                {
                    type: "input",
                    name: "dName",
                    message: "Enter the Department Name: "
                },
                {
                    type: "input",
                    name: "price",
                    message: "Enter the price (without the '$'): "
                },
                {
                    type: "input",
                    name: "qty",
                    message: "Please enter the number units available: "
                }
            ]).then(function(answer) {
                // Make sure the product does not already exist
                if (validProds.indexOf(answer.pName) < 0) {

                    // when finished prompting, insert a new item into the db with that info
                    connection.query("INSERT INTO products SET ?",
                        {
                            product_name: answer.pName,
                            department_name: answer.dName,
                            price: answer.price,
                            stock_quanity: answer.qty,
                            product_sales: parseFloat(0.00)
                        },
                        function(err) {
                            if (err) throw err;
                            console.log("Your new product was added successfully!");
                    });
                } else {
                    console.log("\nThat Product already exists - Please try again.");
                };
                connection.end();
            }); // .then(function(mgrInput))
        };

        function managerDisplay(res) {
            // Display Heading
            console.log("   id    Product Name                                 Price      Qty");
            // Display products with spacing to align with heading
            for (var i = 0; i < res.length; i++) {
                var idSpacer = "";
                var nameSpacer = "";
                var qtySpacer = "";

                var ispacer = parseInt(5 - res[i].item_id.toString().length);
                var nspacer = parseInt(40 - res[i].product_name.length) + parseInt(10 - res[i].price.toFixed(2).toString().length);
                var qspacer = parseInt(8 - res[i].stock_quanity.toString().length);

                for (var k = 0; k < ispacer; k++) {
                    idSpacer = idSpacer + " ";
                }

                for (var m = 0; m < qspacer; m++) {
                    qtySpacer = qtySpacer + " ";
                }

                if (res[i].item_id < 10) { idSpacer = "    "; } 
                else if (res[i].item_id < 100) { idSpacer = "   "; } 
                else { idSpacer = "  "; }

                var nspacer = parseInt(40 - res[i].product_name.length) + 
                              parseInt(10 - res[i].price.toFixed(2).toString().length);
                for (var j = 0; j < nspacer; j++) {
                    nameSpacer = nameSpacer + ".";
                }
                console.log(idSpacer + res[i].item_id + "    " + res[i].product_name + nameSpacer + "$" + 
                            parseFloat(res[i].price).toFixed(2) + qtySpacer + res[i].stock_quanity);
            }

        }
    });      
  });  

