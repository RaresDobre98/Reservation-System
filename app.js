const sqlite3 = require("sqlite3");

let db = new sqlite3.Database("./mydb.sqlite3", err => {
  if (err) {
    console.log("Error when creating the database", err);
  } else {
    console.log("Database created!");
    /* Put code to create table(s) here */
    createTable();
  }
});

const createTable = () => {
  console.log("create database table resources");
  db.run(
    "CREATE TABLE IF NOT EXISTS resources(resource_id INTEGER PRIMARY KEY AUTOINCREMENT, resource_name TEXT UNIQUE)",
    insertData
  );
};

const insertData = () => {
  console.log("Insert data");
  db.run(
    "INSERT INTO resources (resource_name) VALUES (?)",
    ["firstResourceName"],
    readResources
  );
};

const readResources = () => {
  console.log("Read data from contacts");
  db.all("SELECT * FROM resources", function(err, rows) {
    rows.forEach(function(row) {
      console.log(row.resource_id + ": " + row.resource_name);
    });
  });
};
