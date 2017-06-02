import app from './app'

const port = process.env.PORT || 8080
const host = process.env.HOST || 'localhost'

app.listen(port, host, function() {
    console.log(`Server is running on ${host}:${port}`)
})
