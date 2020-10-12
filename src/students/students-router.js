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
  course_id: student.course_id,
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
  .post(jsonParser, (req, res, next) => {
    const { first_name, last_name, course_id, grade } = req.body
    const newStudent = { first_name, last_name, course_id, grade }

    StudentsService.insertStudent(
      req.app.get('db'),
      newStudent
    )
      .then(student => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${student.id}`))
          .json(serializeStudent(student))
      })
      .catch(next)
  })

module.exports = studentsRouter;