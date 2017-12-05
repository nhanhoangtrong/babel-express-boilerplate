/* eslint-disable no-console */
const faker = require('faker');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { userSchema } = require('../schemas/user');
const { postSchema, postCategorySchema } = require('../schemas/post');
const { enquirySchema } = require('../schemas/enquiry');

dotenv.config();

// Start mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_CONNECT_URI, {
    useMongoClient: true,
}).then(function () {
    // Start loading migrations
    console.log('Starting seeds data.');
    return Promise.all([
        seedingUsers(),
        seedingCategories(),
    ]);

}).then(function (args) {

    return seedingPosts(args[0], args[1]);

}).then(function () {

    console.log('Seeds has been ran successfully.');
    mongoose.connection.close();

}).catch(function (err) {
    console.error('Seeding data running errors.');
    console.error(err.stack);
    mongoose.connection.close();
    process.exit(1);
});

// Faker auto-creating 10 users
function seedingUsers() {
    const User = mongoose.model('User', userSchema);
    const fakeUsers = [];
    for (let i = 0; i < 10; ++i) {
        fakeUsers.push({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
        });
    }
    return User.create(fakeUsers);
}

// Faker auto-creating 10 categories
function seedingCategories() {
    const PostCategory = mongoose.model('PostCategory', postCategorySchema);

    const fakeCats = [];
    for (let i = 0; i < 10; ++i) {
        const name = faker.lorem.words();
        fakeCats.push({
            name,
            slug: faker.helpers.slugify(name),
            description: faker.lorem.paragraph(),
        });
    }

    return PostCategory.create(fakeCats);
}

// Faker creating 10 posts each category, each user
function seedingPosts(authors, postCategories) {
    const Post = mongoose.model('Post', postSchema);

    const posts = [];
    for (let i = 0; i < 100; ++i) {
        const nCategories = faker.random.number(2) + 1;
        const categories = faker.helpers.shuffle(postCategories).slice(0, nCategories);

        posts.push({
            title: faker.lorem.words(),
            slug: faker.lorem.slug(),
            image: faker.image.imageUrl(),
            description: faker.lorem.paragraph(),
            author: faker.helpers.randomize(authors)._id,
            content: faker.lorem.paragraphs(faker.random.number(20)).replace('\n', '<br/>'),
            publishedAt: Date.now(),
            isPublished: true,
            categories,
        });
    }

    return Post.create(posts);
}


