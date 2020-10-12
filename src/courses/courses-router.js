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
  teacherId: course.teacher_id
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

module.exports = coursesRouter;