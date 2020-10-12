const express = require('express');
const StudentsService = require('./students-service');
const path = require('path');
const xss = require('xss');

const studentsRouter = express.Router();
const jsonParser = express.json();

const serializeStudent = student => ({
  id: student.id,
  firstName: xss(student.first_name),
  lastName: xss(student.last_name),
  courseId: student.course_id,
  grade: student.grade
})

studentsRouter
  .route('/')
  .get((req, res, next) => {
    StudentsService.getAllStudents(
      req.app.get('db')
    )
      .then(students => {
        res.json(students.map(serializeStudent))
      })
      .catch(next)
  })

module.exports = studentsRouter;