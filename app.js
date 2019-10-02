//const sqlite3 = require("sqlite3");
const Database = require("sqlite-async");

const main = async () => {
  try {
    db = await Database.open(":memory:");
  } catch (e) {
    throw Error("can not access sqlite database");
  }

  try {
    console.log("Creating resources table");
    await db.run(
      "CREATE TABLE IF NOT EXISTS resources(resource_id INTEGER PRIMARY KEY AUTOINCREMENT, resource_name TEXT UNIQUE)"
    );
    console.log("Inserting data into resources");
    await db.run("INSERT INTO resources (resource_name) VALUES (?),(?),(?)", [
      "First resource name",
      "Second resource name",
      "Third resouce name"
    ]);
    let rows = await db.all("SELECT * FROM resources");
    rows.forEach(row =>
      console.log(row.resource_id + ": " + row.resource_name)
    );
  } catch (e) {
    console.error(e);
  }
};

main();
