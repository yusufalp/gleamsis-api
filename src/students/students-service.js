const StudentsService = {
  getAllStudents(knex) {
    return knex.select('*').from('students')
  },
  insertStudent(knex, newStudent) {
    return knex
      .insert(newStudent)
      .into('students')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getStudentById(knex, id) {
    return knex
      .select('*')
      .from('students')
      .where('id', id)
      .then(rows => {
        return rows[0]
      })
  },
  deleteStudent(knex, id) {
    return knex('students')
      .where({ id })
      .delete()
  },
  updateStudent(knex, id, newStudent) {
    return knex('students')
      .where({ id })
      .update(newStudent)
  }
}

module.exports = StudentsService;