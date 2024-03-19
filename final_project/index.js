const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated
const genl_routes = require('./router/general.js').general

const app = express()

app.use(express.json())

const SECRET_KEY = 'fingerprint_customer' // This should be an environment variable in real applications

app.use('/customer', session({ secret: SECRET_KEY, resave: true, saveUninitialized: true }))

app.use('/customer/auth/*', function auth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Lấy token từ header Authorization

  if (token) {
    jwt.verify(token, SECRET_KEY, function (err, decoded) {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      next()
    })
  } else {
    return res.status(401).json({ message: 'Unauthorized' })
  }
})

const PORT = 5555

app.use('/customer', customer_routes)
app.use('/', genl_routes)

app.listen(PORT, () => console.log('Server is running'))
