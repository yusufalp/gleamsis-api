const CoursesService = {
  getAllCourses(knex) {
    return knex.select('*').from('courses')
  },
  insertCourse(knex, newCourse) {
    return knex
      .insert(newCourse)
      .into('courses')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getCourseById(knex, id) {
    return knex
      .select('*')
      .from('courses')
      .where('id', id)
      .then(rows => {
        return rows[0]
      })
  },
  deleteCourse(knex, id) {
    return knex('courses')
      .where({ id })
      .delete()
  },
  updateCourse(knex, id, newCourse) {
    return knex('courses')
      .where({ id })
      .update(newCourse)
  }
}

module.exports = CoursesService