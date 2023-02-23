const express = require('express');
var bodyParser = require('body-parser')
const mysql = require('mysql2/promise');
var jsonParser = bodyParser.json()
const app = express();
const port = 3001;

// Create a MySQL pool
const pool = mysql.createPool({
  host: 'bk2vpw6ahz5g7ocajb10-mysql.services.clever-cloud.com',
  user: 'u7l6smhxaixes8sj',
  password: 'JJ42b2OBQtgTsn2ANtnU',
  database: 'bk2vpw6ahz5g7ocajb10',
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
    if(rows.length == 0) {
      const sql = 'SELECT * FROM books WHERE ISBN LIKE ? OR Title LIKE ? OR Author LIKE ? OR Publisher LIKE ?';
      const [rows] = await pool.query(sql, [`%${query}%`, `%${query}%`, `%${query}%`,`%${query}%`]);
      res.json(rows);
    } else {
      res.json(rows);
    }
    
  });
  
app.post('/books/add',jsonParser, async (req, res) => {
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
  
app.get('/stats', async (req, res) => {
  const [totalBooksCount] = await pool.query('SELECT COUNT(*) AS totalBooksCount FROM books');
  const [totalPagesCount] = await pool.query('SELECT SUM(Length) AS totalPagesCount FROM books');
  const [uniqueAuthorsCount] = await pool.query('SELECT COUNT(DISTINCT Author) AS uniqueAuthorsCount FROM books');
  const [uniquePublishersCount] = await pool.query('SELECT COUNT(DISTINCT Publisher) AS uniquePublishersCount FROM books');
  const [publisherWithMostBooks] = await pool.query('SELECT Publisher, COUNT(*) AS bookCount FROM books GROUP BY Publisher ORDER BY bookCount DESC LIMIT 1');
  const [authorWithMostBooks] = await pool.query('SELECT Author, COUNT(*) AS bookCount FROM books GROUP BY Author ORDER BY bookCount DESC LIMIT 1');
  const [booksPerLanguage] = await pool.query('SELECT Language, COUNT(*) AS bookCount FROM books GROUP BY Language');

  const statistics = {
    totalBooksCount: totalBooksCount[0].totalBooksCount,
    totalPagesCount: totalPagesCount[0].totalPagesCount,
    uniqueAuthorsCount: uniqueAuthorsCount[0].uniqueAuthorsCount,
    uniquePublishersCount: uniquePublishersCount[0].uniquePublishersCount,
    publisherWithMostBooks: publisherWithMostBooks[0],
    authorWithMostBooks: authorWithMostBooks[0],
    booksPerLanguage: booksPerLanguage
  };

  res.json(statistics);
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
