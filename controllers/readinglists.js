const router = require('express').Router()
const { User, Blog, ReadingList } = require('../models')
const { userExtractor } = require('../util/tokenExtractor')

// POST /api/readinglists
router.post('/', async (req, res, next) => {
  try {
    const { blogId, userId } = req.body

    if (!Number.isInteger(blogId) || !Number.isInteger(userId)) {
      return res.status(400).json({
        error: 'blogId and userId must be integers',
      })
    }

    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({
        error: `User with id ${userId} does not exist`,
      })
    }

    const blog = await Blog.findByPk(blogId)

    if (!blog) {
      return res.status(404).json({
        error: `Blog with id ${blogId} does not exist`,
      })
    }

    const existingEntry = await ReadingList.findOne({
      where: { userId, blogId },
    })

    if (existingEntry) {
      return res.status(400).json({
        error: 'Blog is already in this reading list',
      })
    }

    const readingListEntry = await ReadingList.create({
      userId,
      blogId,
      read: false,
    })

    return res.status(201).json(readingListEntry)
  } catch (error) {
    next(error)
  }
})

// PUT /api/readinglists/:id
router.put('/:id', userExtractor, async (req, res, next) => {
  try {
    const readingListEntry = await ReadingList.findByPk(req.params.id)

    if (!readingListEntry) {
      return res.status(404).json({
        error: 'Reading-list entry not found',
      })
    }

    if (Number(readingListEntry.userId) !== Number(req.decodedToken.id)) {
      return res.status(401).json({
        error: 'You cannot modify another user’s reading list',
      })
    }

    if (typeof req.body.read !== 'boolean') {
      return res.status(400).json({
        error: 'read must be a boolean',
      })
    }

    readingListEntry.read = req.body.read
    await readingListEntry.save()

    return res.status(200).json(readingListEntry)
  } catch (error) {
    next(error)
  }
})

module.exports = router
