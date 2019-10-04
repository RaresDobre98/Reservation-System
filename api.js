const Database = require("sqlite-async");
const express = require("express");
const app = express();

// Server port
const HTTP_PORT = 8000;

// Regex email
const validateEmail = email =>
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  );
let db;

const main = (async () => {
  try {
    db = await Database.open(":memory:");
    // db = await Database.open("./mydb.sqlite3");
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
    await insertReservation(
      new Date(),
      new Date(),
      "3",
      "email4@gmail.com",
      "go go go"
    );

    await printReservations();

    startExpressServer();
  } catch (e) {
    console.error(e);
  }
})();

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
  return await rows.forEach(row =>
    console.log(row.resource_id + ": " + row.resource_name)
  );
};

const printReservations = async () => {
  console.log("[SELECT] Printing reservations data");
  let rows = await db.all("SELECT * FROM reservations");
  return await rows.forEach(row =>
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

const startExpressServer = () => {
  // Parse the body of POST requests
  const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Start server
  app.listen(HTTP_PORT, () => {
    console.log("Server running on port " + HTTP_PORT);
  });
  // Root endpoint
  app.get("/test", (req, res, next) => {
    res.json({ message: "Ok" });
  });

  // Insert here other API endpoints
  // GET all resources
  app.get("/api/resources", async (req, res, next) => {
    console.log("[GET] A request has been made on /api/resources");
    let sql = "SELECT * FROM resources";
    let rows;
    try {
      rows = await db.all(sql);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    res.json({
      message: "success",
      data: rows
    });
  });

  // GET all reservations
  app.get("/api/reservations", async (req, res, next) => {
    console.log("[GET] A request has been made on /api/reservations");
    let sql = "SELECT * FROM reservations";
    let rows;
    try {
      rows = await db.all(sql);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    res.json({
      message: "success",
      data: rows
    });
  });

  // GET a single resource
  app.get("/api/resource/:id", async (req, res, next) => {
    console.log(
      "[GET] A request has been made on /api/resources/" + req.params.id
    );
    let sql = "SELECT * FROM resources WHERE resource_id = ?";
    let params = [req.params.id];
    try {
      let row = await db.get(sql, params);
      if (row) {
        res.json({
          message: "success",
          data: row
        });
      } else {
        res.status(400).json({ error: "Invalid resource id" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET a single reservation
  app.get("/api/reservation/:id", async (req, res, next) => {
    console.log(
      "[GET] A request has been made on /api/reservation/" + req.params.id
    );
    let sql = "SELECT * FROM reservations WHERE reservation_id = ?";
    let params = [req.params.id];
    try {
      let row = await db.get(sql, params);
      if (row) {
        res.json({
          message: "success",
          data: row
        });
      } else {
        res.status(400).json({ error: "Invalid reservation id" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST (insert) a new resource
  app.post("/api/resource/", async (req, res, next) => {
    console.log(
      "[POST] A request has been made on /api/resource/ with the following object " +
        JSON.stringify(req.body)
    );
    let errors = [];
    if (!req.body.resource_name) {
      errors.push("No resource_name specified");
    }
    if (errors.length) {
      res.status(400).json({ error: errors.join(", ") });
      return;
    }
    let data = {
      resource_name: req.body.resource_name
    };
    let sql = "INSERT INTO resources (resource_name) VALUES (?)";
    let params = data.resource_name;
    try {
      let { lastID } = await db.run(sql, params);
      res.json({
        message: "success",
        data: data,
        id: lastID
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // POST (insert) a new reservation
  app.post("/api/reservation/", async (req, res, next) => {
    console.log(
      "[POST] A request has been made on /api/reservation/ with the following object " +
        JSON.stringify(req.body)
    );
    let errors = [];
    if (!req.body.start_date) {
      errors.push("No start_date specified");
    }
    if (!req.body.end_date) {
      errors.push("No end_date specified");
    }
    if (!req.body.resource_id) {
      errors.push("No resource_id specified");
    }
    if (!req.body.owner_email) {
      errors.push("No owner_email specified");
    }
    if (!req.body.comments) {
      errors.push("No comments specified");
    }
    if (req.body.start_date > req.body.end_date) {
      errors.push("start_date should be before end_date");
    }
    if (!validateEmail(req.body.owner_email)) {
      errors.push("Invalid e-mail format");
    }
    if (errors.length) {
      res.status(400).json({ error: errors.join(", ") });
      return;
    }
    let data = {
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      resource_id: req.body.resource_id,
      owner_email: req.body.owner_email,
      comments: req.body.comments
    };
    let sql =
      "INSERT INTO reservations (start_date, end_date, resource_id, owner_email, comments) VALUES (?,?,?,?,?)";
    let params = [
      data.start_date,
      data.end_date,
      data.resource_id,
      data.owner_email,
      data.comments
    ];
    try {
      let { lastID } = await db.run(sql, params);
      res.json({
        message: "success",
        data: data,
        id: lastID
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Default response for any other request
  app.get("*", function(req, res) {
    res.status(404).json({ error: "Page not found" });
  });
};
