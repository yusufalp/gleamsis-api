const express = require('express');
const TeachersService = require('./teachers-service');
const path = require('path');
const xss = require('xss');

const teachersRouter = express.Router()
const jsonParser = express.json()

const serializeTeacher = teacher => ({
  id: teacher.id,
  first_name: xss(teacher.first_name),
  last_name: xss(teacher.last_name)
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

teachersRouter
  .route('/:id')
  .all((req, res, next) => {
    TeachersService.getTeacherById(
      req.app.get('db'),
      req.params.id
    )
      .then(teacher => {
        if (!teacher) {
          return res.status(404).json({
            error: { message: 'Teacher does not exist' }
          })
        }
        res.teacher = teacher
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeTeacher(res.teacher))
  })
  .delete((req, res, next) => {
    TeachersService.deleteTeacher(
      req.app.get('db'),
      req.params.id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = teachersRouter;