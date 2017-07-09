const helpers = {
    millisecondsToDate(milliseconds, options) {
        const date = new Date(milliseconds || 0)
        return date.toLocaleString()
        // return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    },
    millisecondsToVNDate() {
        const date = new Date(arguments.length > 1 ? arguments[0] : 0)
        const sep = arguments.length === 3 ? arguments[1] : '-'
        return `${date.getDate()}${sep}${date.getMonth() + 1}${sep}${date.getFullYear()}`
    },
    showYoutubeEmbed(youtubePath, options) {
        try {
            const code = youtubePath.split('=')[1].split('&')[0];
            return '<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/' + code + '" frameborder="0" allowfullscreen></iframe>'
        } catch (err) {
            return youtubePath
        }
    },
    inc(value, options) {
        return parseInt(value) + 1
    },
    ifeq(valueOne, valueTwo, options) {
        return valueOne === valueTwo ? options.fn(this) : options.inverse(this)
    },
}

export default (hbs) => {
    for (let key in helpers) {
        hbs.registerHelper(key, helpers[key])
    }
}
