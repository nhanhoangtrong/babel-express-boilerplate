const mocha = require('mocha')
const chai = require('chai')
const chaiHttp = require('chai-http')

chai.use(chaiHttp)

describe('It is a example test', () => {
	it('it should be done', (done) => {
		done()
	})
})
