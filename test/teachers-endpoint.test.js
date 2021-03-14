const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('Teachers endpoint', () => {
  before('connecting to the database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => {
    return db.destroy();
  });

  before('clean the table', () => db.raw('TRUNCATE teachers RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE teachers RESTART IDENTITY CASCADE'));

  describe('GET /api/teachers', () => {
    context('Given there are no data', () => {
      it('responds with 200', () => {
        return supertest(app)
          .get('/api/teachers')
          .expect(200, [])
      });
    });

    context('Given there are data in the teachers table', () => {
      const testTeachers = [
        {
          id: 0,
          first_name: 'admin',
          last_name: 'admin'
        },
        {
          id: 1,
          first_name: 'Alex',
          last_name: 'Jackson'
        },
        {
          id: 3,
          first_name: 'Chris',
          last_name: 'Wickson'
        },
      ];

      beforeEach('insert teachers', () => {
        return db
          .into('teachers')
          .insert(testTeachers)
      });

      it('responds with 200 and with all teachers', () => {
        return supertest(app)
          .get('/api/teachers')
          .expect(200, testTeachers)
      });
    });
  });

  describe('POST /api/teachers', () => {
    it('creates a teacher responding with 201 and the new teacher', function () {
      const newTeacher = {
        first_name: 'Test firstName',
        last_name: 'Test lastName'
      };
      return supertest(app)
        .post('/api/teachers')
        .send(newTeacher)
        .expect(201)
        .expect(res => {
          expect(res.body.first_name).to.eql(newTeacher.first_name)
          expect(res.body.last_name).to.eql(newTeacher.last_name)
          expect(res.body).to.have.property('id')
        });
    });
  });
  describe('DELETE /api/teachers/:id', () => {
    context('Given there are no teachers', () => {
      it('responds with 404', () => {
        const teacherId = 123456
        return supertest(app)
          .delete(`/api/teachers/${teacherId}`)
          .expect(404, { error: { message: 'Teacher does not exist' } })
      });
    });
    context('Given there are teachers in the database', () => {
      const testTeachers = [
        {
          id: 1,
          first_name: 'admin',
          last_name: 'admin'
        },
        {
          id: 2,
          first_name: 'Alex',
          last_name: 'Jackson'
        },
        {
          id: 3,
          first_name: 'Chris',
          last_name: 'Wickson'
        },
      ];

      beforeEach('insert teachers', () => {
        return db
          .into('teachers')
          .insert(testTeachers)
      });

      it('responds with 204 and removes the teacher', () => {
        const idToRemove = 2
        const expectedTeachers = testTeachers.filter(teacher => teacher.id !== idToRemove)
        return supertest(app)
          .delete(`/api/teachers/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/teachers')
              .expect(expectedTeachers)
          );
      });
    });
  });
});