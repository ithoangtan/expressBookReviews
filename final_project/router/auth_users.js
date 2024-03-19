const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')

const regd_users = express.Router()

let users = [] // This should ideally be a more secure storage in real applications

const SECRET_KEY = 'fingerprint_customer' // This should be an environment variable in real applications

const isValid = (username) => {
  const regex = /^[a-zA-Z0-9_]{5,12}$/
  return regex.test(username)
}

const authenticatedUser = (username, password) => {
  // Check if username and password match the one in records.
  const user = users.find((u) => u.username === username && u.password === password)
  return user !== undefined
}

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: 'Invalid username' })
  }
  if (authenticatedUser(username, password)) {
    // User authenticated
    const accessToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' })
    return res.status(200).json({ message: 'Logged in successfully', accessToken })
  } else {
    // Authentication failed
    return res.status(401).json({ message: 'Authentication failed' })
  }
})

regd_users.put('/auth/review/:isbn', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token required' })
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalid or expired' })
    }

    const { isbn } = req.params
    const { review } = req.body

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' })
    }

    if (!review) {
      return res.status(400).json({ message: 'Review content is required' })
    }

    // Assuming each book has a reviews object where keys are usernames and values are their reviews
    books[isbn].reviews[decoded.username] = review

    return res.status(200).json({ message: 'Review added successfully' })
  })
})

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token required' })
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalid or expired' })
    }

    const { isbn } = req.params

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' })
    }

    console.log('ithoangtan -  ~ jwt.verify ~ decoded.username:', decoded.username)
    console.log('ithoangtan -  ~ jwt.verify ~ isbn:', isbn)
    console.log('ithoangtan -  ~ jwt.verify ~ books:', books)
    if (!books[isbn].reviews[decoded.username]) {
      return res.status(404).json({ message: 'Review not found' })
    }

    delete books[isbn].reviews[decoded.username]

    return res.status(200).json({ message: 'Review deleted successfully' })
  })
})

module.exports.authenticated = regd_users
module.exports.isValid = isValid
module.exports.users = users
