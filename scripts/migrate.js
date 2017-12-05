/* eslint-disable no-console */
const migrate = require('migrate');
const { resolve, join } = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

dotenv.config({
    path: resolve(__dirname, '../.env'),
});
const params = process.argv.slice(2);

const stateStore= resolve(__dirname, '../.migrate');
const migrationsDirectory = resolve(__dirname, '../migrations');

const defaultContent = `'use strict';

exports.up = function (next) {
    next();
};

exports.down = function (next) {
    next();
};
`;

if (params[0] === 'create') {
    try {
        const name = params.slice(1).join('-');
        const filename = Date.now().toString() + (name ? '-' + name + '.js' : '.js');
        console.log('Creating:', filename);

        const file = fs.createWriteStream(join(migrationsDirectory, filename));
        file.write(defaultContent, () => {
            file.close();
            process.exit(0);
        });
    } catch (err) {
        console.error('Creating migration file errors.');
        console.error(err.stack);
        process.exit(1);
    }
} else if (params[0] === 'up' || params[0] === 'down') {
    setupMigrate().then(function () {
        // Start loading migrations
        return runMigrate(params[0]);
    }).then(() => {
        console.log('Migrations ran successfully.');
        clearMigrate();
    }).catch(function (err) {
        console.error('Migration running errors.');
        console.error(err.stack);
        process.exit(1);
    });
} else {
    // Show helps
    throw new Error('Please using "migrate up/down/create"');
}

function setupMigrate() {
    // Start mongoose connection
    mongoose.Promise = global.Promise;
    return mongoose.connect(process.env.MONGODB_CONNECT_URI, {
        useMongoClient: true,
    });
}

function clearMigrate() {
    return mongoose.connection.close();
}

function runMigrate(direction) {
    return new Promise(function (resolve, reject) {
        migrate.load({
            stateStore,
            migrationsDirectory,
        }, function (err, set) {
            if (err) {
                return reject(err);
            }

            const migrateFunc = set[direction];
            if (typeof migrateFunc !== 'function') {
                return reject(Error('Cannot run this direction'));
            }
            set.migrations.forEach(function (migration) {
                console.log(direction + ':', migration.title);
            });
            migrateFunc.call(set, function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    });
}
