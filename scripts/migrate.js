/* eslint-disable no-console */
const migrate = require('migrate');
const { resolve } = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
    path: resolve(__dirname, '../.env'),
});
const params = process.argv.slice(2);

// Start mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_CONNECT_URI, {
    useMongoClient: true,
}).then(function () {
    // Start loading migrations
    runMigrate();
}).catch(function (err) {
    console.error('Migration running errors.');
    console.error(err.stack);
    process.exit(1);
});

function runMigrate() {
    migrate.load({
        stateStore: resolve(__dirname, '../.migrate'),
        migrationsDirectory: resolve(__dirname, '../migrations'),
    }, function (err, set) {
        if (err) {
            throw err;
        }

        if (params.length === 0 || params[0] === 'up') {
            set.migrations.forEach(function (migration) {
                console.log('up:', migration.title);
            });
            set.up(function (err) {
                if (err) {
                    throw err;
                }
                console.log('Migrations up successfully ran');
                process.exit(0);
            });
        } else if (params[0] === 'down') {
            set.migrations.forEach(function (migration) {
                console.log('down:', migration.title);
            });
            set.down(function (err) {
                if (err) {
                    throw err;
                }
                console.log('Migrations down successfully ran');
                process.exit(0);
            });
        } else {
            // Show directions
            console.log('Please using with "up" or "down".');
            process.exit(1);
        }
    });
}
