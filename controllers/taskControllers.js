const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db'); 
const jwt = require("jsonwebtoken")
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, description TEXT, status TEXT)");

  db.run("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)", ['Task 1', 'Description for Task 1', 'todo']);
  db.run("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)", ['Task 2', 'Description for Task 2', 'in_progress']);
  db.run("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)", ['Task 3', 'Description for Task 3', 'done']);
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
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

exports.register = (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (row) {
      res.status(400).json({ error: 'User already exists' });
    } else {
      
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          
          db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function (err) {
            if (err) {
              console.error(err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              res.status(201).json({ message: 'User registered successfully' });
            }
          });
        }
      });
    }
  });
};

 
exports.login = (req, res) => {
  const { username, password } = req.body;

  
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!row) {
      res.status(401).json({ error: 'Invalid username or password' });
    } else {
       
      bcrypt.compare(password, row.password, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else if (!result) {
          res.status(401).json({ error: 'Invalid username or password' });
        } else {
          const token = jwt.sign({ userId: row.id, username: row.username }, 'your_secret_key', { expiresIn: '1h' });
          res.status(200).json({ token });
        }
      });
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



const ADMIN_USERNAME = 'dattavenkataramana';
const ADMIN_PASSWORD = 'Datta1234@#*';

 
const saltRounds = 10;
bcrypt.hash(ADMIN_PASSWORD, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing admin password:', err);
    return;
  }
  db.run("INSERT INTO users (username, password, isAdmin) VALUES (?, ?, 1)", [ADMIN_USERNAME, hashedPassword], (err) => {
    if (err) {
      console.error('Error creating admin user:', err);
    } else {
      console.log('Admin user created successfully');
    }
  });
});

exports.register = (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    db.run("INSERT INTO users (username, password, isAdmin) VALUES (?, ?, 0)", [username, hashedPassword], (err) => {
      if (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(201).json({ message: 'User created successfully' });
      }
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error('Error finding user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else if (!result) {
          res.status(401).json({ error: 'Invalid credentials' });
        } else {
          const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, 'secret', { expiresIn: '1h' });
          res.status(200).json({ token });
        }
      });
    }
  });
};

exports.getAllUserData = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, 'secret', (err, decodedToken) => {
    if (err) {
      console.error('Error verifying token:', err);
      res.status(401).json({ error: 'Unauthorized' });
    } else if (!decodedToken.isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
    } else {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          console.error('Error fetching user data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json(rows);
        }
      });
    }
  });
};