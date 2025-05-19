const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./quotes.db');

// GET quotes with optional theme filter (case-insensitive)
app.get('/quotes', (req, res) => {
    const theme = req.query.theme;
    console.log("Received theme:", theme);  // <-- Debugging log
  
    const sql = theme
      ? `SELECT * FROM quotes WHERE LOWER(theme) = LOWER(?)`
      : `SELECT * FROM quotes`;
  
    console.log("SQL Query:", sql);  // <-- Debugging log
  
    db.all(sql, theme ? [theme.trim()] : [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
  
      console.log("Database rows returned:", rows);  // <-- Debugging log
      res.json(rows);
    });
  });
  

// POST a new quote
app.post('/quotes', (req, res) => {
  const { text, theme } = req.body;
  if (!text || !theme) {
    return res.status(400).json({ error: 'Text and theme are required' });
  }

  db.run(`INSERT INTO quotes (text, theme) VALUES (?, ?)`, [text, theme], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, text, theme });
  });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
