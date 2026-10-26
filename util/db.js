const { Sequelize } = require('sequelize')
const { DATABASE_URL, TEST_DATABASE_URL } = require('./config')

const databaseUrl =
  process.env.TESTING === 'true'
    ? TEST_DATABASE_URL
    : DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
})

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected to the database')
  } catch (error) {
    console.error('Failed to connect to the database:', error.message)
    process.exit(1)
  }
}

module.exports = { sequelize, connectToDatabase }
