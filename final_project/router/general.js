const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()

public_users.post('/register', (req, res) => {
  // Hint: The code should take the ‘username’ and ‘password’ provided in the body
  // of the request for registration.
  // If the username already exists,
  // it must mention the same & must also show other errors like eg.
  // when username &/ password are not provided.
  const { username, password } = req.body

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  // Validate the input
  if (!isValid(username)) {
    return res.status(400).json({ message: 'Invalid username' })
  }

  // password validation
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' })
  }

  // Check if user already exists
  if (users[username]) {
    return res.status(409).json({ message: 'User already exists' })
  }

  // Register new user
  users.push({ username, password, isValid: true })
  return res.status(201).json({ message: 'User registered successfully' })
})

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4))
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn

  const book = books[isbn]
  if (book) {
    return res.status(200).json(book)
  } else {
    return res.status(404).json({ message: 'Book not found' })
  }
})

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase()
  const booksByAuthor = Object.values(books).filter((book) => book.author.toLowerCase().includes(author))

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor)
  } else {
    return res.status(404).json({ message: 'No books found for this author' })
  }
})

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase()
  const booksByTitle = Object.values(books).filter((book) => book.title.toLowerCase().includes(title))

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle)
  } else {
    return res.status(404).json({ message: 'No books found with this title' })
  }
})

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  const book = books[isbn]

  if (book && book.reviews && Object.keys(book.reviews).length > 0) {
    return res.status(200).json(book.reviews)
  } else {
    return res.status(404).json({ message: 'No reviews found for this book' })
  }
})

module.exports.general = public_users
