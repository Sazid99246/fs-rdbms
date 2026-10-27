
require('dotenv').config()

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: process.env.DB_SSL === 'false'
      ? {}
      : {
          ssl: { require: true, rejectUnauthorized: false },
        },
  },
  test: {
    use_env_variable: 'TEST_DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: process.env.DB_SSL === 'false'
      ? {}
      : {
          ssl: { require: true, rejectUnauthorized: false },
        },
  },
}
