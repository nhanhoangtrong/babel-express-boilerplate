import app from './app'
import chalk from 'chalk'
import http from 'http'

const port = app.get('port')

const server = http.createServer(app)

// app.listen(port, () => {
//     console.log(chalk.cyan(`Server is running on ${port}`))
// })
server.listen(port)
server.on('listening', () => {
    console.log(chalk.cyan(`HTTP Server is running on ${port}`))
})
server.on('error', (err) => {
    console.error(chalk.red('Error:'), 'Server error')
    console.error(err)
    server.close()
})
