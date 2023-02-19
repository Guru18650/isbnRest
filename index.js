const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Create a MySQL pool
const pool = mysql.createPool({
  host: '45.138.26.6',
  user: 'root',
  password: '1234',
  database: 'isbn_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Define routes
app.get('/books/isbn/:isbn', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE ISBN = ?', [req.params.isbn]);
  res.json(rows);
});

app.get('/books/title/:title', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE Title LIKE ?', [`%${req.params.title}%`]);
  res.json(rows);
});

app.get('/books/author/:author', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE Author LIKE ?', [`%${req.params.author}%`]);
  res.json(rows);
});

app.get('/books/publisher/:publisher', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE Publisher LIKE ?', [`%${req.params.publisher}%`]);
  res.json(rows);
});

app.get('/books/:isbn', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE ISBN = ?', [req.params.isbn]);
  res.json(rows[0]);
});

app.get('/books', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books');
  res.json(rows);
});

app.get('/books/author/:author', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE Author = ?', [req.params.author]);
  res.json(rows);
});

app.get('/books/publisher/:publisher', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE Publisher = ?', [req.params.publisher]);
  res.json(rows);
});

app.get('/books/search_old/:query', async (req, res) => {
    const query = req.params.query;
    const sql = 'SELECT * FROM books WHERE ISBN LIKE ? OR Title LIKE ? OR Author LIKE ? OR Publisher LIKE ?';
    const [rows] = await pool.query(sql, [`%${query}%`, `%${query}%`, `%${query}%`,`%${query}%`]);
    res.json(rows);
  });

app.get('/books/search/:query', async (req, res) => {
  const query = req.params.query;
  const sql = 'SELECT * FROM books WHERE MATCH (Title, Author, Publisher) AGAINST ("'+query+'" IN NATURAL LANGUAGE MODE);';
  const [rows] = await pool.query(sql);
  res.json(rows);
});
  
app.post('/books/add', async (req, res) => {
  const book = req.body;
  // Check if the book already exists in the database
  const [rows] = await pool.query('SELECT * FROM books WHERE ISBN = ?', [book.ISBN]);
  const existingBook = rows[0];

  if (existingBook) {
    // Update the existing book
    await pool.query('UPDATE books SET Title=?, Author=?, Publisher=?, Language=?, Length=?, PublishDate=?, PhysicalFormat=?, OlKey=?, Cover=?, Owner=? WHERE ISBN = ?', [book.Title, book.Author, book.Publisher, book.Language, book.Length, book.PublishDate, book.PhysicalFormat, book.OlKey, book.Cover, book.Owner, book.ISBN]);
    res.json({ message: 'Book updated successfully' });
  } else {
    // Insert a new book
    await pool.query('INSERT INTO books (ISBN, Title, Author, Publisher, Language, Length, PublishDate, PhysicalFormat, OlKey, Cover, Owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [book.ISBN, book.Title, book.Author, book.Publisher, book.Language, book.Length, book.PublishDate, book.PhysicalFormat, book.OlKey, book.Cover, book.Owner]);
    res.json({ message: 'Book added successfully' });
  }
});
  

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
