const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');

const app = express();

// MySQL connection (Avoid spaces in DB name — use underscore or rename it)
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'',
  database: 'jhon marko'
});

con.connect(err => {
  if (err) throw err;
  console.log('Connected to database');
});

app.use(express.urlencoded({ extended: true }));

// GET form page
app.get('/addproduct', (req, res) => {
  const sql = "SELECT * FROM category"; 

  con.query(sql, (err, results) => {
    if (err) return res.status(500).send("Database error");

    // Start building HTML
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Add Product</title>
<style>
  body {
    margin: 0;
    height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #6878d1, #9574b4);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .form-container {
    background: white;
    border-radius: 12px;
    padding: 2.5rem 3rem;
    width: 320px;
    box-shadow: 0 10px 20px rgb(91 74 172 / 0.3);
    text-align: center;
  }
  .form-container h2 {
    color: #4b399f;
    font-weight: 700;
    margin-bottom: 2rem;
    line-height: 1.2;
  }
  label {
    display: block;
    text-align: left;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
  }
  input[type="text"], input[type="file"], select {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1.5px solid #ddd;
    font-size: 0.95rem;
    outline: none;
    box-sizing: border-box;
    margin-bottom: 1.8rem;
    transition: border-color 0.3s ease;
  }
  input[type="text"]:focus, input[type="file"]:focus, select:focus {
    border-color: #7053a0;
  }
  button {
    background-color: #7053a0;
    color: white;
    padding: 12px 0;
    width: 100%;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }
  button:hover {
    background-color: #5a3b7e;
  }
</style>
</head>
<body>
  <div class="form-container">
    <h2>Add New Product</h2>
    <form action="/submit" method="POST" enctype="multipart/form-data">
      <label>Product Name</label>
      <input type="text" name="pname" placeholder="Enter product name" required />
      
      <label>Price</label>
      <input type="text" name="price" placeholder="Enter price" required /> 
      
      <label>Select Size</label>   
      <select name="size" required>
        <option value="">Select size</option>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
        <option value="extra-large">Extra Large</option>
      </select>

      <label>Select Category</label>
      <select name="category" required>
        <option value="">Select category</option>`;

    // Add category options dynamically
    results.forEach(row => {
      html += `<option value="${row.category}">${row.category}</option>`;
    });

    html += `
      </select>
      
      <label>Product Image</label>
      <input type="file" name="image" required />
      
      <button type="submit">Add Product</button>
    </form>
  </div>
</body>
</html>`;

    res.send(html);
  });
});

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Handle form submission
app.post('/submit', upload.single('image'), (req, res) => {
  const { pname, size, price, category } = req.body;

  const sql = 'INSERT INTO product (pname, size, price, image, category) VALUES (?, ?, ?, ?, ?)';
  con.query(sql, [pname, size, price, req.file.filename, category], (err, result) => {
    if (err) {
      console.error('Database insertion error:', err);
      return res.status(500).send('Database error');
    }
    console.log('Record inserted with ID:', result.insertId);
    res.send(`
      Product added successfully! <br>
      <a href="/">Go Back</a>
    `);
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
