const router = require('express').Router()
const { Op } = require('sequelize')
const { Blog, User } = require('../models')
const { userExtractor } = require('../util/tokenExtractor')

router.get('/', async (req, res, next) => {
  try {
    const where = {}

    if (req.query.search) {
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
        {
          author: {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
      ]
    }

    const blogs = await Blog.findAll({
      where,
      include: {
        model: User,
        attributes: ['id', 'name', 'username'],
      },
      order: [['likes', 'DESC']],
    })

    res.json(blogs)
  } catch (error) {
    next(error)
  }
})


router.post('/', userExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)

    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }

    const blog = await Blog.create({
      author: req.body.author,
      url: req.body.url,
      title: req.body.title,
      likes: req.body.likes ?? 0,
      userId: user.id,
    })

    res.status(201).json(blog)
  } catch (error) {
    next(error)
  }
})

const blogFinder = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id)

    if (!blog) {
      return res.status(404).end()
    }

    req.blog = blog
    next()
  } catch (error) {
    next(error)
  }
}

router.delete('/:id', userExtractor, blogFinder, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)

    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }

    if (req.blog.userId !== user.id) {
      return res.status(403).json({ error: 'only the creator can delete this blog' })
    }

    await req.blog.destroy()
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})


router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } catch (error) {
    next(error)
  }
})

module.exports = router
