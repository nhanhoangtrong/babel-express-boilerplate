export default (milliseconds, options) => {
    const date = new Date(milliseconds)
    // return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    return date.toLocaleString()
}
