const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readingList')

User.hasMany(Blog, {
  as: 'blogs',
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

User.belongsToMany(Blog, {
  through: ReadingList,
  as: 'readingList',
  foreignKey: 'userId',
  otherKey: 'blogId',
})

Blog.belongsToMany(User, {
  through: ReadingList,
  as: 'inReadingLists',
  foreignKey: 'blogId',
  otherKey: 'userId',
})

module.exports = {
  Blog,
  User,
  ReadingList,
}
