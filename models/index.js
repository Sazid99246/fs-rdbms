const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readingList')
const Session = require('./session')

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

// Database-backed login sessions
User.hasMany(Session, {
  as: 'sessions',
  foreignKey: {
    name: 'userId',
    field: 'user_id',
  },
  onDelete: 'CASCADE',
})

Session.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
  },
})

module.exports = {
  Blog,
  User,
  ReadingList,
  Session,
}
