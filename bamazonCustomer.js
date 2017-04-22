var mysql = require("mysql");
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "password",
  database: "Bamazon"
});
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
});

connection.query("SELECT * FROM products", function(err,res){
	if (err) throw err;
	console.log("\n ITEMS FOR SALE \n" + "============================ \n" + JSON.stringify(res) + "\n ============================ \n");
})

//prompt users with two questions
var questions = [
  //QUESTION: what is the ID of the product they would like to buy
  {
    type: 'input',
    name: 'id',
    message: 'What\'s the ID of the product you would like to buy?'
  },
  //QUESITON: what is the number of units they would like to buy
  {
    type: 'input',
    name: 'units',
    message: 'How many units of the product would you like to buy?',
    default: function () {
      return '1';
    }
  }
];

inquirer.prompt(questions).then(function (answers) {
  //ANSWER: numer of products they would like to buy
  var requestedQuantity = answers.units;

  //ANSWER: query based on ID of the product they want to buy
  //Saving stock_quantity of product
  connection.query("SELECT stock_quantity FROM products WHERE item_id=" + answers.id, function(err, res){
    if (err) throw err;
    var stockQuantity = res[0].stock_quantity;
    var balance = stockQuantity-requestedQuantity;
    console.log("stock quantity is: " + stockQuantity);
    console.log("requested quantity is: " + requestedQuantity);

    //if the current stock quantity subtracted by the requested quanity is less than zero, end the transaction.
    if (stockQuantity-requestedQuantity < 0){
      console.log("Insufficient quantity!");
    }
    //otherwise, update the stock quantity to new balance
    else {
      connection.query('UPDATE products SET ? WHERE ?', [{ stock_quantity: balance }, { item_id: answers.id }]);
      connection.query("SELECT price FROM products where item_id=" + answers.id, function(err, res){
        //
        var totalCost = res[0].price * requestedQuantity;
        if (err) throw err;
        console.log("$" + totalCost + " transaction completed. Thank you for your business.");
      })

    }

  })
});

// SELECT stock_quantity FROM products WHERE item_id=answers.id;