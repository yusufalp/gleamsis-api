const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('Students endpoint', () => {
  before('connection to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });


  after('disconnect from db', () => {
    return db.destroy();
  });

  before('clean the table', () => db.raw('TRUNCATE students, teachers RESTART IDENTITY CASCADE'));

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
  ];
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

  afterEach('cleanup', () => db.raw('TRUNCATE students RESTART IDENTITY CASCADE'));

  before('insert teachers', () => {
    return db
      .into('teachers')
      .insert(testTeachers)
  });

  before('insert courses', () => {
    return db
      .into('courses')
      .insert(testCourses)
  });

  describe('GET /api/students', () => {
    context('Given there are no data', () => {
      it('responds with 200', () => {
        return supertest(app)
          .get('/api/students')
          .expect(200, [])
      });
    });

    context('Given there are data in the students table', () => {
      const testStudents = [
        {
          id: 1,
          first_name: 'Gabriel',
          last_name: 'Aqua',
          course_id: 1,
          grade: 'A'
        },
        {
          id: 2,
          first_name: 'Jose',
          last_name: 'Dick',
          course_id: 1,
          grade: 'B'
        },
        {
          id: 3,
          first_name: 'Stephanie',
          last_name: 'Vicki',
          course_id: 1,
          grade: 'A'
        },
      ];

      beforeEach('insert students', () => {
        return db
          .into('students')
          .insert(testStudents)
      });

      it('responds with 200 and with all students', () => {
        return supertest(app)
          .get('/api/students')
          .expect(200, testStudents)
      });
    });
  });

  describe('POST /api/students', () => {
    it('creates a student responding with 201 and the new student', function () {
      const newStudent = {
        first_name: 'Test firstName',
        last_name: 'Test lastName',
        course_id: 1,
        grade: 'A'
      }
      return supertest(app)
        .post('/api/students')
        .send(newStudent)
        .expect(201)
        .expect(res => {
          expect(res.body.first_name).to.eql(newStudent.first_name)
          expect(res.body.last_name).to.eql(newStudent.last_name)
          expect(res.body.course_id).to.eql(newStudent.course_id)
          expect(res.body.grade).to.eql(newStudent.grade)
          expect(res.body).to.have.property('id')
        });
    });
  });
  describe('DELETE /api/students/:id', () => {
    context('Given there are no students', () => {
      it('responds with 404', () => {
        const studentId = 123456
        return supertest(app)
          .delete(`/api/students/${studentId}`)
          .expect(404, { error: { message: 'Student does not exist' } })
      });
    });
    context('Given there are students in the database', () => {
      const testStudents = [
        {
          id: 1,
          first_name: 'Gabriel',
          last_name: 'Aqua',
          course_id: 1,
          grade: 'A'
        },
        {
          id: 2,
          first_name: 'Jose',
          last_name: 'Dick',
          course_id: 1,
          grade: 'B'
        },
        {
          id: 3,
          first_name: 'Stephanie',
          last_name: 'Vicki',
          course_id: 1,
          grade: 'A'
        },
      ];

      beforeEach('insert students', () => {
        return db
          .into('students')
          .insert(testStudents)
      });

      it('responds with 204 and removes the student', () => {
        const idToRemove = 2
        const expectedStudent = testStudents.filter(student => student.id !== idToRemove)
        return supertest(app)
          .delete(`/api/students/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/students')
              .expect(expectedStudent)
          );
      });
    });
  });
});