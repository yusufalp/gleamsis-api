const express = require('express')
const StudentsService = require('./students-service')
const path = require('path')
const xss = require('xss')
const { requireAuth } = require('../middleware/basic-auth')

const studentsRouter = express.Router()
const jsonParser = express.json()

const serializeStudent = student => ({
  id: student.id,
  first_name: xss(student.first_name),
  last_name: xss(student.last_name),
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
  .post(requireAuth, jsonParser, (req, res, next) => {
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

studentsRouter
  .route('/:id')
  .all(requireAuth)
  .all((req, res, next) => {
    StudentsService.getStudentById(
      req.app.get('db'),
      req.params.id
    )
      .then(student => {
        if (!student) {
          return res.status(404).json({
            error: { message: 'Student does not exist' }
          })
        }
        res.student = student
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeStudent(res.student))
  })
  .delete((req, res, next) => {
    StudentsService.deleteStudent(
      req.app.get('db'),
      req.params.id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
module.exports = studentsRouter