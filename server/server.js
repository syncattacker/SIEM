const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const DB_PATH = path.join(__dirname, "..", "database", "enriched.db");

app.get("/api/logs", (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  db.all("SELECT * FROM enriched_logs", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
  db.close();
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
