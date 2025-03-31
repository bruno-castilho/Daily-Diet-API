import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Dohn',
      })
      .expect(201)
  })

  it('should be able to list user meals', async () => {
    const createUserTransactionsResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Dohn',
      })
      .expect(201)

    const cookies = createUserTransactionsResponse.get('Set-Cookie')

    const userCookie = cookies?.find((cookie) => cookie.startsWith('user='))
    expect(userCookie).toBeDefined()

    const user = JSON.parse(
      decodeURIComponent(userCookie || '')
        .split(';')[0]
        .split('=')[1],
    )

    const getUserMealsResponse = await request(app.server).get(
      `/users/${user.id}/meals`,
    )

    expect(getUserMealsResponse.body.meals).toEqual([])
  })

  it('should be able to get user meals metrics', async () => {
    const createUserTransactionsResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Dohn',
      })
      .expect(201)

    const cookies = createUserTransactionsResponse.get('Set-Cookie')

    const userCookie = cookies?.find((cookie) => cookie.startsWith('user='))
    expect(userCookie).toBeDefined()

    const user = JSON.parse(
      decodeURIComponent(userCookie || '')
        .split(';')[0]
        .split('=')[1],
    )

    const getUserMealsResponse = await request(app.server).get(
      `/users/${user.id}/meals/metrics`,
    )

    expect(getUserMealsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 0,
        totalMealsInDiet: 0,
        totalMealsNotInDiet: 0,
        maxMealsSequenceWithinTheDiet: 0,
      }),
    )
  })
})
