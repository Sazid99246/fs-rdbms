
const jwt = require('jsonwebtoken')

// Store active tokens by user ID and track revoked tokens.
const userTokens = new Map()
const revokedTokens = new Set()

const registerToken = (userId, token) => {
  const id = String(userId)

  if (!userTokens.has(id)) {
    userTokens.set(id, new Set())
  }

  userTokens.get(id).add(token)
}

const revokeUserTokens = (userId) => {
  const id = String(userId)
  const tokens = userTokens.get(id)

  if (tokens) {
    for (const token of tokens) {
      revokedTokens.add(token)
    }

    userTokens.delete(id)
  }
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.substring(7)
  }

  next()
}

const userExtractor = (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'token missing' })
    }

    if (revokedTokens.has(req.token)) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    req.decodedToken = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({ error: 'token invalid' })
  }
}

module.exports = {
  tokenExtractor,
  userExtractor,
  registerToken,
  revokeUserTokens,
}
