const chai = require('chai');
const server = require('../index');
const chaiHttp = require('chai-http');
const { assert } = require('chai');

chai.use(chaiHttp);

describe('API endpoints', () => {

    describe('POST /api/upload', () => {
        it('should post a new guess', (done) => {
            const guess = {
                file: '',
                sauce: 'naruto',
                question: 'who'
            }
            chai.request(server)
                .post('/api/upload')
                .send(guess)
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.type, 'application/json')
                    assert.property(res.body, 'link')
                    assert.property(res.json, 'cloud_id')
                    assert.equal(res.body.sauce, 'naruto')
                    assert.equual(res.body.question, 'who')
                    done()
                })

        })
    })
})