
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

router.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({
      where: { username },
      attributes: [
        'id',
        'username',
        'password',
      ],
    })

    const passwordCorrect =
      user &&
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
      userForToken,
      process.env.SECRET
    )

    res.json({
      token,
      username: user.username,
      name: await getUserName(user.id),
    })
  } catch (error) {
    next(error)
  }
})

async function getUserName(id) {
  const user = await User.findByPk(id, {
    attributes: ['name'],
  })

  return user.name
}

module.exports = router
