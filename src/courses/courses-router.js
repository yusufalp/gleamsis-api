const express = require('express')
const CoursesService = require('./courses-service');
const path = require('path');
const xss = require('xss');

const coursesRouter = express.Router();
const jsonParser = express.json();

const serializeCourse = course => ({
  id: course.id,
  name: xss(course.name),
  category: xss(course.category),
  teacher_id: course.teacher_id
})

coursesRouter
  .route('/')
  .get((req, res, next) => {
    CoursesService.getAllCourses(
      req.app.get('db')
    )
      .then(courses => {
        res.json(courses.map(serializeCourse))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, category, teacher_id } = req.body
    const newCourses = { name, category, teacher_id }

    CoursesService.insertCourse(
      req.app.get('db'),
      newCourses
    )
      .then(course => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${course.id}`))
          .json(serializeCourse(course))
      })
      .catch(next)
  })

coursesRouter
  .route('/:id')
  .all((req, res, next) => {
    CoursesService.getCourseById(
      req.app.get('db'),
      req.params.id
    )
      .then(course => {
        if (!course) {
          return res.status(404).json({
            error: { message: 'Course does not exist' }
          })
        }
        res.course = course
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeCourse(res.course))
  })
  .delete((req, res, next) => {
    CoursesService.deleteCourse(
      req.app.get('db'),
      req.params.id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = coursesRouter;