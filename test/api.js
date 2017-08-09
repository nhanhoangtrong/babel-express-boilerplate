process.env.AUTO_MIGRATE = false;

const mocha = require('mocha');
const chai = require('chai');
const chaiHTTP = require('chai-http');

const server = require('../dist/app').default;

server.listen(3001);

chai.should();
chai.use(chaiHTTP)

describe('These are APIs tests', () => {
    it('It shoud return a list of users', (done) => {
        chai.request(server)
            .get('/api/users')
            .send()
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            });
    });

    it('It should return a list of posts', (done) => {
        chai.request(server)
            .get('/api/posts')
            .send()
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done()
            });
    });

    it('It should return a list of post categories', (done) => {
        chai.request(server)
            .get('/api/post-categories')
            .send()
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done()
            });
    });
});
