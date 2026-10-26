const router = require('express').Router()
const { Blog } = require('../models')

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll()
    res.json(blogs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})


router.post('/', async (req, res, next) => {
  try {
    const blog = await Blog.create({
      author: req.body.author,
      url: req.body.url,
      title: req.body.title,
      likes: req.body.likes ?? 0,
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
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

router.delete('/:id', blogFinder, async (req, res) => {
  try {
    await req.blog.destroy()
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
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
