const express = require('express');
const TeachersService = require('./teachers-service');
const path = require('path');
const xss = require('xss');

const teachersRouter = express.Router()
const jsonParser = express.json()

const serializeTeacher = teacher => ({
  id: teacher.id,
  firstName: xss(teacher.first_name),
  lastName: xss(teacher.last_name)
})

teachersRouter
  .route('/')
  .get((req, res, next) => {
    TeachersService.getAllTeachers(
      req.app.get('db')
    )
      .then(teachers => {
        res.json(teachers.map(serializeTeacher))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { first_name, last_name } = req.body
    const newTeacher = { first_name, last_name }

    TeachersService.insertTeacher(
      req.app.get('db'),
      newTeacher
    )
      .then(teacher => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${teacher.id}`))
          .json(serializeTeacher(teacher))
      })
      .catch(next)
  })

module.exports = teachersRouter;