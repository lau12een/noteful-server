const app = require('../src/app')


describe('App', () => {
    it('GET / responds with 200 containing "Noteful Server Running!"', () => {
        return supertest(app)
            .get('/')
            .expect(200, 'Noteful Server Running')
    })
})