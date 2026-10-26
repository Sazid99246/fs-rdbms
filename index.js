require('dotenv').config()
const express = require('express')
const { Sequelize, QueryTypes } = require('sequelize')

const app = express()
app.use(express.json())

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
})

// GET /api/blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await sequelize.query(
      'SELECT * FROM blogs',
      { type: QueryTypes.SELECT }
    )
    res.json(blogs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/blogs
app.post('/api/blogs', async (req, res) => {
  const { author, url, title, likes = 0 } = req.body

  if (!author || !url || !title) {
    return res.status(400).json({
      error: 'author, url, and title are required',
    })
  }

  try {
    const blogs = await sequelize.query(
      `INSERT INTO blogs (author, url, title, likes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      {
        bind: [author, url, title, likes],
        type: QueryTypes.SELECT,
      }
    )
    res.status(201).json(blogs[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/blogs/:id
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const blogs = await sequelize.query(
      'DELETE FROM blogs WHERE id = $1 RETURNING id',
      {
        bind: [req.params.id],
        type: QueryTypes.SELECT,
      }
    )

    if (blogs.length === 0) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const shutdown = async () => {
  server.close()
  await sequelize.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
