const { describe, it, before } = require('node:test')
const assert = require('node:assert')
const axios = require('axios')
const { baseUrl, resetAndSeed } = require('./helper')

let testData

before(async () => {
  testData = await resetAndSeed()
})

describe('Blogs API', () => {
  it('blogs are returned as json and initially empty', async () => {
    const response = await axios.get(`${baseUrl}/blogs`)
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
    assert.strictEqual(Array.isArray(response.data), true)
    assert.strictEqual(response.data.length, 0)
  })

  it('a valid blog can be added with authentication', async () => {
    const newBlog = {
      title: 'Test Blog Post',
      author: 'Test Author',
      url: 'https://example.com/test-blog',
      year: 2024,
    }

    const response = await axios.post(`${baseUrl}/blogs`, newBlog, {
      headers: { Authorization: `Bearer ${testData.tokens[0]}` }
    })

    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.title, newBlog.title)
    assert.strictEqual(response.data.author, newBlog.author)
    assert.strictEqual(response.data.url, newBlog.url)
    assert.strictEqual(response.data.likes, 0)
  })

  it('rejects a blog with a year before 1991', async () => {
    const invalidBlog = {
      title: 'Invalid Year Blog',
      author: 'Test Author',
      url: 'https://example.com/invalid-year',
      year: 1990,
    }

    try {
      await axios.post(`${baseUrl}/blogs`, invalidBlog, {
        headers: {
          Authorization: `Bearer ${testData.tokens[0]}`,
        },
      })
      assert.fail('Expected the request to be rejected')
    } catch (error) {
      assert.strictEqual(error.response.status, 400)
      assert.ok(
        error.response.data.error.includes('Year must be at least 1991')
      )
    }
  })

  it('rejects a blog with a year in the future', async () => {
    const invalidBlog = {
      title: 'Future Year Blog',
      author: 'Test Author',
      url: 'https://example.com/future-year',
      year: new Date().getFullYear() + 1,
    }

    try {
      await axios.post(`${baseUrl}/blogs`, invalidBlog, {
        headers: {
          Authorization: `Bearer ${testData.tokens[0]}`,
        },
      })
      assert.fail('Expected the request to be rejected')
    } catch (error) {
      assert.strictEqual(error.response.status, 400)
      assert.ok(
        error.response.data.error.some((message) =>
          message.startsWith('Year cannot be greater than')
        )
      )
    }
  })

  it('created blog appears in blogs list', async () => {
    const response = await axios.get(`${baseUrl}/blogs`)
    assert.strictEqual(response.data.length, 1)
    assert.strictEqual(response.data[0].title, 'Test Blog Post')
  })

  it('blog can be updated', async () => {
    const blogsResponse = await axios.get(`${baseUrl}/blogs`)
    const blogId = blogsResponse.data[0].id

    const response = await axios.put(`${baseUrl}/blogs/${blogId}`, {
      likes: 5
    })

    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.likes, 5)
  })
})

describe('Users API', () => {
  it('all users are returned', async () => {
    const response = await axios.get(`${baseUrl}/users`)
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(Array.isArray(response.data), true)
    assert.strictEqual(response.data.length, 2)
  })

  it('users have correct properties', async () => {
    const response = await axios.get(`${baseUrl}/users`)
    const user = response.data[0]

    assert.ok(user.id)
    assert.ok(user.username)
    assert.ok(user.name)
    assert.strictEqual(Array.isArray(user.blogs), true)
  })
})

describe('Authors API', () => {
  it('returns author statistics', async () => {
    const response = await axios.get(`${baseUrl}/authors`)
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(Array.isArray(response.data), true)
  })

  it('author stats have correct structure', async () => {
    const response = await axios.get(`${baseUrl}/authors`)

    if (response.data.length > 0) {
      const author = response.data[0]
      assert.ok(author.author)
      assert.ok(!isNaN(Number(author.blogs)))
      assert.ok(!isNaN(Number(author.likes)))
      assert.ok(Number(author.blogs) >= 0)
      assert.ok(Number(author.likes) >= 0)
    }
  })
})
