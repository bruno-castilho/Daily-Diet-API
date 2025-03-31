import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Dohn',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'My Food',
        description: 'My Description',
        date: '2025-03-31T16:00:00.000Z',
        isOnTheDiet: true,
      })
      .expect(201)
  })

  it('should be able to get a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Dohn',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')
    const userCookie = cookies?.find((cookie) => cookie.startsWith('user='))
    expect(userCookie).toBeDefined()

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'My Food',
        description: 'My Description',
        date: '2025-03-31T16:00:00.000Z',
        isOnTheDiet: true,
      })
      .expect(201)

    const user = JSON.parse(
      decodeURIComponent(userCookie || '')
        .split(';')[0]
        .split('=')[1],
    )

    const getUserMealsResponse = await request(app.server).get(
      `/users/${user.id}/meals`,
    )

    const mealId = getUserMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies || [])
      .expect(200)

    expect(getMealResponse.body).toEqual(
      expect.objectContaining({
        name: 'My Food',
        description: 'My Description',
        date: new Date('2025-03-31T16:00:00.000Z').getTime(),
        is_on_the_diet: 1,
      }),
    )
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Dohn',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')
    const userCookie = cookies?.find((cookie) => cookie.startsWith('user='))
    expect(userCookie).toBeDefined()

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'My Food',
        description: 'My Description',
        date: '2025-03-31T16:00:00.000Z',
        isOnTheDiet: true,
      })
      .expect(201)

    const user = JSON.parse(
      decodeURIComponent(userCookie || '')
        .split(';')[0]
        .split('=')[1],
    )

    const getUserMealsResponse = await request(app.server).get(
      `/users/${user.id}/meals`,
    )

    const mealId = getUserMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: 'My Food2',
        description: 'My Description2',
        date: '2025-03-31T17:00:00.000Z',
        isOnTheDiet: false,
      })
      .set('Cookie', cookies || [])
      .expect(204)
  })

  it('should be able to remove a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Dohn',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')
    const userCookie = cookies?.find((cookie) => cookie.startsWith('user='))
    expect(userCookie).toBeDefined()

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'My Food',
        description: 'My Description',
        date: '2025-03-31T16:00:00.000Z',
        isOnTheDiet: true,
      })
      .expect(201)

    const user = JSON.parse(
      decodeURIComponent(userCookie || '')
        .split(';')[0]
        .split('=')[1],
    )

    const getUserMealsResponse = await request(app.server).get(
      `/users/${user.id}/meals`,
    )

    const mealId = getUserMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies || [])
      .expect(204)
  })
})
