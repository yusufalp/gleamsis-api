const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

describe('Courses endpoint', () => {
  db = knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL
  })
  app.set('db', db)

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
  ]

  after('disconnect from db', () => {
    return db.destroy()
  })

  before('clean the table', () => db.raw('TRUNCATE courses,teachers RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE courses RESTART IDENTITY CASCADE'))

  before('insert teachers', () => {
    return db
      .into('teachers')
      .insert(testTeachers)
  })

  describe('GET /api/courses', () => {
    context('Given there are no data', () => {
      it('responds with 200', () => {
        return supertest(app)
          .get('/api/courses')
          .expect(200, [])
      })
    })

    context('Given there are data in the courses table', () => {
      const testCourses = [
        {
          id: 1,
          name: 'English 1',
          category: 'ELA',
          teacher_id: 1
        },
        {
          id: 2,
          name: 'English 2',
          category: 'ELA',
          teacher_id: 1
        },
        {
          id: 3,
          name: 'Algebra 1',
          category: 'Math',
          teacher_id: 2
        },
      ]

      beforeEach('insert courses', () => {
        return db
          .into('courses')
          .insert(testCourses)
      })

      it('responds with 200 and with all courses', () => {
        return supertest(app)
          .get('/api/courses')
          .expect(200, testCourses)
      })
    })
  })

  describe('POST /api/courses', () => {
    it('creates a course responding with 201 and the new course', function () {
      const newCourse = {
        name: 'Test name',
        category: 'Test category',
        teacher_id: 2
      }
      return supertest(app)
        .post('/api/courses')
        .send(newCourse)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newCourse.name)
          expect(res.body.category).to.eql(newCourse.category)
          expect(res.body.teacher_id).to.eql(newCourse.teacher_id)
          expect(res.body).to.have.property('id')
        })
    })
  })
  describe('DELETE /api/courses/:id', () => {
    context('Given there are no courses', () => {
      it('responds with 404', () => {
        const courseId = 123456
        return supertest(app)
          .delete(`/api/courses/${courseId}`)
          .expect(404, { error: { message: 'Course does not exist' } })
      })
    })
    context('Given there are courses in the database', () => {
      const testCourses = [
        {
          id: 1,
          name: 'English 1',
          category: 'ELA',
          teacher_id: 1
        },
        {
          id: 2,
          name: 'English 2',
          category: 'ELA',
          teacher_id: 1
        },
        {
          id: 3,
          name: 'Algebra 1',
          category: 'Math',
          teacher_id: 2
        },
      ]

      beforeEach('insert courses', () => {
        return db
          .into('courses')
          .insert(testCourses)
      })

      it('responds with 204 and removes the course', () => {
        const idToRemove = 2
        const expectedCourse = testCourses.filter(course => course.id !== idToRemove)
        return supertest(app)
          .delete(`/api/courses/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/courses')
              .expect(expectedCourse)
          )
      })
    })
  })
})