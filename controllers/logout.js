const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { Session } = require('../models')

router.delete('/', async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'token missing' })
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    // Remove every active session belonging to this user.
    await Session.destroy({
      where: { userId: decodedToken.id },
    })

    return res.status(204).end()
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({ error: 'token invalid' })
    }

    next(error)
  }
})

module.exports = router
