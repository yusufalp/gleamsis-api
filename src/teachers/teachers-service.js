const TeachersService = {
  getAllTeachers(knex) {
    return knex.select('*').from('teachers')
  },
  insertTeacher(knex, newTeacher) {
    return knex
      .insert(newTeacher)
      .into('teachers')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getTeacherById(knex, id) {
    return knex
      .select('*')
      .from('teachers')
      .where('id', id)
      .then(rows => {
        return rows[0]
      })
  },
  deleteTeacher(knex, id) {
    return knex('teachers')
      .where({ id })
      .delete()
  },
  updateTeacher(knex, id, newTeacher) {
    return knex('teachers')
      .where({ id })
      .update(newTeacher)
  }
}

module.exports = TeachersService