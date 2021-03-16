const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');
const pg = require('pg');
pg.defaults.ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;


// const PORT = process.env.PORT || 8000;

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});