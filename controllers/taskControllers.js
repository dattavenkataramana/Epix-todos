const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db'); 

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, description TEXT, status TEXT)");

  db.run("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)", ['Task 1', 'Description for Task 1', 'todo']);
  db.run("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)", ['Task 2', 'Description for Task 2', 'in_progress']);
  db.run("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)", ['Task 3', 'Description for Task 3', 'done']);
});

exports.getAllTasks = (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(rows);
    }
  });
};

exports.getTaskById = (req, res) => {
  const { taskId } = req.params;
  db.get("SELECT * FROM tasks WHERE id = ?", [taskId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!row) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.status(200).json(row);
    }
  });
};

exports.createTask = (req, res) => {
  const { title, description, status } = req.body;
  db.run("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)", [title, description, status], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(201).json({ id: this.lastID, title, description, status });
    }
  });
};

exports.updateTask = (req, res) => {
  const { taskId } = req.params;
  const { title, description, status } = req.body;
  db.run("UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?", [title, description, status, taskId], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.status(200).json({ id: taskId, title, description, status });
    }
  });
};

exports.deleteTask = (req, res) => {
  const { taskId } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", [taskId], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
        res.send("Data Deleted successfully")
    }
  });
};
