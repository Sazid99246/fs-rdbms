const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { sequelize, connectToDatabase } = require('./util/db')
const { Blog } = require('./models')
const blogsRouter = require('./controllers/blogs')
const { errorHandler } = require('./util/middleware')

app.use(express.json())
app.use('/api/blogs', blogsRouter)
app.use(errorHandler)

const start = async () => {
  await connectToDatabase()

  await Blog.sync()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start().catch(async (error) => {
  console.error('Failed to start the application:', error)
  await sequelize.close()
  process.exit(1)
})
