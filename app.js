const Database = require("sqlite-async");

const main = async () => {
  try {
    db = await Database.open(":memory:");
  } catch (e) {
    throw Error("can not access sqlite database");
  }

  try {
    console.log("[CREATE] Creating resources table");
    await db.run(
      "CREATE TABLE IF NOT EXISTS resources(resource_id INTEGER PRIMARY KEY AUTOINCREMENT, resource_name TEXT UNIQUE NOT NULL)"
    );

    await insertResource("First resouce name");
    await insertResource("Second resouce name");
    await insertResource("Third resouce name");

    await printResources();

    await db.get("PRAGMA foreign_keys = ON");

    console.log("[CREATE] Creating reservations table");
    await db.run(
      "CREATE TABLE IF NOT EXISTS reservations(reservation_id INTEGER PRIMARY KEY AUTOINCREMENT, start_date DATE NOT NULL, end_date DATE NOT NULL, resource_id INTEGER, owner_email TEXT NOT NULL, comments TEXT NOT NULL, FOREIGN KEY (resource_id) REFERENCES resources (resource_id))"
    );

    console.log("[INSERT]Inserting data into reservations table");
    //await db.run("INSERT INTO reservations(");
  } catch (e) {
    console.error(e);
  }
};

const insertResource = async name => {
  console.log("[INSERT] Inserting data into resources table: " + name);
  return await db.run("INSERT INTO resources (resource_name) VALUES (?)", [
    name
  ]);
};

const printResources = async () => {
  console.log("[SELECT] Printing resources data");
  let rows = await db.all("SELECT * FROM resources");
  await rows.forEach(row =>
    console.log(row.resource_id + ": " + row.resource_name)
  );
};

main();
