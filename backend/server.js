const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { task, time } = req.body;

    const result = await pool.query(
      "INSERT INTO tasks (task, time) VALUES ($1, $2) RETURNING *",
      [task, time],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { completed } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Task deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
