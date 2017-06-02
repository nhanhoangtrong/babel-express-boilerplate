import express from 'express'
import morgan from 'morgan'

const app = express()

// Register middlewares

// Morgan for logging requests and responses
app.use(morgan('dev'))

app.get('/', function(req, res) {
    res.send('Hello World')
})

export default app
