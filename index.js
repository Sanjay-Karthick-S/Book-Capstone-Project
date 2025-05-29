import axios from "axios";

import express from "express";
import pg from "pg";
const app = express();
const port = 3005;
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "123456",
  port: 5433,
});
db.connect();

app.get('/', async (req, res) => {
  const result = await db.query("SELECT * FROM books_read ORDER BY ID ASC");

  const books = result.rows.map(book => ({
    cover: `https://covers.openlibrary.org/b/id/${book.image}-L.jpg`,
    name: book.name,
    description: book.description,
    id: book.id
  }));

  res.render("index.ejs", {
    books,
    message: ''
  });
});

app.get('/add-books', async (req, res) => {
  res.render('book.ejs');
});
app.post('/added-books', async (req, res) => {
  try {
    const data = req.body;
    const result = await db.query("INSERT INTO books_read(name,image,description) VALUES($1,$2,$3)", [data.bname, data.bimg, data.bdesc]);
    const result2 = await db.query("SELECT * FROM books_read ORDER BY ID ASC");

    const books = result2.rows.map(book => ({
      cover: `https://covers.openlibrary.org/b/id/${book.image}-L.jpg`,
      name: book.name,
      description: book.description,
      id: book.id
    }));
    res.render('index.ejs', {
      books,
      message: `book ${data.bname} has been added.`
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/edit-book', async (req, res) => {
  try {
    const {
      bname,
      bdesc,
      bid
    } = req.body;
    const id = parseInt(bid, 10);
    if (isNaN(id)) {
      return res.status(400).send("Invalid book ID");
    }
    const result = await db.query("UPDATE books_read SET name=$1,description=$2 WHERE id=$3", [bname, bdesc, id]);
    const result2 = await db.query("SELECT * FROM books_read ORDER BY ID ASC");

    const books = result2.rows.map(book => ({
      cover: `https://covers.openlibrary.org/b/id/${book.image}-L.jpg`,
      name: book.name,
      description: book.description,
      id: book.id
    }));
    res.render('index.ejs', {
      books,
      message: `book ${bname} has been updated.`
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/delete-book', async (req, res) => {
  try {
    const id = parseInt(req.body.bid, 10);
    if (isNaN(id)) {
      return res.status(400).send("Invalid book ID");
    }
    const name = await db.query("SELECT name FROM books_read WHERE id=$1", [id]);
    const result = await db.query("DELETE FROM books_read WHERE id=$1", [id]);
    const result2 = await db.query("SELECT * FROM books_read ORDER BY ID ASC");

    const books = result2.rows.map(book => ({
      cover: `https://covers.openlibrary.org/b/id/${book.image}-L.jpg`,
      name: book.name,
      description: book.description,
      id: book.id
    }));

    res.render('index.ejs', {
      books,

      message: `Book ${name.rows[0]} has been deleted.`
    });

  } catch (err) {
    console.log(err);
  }

})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))