const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { randomUUID } = require('crypto')
const { User, Session } = require('../models')

router.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'password', 'name', 'disabled'],
    })

    const passwordCorrect =
      user &&
      !user.disabled &&
      user.password &&
      typeof password === 'string' &&
      await bcrypt.compare(password, user.password)

    if (!passwordCorrect) {
      return res.status(401).json({
        error: 'Invalid username or password',
      })
    }

    const userForToken = {
      username: user.username,
      id: user.id,
    }

    const token = jwt.sign(
      {
        ...userForToken,
        jti: randomUUID(),
      },
      process.env.SECRET
    )

    await Session.create({
      token,
      userId: user.id,
    })

    return res.json({
      token,
      username: user.username,
      name: user.name,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
