const app = require('../src/app');
const knex = require('knex');

describe('App', () => {
  it('GET / responds with 200 containing Hello, GleamSIS!', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, GleamSIS!')
  });
});
