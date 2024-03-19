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
public_users.get('/', async function (req, res) {
  try {
    const booksList = await new Promise((resolve) => resolve(books))
    res.send(JSON.stringify(booksList, null, 4))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books' })
  }
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn
    const book = await new Promise((resolve, reject) => {
      const bookFound = books[isbn]
      if (bookFound) resolve(bookFound)
      else reject('Book not found')
    })

    res.status(200).json(book)
  } catch (message) {
    res.status(404).json({ message })
  }
})

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author.toLowerCase()
    const booksByAuthor = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter((book) => book.author.toLowerCase().includes(author))
      if (filteredBooks.length > 0) resolve(filteredBooks)
      else reject('No books found for this author')
    })

    res.status(200).json(booksByAuthor)
  } catch (message) {
    res.status(404).json({ message })
  }
})

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title.toLowerCase()
    const booksByTitle = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter((book) => book.title.toLowerCase().includes(title))
      if (filteredBooks.length > 0) resolve(filteredBooks)
      else reject('No books found with this title')
    })

    res.status(200).json(booksByTitle)
  } catch (message) {
    res.status(404).json({ message })
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
