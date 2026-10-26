require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const main = async () => {
  try {
    const result = await pool.query('SELECT * FROM blogs')

    result.rows.forEach((blog) => {
      console.log(
        `${blog.author}: '${blog.title}', ${blog.likes} likes`
      )
    })
  } catch (error) {
    console.error('Database error:', error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

main()
