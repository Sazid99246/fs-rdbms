const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { sequelize, connectToDatabase } = require('./util/db')
const { Blog, User, Session } = require('./models')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const authorsRouter = require('./controllers/authors')
const readinglistsRouter = require('./controllers/readinglists')

const { tokenExtractor } = require('./util/tokenExtractor')
const { errorHandler } = require('./util/middleware')

app.use(express.json())
app.use(tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)
app.use('/api/authors', authorsRouter)
app.use('/api/readinglists', readinglistsRouter)

app.use(errorHandler)

app.get('/', (req, res) => {
  res.status(200).send('OK')
})

app.post('/api/reset', async (req, res, next) => {
  try {
    if (process.env.TESTING !== 'true') {
      return res.status(403).json({
        error: 'Reset is only available in the test environment',
      })
    }

    await Session.destroy({ where: {} })
    await Blog.destroy({ where: {} })
    await User.destroy({ where: {} })

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

const start = async () => {
  await connectToDatabase()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start().catch(async (error) => {
  console.error('Failed to start the application:', error)
  await sequelize.close()
  process.exit(1)
})
