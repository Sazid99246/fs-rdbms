
const Blog = require('./blog')
const User = require('./user')

User.hasMany(Blog, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
  },
})

Blog.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
  },
})

module.exports = {
  Blog,
  User,
}
