const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')
const config = require('../utils/config')
const bcrypt = require('bcrypt')
const User = require('../models/user')


describe('api tests', () => {

    beforeEach(async () => {
        await Blog.deleteMany({})

        for (let blog of helper.initialBlogs) {
            let blogObject = new Blog(blog)
            await blogObject.save()
        }

        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()


    })

    helper.blogsInDb()


    test('api: blogs are returned as json', async () => {
        console.log('entered test')

        const response = await api.get('/api/blogs')

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toBe('application/json; charset=utf-8')

        //.expect('Content-Type', /application\/json/)
    })

    test('api: correct number of blogs is returned', async () => {
        console.log('entered test')

        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('api: correct name of id property', async () => {
        console.log('entered test')

        const response = await api.get('/api/blogs')

        for (let index = 0; index < response.body.length; index++) {
            expect(response.body[index].id).toBeDefined()
        }
    })

    test('api: every new blog is added correctly', async () => {
        console.log('entered test')

        const newBlog = {
            title: 'A single test blog',
            author: 'me :)',
            url: 'test blog url',
            likes: 44,
            userId: '5f13b9f672ae3439fd694488'
        }

        const login = {
            username: 'root',
            password: 'sekret'
        }

        const tokenRes = await api
            .post('/api/login')
            .send(login)

        const token = tokenRes.body.token

        console.log('token: ',token)

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    })

    test('api: likes default to 0 if no likes are specified', async () => {
        console.log('entered test')

        const newBlogNoLikes = {
            title: 'A single test blog',
            author: 'me :)',
            url: 'test blog url'
        }

        const login = {
            username: 'root',
            password: 'sekret'
        }

        const tokenRes = await api
            .post('/api/login')
            .send(login)

        const token = tokenRes.body.token

        await api
            .post('/api/blogs')
            .send(newBlogNoLikes)
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd[helper.initialBlogs.length].likes).toBe(0)

    })

    test('api: if missing author & url, respond with 400 and not add', async () => {
        console.log('entered test')

        const newBlogNoAuthUrl = {
            title: 'A single test blog',
            likes: 44
        }

        const login = {
            username: 'root',
            password: 'sekret'
        }

        const tokenRes = await api
            .post('/api/login')
            .send(login)

        const token = tokenRes.body.token

        await api
            .post('/api/blogs')
            .send(newBlogNoAuthUrl)
            .set('Authorization', 'bearer ' + token)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    })


    afterAll(() => {
        mongoose.connection.close()
    })

})
