const Database = require("sqlite-async");

const main = async () => {
  try {
    db = await Database.open(":memory:");
  } catch (e) {
    throw Error("can not access sqlite database");
  }

  try {
    await createTables();

    await insertResource("First resouce name");
    await insertResource("Second resouce name");
    await insertResource("Third resouce name");

    await printResources();

    await insertReservation(
      new Date(),
      new Date(),
      "1",
      "email1@gmail.com",
      "A looooooong comment"
    );
    await insertReservation(
      new Date(),
      new Date(),
      "2",
      "email2@gmail.com",
      "Short com"
    );
    await insertReservation(
      new Date(),
      new Date(),
      "3",
      "email3@gmail.com",
      "booo"
    );

    printReservations();
  } catch (e) {
    console.error(e);
  }
};

const createTables = async () => {
  console.log("[CREATE] Creating resources table");
  await db.run(
    "CREATE TABLE IF NOT EXISTS resources(resource_id INTEGER PRIMARY KEY AUTOINCREMENT, resource_name TEXT UNIQUE NOT NULL)"
  );
  console.log("[CREATE] Creating reservations table");
  await db.run(
    "CREATE TABLE IF NOT EXISTS reservations(reservation_id INTEGER PRIMARY KEY AUTOINCREMENT, start_date DATE NOT NULL, end_date DATE NOT NULL, resource_id INTEGER, owner_email TEXT NOT NULL, comments TEXT NOT NULL, FOREIGN KEY (resource_id) REFERENCES resources (resource_id))"
  );
  await db.get("PRAGMA foreign_keys = ON");
};

const insertResource = async name => {
  console.log("[INSERT] Inserting data into resources table: " + name);
  return await db.run("INSERT INTO resources (resource_name) VALUES (?)", [
    name
  ]);
};

const insertReservation = async (
  start_date,
  end_date,
  resource_id,
  owner_email,
  comments
) => {
  console.log("[INSERT] Inserting data into reservations table");
  return await db.run(
    "INSERT INTO reservations(start_date, end_date, resource_id, owner_email, comments) VALUES (?,?,?,?,?)",
    [start_date, end_date, resource_id, owner_email, comments]
  );
};

const printResources = async () => {
  console.log("[SELECT] Printing resources data");
  let rows = await db.all("SELECT * FROM resources");
  await rows.forEach(row =>
    console.log(row.resource_id + ": " + row.resource_name)
  );
};

const printReservations = async () => {
  console.log("[SELECT] Printing reservations data");
  let rows = await db.all("SELECT * FROM reservations");
  await rows.forEach(row =>
    console.log(
      row.reservation_id +
        ": " +
        new Date(row.start_date).toISOString() +
        ", " +
        new Date(row.end_date).toISOString() +
        ", " +
        row.resource_id +
        ", " +
        row.owner_email +
        ", " +
        row.comments
    )
  );
};

main();
