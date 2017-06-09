import millisecondsToDate from './millisecondsToDate'

export default (hbs) => {
    hbs.registerHelper('millisecondsToDate', millisecondsToDate)
    hbs.registerHelper('inc', function(value, options) {
        return parseInt(value) + 1
    })
    hbs.registerHelper('equal', function(valueOne, valueTwo, options) {
        return valueOne === valueTwo ? options.fn(this) : options.inverse(this)
    })
}
