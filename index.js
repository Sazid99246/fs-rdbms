const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { sequelize, connectToDatabase } = require('./util/db')
const { Blog, User } = require('./models')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const { tokenExtractor } = require('./util/tokenExtractor')
const { errorHandler } = require('./util/middleware')

app.use(express.json())
app.use(tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(errorHandler)

const start = async () => {
  await connectToDatabase()

  await Blog.sync()
  await User.sync()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start().catch(async (error) => {
  console.error('Failed to start the application:', error)
  await sequelize.close()
  process.exit(1)
})
