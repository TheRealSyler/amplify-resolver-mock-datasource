import { FakeUser, hasThrown } from './api'

test('delete blog with post', async () => {
  const user = new FakeUser()

  const myBlog = await user.mutation('createBlog', { input: { name: 'My Blog' } })

  await user.mutation('createPost', {
    input: {
      title: 'My Post',
      blogID: myBlog.id
    }
  })

  expect(await hasThrown(user.mutation('deleteBlog', {
    input: {
      id: myBlog.id
    }
  }))).toBe(true)
})