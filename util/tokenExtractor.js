const jwt = require('jsonwebtoken')
const { Session, User } = require('../models')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.substring(7)
  }

  next()
}

const userExtractor = async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'token missing' })
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const session = await Session.findOne({
      where: { token: req.token },
    })

    if (!session || Number(session.userId) !== Number(decodedToken.id)) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findByPk(decodedToken.id)

    if (!user || user.disabled) {
      return res.status(401).json({ error: 'token invalid' })
    }

    req.decodedToken = decodedToken
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'token invalid' })
    }

    next(error)
  }
}

module.exports = {
  tokenExtractor,
  userExtractor,
}
