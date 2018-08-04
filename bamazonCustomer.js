// *************************************************
// Program: Bamazon App
// Author: Rod Skoglund
// File: bamazonCustomer.js
// *************************************************

// Declare packages
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "rootroot",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
    console.log("Displaying the list of available products ...\n");
    var query = connection.query("SELECT * FROM products", function(err, res) {
        var validIDs = [];
        // Display Heading
        console.log("   id    Product Name                                 Price");
        // Display products with spacing to align with heading
        for (var i = 0; i < res.length; i++) {
            validIDs.push(res[i].item_id);
            var idSpacer = "";
            var nameSpacer = "";

            var ispacer = parseInt(5 - res[i].item_id.toString().length);
            var nspacer = parseInt(40 - res[i].product_name.length) + parseInt(10 - res[i].price.toFixed(2).toString().length);
            
            for (var k = 0; k < ispacer; k++) {
                idSpacer = idSpacer + " ";
            }

            if (res[i].item_id < 10) { idSpacer = "    "; } 
            else if (res[i].item_id < 100) { idSpacer = "   "; } 
            else { idSpacer = "  "; }

            var nspacer = parseInt(40 - res[i].product_name.length) + parseInt(10 - res[i].price.toFixed(2).toString().length);
            for (var j = 0; j < nspacer; j++) {
                nameSpacer = nameSpacer + ".";
            }
            console.log(idSpacer + res[i].item_id + "    " + res[i].product_name + nameSpacer + "$" + parseFloat(res[i].price).toFixed(2));
        }
        console.log("\n");
        
        inquirer.prompt([
            {
              type: "input",
              name: "id",
              message: "Please enter the ID of the product you would like to buy: "
            },
            {
                type: "input",
                name: "qty",
                message: "Please enter the number units you would like to buy: "
            }
        ]).then(function(userInput) {
            // test for valid inputs: valid ID and quanity >= 0
            if ((validIDs.indexOf(parseInt(userInput.id)) >= 0) && (parseInt(userInput.qty) >= 0)) {
                var userQuery = "SELECT * FROM products INNER JOIN departments " + 
                                "ON products.department_name = departments.department_name WHERE ?"
                
                connection.query(userQuery, {item_id: userInput.id}, function(err, res) {
                    if (err) throw err;
                    if (parseInt(res[0].stock_quanity) < parseInt(userInput.qty)) {
                        console.log("\n  Sorry - Insufficient quantity!\n");
                        connection.end();
                    } else {
                        var totalCost = parseFloat(res[0].price) * parseInt(userInput.qty);
                        var newProductSales = res[0].product_sales + totalCost;
                        var newQty = (parseInt(res[0].stock_quanity) - parseInt(userInput.qty));

                        var updateQtyQuery = "UPDATE products SET stock_quanity = " + newQty + ", product_sales = " + newProductSales + " WHERE item_id = " + res[0].item_id;
                        connection.query(updateQtyQuery, function(err, res) {
                            if (err) throw err;
                        });
                        console.log("\n  Your total cost is $" + totalCost.toFixed(2) + "\n");
                        connection.end();
                    }
                }); // Connection Query (SELECT * FROM products WHERE userInput.id)
            } else {
                console.log("\nPlease enter a valid ID and a quanity greater than or equal to zero");
                connection.end();
            }
        }); // .then(function(userInput))
    }); // Connection Query (SELECT * FROM products)
}); // Connection.connect

