const bcrypt = require('bcrypt')

const router = require('express').Router()
const { User, Blog } = require('../models')

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: {
        model: Blog,
        as: 'blogs'
      },
    })
    res.json(users)
  } catch (error) {
    next(error)
  }
})

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const { name, username, password } = req.body

    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password is required' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      username,
      password: passwordHash,
    })

    res.status(201).json({
      id: user.id,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})



 // GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: {
        model: Blog,
        as: 'readingList',
        attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
        through: {
          attributes: ['id', 'read'],
        },
      },
    })

    if (!user) {
      return res.status(404).end()
    }

    const userData = user.toJSON()
    const { readingList, ...userInfo } = userData

    const readings = readingList
      .map((blog) => {
        const entry = blog.ReadingList

        return {
          ...blog,
          readingList: {
            id: entry.id,
            read: entry.read,
          },
        }
      })
      .filter((blog) => {
        if (req.query.read === undefined) {
          return true
        }

        if (req.query.read !== 'true' && req.query.read !== 'false') {
          return false
        }

        return String(blog.readingList.read) === req.query.read
      })

    return res.json({
      ...userInfo,
      readings,
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/users/:username
router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    })

    if (!user) {
      return res.status(404).end()
    }

    user.name = req.body.name
    await user.save()

    res.json(user)
  } catch (error) {
    next(error)
  }
})

module.exports = router
