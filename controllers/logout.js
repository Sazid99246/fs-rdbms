
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { revokeUserTokens } = require('../util/tokenExtractor')

router.delete('/', (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'token missing' })
  }

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    revokeUserTokens(decodedToken.id)

    return res.status(204).end()
  } catch (error) {
    return res.status(401).json({ error: 'token invalid' })
  }
})

module.exports = router
