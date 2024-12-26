const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure 'uploads' directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'tedx',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  },
});

// CRUD Routes

// GET all founders
app.get('/api/founders', (req, res) => {
  db.query('SELECT * FROM founders', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// POST new founder
app.post('/api/founders', upload.single('image'), (req, res) => {
  const { name, about, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !about || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = 'INSERT INTO founders (name, about, description, image_url) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, about, description, imageUrl], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: result.insertId, name, about, description, image_url: imageUrl });
  });
});

// PUT update founder
app.put('/api/founders/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, about, description } = req.body;
  let sql = 'UPDATE founders SET name = ?, about = ?, description = ? WHERE id = ?';
  const values = [name, about, description, id];

  if (req.file) {
    const imageUrl = `/uploads/${req.file.filename}`;
    sql = 'UPDATE founders SET name = ?, about = ?, description = ?, image_url = ? WHERE id = ?';
    values.splice(3, 0, imageUrl);
  }

  db.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Founder updated successfully' });
  });
});

// DELETE founder
app.delete('/api/founders/:id', (req, res) => {
  const { id } = req.params;

  // Fetch the founder first to get the image URL
  db.query('SELECT image_url FROM founders WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    const founder = results[0];
    if (founder) {
      const imagePath = path.join(__dirname, founder.image_url);

      // Delete image file if it exists
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Delete the founder from the database
      const sql = 'DELETE FROM founders WHERE id = ?';
      db.query(sql, [id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Founder deleted successfully' });
      });
    } else {
      res.status(404).json({ error: 'Founder not found' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
