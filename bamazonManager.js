var mysql = require("mysql");
var inquirer = require("inquirer");

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
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }

  ]).then(function(res) {
    // console.log("\n");
    // console.log(res.action);
    connection.connect(function(err) {
        if (err) throw err;
        switch (res.action) {

            case "View Products for Sale":
                // console.log(res.action);
                viewProducts(res);
                break;
                // return displayRoot(path, req, res);
          
            case "View Low Inventory":
                // console.log(res.action);
                viewLowInv(res);
                break;
                // return displayPortfolio(path, req, res);
          
            case "Add to Inventory":
                // console.log(res.action);
                addInventory(res);
                break;
                // return displayPortfolio(path, req, res);
          
            case "Add New Product":
                // console.log(res.action);
                addNewProduct(res);
                // return display404(path, req, res);
        }
       
        // function viewProducts(response) {
        function viewProducts() {
                console.log(res.action);
            console.log("\n");
            var query = connection.query("SELECT * FROM products", function(err, res) {
                managerDiaplay(res);
                console.log("\n");
                connection.end();
            });
        }

        function viewLowInv() {
            //SELECT * FROM products WHERE (stock_quanity < 5);
            console.log(res.action);
            console.log("\n");
            var query = connection.query("SELECT * FROM products WHERE (stock_quanity < 5)", function(err, res) {
                managerDiaplay(res);
                console.log("\n");
                connection.end();
            });
        }
        function addInventory() {
            console.log(res.action);
            var query = connection.query("SELECT * FROM products", function(err, res) {
                managerDiaplay(res);
                console.log("\n");
                // connection.end();
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
        
                    var mgrQuery = "SELECT * FROM products WHERE ?"
                    
                    connection.query(mgrQuery, {item_id: mgrInput.id}, function(err, res2) {
                        // console.log("res2[0].stock_quanity = " + res2[0].stock_quanity);
                        // console.log("mgrInput.qty = " + mgrInput.qty);
                        var newQty = parseInt(res2[0].stock_quanity) + parseInt(mgrInput.qty);
                        // console.log("newQty = " + newQty);
                        var updateQtyQuery = "UPDATE products SET stock_quanity = " + parseInt(newQty) + " WHERE item_id = " + mgrInput.id;
                        // console.log("updateQtyQuery = " + updateQtyQuery);
                        connection.query(updateQtyQuery, function(err, res) {
                            if (err) throw err;
                            // console.log(res);
                        });
                        console.log("Success - the new quanity = " + newQty);
                        connection.end();
                    }); // Connection Query (SELECT * FROM products WHERE mgrInput.id)
                }); // .then(function(mgrInput))
            });
        } // end funstion addInventory
        
        function addNewProduct() {
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
                // when finished prompting, insert a new item into the db with that info
                connection.query(
                  "INSERT INTO products SET ?",
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
                  }
                );
                connection.end();
            }); // .then(function(mgrInput))
        }

        function managerDiaplay(res) {
            // Display Heading
            console.log("   id    Product Name                                 Price      Qty");
            // Display products with spacing to align with heading
            for (var i = 0; i < res.length; i++) {
                var idSpacer = "";
                var nameSpacer = "";
                var qtySpacer = "";
                // console.log("Length of item_id = " + res[i].item_id.toString().length);
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

// connection.connect(function(err) {
//     if (err) throw err;
// });  
