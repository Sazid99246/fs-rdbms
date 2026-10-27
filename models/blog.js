const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../util/db')

class Blog extends Model {}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Year must be an integer',
        },
        min: {
          args: [1991],
          msg: 'Year must be at least 1991',
        },
        max: {
          args: [new Date().getFullYear()],
          msg: `Year cannot be greater than ${new Date().getFullYear()}`,
        },
      },
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    underscored: true,
    tableName: 'blogs',
    modelName: 'Blog',
  }
)

module.exports = Blog
