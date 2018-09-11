### Bamazon Schema

DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products
(
	item_id int NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quanity INTEGER NOT NULL,
    product_sales DECIMAL(10,2),
	PRIMARY KEY (item_id)
);

CREATE TABLE departments
(
	department_id int NOT NULL AUTO_INCREMENT,
	department_name VARCHAR(255) NOT NULL,
    over_head_costs DECIMAL(10,2) NOT NULL,
	PRIMARY KEY (department_id)
);
