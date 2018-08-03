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

// console.log("testing");

connection.connect(function(err) {
  if (err) throw err;
//   console.log("connected as id " + connection.threadId + "\n");
//   displayProducts();

// function displayProducts() {
    console.log("Displaying the list of available products ...\n");
    var query = connection.query("SELECT * FROM products", function(err, res) {
        // Display Heading
        console.log("   id    Product Name                                 Price");
        // Display products with spacing to align with heading
        for (var i = 0; i < res.length; i++) {
            var idSpacer = "";
            var nameSpacer = "";
            // console.log("Length of item_id = " + res[i].item_id.toString().length);
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
              message: "Please enter the ID of the product they would like to buy: "
            },
            {
                type: "input",
                name: "qty",
                message: "Please enter the number units you would like to buy: "
            }
          ]).then(function(userInput) {

            var userQuery = "SELECT * FROM products INNER JOIN departments " + 
                            "ON products.department_name = departments.department_name WHERE ?"
            
            connection.query(userQuery, {item_id: userInput.id}, function(err, res) {
                // console.log(res);
                if (parseInt(res[0].stock_quanity) < parseInt(userInput.qty)) {
                    console.log("\n  Sorry - Insufficient quantity!\n");
                    connection.end();
                } else {
                    //Decreent qty from stock_quantity = update DB
                    var totalCost = parseFloat(res[0].price) * parseInt(userInput.qty);
                    var newProductSales = res[0].product_sales + totalCost;
                    var newQty = (parseInt(res[0].stock_quanity) - parseInt(userInput.qty));
                    
                    var updateQtyQuery = "UPDATE products SET stock_quanity = " + newQty + ", product_sales = " + newProductSales + " WHERE item_id = " + res[0].item_id;
                    connection.query(updateQtyQuery, function(err, res) {
                        if (err) throw err;
                        // console.log(res);
                    });
                    console.log("\n  Your total cost is $" + totalCost.toFixed(2) + "\n");
                    connection.end();
                }
            }); // Connection Query (SELECT * FROM products WHERE userInput.id)
        }); // .then(function(userInput))
    }); // Connection Query (SELECT * FROM products)
}); // Connection.connect

