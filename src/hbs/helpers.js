import hbs from 'express-hbs';
import _ from 'lodash';

export const hbsHelpers = {
    callFunc(object, funcName, ...args) {
        const options = args.splice(args.length - 1)[0];
        if (Object.prototype.hasOwnProperty(funcName) && typeof object[funcName] === 'function') {
            return object[funcName].call(object, ...args);
        }
        throw new Error("Object doesn't has the given function.");
    },
    millisecondsToDate(milliseconds, options) {
        const date = new Date(milliseconds || 0);
        return date.toLocaleString();
        // return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    },
    millisecondsToVNDate() {
        const date = new Date(arguments.length > 1 ? arguments[0] : 0);
        const sep = arguments.length === 3 ? arguments[1] : '-';
        return `${date.getDate()}${sep}${date.getMonth() + 1}${sep}${date.getFullYear()}`;
    },
    showYoutubeEmbed(youtubePath, options) {
        try {
            const code = youtubePath.split('=')[1].split('&')[0];
            return '<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/' + code + '" frameborder="0" allowfullscreen></iframe>';
        } catch (err) {
            return youtubePath;
        }
    },
    inc(value) {
        const val = parseInt(value, 10);
        return isNaN(val) ? 'NaN' : val + 1;
    },
    desc(value) {
        const val = parseInt(value, 10);
        return isNaN(val) ? 'NaN' : val - 1;
    },
    ifeq(valueOne, valueTwo, options) {
        return valueOne === valueTwo ? options.fn(this) : options.inverse(this);
    },
    characterLimit(text, number, options) {
        return text.slice(0, number > text.length ? text.length - 1 : number - 1) + '...';
    },
    range() {
        const args = Array.prototype.slice.call(arguments);
        const rangeArgs = args.slice(0, -1);
        const options = args[args.length - 1];

        return _.range.apply(null, rangeArgs).map((num) => {
            return options.fn(this, { data: {
                element: num + 1,
            }});
        })
        .join('');
    }
};

(function (c) {
    c.registerHelpers = function (h) {
        for (const k in h) {
            if (h.hasOwnProperty(k)) {
                this.registerHelper(k, h[k]);
            }
        }
    };
})(hbs);
